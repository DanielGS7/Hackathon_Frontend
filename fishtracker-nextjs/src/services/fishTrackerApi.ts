import {
  RegisterDevice,
  FishTrackerApiResponse,
  TrackedFishInfo,
  Device,
  FishUploadResponse,
  Fish
} from '../types/dto';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const fishTrackerApi = {
  registerDevice: async (device: RegisterDevice): Promise<FishTrackerApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/device/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceId: device.id }),
    });
    return handleResponse<FishTrackerApiResponse<any>>(response);
  },

  getDevice: async (deviceId: string): Promise<FishTrackerApiResponse<Device>> => {
    const response = await fetch(`${API_BASE_URL}/device/${deviceId}`);
    return handleResponse<FishTrackerApiResponse<Device>>(response);
  },

  getFish: async (deviceId: string): Promise<FishTrackerApiResponse<TrackedFishInfo[]>> => {
    const response = await fetch(`${API_BASE_URL}/fish/${deviceId}`);
    return handleResponse<FishTrackerApiResponse<TrackedFishInfo[]>>(response);
  },

  uploadFishImage: async (
    deviceId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FishTrackerApiResponse<FishUploadResponse>> => {
    const formData = new FormData();
    formData.append('deviceId', deviceId);
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentage = (e.loaded / e.total) * 100;
            onProgress(percentage);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new ApiError(xhr.status, `Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.open('POST', `${API_BASE_URL}/fish/upload`);
      xhr.send(formData);
    });
  },

  getFishImage: (imagePath: string): string => {
    return `${API_BASE_URL}/fish/image/${imagePath}`;
  },

  getFishDetails: async (fishId: string): Promise<Fish | null> => {
    const response = await fetch(`${API_BASE_URL}/fish/details/${fishId}`);
    if (response.status === 404) {
      return null;
    }
    const data = await handleResponse<FishTrackerApiResponse<Fish>>(response);
    return data.data;
  },
};

export { ApiError };
