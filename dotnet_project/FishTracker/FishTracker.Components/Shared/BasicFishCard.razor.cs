using FishTracker.Components.Interfaces.Services;
using FishTracker.Components.Models;
using Microsoft.AspNetCore.Components;

namespace FishTracker.Components.Shared;

public partial class BasicFishCard : ComponentBase
{
    [Parameter] public FishBasic Fish { get; set; } = null!;

    [Inject] private NavigationManager NavigationManager { get; set; } = null!;
}