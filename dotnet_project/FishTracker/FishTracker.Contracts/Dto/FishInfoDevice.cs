using System.Text.Json.Serialization;

namespace FishTracker.Contracts.Dto;

public class FishInfoDevice
{
    [JsonPropertyName("fish")]
    public string Id { get; set; }
    public string ImageUrl { get; set; }
    public string TimeStamp { get; set; }
    public string FishId { get; set; }
}