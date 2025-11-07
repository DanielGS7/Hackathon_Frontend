using FishTracker.Components.Interfaces.Services;
using FishTracker.Components.Models;
using Microsoft.AspNetCore.Components;

namespace FishTracker.Components.Pages.Home.Parts;

public partial class RecentCatchesPanel : ComponentBase
{
    [Parameter] public List<FishBasic> Fishes { get; set; } = [];
    [Parameter] public EventCallback OnRefresh { get; set; }
    [Parameter] public bool LoadingFishes { get; set; }
    
    [Inject] private NavigationManager NavigationManager { get; set; } = null!;
    [Inject] private INavService NavService { get; set; } = null!;

    private async Task HandleRefresh()
    {
        await OnRefresh.InvokeAsync();
    }
}