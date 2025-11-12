using FishTracker.Components.Interfaces.Services;
using Microsoft.AspNetCore.Components;

namespace FishTracker.Components.Shared;

public partial class PageHeader
{
    [Parameter] public string Title { get; set; } = "Title";
    [Inject] public NavigationManager NavigationManager { get; set; } = null!;
}