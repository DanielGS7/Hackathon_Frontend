
using FishTracker.Components.Constants;
using FishTracker.Components.Interfaces.Services;

namespace FishTracker.App.Services;

public class DeviceIdService : IDeviceIdService
{
    public async Task<string> GetOrCreateDeviceIdAsync()
    {
        var deviceId = await SecureStorage.GetAsync(Constant.App.DeviceIdKey);
        if (deviceId != null) 
            return deviceId;
        
        deviceId = Guid.NewGuid().ToString();
        await SecureStorage.SetAsync(Constant.App.DeviceIdKey, deviceId);

        return deviceId;
    }
}