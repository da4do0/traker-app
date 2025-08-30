using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Api.model;
using Api.Services;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using model.DTOs.Auth;

namespace Api.Controllers
{
    [ApiController]
    [Route("user")]
    public class UserController : ControllerBase
    {
        private readonly ApiDbContext _context;
        private readonly ILogger<UserController> _logger;

        public UserController(ApiDbContext context, ILogger<UserController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET /user
        [HttpGet]
        public ActionResult<IEnumerable<User>> GetAll()
        {
            return Ok(_context.Users);
        }

        // GET /user/{username}
        [HttpGet("{username}")]
        public ActionResult<bool> CheckUserExists(string username)
        {
            bool exists = _context.Users.Any(u => u.Username == username);
            return Ok(exists);
        }

        [HttpPost("login")]
        public ActionResult<User> Login([FromBody] LoginRequest loginUser)
        {
            if (loginUser == null || loginUser.Username == null || loginUser.Password == null)
            {
                return BadRequest("Username or password is null");
            }

            var user = _context.Users.FirstOrDefault(u => u.Username == loginUser.Username);
            
            if (user == null || !BCrypt.Net.BCrypt.Verify(loginUser.Password, user.Password))
            {
                return Unauthorized("Invalid username or password");
            }

            return Ok(user.Id);
        }

        // GET /user/id/
        [HttpGet("id/{username}")]
        public ActionResult<int> GetUserId(string username)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
            {
                return NotFound("User not found");
            }
            return Ok(user.Id);
        }

        // POST /user
        [HttpPost]
        public ActionResult<User> Create(User user, [FromServices] ICalorieCalculationService calorieService)
        {
            if (user == null)
            {
                return BadRequest("User is null");
            }

            if (
                user.Username == null
                || user.Password == null
                || user.Email == null
                || user.Nome == null
                || user.Cognome == null
            )
            {
                return BadRequest("Username or password is null");
            }
            if (_context.Users.Any(u => u.Username == user.Username))
            {
                return BadRequest("Username already exists");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Add(user);
            _context.SaveChanges();

            // Calculate daily calorie goal if misuration data exists
            if (user.Misurations != null && user.Misurations.Any())
            {
                user.DailyCalorieGoal = calorieService.CalculateDailyCalories(user);
                _context.SaveChanges();
            }

            return Ok(user);
        }

        // GET /user/info/{username}
        [HttpGet("info/{username}")]
        public ActionResult<Object> GetUserInfo(string username)
        {
            _logger.LogInformation($"Fetching user info for: {username}");
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var registra = _context
                .UserFoods.Where(uf => uf.UserId == user.Id && uf.Date.Date == DateTime.Today)
                .Select(uf => new
                {
                    uf.Id,
                    uf.FoodId,
                    uf.Quantity,
                    uf.Date,
                    Meal = uf.Meal.ToString(),
                })
                .ToList();

            var food = _context
                .Foods.Where(f => registra.Select(r => r.FoodId).Contains(f.Id))
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.Calories,
                    f.Proteins,
                    f.Carbohydrates,
                    f.Fats,
                })
                .ToList();

            var foodList = registra
                .Select(r =>
                {
                    var foodItem = food.FirstOrDefault(f => f.Id == r.FoodId);
                    return new
                    {
                        r.Id,
                        Food = foodItem,
                        r.Quantity,
                        r.Date,
                        Meal = r.Meal,
                    };
                })
                .ToList();
            return Ok(
                new
                {
                    userInfo = new
                    {
                        weight = user.Misurations.OrderByDescending(m => m.Date).FirstOrDefault()?.Weight ?? 0
                    },
                    data = new
                    {
                        registra,
                        food = foodList,
                    },
                }
            );
        }

        // POST /user/recalculate-calories/{username}
        [HttpPost("recalculate-calories/{username}")]
        public async Task<ActionResult<int>> RecalculateCalories(string username, [FromServices] ICalorieCalculationService calorieService)
        {
            var user = _context.Users
                .Where(u => u.Username == username)
                .FirstOrDefault();

            if (user == null)
                return NotFound("User not found");

            try
            {
                var newCalorieGoal = await calorieService.CalculateDailyCaloriesAsync(user.Id, _context);
                user.DailyCalorieGoal = newCalorieGoal;
                user.UpdatedAt = DateTime.UtcNow;
                _context.SaveChanges();

                return Ok(newCalorieGoal);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error calculating calories: {ex.Message}");
            }
        }

        // PUT /user/goals/{username}
        [HttpPut("goals/{username}")]
        public async Task<ActionResult> UpdateUserGoals(string username, [FromBody] UserGoalsUpdate goals, [FromServices] ICalorieCalculationService calorieService)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
                return NotFound("User not found");

            user.ActivityLevel = goals.ActivityLevel;
            user.WeightGoal = goals.WeightGoal;
            user.TargetWeight = goals.TargetWeight;
            user.UpdatedAt = DateTime.UtcNow;

            // Recalculate calories with new goals
            try
            {
                user.DailyCalorieGoal = await calorieService.CalculateDailyCaloriesAsync(user.Id, _context);
            }
            catch (Exception)
            {
                // Keep existing calorie goal if calculation fails
            }

            _context.SaveChanges();
            return Ok(new { DailyCalorieGoal = user.DailyCalorieGoal });
        }
    }

    public class UserGoalsUpdate
    {
        public ActivityLevel ActivityLevel { get; set; }
        public WeightGoal WeightGoal { get; set; }
        public float? TargetWeight { get; set; }
    }
}
