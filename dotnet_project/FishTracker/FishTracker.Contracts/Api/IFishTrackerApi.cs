using FishTracker.Contracts.Dto;
using Refit;

namespace FishTracker.Contracts.Api;

[Headers("Content-Type: application/json")]
public interface IFishTrackerApi
{
    [Get("/device/{id}")]
    Task<FishTrackerApiResponse<Device>> GetDeviceById(string id);
    
    [Post("/device/register")]
    Task<IApiResponse> RegisterDevice([Body] RegisterDevice device);
    
    [Get("/fish/{deviceId}")]
    Task<FishTrackerApiResponse<TrackedFishInfo[]>> GetFish(string deviceId);
    
    [Get("/fish/detail/{fishId}")]
    Task<FishTrackerApiResponse<Fish>> GetFishDetail(string fishId);
    
    [Post("/chat/{deviceId}")]
    Task<ApiResponse<FishTrackerApiResponse<ChatResponse>>> Chat(string deviceId, [Body] ChatRequest message);
}