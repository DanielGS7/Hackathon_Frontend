using FishTracker.Contracts.Api;
using Microsoft.Extensions.DependencyInjection;
using Refit;

namespace FishTracker.Contracts;

public static class ContractsRegistrations
{
    public static void RegisterContracts(this IServiceCollection services)
    {
            services
                .AddRefitClient<IFishTrackerApi>()
                .ConfigureHttpClient(c => c.BaseAddress = new Uri("https://wafishtrackerapi-dxekchh4dvdjg0g4.francecentral-01.azurewebsites.net/api"));
    }
    
}