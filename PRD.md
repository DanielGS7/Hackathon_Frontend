# FishTracker Frontend - Product Requirements Document (PRD)

## Executive Summary

**Product Name:** FishTracker
**Version:** 2.0 (Next.js Implementation)
**Target Platform:** Web (Progressive Web App)
**Technology Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4
**Backend API:** RESTful API (documented via Swagger)

FishTracker is a fish detection and tracking application that enables users to capture images of fish, identify them using AI, and learn about various fish species through an intelligent chat assistant. The application combines computer vision, marine biology data, and conversational AI to provide an educational and engaging experience for marine enthusiasts, fishermen, and researchers.

---

## 1. Product Overview

### 1.1 Purpose
FishTracker provides a mobile-first web application that:
- Captures and uploads fish images for AI-powered identification
- Tracks user's fish catches with timestamps and location data
- Provides detailed information about identified fish species
- Offers an AI chat assistant for answering questions about detected fish
- Maintains conservation status awareness and environmental education

### 1.2 Target Users
- **Primary:** Recreational fishermen, marine enthusiasts, divers
- **Secondary:** Marine biology students, researchers, educators
- **Tertiary:** Conservation organizations, aquarium visitors

### 1.3 Key Differentiators
- Real-time AI fish identification
- Comprehensive fish species database with conservation status
- Interactive AI chat for marine education
- Device-based tracking (no mandatory user accounts)
- Progressive Web App (works across all devices)

---

## 2. Technical Architecture

### 2.1 Frontend Stack
```
├── Framework: Next.js 16.0.1 (React 19.2.0)
├── Language: TypeScript 5
├── Styling: Tailwind CSS 4
├── Animations: Lottie-react 2.4.1
├── State Management: React Hooks (useState, useEffect)
├── Routing: Next.js App Router
└── Storage: localStorage (Device ID persistence)
```

### 2.2 Project Structure
```
fishtracker-nextjs/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Home page
│   │   ├── layout.tsx               # Root layout
│   │   ├── globals.css              # Global styles
│   │   ├── live-tracking/
│   │   │   └── page.tsx             # Live tracking page
│   │   └── fish-assistant/
│   │       └── page.tsx             # AI chat page
│   ├── components/
│   │   └── RecentCatchesPanel.tsx   # Recent catches widget
│   ├── services/
│   │   ├── fishTrackerApi.ts        # API client
│   │   └── deviceIdService.ts       # Device ID management
│   └── types/
│       └── dto.ts                   # TypeScript interfaces
└── public/
    └── images/                      # Static assets
```

### 2.3 Backend API Integration

**Base URL:** `http://localhost:5000` (Development)

#### API Endpoints

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/device/register` | POST | Register new device | ✅ Implemented |
| `/device/{id}` | GET | Get device details | ⏳ Not used yet |
| `/fish/{deviceId}` | GET | Get all fish for device | ✅ Implemented |
| `/fish/upload` | POST | Upload fish image | ❌ To implement |
| `/fish/image/{imagePath}` | GET | Get fish image | ❌ To implement |
| `/chat/{deviceId}` | POST | Chat with AI | ❌ To implement |

---

## 3. Feature Requirements

### 3.1 Core Features (Must Have - MVP)

#### 3.1.1 Home Page
**Status:** ✅ 80% Complete

**Requirements:**
- [✅] Display app branding and call-to-action
- [✅] Show animated fish icon with Lottie animation
- [✅] Device registration on first visit
- [✅] Display recent catches panel (when catches exist)
- [✅] Navigation to live tracking
- [✅] Navigation to fish assistant
- [❌] Display fish thumbnails with images from backend
- [❌] Click on fish to view detailed information
- [❌] Loading states and error handling

**User Stories:**
```
AS A user
I WANT to see my recent fish catches on the home screen
SO THAT I can quickly access my tracking history

AS A first-time user
I WANT to be automatically registered with a device ID
SO THAT I can start using the app without creating an account
```

**Acceptance Criteria:**
- Device ID is generated and stored in localStorage
- Recent catches display fish name, image, and time tracked
- "Recent" badge shows for catches within 24 hours
- Smooth animations and responsive design
- Pull-to-refresh functionality for recent catches

---

#### 3.1.2 Live Tracking Page
**Status:** ❌ 0% Complete (Placeholder only)

**Requirements:**
- [❌] Camera access for capturing fish images
- [❌] Image preview before upload
- [❌] Upload button with loading state
- [❌] Real-time fish identification feedback
- [❌] Display AI accuracy percentage
- [❌] Option to retake photo
- [❌] Display detected fish information
- [❌] Save to tracked fish list
- [❌] Handle "no fish detected" scenario
- [❌] Option to upload from gallery
- [❌] Error handling for upload failures

**User Stories:**
```
AS A fisherman
I WANT to take a picture of a fish I caught
SO THAT I can identify it and learn about it

AS A user
I WANT to see the AI confidence level
SO THAT I can trust the identification

AS A user
I WANT to upload an existing photo from my gallery
SO THAT I can identify fish I photographed earlier
```

**Acceptance Criteria:**
- Camera opens on page load with user permission
- Image is compressed before upload (max 5MB)
- Upload shows progress indicator
- Success: Display fish information with animation
- Failure: Show error message with retry option
- Multiple fish detected: Show all results
- No fish detected: Show helpful message

**API Integration:**
```typescript
POST /fish/upload
Content-Type: multipart/form-data

Request:
- deviceId: string
- file: binary (image file)

Response:
{
  "success": boolean,
  "message": string,
  "data": {
    "fishDetected": boolean,
    "fishes": Fish[]
  }
}
```

**UI Components:**
```
LiveTrackingPage
├── CameraView
│   ├── Video stream preview
│   ├── Capture button
│   └── Gallery upload button
├── ImagePreview
│   ├── Preview image
│   ├── Retake button
│   └── Upload button
├── UploadProgress
│   └── Loading spinner with percentage
└── FishResultCard
    ├── Fish image
    ├── Fish name and family
    ├── AI accuracy badge
    ├── Quick facts
    └── "View Details" button
```

---

#### 3.1.3 Fish Assistant (AI Chat)
**Status:** ❌ 0% Complete (Placeholder only)

**Requirements:**
- [❌] Chat interface with message history
- [❌] Send text messages to AI
- [❌] Display AI responses with typing animation
- [❌] Context-aware responses (about user's detected fish)
- [❌] Suggested questions/prompts
- [❌] Message timestamps
- [❌] Copy response to clipboard
- [❌] Clear chat history
- [❌] Error handling for API failures
- [❌] Offline mode message

**User Stories:**
```
AS A user
I WANT to ask questions about the fish I've detected
SO THAT I can learn more about them

AS A user
I WANT to see suggested questions
SO THAT I know what I can ask the AI

AS A student
I WANT to ask about conservation status
SO THAT I can understand environmental concerns
```

**Acceptance Criteria:**
- Chat shows relevant information about tracked fish
- AI responses are contextual and educational
- Messages persist during session
- Typing indicator shows while AI is responding
- Error messages are user-friendly
- Suggested questions are relevant to user's catches

**API Integration:**
```typescript
POST /chat/{deviceId}
Content-Type: application/json

Request:
{
  "message": string
}

Response:
{
  "success": boolean,
  "data": {
    "response": string
  }
}
```

**UI Components:**
```
FishAssistantPage
├── ChatHeader
│   ├── Title
│   └── Clear history button
├── MessageList
│   ├── UserMessage
│   │   ├── Message text
│   │   └── Timestamp
│   └── AIMessage
│       ├── Avatar/icon
│       ├── Message text
│       ├── Timestamp
│       └── Copy button
├── SuggestedQuestions
│   └── Question chips (clickable)
└── ChatInput
    ├── Text input field
    ├── Send button
    └── Character counter
```

---

#### 3.1.4 Fish Details Page
**Status:** ❌ Not Started

**Requirements:**
- [❌] Display full fish information
- [❌] Large fish image
- [❌] Scientific details (family, size range, depth range)
- [❌] Conservation status with color coding
- [❌] Water type and environment
- [❌] Geographic region
- [❌] Color description
- [❌] Favorite/bookmark functionality
- [❌] Share fish information
- [❌] Navigate to similar fish
- [❌] Detection history for this fish

**User Stories:**
```
AS A user
I WANT to view detailed information about a fish
SO THAT I can learn its characteristics

AS A conservationist
I WANT to see the conservation status
SO THAT I can understand which species need protection

AS A user
I WANT to favorite interesting fish
SO THAT I can quickly find them later
```

**Route:** `/fish/[fishId]`

**Data Model:**
```typescript
interface Fish {
  id: string;
  name: string;
  family: string;
  minSize: number;              // cm
  maxSize: number;              // cm
  waterType: "Freshwater" | "Saltwater" | "Brackish";
  description: string;
  colorDescription: string;
  depthRangeMin: number;        // meters
  depthRangeMax: number;        // meters
  environment: string;
  region: string;
  conservationStatus:
    | "Least Concern"
    | "Near Threatened"
    | "Vulnerable"
    | "Endangered"
    | "Critically Endangered"
    | "Extinct in the Wild"
    | "Extinct"
    | "Data Deficient";
  consStatusDescription: string;
  favoriteIndicator: boolean;
  aiAccuracy: number;           // percentage
  imageUrl: string;
}
```

**UI Sections:**
```
FishDetailsPage
├── FishHero
│   ├── Large image
│   ├── Fish name
│   ├── Scientific family
│   └── Favorite button
├── QuickFacts
│   ├── Water type badge
│   ├── Size range
│   ├── Depth range
│   └── AI accuracy
├── ConservationStatus
│   ├── Status badge (color-coded)
│   └── Description
├── Description
│   └── Full text description
├── PhysicalCharacteristics
│   ├── Color description
│   └── Size details
├── Habitat
│   ├── Environment
│   └── Geographic region
└── ActionButtons
    ├── Share button
    ├── Ask AI about this fish
    └── View similar fish
```

**Conservation Status Colors:**
- Least Concern: Green (#10B981)
- Near Threatened: Yellow (#FBBF24)
- Vulnerable: Orange (#F59E0B)
- Endangered: Red (#EF4444)
- Critically Endangered: Dark Red (#991B1B)
- Extinct in the Wild: Gray (#6B7280)
- Extinct: Black (#1F2937)
- Data Deficient: Blue (#3B82F6)

---

### 3.2 Secondary Features (Should Have)

#### 3.2.1 Recent Catches Enhancement
**Priority:** High

**Requirements:**
- Display fish thumbnail images (from backend)
- Show AI accuracy badge
- Filter catches (all, recent, favorites)
- Sort options (newest, oldest, name)
- Delete catch from history
- Export catches as CSV/JSON

#### 3.2.2 Image Display Integration
**Priority:** High

**Requirements:**
```typescript
// Fetch image from backend
GET /fish/image/{imagePath}

// Implementation
const getImageUrl = (imagePath: string) => {
  return `${API_BASE_URL}/fish/image/${imagePath}`;
};
```

**Usage:**
```tsx
<img
  src={getImageUrl(fish.imageUrl)}
  alt={fish.name}
  onError={(e) => {
    e.currentTarget.src = '/images/placeholder-fish.png';
  }}
/>
```

#### 3.2.3 Search and Filter
**Priority:** Medium

**Requirements:**
- Search fish by name
- Filter by water type
- Filter by conservation status
- Filter by region
- Sort by name, size, recent detection

#### 3.2.4 Favorites Management
**Priority:** Medium

**Requirements:**
- Mark fish as favorite
- View all favorites
- Remove from favorites
- Sync favorites with device

**Implementation:**
- Store favorites in localStorage
- Key: `fishtracker_favorites_{deviceId}`
- Value: Array of fish IDs

---

### 3.3 Nice-to-Have Features (Could Have)

#### 3.3.1 Statistics Dashboard
- Total catches count
- Most common fish
- Water type distribution chart
- Detection accuracy average
- Catches over time graph

#### 3.3.2 Fish Encyclopedia
- Browse all known fish species
- Educational content
- Fish comparison tool

#### 3.3.3 Social Features
- Share catches on social media
- Compare catches with friends
- Leaderboards

#### 3.3.4 Offline Support
- Cache recent catches
- Queue uploads for when online
- Offline chat with cached data
- Service worker implementation

#### 3.3.5 Advanced Camera Features
- Flash control
- Zoom functionality
- Grid overlay for composition
- Camera flip (front/back)

---

## 4. User Experience (UX) Requirements

### 4.1 Design Principles
1. **Mobile-First:** Design for small screens, enhance for larger
2. **Simplicity:** Minimize clicks to complete tasks
3. **Visual Feedback:** Clear loading states and confirmations
4. **Accessibility:** WCAG 2.1 AA compliance
5. **Performance:** < 3s initial load, < 1s navigation

### 4.2 Color Palette
```css
Primary Blue: #2563EB (rgb(37, 99, 235))
Primary Hover: #1D4ED8
Secondary Gray: #6B7280
Background: #F9FAFB
Success Green: #10B981
Warning Yellow: #FBBF24
Error Red: #EF4444
Text Primary: #111827
Text Secondary: #6B7280
```

### 4.3 Typography
- **Headings:** Font: System Default (sans-serif), Weight: Bold (700)
- **Body:** Font: System Default (sans-serif), Weight: Regular (400)
- **Sizes:**
  - H1: 2.25rem (36px)
  - H2: 1.5rem (24px)
  - H3: 1.25rem (20px)
  - Body: 1rem (16px)
  - Small: 0.875rem (14px)

### 4.4 Navigation Flow
```
Home Page
├── → Live Tracking (Capture)
│   └── → Fish Details
│       └── → Fish Assistant
├── → Fish Assistant (Chat)
└── → Fish Details (Click recent catch)
    └── → Fish Assistant
```

### 4.5 Loading States
- **Initial Load:** Skeleton screens for content areas
- **Data Fetch:** Spinner with message
- **Image Upload:** Progress bar with percentage
- **Chat:** Typing indicator with animated dots
- **Transitions:** Smooth fade-in/fade-out (300ms)

### 4.6 Error Handling
| Error Type | User Message | Action |
|------------|-------------|--------|
| Network Error | "Unable to connect. Check your internet connection." | Retry button |
| Upload Failed | "Failed to upload image. Please try again." | Retry button |
| No Fish Detected | "No fish detected in this image. Try a clearer photo." | Retake button |
| API Error | "Something went wrong. Please try again later." | Back button |
| Camera Permission | "Camera access required to track fish." | Grant permission |

---

## 5. API Service Implementation

### 5.1 Enhanced API Service
**File:** `src/services/fishTrackerApi.ts`

**Required Methods:**
```typescript
export const fishTrackerApi = {
  // ✅ Implemented
  registerDevice: async (device: RegisterDevice): Promise<ApiResponse<any>>

  // ✅ Implemented
  getFish: async (deviceId: string): Promise<ApiResponse<TrackedFishInfo[]>>

  // ❌ To Implement
  getDeviceById: async (deviceId: string): Promise<ApiResponse<Device>>

  // ❌ To Implement
  uploadFishImage: async (
    deviceId: string,
    file: File
  ): Promise<ApiResponse<FishUploadResponse>>

  // ❌ To Implement
  getFishImage: async (imagePath: string): Promise<Blob>

  // ❌ To Implement
  chatWithAI: async (
    deviceId: string,
    message: string
  ): Promise<ApiResponse<ChatResponse>>

  // ❌ To Implement
  getFishDetails: async (
    deviceId: string,
    fishId: string
  ): Promise<ApiResponse<Fish>>
};
```

### 5.2 Type Definitions Updates
**File:** `src/types/dto.ts`

**Required Updates:**
```typescript
// ✅ Already defined
export interface ChatRequest { message: string; }
export interface ChatResponse { response: string; }
export interface Device { deviceIdentifier: string; fish: FishInfoDevice[]; }
export interface Fish { /* 14 properties */ }
export interface FishInfoDevice { id: string; imageUrl: string; timeStamp: string; fishId: string; }
export interface FishTrackerApiResponse<T> { succes: boolean; message: string; data: T; }
export interface FishUploadResponse { fishDetected: boolean; fishes: Fish[]; }
export interface RegisterDevice { id: string; }
export interface TrackedFishInfo { fish: Fish; imageUrl: string; timestamp: string; fishId: string; id: string; }
export interface FishBasic { id: string; imgUrl: string; name: string; trackedTime: string; showRecentIcon: boolean; }

// ❌ To Add
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type WaterType = 'Freshwater' | 'Saltwater' | 'Brackish';
export type ConservationStatus =
  | 'Least Concern'
  | 'Near Threatened'
  | 'Vulnerable'
  | 'Endangered'
  | 'Critically Endangered'
  | 'Extinct in the Wild'
  | 'Extinct'
  | 'Data Deficient';
```

---

## 6. Component Specifications

### 6.1 Required Components

#### 6.1.1 Layout Components
- [✅] `RootLayout` - Main app layout with metadata
- [❌] `AppHeader` - Navigation header with back button
- [❌] `AppFooter` - Footer with app info
- [❌] `BottomNavigation` - Mobile bottom nav bar

#### 6.1.2 Feature Components
- [✅] `RecentCatchesPanel` - Display recent catches
- [❌] `CameraCapture` - Camera interface
- [❌] `ImagePreview` - Preview before upload
- [❌] `FishCard` - Display fish info card
- [❌] `FishDetailView` - Full fish details
- [❌] `ChatInterface` - Chat UI
- [❌] `MessageBubble` - Individual chat message
- [❌] `SuggestedQuestions` - Quick question chips
- [❌] `ConservationBadge` - Status indicator
- [❌] `FavoriteButton` - Toggle favorite

#### 6.1.3 Utility Components
- [❌] `LoadingSpinner` - Loading indicator
- [❌] `ErrorMessage` - Error display
- [❌] `EmptyState` - No data placeholder
- [❌] `Button` - Reusable button
- [❌] `Badge` - Info badge
- [❌] `Modal` - Modal dialog
- [❌] `Toast` - Notification

---

## 7. Performance Requirements

### 7.1 Loading Performance
| Metric | Target | Current |
|--------|--------|---------|
| Initial Page Load | < 3s | ✅ ~2s |
| Time to Interactive | < 5s | ✅ ~3s |
| Image Upload | < 10s (5MB) | ❌ Not implemented |
| API Response Time | < 2s | ⏳ Depends on backend |
| Navigation Transition | < 300ms | ✅ ~200ms |

### 7.2 Optimization Strategies
1. **Code Splitting:** Lazy load pages and components
2. **Image Optimization:** Use Next.js Image component
3. **Caching:** Cache API responses in memory
4. **Compression:** Compress images before upload
5. **Bundle Size:** Keep bundle < 300KB gzipped

### 7.3 Browser Support
- Chrome 90+ ✅
- Firefox 88+ ✅
- Safari 14+ ✅
- Edge 90+ ✅
- Mobile Safari (iOS 14+) ✅
- Chrome Mobile (Android 8+) ✅

---

## 8. Security Requirements

### 8.1 Data Protection
- [❌] HTTPS only in production
- [❌] Sanitize user inputs
- [❌] Validate file uploads (type, size)
- [❌] Secure localStorage usage
- [❌] CORS configuration

### 8.2 API Security
- [❌] API key/token if required
- [❌] Rate limiting handling
- [❌] Error message sanitization (no sensitive info)

### 8.3 Content Security
- [❌] Content Security Policy (CSP) headers
- [❌] XSS protection
- [❌] CSRF protection for state-changing operations

---

## 9. Testing Requirements

### 9.1 Unit Tests
- [ ] Component rendering tests
- [ ] Service function tests
- [ ] Utility function tests
- [ ] Type validation tests

### 9.2 Integration Tests
- [ ] API integration tests
- [ ] User flow tests (capture → view → chat)
- [ ] localStorage integration tests

### 9.3 E2E Tests
- [ ] Complete user journey
- [ ] Camera capture flow
- [ ] Chat conversation flow
- [ ] Error scenarios

### 9.4 Manual Testing Checklist
- [ ] Camera works on different devices
- [ ] Images upload correctly
- [ ] Chat responses are relevant
- [ ] Responsive design on all breakpoints
- [ ] Accessibility with screen reader
- [ ] Performance on slow networks
- [ ] Offline behavior

---

## 10. Deployment Requirements

### 10.1 Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=FishTracker
NEXT_PUBLIC_IMAGE_MAX_SIZE=5242880  # 5MB
```

### 10.2 Build Configuration
```json
// next.config.ts
{
  "images": {
    "domains": ["localhost", "api.fishtracker.com"]
  },
  "compress": true,
  "poweredByHeader": false
}
```

### 10.3 Deployment Targets
- **Development:** Vercel (auto-deploy from main branch)
- **Staging:** Vercel (preview deployments)
- **Production:** Vercel/Netlify/Custom hosting

---

## 11. Development Roadmap

### Phase 1: Core MVP (Weeks 1-2)
- [✅] Project setup and structure
- [✅] Home page with device registration
- [✅] Recent catches display (basic)
- [❌] Live tracking page with camera
- [❌] Image upload functionality
- [❌] Basic fish details display

### Phase 2: AI Integration (Weeks 3-4)
- [❌] Chat interface implementation
- [❌] AI response handling
- [❌] Context-aware conversations
- [❌] Suggested questions feature

### Phase 3: Enhanced Features (Weeks 5-6)
- [❌] Full fish details page
- [❌] Image display from backend
- [❌] Favorites functionality
- [❌] Search and filter
- [❌] Statistics dashboard

### Phase 4: Polish & Testing (Week 7-8)
- [❌] Comprehensive testing
- [❌] Performance optimization
- [❌] Accessibility improvements
- [❌] Bug fixes and refinements
- [❌] Documentation completion

---

## 12. Success Metrics

### 12.1 User Engagement
- Daily active users
- Average session duration
- Fish uploads per user
- Chat messages sent

### 12.2 Technical Metrics
- API success rate (target: > 99%)
- Average response time (target: < 2s)
- Image upload success rate (target: > 95%)
- AI identification accuracy (backend metric)

### 12.3 User Satisfaction
- App rating (target: > 4.5/5)
- Feature usage rate
- User retention rate
- Support ticket volume

---

## 13. Known Issues & Technical Debt

### 13.1 Current Issues
1. ❌ API base URL is hardcoded (should be environment variable)
2. ❌ Image URL construction is incomplete (line 62 in page.tsx)
3. ❌ No error boundaries for React components
4. ❌ localStorage not checked for availability
5. ❌ No loading states during API calls
6. ❌ Typo in FishTrackerApiResponse: "succes" should be "success"

### 13.2 Technical Debt
1. Add proper error handling throughout
2. Implement retry logic for failed API calls
3. Add request cancellation for unmounted components
4. Implement proper state management (Context/Redux)
5. Add TypeScript strict mode
6. Add ESLint rules and enforce
7. Add Prettier for code formatting
8. Implement proper logging system

---

## 14. Dependencies & Requirements

### 14.1 Frontend Dependencies
```json
{
  "dependencies": {
    "next": "16.0.1",              // Framework
    "react": "19.2.0",              // UI library
    "react-dom": "19.2.0",          // React DOM
    "lottie-react": "^2.4.1"        // Animations
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",   // CSS framework
    "@types/node": "^20",           // Node types
    "@types/react": "^19",          // React types
    "@types/react-dom": "^19",      // React DOM types
    "eslint": "^9",                 // Linting
    "eslint-config-next": "16.0.1", // Next.js lint config
    "tailwindcss": "^4",            // Tailwind
    "typescript": "^5"              // TypeScript
  }
}
```

### 14.2 Recommended Additional Dependencies
```bash
npm install --save axios               # Better HTTP client
npm install --save react-query         # Data fetching & caching
npm install --save zustand             # State management
npm install --save react-hook-form     # Form handling
npm install --save zod                 # Schema validation
npm install --save date-fns            # Date utilities
npm install --save clsx                # Class name utility
npm install --save react-hot-toast     # Notifications
npm install --save framer-motion       # Advanced animations
```

### 14.3 Development Tools
```bash
npm install --save-dev vitest          # Testing framework
npm install --save-dev @testing-library/react
npm install --save-dev @testing-library/jest-dom
npm install --save-dev @playwright/test # E2E testing
npm install --save-dev prettier        # Code formatting
```

---

## 15. API Integration Reference

### 15.1 Complete API Mapping

#### Device Endpoints
```typescript
// Register Device
POST /device/register
Request: { deviceId: string }
Response: { success: boolean, message: string, data: any }

// Get Device
GET /device/{id}
Response: { success: boolean, message: string, data: Device }
```

#### Fish Endpoints
```typescript
// Get All Fish for Device
GET /fish/{deviceId}
Response: { success: boolean, message: string, data: TrackedFishInfo[] }

// Upload Fish Image
POST /fish/upload
Content-Type: multipart/form-data
Request: { deviceId: string, file: File }
Response: {
  success: boolean,
  message: string,
  data: {
    fishDetected: boolean,
    fishes: Fish[]
  }
}

// Get Fish Image
GET /fish/image/{imagePath}
Response: Binary image data
```

#### Chat Endpoint
```typescript
// Chat with AI
POST /chat/{deviceId}
Request: { message: string }
Response: {
  success: boolean,
  data: {
    response: string
  }
}
```

---

## 16. Accessibility Requirements

### 16.1 WCAG 2.1 AA Compliance
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility
- [ ] Sufficient color contrast (4.5:1 for text)
- [ ] Focus indicators visible
- [ ] Alt text for all images
- [ ] ARIA labels for interactive elements
- [ ] Semantic HTML structure

### 16.2 Accessibility Features
- [ ] Skip to main content link
- [ ] Descriptive link text
- [ ] Form labels and error messages
- [ ] Status announcements for screen readers
- [ ] Resizable text (up to 200%)
- [ ] No reliance on color alone for information

---

## 17. Documentation Requirements

### 17.1 Developer Documentation
- [ ] README.md with setup instructions
- [ ] API integration guide
- [ ] Component documentation
- [ ] Code commenting standards
- [ ] Git workflow guide
- [ ] Deployment guide

### 17.2 User Documentation
- [ ] User guide/help section
- [ ] FAQ page
- [ ] Privacy policy
- [ ] Terms of service
- [ ] About page with conservation info

---

## 18. Future Enhancements (Beyond MVP)

### 18.1 Advanced Features
- Multi-language support (i18n)
- Location-based fish recommendations
- Fish species distribution maps
- Integration with fishing regulations API
- Weather and tide information
- Fish size estimation from photos
- Species comparison tool
- Community features (forums, user profiles)

### 18.2 Platform Expansion
- Native mobile apps (React Native/Flutter)
- Desktop application (Electron)
- Browser extension
- Watch app integration
- Smart glasses integration

### 18.3 AI Enhancements
- Multiple fish detection in single image
- Fish health assessment
- Habitat suitability predictions
- Seasonal availability predictions
- Similar species comparison

---

## 19. Appendix

### 19.1 Glossary
- **Device ID:** Unique identifier for each device/browser
- **Tracked Fish:** Fish that has been identified and saved
- **Conservation Status:** IUCN Red List classification
- **Water Type:** Freshwater, Saltwater, or Brackish
- **AI Accuracy:** Confidence level of fish identification

### 19.2 References
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [FishBase](https://www.fishbase.org/) - Fish species database
- [IUCN Red List](https://www.iucnredlist.org/) - Conservation status

### 19.3 Contact & Support
- **Project Repository:** [GitHub Link]
- **Issue Tracker:** [GitHub Issues]
- **Technical Lead:** [Name/Email]
- **Backend API:** [API Documentation URL]

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-12 | AI Assistant | Initial PRD creation based on project analysis |

---

**End of Document**
