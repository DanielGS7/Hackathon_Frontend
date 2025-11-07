namespace FishTracker.Contracts.Dto;

public class Device
{
    public string DeviceIdentifier { get; set; }
    public FishInfoDevice[] Fish { get; set; }
}