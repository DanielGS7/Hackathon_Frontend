// fishtracker-nextjs/src/services/deviceIdService.ts

const DEVICE_ID_KEY = 'fishTrackerDeviceId';

export const deviceIdService = {
  getOrCreateDeviceId: (): string => {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = crypto.randomUUID(); // Generate a new UUID
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  },
};
