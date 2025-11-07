
namespace FishTracker.App;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();

        // 1) Register routes for pages you will navigate to
        // Use nameof(...) to avoid typos
        Routing.RegisterRoute(nameof(CameraTracking), typeof(CameraTracking));

        // (Optional) If you later add more pages, register them here too
        // Routing.RegisterRoute(nameof(SettingsPage), typeof(SettingsPage));
    }
}