using FishTracker.Components.Interfaces.Services;

namespace FishTracker.App.Services;

public class NavService : INavService
{
    public Task GoToLiveTracking()
        => MainThread.InvokeOnMainThreadAsync(() => Shell.Current.GoToAsync(nameof(CameraTracking))
        );
}