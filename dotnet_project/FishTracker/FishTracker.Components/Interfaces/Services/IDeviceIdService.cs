using System.Threading.Tasks;

namespace FishTracker.Components.Interfaces.Services;

public interface IDeviceIdService
{
    Task<string> GetOrCreateDeviceIdAsync();
    
}