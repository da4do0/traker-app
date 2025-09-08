using Api.model;
using model.DTOs.Weight;

namespace Api.Interfaces
{
    public interface IWeightService
    {
        Task<MisurationResponse> GetUserMisuration(int userId);
        Task<bool> AddUserMisuration(Misuration misuration);
    }
}