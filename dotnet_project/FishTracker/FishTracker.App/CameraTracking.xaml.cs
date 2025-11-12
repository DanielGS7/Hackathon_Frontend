using System.Net.Http.Json;
using CommunityToolkit.Maui.Alerts;
using CommunityToolkit.Maui.Core;
using FishTracker.Components.Constants;
using FishTracker.Components.Interfaces.Services;
using FishTracker.Contracts.Dto;
#if ANDROID
#endif

namespace FishTracker.App;

public partial class CameraTracking : ContentPage
{
    private readonly IDeviceIdService _deviceIdService;
    private CancellationTokenSource? _previewCts;
    private string _deviceId = string.Empty;
    
    public CameraTracking( IDeviceIdService deviceIdService)
    {
        _deviceIdService = deviceIdService;
        InitializeComponent();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        Loaded += OnPageLoaded;
    }

    private async void OnPageLoaded(object? sender, EventArgs e)
    {
        try
        {
            _deviceId = await _deviceIdService.GetOrCreateDeviceIdAsync();
            _previewCts = new CancellationTokenSource();
            
            // Start camera preview before sending pictures
            await Camera.StartCameraPreview(_previewCts.Token);
            
            // Wait briefly to ensure preview is visible
            await Task.Delay(500);
            await StartSendingPictures(_previewCts.Token);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Preview start failed: {ex}");
        }
    }

    protected override void OnDisappearing()
    {
        base.OnDisappearing();
        try
        {
            _previewCts?.Cancel();
            _previewCts?.Dispose();
            _previewCts = null;
            Camera.StopCameraPreview();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Preview stop failed: {ex}");
        }
    }

    private async Task StartSendingPictures(CancellationToken token)
    {
        while (!token.IsCancellationRequested)
        {
            try
            {
                var photo = await Camera.CaptureImage(token);
                if (photo != null)
                {
                    var fileName = $"image_{DateTime.Now:yyyyMMdd_HHmmss}.jpg";

                    // Upload photo to server
                    var success = await UploadFishImageAsync(_deviceId, photo, fileName);

                    if (success)
                    {
                        // Show success notification
                        await ShowToast("✓Photo uploaded successfully!");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Photo capture/upload failed: {ex}");
            }

            await Task.Delay(3000, token);
        }
    }

    private async Task ShowToast(string text)
    {
        var toast = Toast.Make(text, ToastDuration.Short, 16);
        await toast.Show();
    }

    private async Task<bool> UploadFishImageAsync(string deviceId, Stream imageStream, string fileName)
    {
        try
        {
            using var httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri(Constant.Api.BaseUrl);
            
            
            using var content = CreateMultipartFormDataContent(deviceId, imageStream, fileName);
            var response = await httpClient.PostAsync(Constant.Api.UploadFishEndpoint, content);

            if (!response.IsSuccessStatusCode) 
                return false;
            
            var responseContent = await response.Content.ReadFromJsonAsync<FishTrackerApiResponse<string>>();
            await ShowToast(responseContent?.Message ?? "empty response");
            return true;
        }
        catch (HttpRequestException httpEx)
        {
            return false;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    private static MultipartFormDataContent CreateMultipartFormDataContent(string deviceId, Stream imageStream,
        string fileName)
    {
        MultipartFormDataContent? content = null;
        try
        {
            content = new MultipartFormDataContent();

            var deviceIdContent = new StringContent(deviceId);
            deviceIdContent.Headers.ContentDisposition =
                new System.Net.Http.Headers.ContentDispositionHeaderValue(Constant.Api.FormData)
                {
                    Name = Constant.Api.HeaderDeviceId
                };
            content.Add(deviceIdContent);

            // Add file with explicit Content-Disposition
            var streamContent = new StreamContent(imageStream);
            streamContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(Constant.Api.ContentTypeImageJpeg);
            streamContent.Headers.ContentDisposition =
                new System.Net.Http.Headers.ContentDispositionHeaderValue(Constant.Api.FormData)
                {
                    Name = Constant.Api.HeaderFile,
                    FileName = string.Format(Constant.Api.HeaderFileName, fileName)
                };
            content.Add(streamContent);
            return content;
        }
        catch
        {
            content?.Dispose();
            throw;
        }
    }

    private async void OnHomeClicked(object? sender, EventArgs e)
    {
        try
        {
            // Stop the camera and cancel the preview first
            _previewCts?.Cancel();
            _previewCts?.Dispose();
            _previewCts = null;
            Camera.StopCameraPreview();

            // Navigate back to home - use the route defined in AppShell
            await Shell.Current.GoToAsync(Constant.NavRoutes.HomeShell);
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"Navigation failed: {ex}");
        }
    }
}