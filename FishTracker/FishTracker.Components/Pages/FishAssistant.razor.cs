using FishTracker.Components.Constants;
using FishTracker.Components.Interfaces.Services;
using FishTracker.Components.Models;
using FishTracker.Contracts.Api;
using FishTracker.Contracts.Dto;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;

namespace FishTracker.Components.Pages;

public partial class FishAssistant : ComponentBase
{
    [Inject] public IFishTrackerApi FishTrackerApi { get; set; } = null!;
    [Inject] public IDeviceIdService DeviceIdService { get; set; } = null!;

    public string UserInput { get; set; } = string.Empty;

    private List<ChatMessage> Messages { get; set; } = [];
    private string _deviceId = string.Empty;
    private bool _chatLoading;
    private ElementReference _dummyBtn;

    protected override async Task OnInitializedAsync()
    {
        _deviceId = await DeviceIdService.GetOrCreateDeviceIdAsync();
        Messages.Add(new ChatMessage { IsUser = false, Content = Constant.AiAssistant.WelcomeMessage, TimeStamp = DateTime.Now });
        Messages.Add(new ChatMessage { IsUser = false, Content = Constant.AiAssistant.IntroMessage, TimeStamp = DateTime.Now });
    }

    private async Task SendChat(MouseEventArgs obj)
    {
        if (string.IsNullOrEmpty(UserInput))
        {
            await _dummyBtn.FocusAsync();
            return;
        }
        
        _chatLoading = true;
        Messages.Add(new ChatMessage { Content = UserInput, IsUser = true, TimeStamp = DateTime.Now });
        StateHasChanged();

        var chatRequest = new ChatRequest { Message = UserInput };
        var response = await FishTrackerApi.Chat(_deviceId, chatRequest);
        Messages.Add(new ChatMessage { Content = response.Content.Data.Response, IsUser = false, TimeStamp = DateTime.Now });

        UserInput = string.Empty;
        _chatLoading = false;
        await _dummyBtn.FocusAsync();
        StateHasChanged();
    }
}