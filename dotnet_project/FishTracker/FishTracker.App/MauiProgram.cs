using CommunityToolkit.Maui;
using FishTracker.Components;
using Microsoft.Extensions.Logging;
using MudBlazor.Services;
using FishTracker.App.Services;
using FishTracker.Components.Interfaces.Services;
using FishTracker.Contracts;

namespace FishTracker.App;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .UseMauiCommunityToolkitCamera()
            .ConfigureFonts(fonts => { fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular"); })
            .UseMauiCommunityToolkit();
        
        builder.Services.AddMauiBlazorWebView();
        builder.Services.AddMudServices();
        
        builder.Services.RegisterAppComponents();

        builder.Services.AddSingleton<INavService, NavService>();
        builder.Services.AddSingleton<IDeviceIdService, DeviceIdService>();
        builder.Services.RegisterContracts();

#if DEBUG
        builder.Services.AddBlazorWebViewDeveloperTools();
        builder.Logging.AddDebug();
#endif
        return builder.Build();
    }
}