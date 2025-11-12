# Gemini Dev Guide for FishTracker

## 📌 Guiding Principles

- This document contains guidelines for developing the FishTracker project.
- My primary goal is to assist effectively, adhering to the conventions outlined here.
- If a request contradicts these guidelines, I will ask for clarification before proceeding.

---

## 🚨 Core Rules

### Communication
- I will not add comments to new files unless the file already has them or the logic is exceptionally complex.
- I will not include mentions of AI, LLMs, or my status as a bot in any code or documentation.
- I will prioritize clear naming conventions for self-documenting code.

### Git Workflow
- I will only perform commits on the current branch. I will not create new branches.
- I will not push changes to a remote repository unless explicitly asked to do so.
- Before committing, I will propose a clear and concise commit message for your approval.

### Pre-Commit Checklist
- [ ] Changes are directly related to the requested task.
- [ ] No AI/LLM mentions are present in the code.
- [ ] The code follows the project's existing style and conventions.
- [ ] The commit message is descriptive and follows project patterns.

---

## 🏗️ Project Information

### Stack
- **UI Framework:** .NET MAUI with Blazor Hybrid
- **Language:** C#
- **Architecture:** Component-based architecture with shared services and data contracts.

### Solution Structure
- `FishTracker.App`: The main .NET MAUI application project. This is the entry point for mobile and desktop platforms.
- `FishTracker.Components`: A Razor Class Library (RCL) containing the shared Blazor UI components, pages, and related logic. This is where most of the UI development happens.
- `FishTracker.Contracts`: A class library for Data Transfer Objects (DTOs) and API client interfaces. It defines the data structures for the application.
- `Fishtracker.Web`: A Blazor web project, likely for hosting the application on the web, reusing components from `FishTracker.Components`.

---

## 📖 Conventions

### Naming
- **Classes & Methods:** `PascalCase` (e.g., `MyCatches`, `OnInitializedAsync`)
- **Parameters & Variables:** `camelCase` (e.g., `fishId`, `trackedFish`)
- **Private Fields:** `_camelCase` (e.g., `_navigationManager`)
- **Async Methods:** Suffix with `Async` (e.g., `LoadDataAsync`)
- **Interfaces:** Prefix with `I` (e.g., `INavService`)

### Code Style
- Use constructor injection for services in Blazor components.
- Always use `async`/`await` for asynchronous operations.
- Place component logic in the `.razor.cs` code-behind file.
- Define UI in the `.razor` file.

---

## 📝 Feature Workflow Example (New Page)

1.  **Contract:** If new data structures are needed, define the DTOs in the `FishTracker.Contracts` project.
2.  **Component:** Create the new Blazor component/page in `FishTracker.Components/Pages/`.
    - Create `MyNewPage.razor` for the UI markup.
    - Create `MyNewPage.razor.cs` for the C# logic.
3.  **Service:** If the page requires new business logic (e.g., data fetching), add the necessary service interfaces and implementations.
4.  **Navigation:** Add the new page to the navigation structure, likely within `FishTracker.App/AppShell.xaml` or a shared navigation component.

---

## 📍 File Locations

| Type | Path |
|------|------|
| Blazor Page | `FishTracker.Components/Pages/[Feature]/[Page].razor` |
| Shared Component | `FishTracker.Components/Shared/[Component].razor` |
| Data Contract (DTO) | `FishTracker.Contracts/Dto/[Model].cs` |
| API Interface | `FishTracker.Contracts/Api/I[Name]Api.cs` |
| App Service | `FishTracker.App/Services/[Service].cs` |
| Component Service | `FishTracker.Components/Services/[Service].cs` |
| MAUI App Entry | `FishTracker.App/MauiProgram.cs` |
| Web App Entry | `Fishtracker.Web/Program.cs` |

---

## 🚀 Common Commands

### Run the MAUI App (Android Example)
```bash
dotnet build FishTracker/FishTracker.App/FishTracker.App.csproj -t:Run -f net8.0-android
```

### Run the Web App
```bash
dotnet run --project Fishtracker.Web/Fishtracker.Web.csproj
```
