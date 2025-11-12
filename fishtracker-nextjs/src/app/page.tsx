"use client";

import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { useRouter } from 'next/navigation';
import { fishTrackerApi } from '../services/fishTrackerApi';
import { deviceIdService } from '../services/deviceIdService';
import { FishBasic, TrackedFishInfo } from '../types/dto';
import RecentCatchesPanel from '../components/RecentCatchesPanel';
import { DebugPanel, addDebugLog } from '../components/DebugPanel';
import { useToast } from '../contexts/ToastContext';

const HomePage: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [fishes, setFishes] = useState<FishBasic[]>([]);
  const [noCatches, setNoCatches] = useState(true);
  const [loadingFishes, setLoadingFishes] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');
  const [animationData, setAnimationData] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Initializing...');

  useEffect(() => {
    console.log('🏠 [HOME] Home page mounted');
    addDebugLog('info', 'Home page mounted');

    const fetchAnimationData = async () => {
      try {
        console.log('🎨 [HOME] Fetching Lottie animation...');
        addDebugLog('info', 'Fetching Lottie animation');

        const response = await fetch('/images/pulse_button.lottie');

        if (!response.ok) {
          console.log('ℹ️ [HOME] Lottie animation file not found, using fallback');
          addDebugLog('info', 'Lottie animation not available, using CSS animation');
          return;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log('ℹ️ [HOME] Lottie file is not JSON format, using fallback');
          addDebugLog('info', 'Lottie file format invalid, using CSS animation');
          return;
        }

        const data = await response.json();
        setAnimationData(data);

        console.log('✅ [HOME] Lottie animation loaded');
        addDebugLog('success', 'Lottie animation loaded successfully');
      } catch (error) {
        console.log('ℹ️ [HOME] Lottie animation unavailable, using CSS fallback');
        addDebugLog('info', 'Using CSS animation fallback');
      }
    };

    fetchAnimationData();
  }, []);

  useEffect(() => {
    const initializeData = async () => {
      console.log('🔧 [HOME] Initializing app data...');
      addDebugLog('info', 'Starting app initialization');
      setStatusMessage('Setting up your device...');

      setLoadingFishes(true);

      try {
        // Get or create device ID
        console.log('📱 [HOME] Getting device ID...');
        addDebugLog('info', 'Getting or creating device ID');

        const currentDeviceId = deviceIdService.getOrCreateDeviceId();
        setDeviceId(currentDeviceId);

        console.log(`✅ [HOME] Device ID: ${currentDeviceId}`);
        addDebugLog('success', 'Device ID obtained', { deviceId: currentDeviceId });
        showToast(`Device ID: ${currentDeviceId.substring(0, 8)}...`, 'info', 3000);

        // Register device with backend
        console.log('📤 [HOME] Registering device with backend...');
        addDebugLog('info', 'Registering device with backend');
        setStatusMessage('Connecting to server...');

        try {
          await fishTrackerApi.registerDevice({ id: currentDeviceId });

          console.log('✅ [HOME] Device registered successfully');
          addDebugLog('success', 'Device registered with backend');
          showToast('Connected to FishTracker server', 'success');

          // Fetch user's fish
          setStatusMessage('Loading your catches...');
          await fetchFishes(currentDeviceId);

          console.log('✅ [HOME] Initialization complete');
          addDebugLog('success', 'App initialization complete');
          setStatusMessage('Ready!');
        } catch (backendError) {
          // Backend not available - graceful degradation
          console.log('⚠️ [HOME] Backend not available - running in offline mode');
          addDebugLog('warning', 'Backend server not available - offline mode');
          showToast('Running in offline mode - backend not available', 'warning', 4000);
          setStatusMessage('Offline mode - Backend not connected');
          setNoCatches(true);
        }
      } catch (error) {
        console.log('⚠️ [HOME] Non-critical initialization issue');
        addDebugLog('info', 'Initialization completed with warnings');
        setStatusMessage('Ready (limited functionality)');
      } finally {
        setLoadingFishes(false);
      }
    };

    initializeData();
  }, []);

  const fetchFishes = async (currentDeviceId: string) => {
    console.log(`🐟 [HOME] Fetching fish for device: ${currentDeviceId}`);
    addDebugLog('info', 'Fetching user fish history', { deviceId: currentDeviceId });

    try {
      const response = await fishTrackerApi.getFish(currentDeviceId);
      const trackedFishInfos = response.data;

      console.log(`📊 [HOME] Received ${trackedFishInfos?.length || 0} fish from backend`);
      addDebugLog('info', `Received ${trackedFishInfos?.length || 0} fish records`);

      if (!trackedFishInfos || trackedFishInfos.length === 0) {
        console.log('ℹ️ [HOME] No fish found for this device');
        addDebugLog('info', 'No fish history found');
        setFishes([]);
        setNoCatches(true);
        showToast('No catches yet. Start tracking fish!', 'info', 3000);
        return;
      }

      const formattedFishes: FishBasic[] = trackedFishInfos
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((trackedInfo: TrackedFishInfo) => {
          const now = new Date();
          const trackedDate = new Date(trackedInfo.timestamp);
          const hoursDiff = (now.getTime() - trackedDate.getTime()) / (1000 * 60 * 60);

          console.log(`   🐠 ${trackedInfo.fish.name} - ${formatTrackedTime(trackedDate)}`);

          return {
            id: trackedInfo.fishId,
            imgUrl: fishTrackerApi.getFishImage(trackedInfo.imageUrl),
            name: trackedInfo.fish.name,
            trackedTime: formatTrackedTime(trackedDate),
            showRecentIcon: hoursDiff < 24,
          };
        });

      setFishes(formattedFishes);
      setNoCatches(false);

      const recentCount = formattedFishes.filter(f => f.showRecentIcon).length;
      console.log(`✅ [HOME] Loaded ${formattedFishes.length} fish (${recentCount} recent)`);
      addDebugLog('success', `Loaded ${formattedFishes.length} fish catches`, {
        total: formattedFishes.length,
        recent: recentCount
      });

      showToast(`Loaded ${formattedFishes.length} ${formattedFishes.length === 1 ? 'catch' : 'catches'}`, 'success', 3000);
    } catch (error) {
      console.log('⚠️ [HOME] Could not fetch fish history');
      addDebugLog('warning', 'Fish history unavailable');
      setFishes([]);
      setNoCatches(true);
    }
  };

  const formatTrackedTime = (time: Date): string => {
    const now = new Date();
    const span = now.getTime() - time.getTime();
    const totalHours = span / (1000 * 60 * 60);
    const totalDays = span / (1000 * 60 * 60 * 24);

    return totalHours < 24
      ? `${Math.floor(totalHours)} hours ago`
      : `${Math.floor(totalDays)} days ago`;
  };

  const GoToTracking = () => {
    console.log('🎣 [HOME] Navigating to live tracking...');
    addDebugLog('info', 'User clicked "Track Fish" button');
    showToast('Opening camera...', 'info');
    router.push('/live-tracking');
  };

  const RefreshFishes = async () => {
    console.log('🔄 [HOME] Refreshing fish list...');
    addDebugLog('info', 'User requested fish list refresh');
    showToast('Refreshing catches...', 'info');

    setLoadingFishes(true);
    setStatusMessage('Refreshing...');

    await fetchFishes(deviceId);

    setLoadingFishes(false);
    setStatusMessage('Ready!');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-50">
      <DebugPanel />

      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white py-2 px-4 text-center text-sm font-medium z-40">
        {statusMessage}
        {deviceId && (
          <span className="ml-4 text-xs opacity-75">
            Device: {deviceId.substring(0, 8)}...
          </span>
        )}
      </div>

      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 text-center mt-12">
        <div className={noCatches ? "mt-20" : "mt-4"}>
          <h1 className="text-4xl font-bold text-blue-600 p-4">Ready to dive?</h1>
          <h2 className="text-2xl text-gray-700">Tap to track fish</h2>
        </div>

        <div className="relative flex justify-center items-center my-20 cursor-pointer group"
             style={{ width: '350px', height: '350px' }}
             onClick={GoToTracking}>
          {animationData ? (
            <Lottie
              animationData={animationData}
              loop={true}
              autoplay={true}
              style={{ width: '350px', height: '350px' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-20" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-300 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 opacity-10 animate-pulse" />
            </div>
          )}
          <img src="/images/Fish.svg" alt="Fish" className="absolute w-15 h-15 group-hover:scale-110 transition-transform" />

          {/* Instruction overlay */}
          <div className="absolute -bottom-8 left-0 right-0 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Click here to start tracking
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center w-full">
          {noCatches ? (
            <div className="mb-16 text-center">
              <p className="text-gray-600 mb-4">
                Scan the waters,
                <br />
                unlock the stories
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ How it works:</strong>
                  <br />
                  1. Click the fish button above
                  <br />
                  2. Take a photo or upload one
                  <br />
                  3. Get instant AI identification!
                </p>
              </div>
            </div>
          ) : (
            <RecentCatchesPanel fishes={fishes} onRefresh={RefreshFishes} loadingFishes={loadingFishes} />
          )}
        </div>
      </main>

      <button
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors text-lg z-40 group"
        onClick={() => {
          console.log('💬 [HOME] Navigating to fish assistant...');
          addDebugLog('info', 'User clicked chat button');
          showToast('Chat feature coming soon!', 'info');
          router.push('/fish-assistant');
        }}
        title="Fish Assistant (Coming Soon)"
      >
        <span>Chat</span>
        <span className="absolute -top-2 -right-2 bg-yellow-500 text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          Soon
        </span>
      </button>
    </div>
  );
};

export default HomePage;
