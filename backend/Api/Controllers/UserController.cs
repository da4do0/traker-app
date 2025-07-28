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
        public ActionResult<User> GetByUsername(string username)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == username);
            if (user == null)
            {
                return NotFound("User not found");
            }
            return Ok(user);

            //bool isValid = BCrypt.Net.BCrypt.Verify(password, hashed);
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
    }
}
