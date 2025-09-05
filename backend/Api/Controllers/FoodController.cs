using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Api.model;
using Api.Interfaces;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("food")]
    public class FoodController : ControllerBase
    {
        private readonly ApiDbContext _context;
        private readonly IFoodService _foodService;
        private readonly ILogger<FoodController> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private const string BaseUsaUrl = "https://api.nal.usda.gov/fdc/v1";
        private const string BaseEuUrl = "https://world.openfoodfacts.org";

        public FoodController(
            ApiDbContext context,
            IFoodService foodService,
            ILogger<FoodController> logger,
            HttpClient httpClient,
            IConfiguration configuration
        )
        {
            _context = context;
            _foodService = foodService;
            _logger = logger;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        [HttpGet("search/usa/{query}")]
        public async Task<ActionResult<IEnumerable<Object>>> Search(
            string query,
            [FromQuery] int pageSize = 5,
            [FromQuery] int pageNumber = 1,
            [FromQuery] string? dataType = null, // "Branded", "Foundation", "Survey", "SR Legacy"
            [FromQuery] string? sortBy = "fdcId",
            [FromQuery] string? sortOrder = "asc"
        )
        {
            try
            {
                var apiKey = _configuration["FoodApiKey"];
                var url =
                    $"{BaseUsaUrl}/foods/search?api_key={apiKey}&query={Uri.EscapeDataString(query)}&pageSize={pageSize}&pageNumber={pageNumber}";

                if (!string.IsNullOrEmpty(dataType))
                    url += $"&dataType={dataType}";

                if (!string.IsNullOrEmpty(sortBy))
                    url += $"&sortBy={sortBy}&sortOrder={sortOrder}";

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        "Error fetching data from food API: {StatusCode}",
                        response.StatusCode
                    );
                    return StatusCode(
                        (int)response.StatusCode,
                        "Error fetching data from food API"
                    );
                }

                var jsonContent = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<UsdaSearchResponse>(
                    jsonContent,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                var cleanedData = data
                    ?.foods?.Select(food => new
                    {
                        FdcId = food.fdcId,
                        Description = food.description,
                        DataType = food.dataType,
                        BrandOwner = food.brandOwner,
                        BrandName = food.brandName,
                        Ingredients = food.ingredients,
                        ServingSize = food.servingSize,
                        ServingSizeUnit = food.servingSizeUnit,
                        // Estrai nutrienti principali se disponibili
                        Nutrients = food
                            .foodNutrients?.Where(n =>
                                n.nutrientName == "Energy"
                                || n.nutrientName == "Protein"
                                || n.nutrientName == "Carbohydrate, by difference"
                                || n.nutrientName == "Total lipid (fat)"
                            )
                            .Select(n => new
                            {
                                Name = n.nutrientName,
                                Amount = n.value,
                                Unit = n.unitName,
                            }),
                    })
                    .ToList();

                return Ok(
                    new
                    {
                        TotalHits = data?.totalHits ?? 0,
                        CurrentPage = data?.currentPage ?? 1,
                        TotalPages = data?.totalPages ?? 1,
                        Foods = cleanedData,
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving API key from configuration");
                return StatusCode(500, "Internal server error");
            }
        }

        // Endpoint for searching food in the EU
        // This Api dont need an API key, but you have to compile the User-agent header in the correct way
        // Example: "{appName}/{version}"
        // Endpoint for searching food in the EU
        // This Api dont need an API key, but you have to compile the User-agent header in the correct way
        // Example: "{appName}/{version}"
        [HttpGet("search/eu/{query}")]
        public async Task<ActionResult<object>> SearchEu(
            string query,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 5,
            [FromQuery] string? country = null
        )
        {
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("Query parameter cannot be empty");
            }

            pageSize = Math.Clamp(pageSize, 1, 100);
            pageNumber = Math.Max(pageNumber, 1);

            var url =
                $"{BaseEuUrl}/cgi/search.pl?search_terms={Uri.EscapeDataString(query)}&json=1&page_size={pageSize}&page={pageNumber}";

            if (!string.IsNullOrEmpty(country))
            {
                url += $"&countries={Uri.EscapeDataString(country)}";
            }

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.UserAgent.ParseAdd("FoodTracker/1.0 (test)");

                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                var response = await _httpClient.SendAsync(request, cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        "Error fetching data from OpenFoodFacts API: {StatusCode} for query: {Query}",
                        response.StatusCode,
                        query
                    );
                    return StatusCode(
                        (int)response.StatusCode,
                        "Error fetching data from food API"
                    );
                }

                var jsonContent = await response.Content.ReadAsStringAsync();

                if (string.IsNullOrWhiteSpace(jsonContent))
                {
                    return Ok(
                        new
                        {
                            products = Array.Empty<object>(),
                            count = 0,
                            page = pageNumber,
                        }
                    );
                }

                // USA SearchRoot invece di Root per l'endpoint di ricerca
                var data = JsonSerializer.Deserialize<SearchRoot>(
                    jsonContent,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        NumberHandling = JsonNumberHandling.AllowReadingFromString,
                    }
                );

                // Risposta pulita e strutturata
                var products = data
                    ?.Products?.Select(p => new
                    {
                        code = p.Code,
                        name = p.ProductName,
                        brands = p.Brands,
                        quantity = p.Quantity,
                        categories = p.Categories,
                        imageUrl = p.ImageUrl,
                        nutritionGrade = p.NutriscoreGrade,
                        novaGroup = p.NovaGroup,
                        servingSize = p.ServingSize,
                        nutrition = new
                        {
                            calories100g = p.Nutriments?.EnergyKcal100g,
                            protein100g = p.Nutriments?.Proteins100g,
                            carbs100g = p.Nutriments?.Carbohydrates100g,
                            fat100g = p.Nutriments?.Fat100g,
                            sugar100g = p.Nutriments?.Sugars100g,
                            fiber100g = p.Nutriments?.Fiber100g,
                            salt100g = p.Nutriments?.Salt100g,
                            sodium100g = p.Nutriments?.Sodium100g,
                        },
                        ingredients = p.IngredientsText,
                        allergens = p.AllergensTags,
                    })
                    .ToList();

                var cleanResponse = new
                {
                    query = query,
                    page = data?.Page ?? pageNumber,
                    pageSize = pageSize,
                    totalPages = data?.PageCount ?? 0,
                    totalResults = data?.Count ?? 0,
                    country = country,
                    products = products, // Ora funziona perché products può essere null
                };

                return Ok(cleanResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching data for query: {Query}", query);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpPost("add")]
        public async Task<IActionResult> AddFood([FromBody] FoodApi food)
        {
            if (food == null)
            {
                return BadRequest("Food data is required");
            }

            try
            {
                // Get user ID from username
                var userId = _context.Users
                    .Where(u => u.Username == food.Username)
                    .Select(u => u.Id)
                    .FirstOrDefault();

                if (userId == 0)
                {
                    return BadRequest("User not found");
                }

                // Check if food exists by code
                var existingFood = await _foodService.GetFoodByCodeAsync(food.code);

                int foodId;
                if (existingFood != null)
                {
                    foodId = existingFood.Id;
                }
                else
                {
                    // Create new food
                    var newFood = new Food
                    {
                        Name = food.Name,
                        Description = food.Description,
                        Image = food.Image,
                        Calories = food.Calories,
                        Proteins = food.Proteins,
                        Carbohydrates = food.Carbohydrates,
                        Fats = food.Fats,
                        code = food.code
                    };

                    var createdFood = await _foodService.CreateFoodAsync(newFood);
                    foodId = createdFood.Id;
                }

                // Add food to user using service (Meal is already a string)
                var result = await _foodService.AddFoodToUserAsync(userId, foodId, food.Quantity, food.Meal);

                if (!result)
                {
                    return BadRequest("Failed to add food to user");
                }

                return Ok(new
                {
                    msg = "Food added successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding food");
                return StatusCode(500, "Internal server error");
            }
        }

        // Aggiungo nuovi endpoint che usano il service
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Food>>> GetAllFoods()
        {
            var foods = await _foodService.GetAllFoodsAsync();
            return Ok(foods);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Food>> GetFood(int id)
        {
            var food = await _foodService.GetFoodByIdAsync(id);
            if (food == null)
            {
                return NotFound();
            }
            return Ok(food);
        }

        [HttpPost("add-to-user")]
        public async Task<ActionResult> AddFoodToUser(
            [FromQuery] int userId,
            [FromQuery] int foodId,
            [FromQuery] int quantity,
            [FromQuery] string mealType)
        {
            var result = await _foodService.AddFoodToUserAsync(userId, foodId, quantity, mealType);

            if (!result)
                return BadRequest("Invalid meal type or user/food not found");

            return Ok("Food added to user successfully");
        }

        [HttpGet("calories/{userId}")]
        public async Task<ActionResult<IEnumerable<UserFood>>> GetUserFoods(int userId)
        {
            var calories = await _foodService.GetUserCaloriesAsync(userId);
            return Ok(calories);
        }

        [HttpGet("product/eu/{barcode}")]
        public async Task<ActionResult<object>> GetProductByBarcode(string barcode)
        {
            if (string.IsNullOrWhiteSpace(barcode))
            {
                return BadRequest("Barcode parameter cannot be empty");
            }

            // Usa l'endpoint specifico per i prodotti invece del search
            var url = $"{BaseEuUrl}/api/v0/product/{barcode}.json";

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.UserAgent.ParseAdd("FoodTracker/1.0 (test)");

                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                var response = await _httpClient.SendAsync(request, cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        "Error fetching product from OpenFoodFacts API: {StatusCode} for barcode: {Barcode}",
                        response.StatusCode,
                        barcode
                    );
                    return StatusCode((int)response.StatusCode, "Error fetching product from food API");
                }

                var jsonContent = await response.Content.ReadAsStringAsync();

                if (string.IsNullOrWhiteSpace(jsonContent))
                {
                    return NotFound(new { message = "Product not found", barcode = barcode });
                }

                // Usa il modello BarcodeRoot per singoli prodotti (specifico per barcode API)
                var data = JsonSerializer.Deserialize<BarcodeRoot>(
                    jsonContent,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        NumberHandling = JsonNumberHandling.AllowReadingFromString,
                    }
                );

                // Controlla se il prodotto è stato trovato
                if (data.Product == null)
                {
                    return NotFound(new { message = "Product not found", barcode = barcode });
                }

                // Formatta la risposta come il tuo search endpoint per consistenza
                var product = new
                {
                    code = data.Product.Code,
                    name = data.Product.ProductName,
                    brands = data.Product.Brands,
                    quantity = data.Product.Quantity,
                    categories = data.Product.Categories,
                    imageUrl = data.Product.ImageUrl,
                    nutritionGrade = data.Product.NutriscoreGrade,
                    novaGroup = data.Product.NovaGroup,
                    servingSize = data.Product.ServingSize,
                    nutrition = new
                    {
                        calories100g = data.Product.Nutriments?.EnergyKcal100g,
                        protein100g = data.Product.Nutriments?.Proteins100g,
                        carbs100g = data.Product.Nutriments?.Carbohydrates100g,
                        fat100g = data.Product.Nutriments?.Fat100g,
                        sugar100g = data.Product.Nutriments?.Sugars100g,
                        fiber100g = data.Product.Nutriments?.Fiber100g,
                        salt100g = data.Product.Nutriments?.Salt100g,
                        sodium100g = data.Product.Nutriments?.Sodium100g,
                    },
                    ingredients = data.Product.IngredientsText,
                    allergens = data.Product.AllergensTags,
                };

                return Ok(new
                {
                    barcode = barcode,
                    found = true,
                    product = product
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching product for barcode: {Barcode}", barcode);
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("list/{userId}")]
        public async Task<ActionResult<IEnumerable<Food>>> GetUserFoodList(int userId)
        {
            var foods = await _foodService.GetUserFoodListAsync(userId);
            return Ok(foods);
        }

        [HttpDelete("registration/{userFoodId}")]
        public async Task<ActionResult> RemoveUserFood(int userFoodId)
        {
            var result = await _foodService.RemoveUserFoodAsync(userFoodId);

            if (!result)
                return NotFound(new { msg = "UserFood entry not found" });

            return Ok(new { msg = "UserFood entry removed successfully" });
        }

        [HttpPut("registration")]
        public async Task<ActionResult> UpdateUserFood(
            [FromBody] UserFood updatedEntry)
        {
            Console.WriteLine($"✏️ [Backend] Starting UpdateUserFood for userFoodId: {updatedEntry.Id}");
            Console.WriteLine($"✏️ [Backend] UpdatedEntry: FoodId={updatedEntry.FoodId}, UserId={updatedEntry.UserId}, Quantity={updatedEntry.Quantity}, Meal={updatedEntry.Meal}, Date={updatedEntry.Date}");
            var existingEntry = await _context.UserFoods.FindAsync(updatedEntry.Id);
            Console.WriteLine($"find: {existingEntry}");
            if (existingEntry == null)
            {
                return NotFound(new { msg = "UserFood entry not found" });
            }

            // Aggiorna i campi modificabili
            existingEntry.Quantity = updatedEntry.Quantity;
            existingEntry.Meal = updatedEntry.Meal;

            await _context.SaveChangesAsync();
            return Ok(new { msg = "UserFood entry updated successfully" });
        }
    }
}
