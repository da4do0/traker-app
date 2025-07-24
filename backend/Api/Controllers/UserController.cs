using Microsoft.AspNetCore.Mvc;
using Api.model;
using System.Collections.Generic;
using System.Linq;

namespace Api.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UserController : ControllerBase
    {

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
            return Ok(); // Da implementare con il database
        }
    }
}