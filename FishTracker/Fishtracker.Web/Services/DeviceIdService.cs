using FishTracker.Components.Interfaces.Services;

namespace MudBlazorDebug.Services;

public class DeviceIdService : IDeviceIdService
{
    public Task<string> GetOrCreateDeviceIdAsync()
    {
        //return Task.FromResult(Guid.NewGuid().ToString());
        return Task.FromResult("prod");
    }
}