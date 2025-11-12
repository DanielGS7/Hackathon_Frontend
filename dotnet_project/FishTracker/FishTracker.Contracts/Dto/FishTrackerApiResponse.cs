namespace FishTracker.Contracts.Dto;

public class FishTrackerApiResponse<T>
{
    public bool Succes { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
}