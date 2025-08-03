using System.Text.Json;
using System.Threading.Tasks;
using Api.model;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [ApiController]
    [Route("food")]
    public class FoodController : ControllerBase
    {
        private readonly ApiDbContext _context;
        private readonly ILogger<FoodController> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private const string BaseUsaUrl = "https://api.nal.usda.gov/fdc/v1";
        private const string BaseEuUrl = "https://world.openfoodfacts.org";

        public FoodController(
            ApiDbContext context,
            ILogger<FoodController> logger,
            HttpClient httpClient,
            IConfiguration configuration
        )
        {
            _context = context;
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
            [FromQuery] int pageSize = 10,
            [FromQuery] string? country = null
        )
        {
            // Validazione input
            if (string.IsNullOrWhiteSpace(query))
            {
                return BadRequest("Query parameter cannot be empty");
            }

            // Limiti per evitare sovraccarico
            pageSize = Math.Clamp(pageSize, 1, 100);
            pageNumber = Math.Max(pageNumber, 1);

            var url =
                $"{BaseEuUrl}/cgi/search.pl?search_terms={Uri.EscapeDataString(query)}&json=1&page_size={pageSize}&page={pageNumber}";

            // Aggiungi filtro paese se specificato
            if (!string.IsNullOrEmpty(country))
            {
                url += $"&countries={Uri.EscapeDataString(country)}";
            }

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.UserAgent.ParseAdd("FoodTracker/1.0 (garavagliad2@gmail.com)");

                // Timeout per evitare richieste troppo lunghe
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                var response = await _httpClient.SendAsync(request, cts.Token);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError(
                        "Error fetching data from OpenFoodFacts API: {StatusCode} for query: {Query}",
                        response.StatusCode,
                        query
                    );

                    return response.StatusCode switch
                    {
                        HttpStatusCode.NotFound => NotFound("No results found for the given query"),
                        HttpStatusCode.TooManyRequests => StatusCode(
                            429,
                            "Too many requests. Please try again later."
                        ),
                        _ => StatusCode(
                            (int)response.StatusCode,
                            "Error fetching data from food API"
                        ),
                    };
                }

                var jsonContent = await response.Content.ReadAsStringAsync();

                // Controllo se la risposta è vuota
                if (string.IsNullOrWhiteSpace(jsonContent))
                {
                    _logger.LogWarning(
                        "Empty response from OpenFoodFacts API for query: {Query}",
                        query
                    );
                    return Ok(
                        new
                        {
                            products = Array.Empty<object>(),
                            count = 0,
                            page = pageNumber,
                        }
                    );
                }

                var data = JsonSerializer.Deserialize<Root>(
                    jsonContent,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                    }
                );

                // Aggiungi metadati utili alla risposta
                var response_data = new
                {
                    query = query,
                    page = pageNumber,
                    pageSize = pageSize,
                    country = country,
                    totalResults = data?.Count ?? 0,
                    products = data?.Products?.Select(p => new
                    {
                        code = p.Code,
                        productName = p.ProductName,
                        brands = p.Brands,
                        imageUrl = p.ImageUrl,
                        // Estrai solo i nutrienti principali per una risposta più pulita
                        nutrition = new
                        {
                            energyKcal100g = p.Nutriments?.EnergyKcal100g,
                            proteins100g = p.Nutriments?.Proteins100g,
                            carbohydrates100g = p.Nutriments?.Carbohydrates100g,
                            fat100g = p.Nutriments?.Fat100g,
                            fiber100g = p.Nutriments?.Fiber100g,
                            sugars100g = p.Nutriments?.Sugars100g,
                            sodium100g = p.Nutriments?.Sodium100g,
                        },
                        ingredients = p.IngredientsText,
                        servingSize = p.ServingSize,
                    }) ?? Array.Empty<object>(),
                };

                _logger.LogInformation(
                    "Successfully fetched {Count} products from OpenFoodFacts for query: {Query}",
                    data?.Count ?? 0,
                    query
                );

                return Ok(response_data);
            }
            catch (OperationCanceledException)
            {
                _logger.LogError("Timeout occurred while fetching data for query: {Query}", query);
                return StatusCode(408, "Request timeout");
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Network error while fetching data for query: {Query}", query);
                return StatusCode(503, "Service temporarily unavailable");
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Error parsing JSON response for query: {Query}", query);
                return StatusCode(502, "Invalid response from food API");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error fetching data for query: {Query}", query);
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
