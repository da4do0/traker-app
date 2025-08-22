using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Api.model;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

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
        public ActionResult<User> Create(User user)
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

            _context.Users.Add(user);
            _context.SaveChanges();
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
                        user.Weight
                    },
                    data = new
                    {
                        registra,
                        food = foodList,
                    },
                }
            );
        }
    }
}
