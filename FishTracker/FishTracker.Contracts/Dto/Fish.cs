using System.Text.Json.Serialization;

namespace FishTracker.Contracts.Dto;

public class Fish
{
    [JsonPropertyName("fishId")]
    public string Id { get; set; }
    public string Name { get; set; }
    public string Family { get; set; }
    public int MinSize { get; set; }
    public int MaxSize { get; set; }
    public string WaterType { get; set; }
    public string Description { get; set; }
    public string ColorDescription { get; set; }
    public int DepthRangeMin { get; set; }
    public int DepthRangeMax { get; set; }
    public string Environment { get; set; }
    public string Region { get; set; }
    public string ConservationStatus { get; set; }
    public string ConsStatusDescription { get; set; }
    public bool FavoriteIndicator { get; set; }
    public int AiAccuracy { get; set; }
    public string ImageUrl { get; set; }
}