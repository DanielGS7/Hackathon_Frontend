using System.Threading.Tasks;
using FishTracker.Components.Interfaces.Services;
using Microsoft.AspNetCore.Components;

namespace MudBlazorDebug.Services;

public class BlazorNavService(NavigationManager navigationManager) : INavService
{
    
    public Task GoToLiveTracking()
    {
        navigationManager.NavigateTo("/camera-tracking");
        return Task.CompletedTask;
    }

    public void GoToFishDetail(string fishId)
    {
        navigationManager.NavigateTo($"/fish-detail/{fishId}");
    }
    
    public void GoToHome()
    {
        navigationManager.NavigateTo("/");
    }

    public void GoToMyCatches()
    {
        navigationManager.NavigateTo("/my-catches");
    }

    public void GoToFishAssistant()
    {
        navigationManager.NavigateTo("/fish-assistant");
    }
}