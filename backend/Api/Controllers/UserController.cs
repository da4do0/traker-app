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
using model.DTOs.User;

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
        public ActionResult<User> Create(RegisterRequest user, [FromServices] ICalorieCalculationService calorieService)
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

            // Validation for height and weight
            if (user.Height <= 0 || user.Weight <= 0)
            {
                return BadRequest("Height and weight must be positive values");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
            user.CreatedAt = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            var newUser = new User
            {
                Username = user.Username,
                Nome = user.Nome,
                Cognome = user.Cognome,
                Email = user.Email,
                Password = user.Password,
                sex = user.Sex,
                DateOfBirth = user.DateOfBirth,
                ActivityLevel = user.ActivityLevel,
                WeightGoal = user.WeightGoal,
                TargetWeight = user.TargetWeight,
                DailyCalorieGoal = user.DailyCalorieGoal,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
            
            _context.Users.Add(newUser);
            _context.SaveChanges(); // Save to get the user ID
            
            // Calculate IMC with proper height conversion (assuming height is in cm)
            float heightInMeters = user.Height / 100f;
            float imc = user.Weight / (heightInMeters * heightInMeters);
            
            // Remove FFMI calculation as it requires body fat percentage which we don't have
            _context.Misurations.Add(new Misuration
            {
                UserId = newUser.Id,
                Date = DateTime.UtcNow,
                Weight = user.Weight,
                Height = user.Height,
                IMC = imc,
                FFMI = 0, // Set to 0 or remove if not needed
            });
            _context.SaveChanges();

            // Use the already created user object instead of querying again
            var createdUser = newUser;
            if (createdUser != null)
            {
                createdUser.DailyCalorieGoal = calorieService.CalculateDailyCalories(createdUser);
                _context.SaveChanges();
            }

            return Ok(user);
        }

        // GET /user/info/{username}
        [HttpGet("info/{userId}")]
        public ActionResult<InfoUserResponse> GetUserInfo(int userId)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
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
                        weight = _context.Misurations
                            .Where(m => m.UserId == user.Id)
                            .OrderByDescending(m => m.Date)
                            .Select(m => m.Weight)
                            .FirstOrDefault(),
                        dailyCalorieGoal = user.DailyCalorieGoal,
                        weightGoal = user.WeightGoal.ToString(),
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
