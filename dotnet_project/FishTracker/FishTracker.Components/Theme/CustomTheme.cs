using MudBlazor;
using MudBlazor.Utilities;

namespace FishTracker.Components.Theme;

public class CustomTheme : MudTheme
{
    public CustomTheme()
    {
        PaletteLight = new PaletteLight
        {
            Primary = new MudColor("#FF6F3C"),
            PrimaryLighten = "#FFCFBE",
            PrimaryDarken = "#EC3E00",
            Black = new MudColor("#28333D"),
            White = new MudColor("#FFFFFF"),
            GrayDefault = "#BDBDBD",
            GrayDarker = "#666666",
            GrayLight = "#E8E8E8",
            GrayLighter = "#F6F6F6",
            Success = "#3DCB6C",
            Warning = "#FFB545",
            Error = "#FF405F",
            Info = "#4986FF",
        };

        Typography = new Typography
        {
            Default = new DefaultTypography
            {
                FontFamily = ["Roboto", "sans-serif"],
                FontSize = "15px",
                FontWeight = "400",
                LineHeight = "125%",
                LetterSpacing = "0%",
            },
            H1 = new H1Typography
            {
                FontWeight = "500",
                FontSize = "30px",
                LetterSpacing = "-0.5%",
            },
            H2 = new H2Typography
            {
                FontWeight = "700",
                FontSize = "24px",
                LetterSpacing = "0.5%",           
            },
            H3 = new H3Typography
            {
                FontSize = "20px",
                FontWeight = "500",
                LetterSpacing = "0%"
            },
            H4 = new H4Typography
            {
                FontSize = "18px",
                FontWeight = "400",
                LetterSpacing = "0.5%"
            },
            Body1 = new Body1Typography()
            {
                FontWeight = "400",
                FontSize = "16px",           
            },
            Body2 = new Body2Typography()
            {
                FontWeight = "400",
                FontSize = "13px",
            }
        };
    }
}