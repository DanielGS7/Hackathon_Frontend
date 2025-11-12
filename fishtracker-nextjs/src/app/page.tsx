// fishtracker-nextjs/src/app/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { useRouter } from 'next/navigation';
import { fishTrackerApi } from '../services/fishTrackerApi';
import { deviceIdService } from '../services/deviceIdService';
import { FishBasic, TrackedFishInfo } from '../types/dto';
import RecentCatchesPanel from '../components/RecentCatchesPanel';

const HomePage: React.FC = () => {
  const router = useRouter();
  const [fishes, setFishes] = useState<FishBasic[]>([]);
  const [noCatches, setNoCatches] = useState(true);
  const [loadingFishes, setLoadingFishes] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    const fetchAnimationData = async () => {
      try {
        const response = await fetch('/images/pulse_button.lottie');
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Failed to fetch animation data:", error);
      }
    };

    fetchAnimationData();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      setLoadingFishes(true);
      const currentDeviceId = deviceIdService.getOrCreateDeviceId();
      setDeviceId(currentDeviceId);

      try {
        await fishTrackerApi.registerDevice({ id: currentDeviceId });
        await fetchFishes(currentDeviceId);
      } catch (error) {
        console.error("Failed to initialize data:", error);
      } finally {
        setLoadingFishes(false);
      }
    };

    initializeData();
  }, []);

  const fetchFishes = async (currentDeviceId: string) => {
    try {
      const response = await fishTrackerApi.getFish(currentDeviceId);
      const trackedFishInfos = response.data;

      const formattedFishes: FishBasic[] = trackedFishInfos
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((trackedInfo: TrackedFishInfo) => ({
          id: trackedInfo.fishId,
          imgUrl: `https://example.com/images/${trackedInfo.imageUrl}`, // TODO: Replace with actual image base URL
          name: trackedInfo.fish.name,
          trackedTime: formatTrackedTime(new Date(trackedInfo.timestamp)),
          showRecentIcon: true,
        }));

      setFishes(formattedFishes);
      setNoCatches(!formattedFishes.length);
    } catch (error) {
      console.error("Failed to fetch fishes:", error);
      setFishes([]);
      setNoCatches(true);
    }
  };

  const formatTrackedTime = (time: Date): string => {
    const now = new Date();
    const span = now.getTime() - time.getTime(); // Difference in milliseconds
    const totalHours = span / (1000 * 60 * 60);
    const totalDays = span / (1000 * 60 * 60 * 24);

    return totalHours < 24
      ? `${Math.floor(totalHours)} hours ago`
      : `${Math.floor(totalDays)} days ago`;
  };

  const GoToTracking = () => {
    router.push('/live-tracking');
  };

  const RefreshFishes = async () => {
    setLoadingFishes(true);
    await fetchFishes(deviceId);
    setLoadingFishes(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center">
        <div className={noCatches ? "mt-20" : "mt-4"}>
          <h1 className="text-4xl font-bold text-blue-600 p-4">Ready to dive?</h1>
          <h2 className="text-2xl text-gray-700">Tap to track fish</h2>
        </div>

        <div className="relative flex justify-center items-center my-20 cursor-pointer"
             style={{ width: '350px', height: '350px' }}
             onClick={GoToTracking}>
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ width: '350px', height: '350px' }}
            />
          )}
          <img src="/images/Fish.svg" alt="Fish" className="absolute w-15 h-15" />
        </div>

        <div className="flex justify-center items-center w-full">
          {noCatches ? (
            <p className="mb-16 text-center text-gray-600">
              Scan the waters,
              <br />
              unlock the stories
            </p>
          ) : (
            <RecentCatchesPanel fishes={fishes} onRefresh={RefreshFishes} loadingFishes={loadingFishes} />
          )}
        </div>
      </main>

      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors text-lg"
        onClick={() => {
          router.push('/fish-assistant');
        }}
      >
        Chat
      </button>
    </div>
  );
};

export default HomePage;