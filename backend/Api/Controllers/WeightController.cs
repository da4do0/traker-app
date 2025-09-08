using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Api.Interfaces;
using Api.model;
using Api.Services;
using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using model.DTOs.Weight;

namespace Api.Controllers
{
    [ApiController]
    [Route("weight")]
    public class WeightController : ControllerBase
    {

        private readonly ApiDbContext _context;
        private readonly ILogger<UserController> _logger;
        private readonly IWeightService _weightService;

        public WeightController(ApiDbContext context, ILogger<UserController> logger, IWeightService weightService)
        {
            _context = context;
            _logger = logger;
            _weightService = weightService;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<MisurationResponse>> GetUserWeight(int userId)
        {
            return await _weightService.GetUserMisuration(userId);
        }

        [HttpPost()]
        public async Task<ActionResult<bool>> AddUserMisuration([FromBody] Misuration misuration)
        {
            return await _weightService.AddUserMisuration(misuration);
        }
    }
}