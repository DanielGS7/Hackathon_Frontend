using FishTracker.Components.Interfaces.Services;
using FishTracker.Contracts.Api;
using FishTracker.Contracts.Dto;
using Microsoft.AspNetCore.Components;

namespace FishTracker.Components.Pages.FishDetail;

public partial class FishDetail
{
    [Parameter] public string Id { get; set; } = string.Empty;

    [Inject] private NavigationManager NavigationManager { get; set; } = null!;
    [Inject] public IFishTrackerApi FishTrackerApi { get; set; } = null!;
    [Inject] public IDeviceIdService DeviceIdService { get; set; } = null!;
    
    private Fish _fishDetails = null!;
    private bool _loading = true;

    protected override async Task OnInitializedAsync()
    {
        var response = await FishTrackerApi.GetFishDetail(Id);
        _fishDetails = response.Data;
        _loading = false;
    }
}

