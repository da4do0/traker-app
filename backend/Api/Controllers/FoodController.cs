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
        private const string BaseUrl = "https://api.nal.usda.gov/fdc/v1";

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

        [HttpGet("search/{query}")]
        public async Task<ActionResult<IEnumerable<Object>>> Search(
            string query,
            [FromQuery] int pageSize = 50,
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
                    $"{BaseUrl}/foods/search?api_key={apiKey}&query={Uri.EscapeDataString(query)}&pageSize={pageSize}&pageNumber={pageNumber}";

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
                        Foods = cleanedData
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving API key from configuration");
                return StatusCode(500, "Internal server error");
            }
        }
    }
}
