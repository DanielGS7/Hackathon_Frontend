using System.Text.Json.Serialization;

namespace FishTracker.Contracts.Dto;

public class RegisterDevice
{
    [JsonPropertyName("deviceId")]
    public string Id { get; set; }
}