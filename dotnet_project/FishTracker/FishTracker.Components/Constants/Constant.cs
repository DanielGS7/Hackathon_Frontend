namespace FishTracker.Components.Constants;

public static class Constant
{
    
    public static class App
    {
        public const string DeviceIdKey = "deviceId";
    }
    
    public static class FishBasic
    {
        public const string ImageBaseUrl = "https://wafishtrackerapi-dxekchh4dvdjg0g4.francecentral-01.azurewebsites.net/{0}";
        public const string HourAgoFormat = "{0}h ago";
        public const string DayAgoFormat = "{0}d ago";
        public const string YesterdayLabel = "Yesterday";
    }

    public static class AiAssistant
    {
        public const string WelcomeMessage = "Hi, I’m your Fish Assistant!";
        public const string IntroMessage = "Got a catch? I’ve got the facts. I’m your buddy for all things fishy.";
    }
    
    public static class Ui
    {
        public const string FishAssistantUserInputLabel = "Ask me anything";
        public const string StopTrackingButtonLabel = "Stop Tracking";
    }
    
    public static class Api
    {
        public const string BaseUrl = "https://wafishtrackerapi-dxekchh4dvdjg0g4.francecentral-01.azurewebsites.net/api/";
        public const string UploadFishEndpoint = "fish/upload";
        public const string FormData = "form-data";
        public const string ContentTypeImageJpeg = "image/jpeg";
        public const string HeaderDeviceId = "\"deviceId\"";
        public const string HeaderFile = "\"file\"";
        public const string HeaderFileName = "\"{0}\"";
    }
    
    public static class NavRoutes
    {
        public const string FishDetail = "/fish-detail/{0}";
        public const string Home = "/";
        public const string HomeShell = "//Home";
        public const string MyCatches = "/my-catches";
        public const string FishAssistant = "/fish-assistant";
    }
}