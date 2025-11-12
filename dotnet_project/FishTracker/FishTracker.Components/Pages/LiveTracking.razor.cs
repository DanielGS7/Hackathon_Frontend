using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace FishTracker.Components.Pages;

public partial class LiveTracking : ComponentBase
{
    [Inject] public NavigationManager NavigationManager { get; set; } = null!;

    private void StopTracking(MouseEventArgs obj)
    {
        NavigationManager.NavigateTo("//");
    }
}