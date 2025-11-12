using FishTracker.Components.Constants;
using FishTracker.Components.Interfaces.Services;
using FishTracker.Contracts.Api;
using FishTracker.Contracts.Dto;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using MudBlazor;
using Refit;

namespace MudBlazorDebug;

public partial class CameraTracking : ComponentBase
{
    [Inject] public IFishTrackerApi Api { get; set; } = null!;
    [Inject] public IDeviceIdService DeviceIdService { get; set; } = null!;
    [Inject] public ISnackbar Snackbar { get; set; } = null!;

    private async Task UploadFile(IBrowserFile? browserFile)
    {
        if (browserFile == null)
            return;

        var stream = browserFile.OpenReadStream();
        var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream);
        var deviceId = await DeviceIdService.GetOrCreateDeviceIdAsync();

        await UploadFishImageAsync(deviceId, memoryStream, browserFile.Name);
    }

    public string Response { get; set; } = "Send file for response";


    private async Task UploadFishImageAsync(string deviceId, Stream imageStream, string fileName)
    {
        try
        {
            using var httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri(Constant.Api.BaseUrl);


            using var content = CreateMultipartFormDataContent(deviceId, imageStream, fileName);
            var response = await httpClient.PostAsync(Constant.Api.UploadFishEndpoint, content);

            if (!response.IsSuccessStatusCode)
                Snackbar.Add($"Error: {response.StatusCode} {response.ReasonPhrase}", Severity.Error);

            var responseContent = await response.Content.ReadFromJsonAsync<FishTrackerApiResponse<string>>();

            Snackbar.Add(responseContent?.Message ?? "empty response", Severity.Success);
        }
        catch (HttpRequestException httpEx)
        {
            Snackbar.Add($"Error: {httpEx.Message}", Severity.Error);
        }
        catch (Exception ex)
        {
            Snackbar.Add($"Error: {ex.Message}", Severity.Error);
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
            streamContent.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(Constant.Api.ContentTypeImageJpeg);
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
}