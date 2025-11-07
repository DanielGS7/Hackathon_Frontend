using FishTracker.Components.Constants;
using FishTracker.Components.Interfaces.Services;
using FishTracker.Components.Models;
using FishTracker.Contracts.Api;
using Microsoft.AspNetCore.Components;

namespace FishTracker.Components.Pages.TrackedFish;

public partial class MyCatches : ComponentBase
{
    private List<FishBasic> _trackedToday = [];
    private List<FishBasic> _trackedYesterday = [];
    private List<FishBasic> _trackedOlder = [];
    private bool _loading = true;

    [Inject] public IFishTrackerApi FishTrackerApi { get; set; } = null!;
    [Inject] public IDeviceIdService DeviceIdService { get; set; } = null!;
    

    protected override async Task OnInitializedAsync()
    {
        var deviceId = await DeviceIdService.GetOrCreateDeviceIdAsync();
        var response = await FishTrackerApi.GetFish(deviceId);
        var trackedFishInfos = response.Data;

        _trackedToday = trackedFishInfos
            .Where(trackedInfo => trackedInfo.Timestamp.Date == DateTime.Now.Date)
            .OrderBy(trackedInfo => trackedInfo.Timestamp)
            .Select(trackedInfo => new FishBasic
            {
                Id = trackedInfo.FishId,
                ImgUrl = string.Format(Constant.FishBasic.ImageBaseUrl, trackedInfo.ImageUrl),
                Name = trackedInfo.Fish.Name,
                TrackedTime = string.Format(Constant.FishBasic.HourAgoFormat, DateTime.Now.Subtract(trackedInfo.Timestamp).Hours),
                ShowRecentIcon = true,
            })
            .ToList();

        _trackedYesterday = trackedFishInfos
            .Where(trackedInfo => trackedInfo.Timestamp.Date == DateTime.Now.Date.AddDays(-1))
            .OrderBy(trackedInfo => trackedInfo.Timestamp)
            .Select(trackedInfo => new FishBasic
            {
                Id = trackedInfo.FishId,
                ImgUrl = string.Format(Constant.FishBasic.ImageBaseUrl, trackedInfo.ImageUrl),
                Name = trackedInfo.Fish.Name,
                TrackedTime = Constant.FishBasic.YesterdayLabel,
                ShowRecentIcon = false
            })
            .ToList();
        
        _trackedOlder = trackedFishInfos
            .Where(trackedInfo => trackedInfo.Timestamp.Date < DateTime.Now.Date.AddDays(-1))
            .OrderBy(trackedInfo => trackedInfo.Timestamp)
            .Select(trackedInfo => new FishBasic
            {
                Id = trackedInfo.FishId,
                ImgUrl = string.Format(Constant.FishBasic.ImageBaseUrl, trackedInfo.ImageUrl),
                Name = trackedInfo.Fish.Name,
                TrackedTime = trackedInfo.Timestamp.ToShortDateString(),
                ShowRecentIcon = false
            })
            .ToList();
        
        _loading = false;
    }
}

