namespace FishTracker.Contracts.Dto;

public class TrackedFishInfo
{
    public Fish Fish { get; set; }
    public string ImageUrl { get; set; }
    public DateTime Timestamp { get; set; }
    public string FishId { get; set; }
    public string Id { get; set; }
}