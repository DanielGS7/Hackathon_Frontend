namespace FishTracker.Contracts.Dto;

public class FishUploadResponse
{
    public bool FishDetected { get; set; }
    public Fish[] Fishes { get; set; } = [];
    
}