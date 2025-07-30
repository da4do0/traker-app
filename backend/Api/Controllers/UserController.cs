using System.Collections.Generic;
using System.Linq;
using Api.model;
using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;

namespace Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApiDbContext _context;

        public UserController(ApiDbContext context)
        {
            _context = context;
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
            if (!exists)
            {
                return Ok(exists);
            }
            return Ok(exists);
        }

        // POST /user
        [HttpPost]
        public ActionResult<User> Create(User user)
        {
            Console.WriteLine("Creating user... ");
            Console.WriteLine(
                "user:"
                    + user.Username
                    + " "
                    + user.Password
                    + " "
                    + user.Email
                    + " "
                    + user.Nome
                    + " "
                    + user.Cognome
            );
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
        public ActionResult<User> GetUserInfo(string username)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            var registra = _context.UserFoods
                .Where(uf => uf.User == user.Id)
                .Select(uf => new
                {
                    uf.Id,
                    uf.FoodId,
                    uf.Quantity,
                    uf.Date,
                    Meal = uf.Meal.ToString()
                })
                .ToList();

            var food = _context.Foods
                .Where(f => registra.Select(r => r.FoodId).Contains(f.Id))
                .Select(f => new
                {
                    f.Id,
                    f.Name,
                    f.Calories,
                    f.Proteins,
                    f.Carbohydrates,
                    f.Fats
                })
                .ToList();

            
            if (user == null)
            {
                return NotFound("User not found");
            }
            return Ok(user);
        }
    }
}
