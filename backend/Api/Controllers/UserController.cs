using System.Collections.Generic;
using System.Linq;
using Api.model;
using Microsoft.AspNetCore.Mvc;

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
            return Ok(); // Da implementare con il database
        }

        // GET /user/{username}
        [HttpGet("{username}")]
        public ActionResult<User> GetByUsername(string username)
        {
            return Ok(); // Da implementare con il database
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
            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(user);
        }
    }
}
