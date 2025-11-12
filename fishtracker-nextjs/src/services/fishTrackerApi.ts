import {
  RegisterDevice,
  FishTrackerApiResponse,
  TrackedFishInfo,
  Device,
  FishUploadResponse,
  Fish,
} from "../types/dto";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

console.log("🔧 [API] FishTracker API initialized");
console.log("🔧 [API] Base URL:", API_BASE_URL);

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  console.log(
    `📥 [API] Response Status: ${response.status} ${response.statusText}`
  );

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    console.error(`❌ [API] Error Response:`, errorData);
    throw new ApiError(
      response.status,
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const data = await response.json();
  console.log(`✅ [API] Success Response:`, data);
  return data;
}

export const fishTrackerApi = {
  registerDevice: async (
    device: RegisterDevice
  ): Promise<FishTrackerApiResponse<any>> => {
    console.log("📤 [API] Registering device:", device.id);
    console.log("📤 [API] POST", `${API_BASE_URL}/device/register`);

    try {
      const response = await fetch(`${API_BASE_URL}/device/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deviceId: device.id }),
      });

      const result = await handleResponse<FishTrackerApiResponse<any>>(
        response
      );
      console.log("✅ [API] Device registered successfully");
      return result;
    } catch (error) {
      console.error("❌ [API] Failed to register device:", error);
      throw error;
    }
  },

  getDevice: async (
    deviceId: string
  ): Promise<FishTrackerApiResponse<Device>> => {
    console.log("📤 [API] Getting device:", deviceId);
    console.log("📤 [API] GET", `${API_BASE_URL}/device/${deviceId}`);

    try {
      const response = await fetch(`${API_BASE_URL}/device/${deviceId}`);
      const result = await handleResponse<FishTrackerApiResponse<Device>>(
        response
      );
      console.log("✅ [API] Device data retrieved");
      return result;
    } catch (error) {
      console.error("❌ [API] Failed to get device:", error);
      throw error;
    }
  },

  getFish: async (
    deviceId: string
  ): Promise<FishTrackerApiResponse<TrackedFishInfo[]>> => {
    console.log("📤 [API] Getting fish for device:", deviceId);
    console.log("📤 [API] GET", `${API_BASE_URL}/fish/${deviceId}`);

    try {
      const response = await fetch(`${API_BASE_URL}/fish/${deviceId}`);
      const result = await handleResponse<
        FishTrackerApiResponse<TrackedFishInfo[]>
      >(response);
      console.log(`✅ [API] Retrieved ${result.data?.length || 0} fish`);
      return result;
    } catch (error) {
      console.error("❌ [API] Failed to get fish:", error);
      throw error;
    }
  },

  uploadFishImage: async (
    deviceId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FishTrackerApiResponse<FishUploadResponse>> => {
    console.log("📤 [API] Uploading fish image");
    console.log("📤 [API] Device ID:", deviceId);
    console.log(
      "📤 [API] File:",
      file.name,
      `(${(file.size / 1024 / 1024).toFixed(2)}MB)`
    );
    console.log("📤 [API] POST", `${API_BASE_URL}/fish/upload`);

    const formData = new FormData();
    formData.append("deviceId", deviceId);
    formData.append("file", file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentage = (e.loaded / e.total) * 100;
            console.log(`📊 [API] Upload progress: ${percentage.toFixed(1)}%`);
            onProgress(percentage);
          }
        });
      }

      xhr.addEventListener("load", () => {
        console.log(`📥 [API] Upload complete. Status: ${xhr.status}`);

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            console.log("✅ [API] Fish image uploaded successfully:", data);

            if (data.data?.fishDetected) {
              console.log(`🐟 [API] ${data.data.fishes.length} fish detected`);
              data.data.fishes.forEach((fish: Fish, idx: number) => {
                console.log(
                  `   ${idx + 1}. ${fish.name} (${fish.aiAccuracy}% accuracy)`
                );
              });
            } else {
              console.log("⚠️ [API] No fish detected in image");
            }

            resolve(data);
          } catch (error) {
            console.error("❌ [API] Failed to parse upload response:", error);
            reject(new Error("Failed to parse response"));
          }
        } else {
          console.error(`❌ [API] Upload failed with status ${xhr.status}`);
          reject(new ApiError(xhr.status, `Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener("error", () => {
        console.error("❌ [API] Network error during upload");
        reject(new Error("Network error occurred"));
      });

      console.log("🚀 [API] Starting upload...");
      xhr.open("POST", `${API_BASE_URL}/fish/upload`);
      xhr.send(formData);
    });
  },

  getFishImage: (imagePath: string): string => {
    const url = `${API_BASE_URL}/fish/image/${imagePath}`;
    console.log("🖼️ [API] Fish image URL:", url);
    return url;
  },

  getFishDetails: async (fishId: string): Promise<Fish | null> => {
    console.log("📤 [API] Getting fish details:", fishId);
    console.log("📤 [API] GET", `${API_BASE_URL}/fish/details/${fishId}`);

    try {
      const response = await fetch(`${API_BASE_URL}/fish/details/${fishId}`);

      if (response.status === 404) {
        console.log("⚠️ [API] Fish not found");
        return null;
      }

      const data = await handleResponse<FishTrackerApiResponse<Fish>>(response);
      console.log("✅ [API] Fish details retrieved:", data.data.name);
      return data.data;
    } catch (error) {
      console.error("❌ [API] Failed to get fish details:", error);
      throw error;
    }
  },
};

export { ApiError };
