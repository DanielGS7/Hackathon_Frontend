# Hackathon Frontend Example 🚀

Welcome to the **Hackathon Frontend Example** project!  
This repository serves as an inspiration for students participating in our hackathon. Feel free to explore, learn, and most importantly—**be creative! Your final project does not have to match this layout, style, or tech stack.** This example is just a starting point to show what’s possible.

---

## About This Project

- **Blazor Hybrid**: This project is primarily built with Blazor Hybrid, which enables you to run C# and Razor components inside a cross-platform application.
- **Component Sharing**: The repository also includes a standard Blazor project that reuses the same components as the Blazor Hybrid project. This setup makes debugging easier and offers a straightforward way to run the UI in a browser.
- **Experiment & Research**: We used this project internally to explore Blazor Hybrid. It’s not a requirement for your hackathon submission—you are encouraged to use your preferred tech stack and design freely!

---

## Tech Stack

- **C# (.NET)** — Main application & business logic (~60%)
- **HTML** — Structure and markup (~29%)
- MudBlazor as Component Library
- Refit httpClient wrapper
- **CSS** — Styling (~11%)
- **JavaScript** — Interactivity (~0.5%)

---

## Getting Started (Setup Guide)

To build and run this example project, you’ll need a few prerequisites:

### Prerequisites

- **.NET 8 SDK**  
  Download from [dotnet.microsoft.com/download](https://dotnet.microsoft.com/download/dotnet/8.0)
- **Visual Studio 2022** (or later)  
  With `.NET MAUI` and `Blazor` development workloads installed.
- **Android SDK** (for building Android APKs)  
  Usually installed with Visual Studio's Mobile Development workload.

(Optional: You can also build for Windows, Mac, or iOS if you have the required SDKs.)

### Steps

1. **Clone the Repository**
   ```sh
   git clone https://github.com/RMDY-NV/Hackathon_Frontend.git
   cd Hackathon_Frontend
   ```

2. **Open in Visual Studio**
   - Open `Hackathon_Frontend.sln`.
   - Restore NuGet packages when prompted.

3. **Select and Build Your Target**
   - For mobile: Choose `Android` or `iOS` as StartUp project.
   - For browser: Use the standard Blazor WebAssembly project.
   
4. **Run / Debug**
   - Press `F5` (Run) or debug as usual in Visual Studio.
   - For Android: Use the emulator or a connected device.

5. **APK Packaging**
   - Follow MAUI/Visual Studio guides to publish APKs ([Microsoft Docs](https://learn.microsoft.com/en-us/dotnet/maui/android/deployment/publish-apk)).

---

## Encouragement for Participants

> **Have fun, and don’t feel limited by this example!**
>
> You’re free to use your own tech stack, design, layout, and creative ideas.  
> This repo is just one possible solution; make yours unique!

---

## Further Reading

- [Blazor Hybrid documentation](https://learn.microsoft.com/en-us/aspnet/core/blazor/hybrid/)
- [.NET MAUI documentation](https://learn.microsoft.com/en-us/dotnet/maui/)

---

## License

See [LICENSE](LICENSE) for usage terms.
