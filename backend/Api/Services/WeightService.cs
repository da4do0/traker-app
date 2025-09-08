using Api.Interfaces;
using Api.model;
using Microsoft.AspNetCore.Components.Forms;
using Microsoft.EntityFrameworkCore;
using model.DTOs.Weight;

namespace Api.Services
{
    public class WeightService : IWeightService
    {
        private readonly ApiDbContext _context;

        public WeightService(ApiDbContext context)
        {
            _context = context;
        }

        public async Task<MisurationResponse> GetUserMisuration(int userId)
        {
            var user = await _context.Users
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.TargetWeight,
                    u.WeightGoal
                })
                .FirstOrDefaultAsync();

            if (user == null)
                throw new ArgumentException("User not found");

            var misurations = await _context.Misurations
                .Where(m => m.UserId == userId)
                .OrderByDescending(m => m.Date)
                .Select(m => new PeriodMisuration
                {
                    Date = m.Date,
                    Weight = m.Weight,
                    Height = m.Height,
                    IMC = m.IMC,
                    FFMI = m.FFMI
                })
                .ToArrayAsync();

            return new MisurationResponse
            {
                TargetWeight = user.TargetWeight,
                WeightGoal = user.WeightGoal,
                periodMisuration = misurations
            };
        }

        public async Task<bool> AddUserMisuration(Misuration misuration)
        {
            if (misuration == null)
            {
                throw new ArgumentNullException(nameof(misuration), "Misuration cannot be null");
            }

            if (misuration.UserId <= 0)
            {
                throw new ArgumentException("Invalid UserId", nameof(misuration));
            }

            if (misuration.Weight <= 0 || misuration.Height <= 0)
            {
                throw new ArgumentException("Weight and Height must be positive values", nameof(misuration));
            }

            try
            {
                await _context.Misurations.AddAsync(misuration);
                
                var affectedRows = await _context.SaveChangesAsync();
                return affectedRows > 0;
            }
            catch (DbUpdateException ex)
            {
                throw new InvalidOperationException("Failed to save measurement data. Please check that the user exists and try again.", ex);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An unexpected error occurred while saving the measurement.", ex);
            }
        }
    }
}