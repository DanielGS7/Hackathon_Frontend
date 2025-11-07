using FishTracker.Components.Models;
using Microsoft.AspNetCore.Components;

namespace FishTracker.Components.Pages.TrackedFish.Parts;

public partial class CatchesPaper : ComponentBase
{
    [Parameter] public string Title { get; set; } = "Title";
    [Parameter] public List<FishBasic> Fishes { get; set; } = [];
    [Parameter] public bool LoadingFishes { get; set; }

}

