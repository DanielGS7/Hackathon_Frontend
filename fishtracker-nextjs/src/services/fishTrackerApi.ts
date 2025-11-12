// fishtracker-nextjs/src/services/fishTrackerApi.ts
import { RegisterDevice, FishTrackerApiResponse, TrackedFishInfo } from '../types/dto';

const API_BASE_URL = 'http://localhost:5000'; // TODO: Confirm actual API base URL

export const fishTrackerApi = {
  registerDevice: async (device: RegisterDevice): Promise<FishTrackerApiResponse<any>> => {
    const response = await fetch(`${API_BASE_URL}/device/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(device),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  getFish: async (deviceId: string): Promise<FishTrackerApiResponse<TrackedFishInfo[]>> => {
    const response = await fetch(`${API_BASE_URL}/fish/${deviceId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};
