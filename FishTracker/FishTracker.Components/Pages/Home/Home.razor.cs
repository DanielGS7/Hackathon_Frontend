using FishTracker.Components.Constants;
using FishTracker.Components.Interfaces.Services;
using FishTracker.Components.Models;
using FishTracker.Contracts.Api;
using FishTracker.Contracts.Dto;
using Microsoft.AspNetCore.Components;

namespace FishTracker.Components.Pages.Home;

public partial class Home : ComponentBase
{
    [Inject] public NavigationManager NavigationManager { get; set; } = null!;
    [Inject] public INavService NavService { get; set; } = null!;
    [Inject] public IFishTrackerApi FishTrackerApi { get; set; } = null!;
    [Inject] public IDeviceIdService DeviceIdService { get; set; } = null!;

    public List<FishBasic> Fishes { get; set; } = [];
    private bool _noCatches = true;
    private bool _loadingFishes;
    private string _deviceId = string.Empty;

    protected override async Task OnInitializedAsync()
    {
        _deviceId = await DeviceIdService.GetOrCreateDeviceIdAsync();
        await FishTrackerApi.RegisterDevice(new RegisterDevice { Id = _deviceId });

        var response = await FishTrackerApi.GetFish(_deviceId);
        var trackedFishInfos = response.Data;

        Fishes = trackedFishInfos
            .OrderBy(trackedInfo => trackedInfo.Timestamp)
            .Select(trackedInfo => new FishBasic
            {
                Id = trackedInfo.FishId,
                ImgUrl = string.Format(Constant.FishBasic.ImageBaseUrl, trackedInfo.ImageUrl),
                Name = trackedInfo.Fish.Name,
                TrackedTime = FormatTrackedTime(trackedInfo.Timestamp),
                ShowRecentIcon = true
            })
            .ToList();

        _noCatches = !Fishes.Any();
    }

    private string FormatTrackedTime(DateTime time)
    {
        var span = DateTime.Now.Subtract(time);
        return span.TotalHours < 24
            ? string.Format(Constant.FishBasic.HourAgoFormat, (int)span.TotalHours)
            : string.Format(Constant.FishBasic.DayAgoFormat, (int)span.TotalDays);
    }

    private async Task GoToTracking()
    {
        await NavService.GoToLiveTracking();
    }

    private async Task RefreshFishes()
    {
        _loadingFishes = true;
        var response = await FishTrackerApi.GetFish(_deviceId);
        var trackedFishInfos = response.Data;

        Fishes = trackedFishInfos
            .OrderBy(trackedInfo => trackedInfo.Timestamp)
            .Select(trackedInfo => new FishBasic
            {
                Id = trackedInfo.FishId,
                ImgUrl = string.Format(Constant.FishBasic.ImageBaseUrl, trackedInfo.ImageUrl),
                Name = trackedInfo.Fish.Name,
                TrackedTime = FormatTrackedTime(trackedInfo.Timestamp),
                ShowRecentIcon = true
            })
            .ToList();
        
        _loadingFishes = false;
    }
}
