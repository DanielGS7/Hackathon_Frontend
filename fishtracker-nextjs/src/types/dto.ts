// fishtracker-nextjs/src/types/dto.ts

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
}

export interface Device {
  deviceIdentifier: string;
  fish: FishInfoDevice[];
}

export interface Fish {
  id: string;
  name: string;
  family: string;
  minSize: number;
  maxSize: number;
  waterType: string;
  description: string;
  colorDescription: string;
  depthRangeMin: number;
  depthRangeMax: number;
  environment: string;
  region: string;
  conservationStatus: string;
  consStatusDescription: string;
  favoriteIndicator: boolean;
  aiAccuracy: number;
  imageUrl: string;
}

export interface FishInfoDevice {
  id: string;
  imageUrl: string;
  timeStamp: string;
  fishId: string;
}

export interface FishTrackerApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface FishUploadResponse {
  fishDetected: boolean;
  fishes: Fish[];
}

export interface RegisterDevice {
  id: string;
}

export interface TrackedFishInfo {
  fish: Fish;
  imageUrl: string;
  timestamp: string; // Changed from DateTime to string for TypeScript
  fishId: string;
  id: string;
}

export interface FishBasic {
  id: string;
  imgUrl: string;
  name: string;
  trackedTime: string;
  showRecentIcon: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type WaterType = "Freshwater" | "Saltwater" | "Brackish";

export type ConservationStatus =
  | "Least Concern"
  | "Near Threatened"
  | "Vulnerable"
  | "Endangered"
  | "Critically Endangered"
  | "Extinct in the Wild"
  | "Extinct"
  | "Data Deficient";
