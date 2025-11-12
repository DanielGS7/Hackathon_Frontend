"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { fishTrackerApi } from '@/services/fishTrackerApi';
import { deviceIdService } from '@/services/deviceIdService';
import { Fish } from '@/types/dto';
import { LoadingSpinner, ErrorMessage, Button, Badge, Modal } from '@/components/ui';
import { DebugPanel, addDebugLog } from '@/components/DebugPanel';
import { useToast } from '@/contexts/ToastContext';

type ViewState = 'camera' | 'preview' | 'uploading' | 'result' | 'error';

const LiveTrackingPage: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoCaptureInterval = useRef<NodeJS.Timeout | null>(null);

  const [viewState, setViewState] = useState<ViewState>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [detectedFish, setDetectedFish] = useState<Fish[]>([]);
  const [latestFish, setLatestFish] = useState<Fish | null>(null);
  const [error, setError] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);

  // Live feed mode
  const [liveFeedMode, setLiveFeedMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [totalFishDetected, setTotalFishDetected] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to track fish');

  useEffect(() => {
    console.log('📸 [TRACKING] Live tracking page mounted');
    addDebugLog('info', 'Live tracking page mounted');

    const id = deviceIdService.getOrCreateDeviceId();
    setDeviceId(id);
    console.log(`📸 [TRACKING] Device ID: ${id}`);
    addDebugLog('info', 'Device ID retrieved', { deviceId: id });

    startCamera();

    return () => {
      console.log('📸 [TRACKING] Cleaning up...');
      addDebugLog('info', 'Live tracking page unmounted');
      stopCamera();
      stopLiveFeed();
    };
  }, []);

  const startCamera = async () => {
    console.log('📸 [TRACKING] Requesting camera access...');
    addDebugLog('info', 'Requesting camera permissions');
    setStatusMessage('Requesting camera access...');

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setCameraError('');
      console.log('✅ [TRACKING] Camera access granted');
      addDebugLog('success', 'Camera stream started successfully');
      showToast('Camera ready', 'success');
      setStatusMessage('Camera ready - Tap to capture or enable live feed');

    } catch (err) {
      console.error('❌ [TRACKING] Camera access denied:', err);
      addDebugLog('error', 'Failed to access camera', err);
      setCameraError('Camera access denied. Please enable camera permissions or upload an image from your gallery.');
      showToast('Camera access denied', 'error');
      setStatusMessage('Camera unavailable');
    }
  };

  const stopCamera = () => {
    if (stream) {
      console.log('📸 [TRACKING] Stopping camera stream...');
      addDebugLog('info', 'Stopping camera stream');
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const startLiveFeed = () => {
    console.log('🔴 [TRACKING] Starting live feed mode...');
    addDebugLog('info', 'Live feed mode activated');
    showToast('Live feed started - Auto-capturing every 5 seconds', 'success', 4000);

    setLiveFeedMode(true);
    setCaptureCount(0);
    setTotalFishDetected(0);
    setStatusMessage('🔴 LIVE: Auto-capturing every 5 seconds');

    // Immediate first capture
    setTimeout(() => autoCaptureAndUpload(), 500);

    // Then every 5 seconds
    autoCaptureInterval.current = setInterval(() => {
      autoCaptureAndUpload();
    }, 5000);
  };

  const stopLiveFeed = () => {
    console.log('⏹️ [TRACKING] Stopping live feed mode...');
    addDebugLog('info', 'Live feed mode deactivated', {
      totalCaptures: captureCount,
      totalFishDetected
    });

    if (autoCaptureInterval.current) {
      clearInterval(autoCaptureInterval.current);
      autoCaptureInterval.current = null;
    }

    setLiveFeedMode(false);
    setStatusMessage(`Live feed stopped - ${captureCount} captures, ${totalFishDetected} fish detected`);
    showToast(`Live feed stopped: ${captureCount} captures, ${totalFishDetected} fish found`, 'info', 5000);
  };

  const autoCaptureAndUpload = useCallback(async () => {
    if (isProcessing) {
      console.log('⏭️ [TRACKING] Skipping capture - still processing previous image');
      addDebugLog('warning', 'Skipped auto-capture - still processing');
      return;
    }

    if (!videoRef.current || !canvasRef.current) {
      console.log('⚠️ [TRACKING] Camera not ready for auto-capture');
      return;
    }

    const currentCapture = captureCount + 1;
    console.log(`📸 [TRACKING] Auto-capture #${currentCapture}`);
    addDebugLog('info', `Auto-capture #${currentCapture} triggered`);

    setIsProcessing(true);
    setCaptureCount(currentCapture);
    setStatusMessage(`🔴 LIVE: Capturing #${currentCapture}...`);

    try {
      // Capture image
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        console.log(`📸 [TRACKING] Image captured: ${canvas.width}x${canvas.height}`);
        addDebugLog('success', `Image captured`, {
          width: canvas.width,
          height: canvas.height,
          captureNumber: currentCapture
        });

        // Convert to file and upload
        const file = dataURLtoFile(imageData, `auto-capture-${Date.now()}.jpg`);

        console.log(`📤 [TRACKING] Auto-uploading capture #${currentCapture}...`);
        setStatusMessage(`🔴 LIVE: Uploading #${currentCapture}...`);

        const response = await fishTrackerApi.uploadFishImage(
          deviceId,
          file,
          (progress) => {
            console.log(`📊 [TRACKING] Upload #${currentCapture}: ${progress.toFixed(0)}%`);
          }
        );

        if (response.success && response.data.fishDetected) {
          const fishCount = response.data.fishes.length;
          setTotalFishDetected(prev => prev + fishCount);
          setDetectedFish(prev => [...response.data.fishes, ...prev].slice(0, 10)); // Keep last 10
          setLatestFish(response.data.fishes[0]);

          console.log(`✅ [TRACKING] Capture #${currentCapture}: ${fishCount} fish detected!`);
          addDebugLog('success', `Auto-capture #${currentCapture} - ${fishCount} fish detected`, {
            fishes: response.data.fishes.map(f => ({ name: f.name, accuracy: f.aiAccuracy }))
          });

          showToast(`🐟 Found ${fishCount} fish! (Total: ${totalFishDetected + fishCount})`, 'success', 3000);
          setStatusMessage(`🔴 LIVE: ${fishCount} fish found in capture #${currentCapture}`);
        } else {
          console.log(`ℹ️ [TRACKING] Capture #${currentCapture}: No fish detected`);
          addDebugLog('info', `Auto-capture #${currentCapture} - No fish detected`);
          setStatusMessage(`🔴 LIVE: No fish in capture #${currentCapture}`);
        }
      }
    } catch (err) {
      console.error(`❌ [TRACKING] Auto-capture #${currentCapture} failed:`, err);
      addDebugLog('error', `Auto-capture #${currentCapture} failed`, err);
      showToast(`Capture #${currentCapture} failed`, 'error', 2000);
      setStatusMessage(`🔴 LIVE: Capture #${currentCapture} failed`);
    } finally {
      setIsProcessing(false);
    }
  }, [deviceId, captureCount, totalFishDetected, isProcessing]);

  const captureImage = () => {
    console.log('📸 [TRACKING] Manual capture triggered');
    addDebugLog('info', 'User triggered manual capture');

    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
        setViewState('preview');

        console.log(`✅ [TRACKING] Image captured: ${canvas.width}x${canvas.height}`);
        addDebugLog('success', 'Manual capture successful', {
          width: canvas.width,
          height: canvas.height
        });

        showToast('Photo captured - Review and identify', 'info');
        setStatusMessage('Photo captured - Ready to identify');
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log(`📁 [TRACKING] User selected file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
      addDebugLog('info', 'User selected file from gallery', {
        filename: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
      });

      if (file.size > 5 * 1024 * 1024) {
        console.error('❌ [TRACKING] File too large');
        addDebugLog('error', 'File size exceeds 5MB limit', { size: file.size });
        setError('Image size must be less than 5MB');
        setViewState('error');
        showToast('Image too large - max 5MB', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setViewState('preview');
        console.log('✅ [TRACKING] File loaded successfully');
        addDebugLog('success', 'Gallery image loaded');
        showToast('Image loaded - Ready to identify', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const uploadImage = async () => {
    if (!capturedImage) return;

    console.log('📤 [TRACKING] Starting manual upload...');
    addDebugLog('info', 'Manual upload initiated');
    setViewState('uploading');
    setUploadProgress(0);
    setStatusMessage('Uploading image for identification...');
    showToast('Identifying fish...', 'info');

    try {
      const file = dataURLtoFile(capturedImage, `fish-${Date.now()}.jpg`);
      const response = await fishTrackerApi.uploadFishImage(
        deviceId,
        file,
        (progress) => {
          setUploadProgress(Math.round(progress));
          setStatusMessage(`Uploading: ${Math.round(progress)}%`);
        }
      );

      if (response.success && response.data.fishDetected) {
        setDetectedFish(response.data.fishes);
        setViewState('result');
        setShowResultModal(true);

        console.log(`✅ [TRACKING] Upload successful - ${response.data.fishes.length} fish found`);
        addDebugLog('success', `Fish identification complete`, {
          fishCount: response.data.fishes.length,
          fishes: response.data.fishes.map(f => ({ name: f.name, accuracy: f.aiAccuracy }))
        });

        showToast(`Found ${response.data.fishes.length} fish!`, 'success');
        setStatusMessage(`${response.data.fishes.length} fish identified!`);
      } else {
        console.log('⚠️ [TRACKING] No fish detected in image');
        addDebugLog('warning', 'No fish detected in uploaded image');
        setError('No fish detected in the image. Please try a clearer photo.');
        setViewState('error');
        showToast('No fish detected - try another photo', 'warning');
        setStatusMessage('No fish detected');
      }
    } catch (err) {
      console.error('❌ [TRACKING] Upload failed:', err);
      addDebugLog('error', 'Image upload failed', err);
      setError('Failed to upload image. Please try again.');
      setViewState('error');
      showToast('Upload failed - please try again', 'error');
      setStatusMessage('Upload failed');
    }
  };

  const retakePhoto = () => {
    console.log('🔄 [TRACKING] User chose to retake photo');
    addDebugLog('info', 'Retaking photo');
    setCapturedImage(null);
    setDetectedFish([]);
    setError('');
    setViewState('camera');
    setStatusMessage('Ready to capture');
    showToast('Ready to capture new photo', 'info');
  };

  const viewFishDetails = (fish: Fish) => {
    console.log(`🐠 [TRACKING] Navigating to fish details: ${fish.name}`);
    addDebugLog('info', 'User viewing fish details', { fishName: fish.name, fishId: fish.id });
    router.push(`/fish/${fish.id}`);
  };

  const goHome = () => {
    console.log('🏠 [TRACKING] Navigating to home');
    addDebugLog('info', 'User returning to home page');
    showToast('Returning to home', 'info');
    router.push('/');
  };

  const toggleLiveFeed = () => {
    if (liveFeedMode) {
      stopLiveFeed();
    } else {
      startLiveFeed();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <DebugPanel />

      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 bg-gray-800 text-white py-2 px-4 text-center text-sm font-medium z-50 flex items-center justify-between">
        <button onClick={goHome} className="flex items-center hover:text-blue-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 text-center">
          <span>{statusMessage}</span>
          {liveFeedMode && isProcessing && (
            <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
        <div className="text-xs opacity-75">
          {liveFeedMode && `${captureCount} captures`}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 mt-12">
        {viewState === 'camera' && (
          <div className="w-full max-w-2xl">
            {cameraError ? (
              <div className="bg-gray-800 rounded-lg p-8 text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="mb-4">{cameraError}</p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="primary"
                >
                  Upload from Gallery
                </Button>
              </div>
            ) : (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Live Feed Indicator */}
                {liveFeedMode && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full" />
                    <span className="text-sm font-bold">LIVE</span>
                  </div>
                )}

                {/* Latest Fish Display (Live Feed) */}
                {liveFeedMode && latestFish && (
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg max-w-xs">
                    <p className="text-xs font-bold">Latest Detection:</p>
                    <p className="text-sm">{latestFish.name}</p>
                    <p className="text-xs">{latestFish.aiAccuracy}% match</p>
                  </div>
                )}

                {/* Stats Display (Live Feed) */}
                {liveFeedMode && (
                  <div className="absolute bottom-20 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                      <div>
                        <p className="text-xs opacity-75">Captures</p>
                        <p className="text-lg font-bold">{captureCount}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">Fish Found</p>
                        <p className="text-lg font-bold text-green-400">{totalFishDetected}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">Status</p>
                        <p className="text-lg font-bold">{isProcessing ? '⏳' : '✓'}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                      aria-label="Upload from gallery"
                      disabled={liveFeedMode}
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>

                    {!liveFeedMode && (
                      <button
                        onClick={captureImage}
                        className="p-6 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                        aria-label="Capture photo"
                      >
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={toggleLiveFeed}
                      className={`p-4 rounded-full transition-colors ${
                        liveFeedMode
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                      aria-label={liveFeedMode ? 'Stop live feed' : 'Start live feed'}
                    >
                      {liveFeedMode ? (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  <p className="text-white text-center mt-3 text-sm">
                    {liveFeedMode
                      ? '🔴 Live Feed Active - Auto-capturing every 5s'
                      : 'Click ▶ for live feed or 📷 for manual capture'
                    }
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {viewState === 'preview' && capturedImage && (
          <div className="w-full max-w-2xl">
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <img src={capturedImage} alt="Captured fish" className="w-full h-auto" />

              <div className="p-6 flex gap-4">
                <Button onClick={retakePhoto} variant="secondary" className="flex-1">
                  Retake
                </Button>
                <Button onClick={uploadImage} variant="primary" className="flex-1">
                  Identify Fish
                </Button>
              </div>
            </div>
          </div>
        )}

        {viewState === 'uploading' && (
          <div className="w-full max-w-md bg-gray-800 rounded-lg p-8 text-white">
            <LoadingSpinner size="large" className="mb-6" />
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Analyzing image...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            <p className="text-center text-gray-400 mt-4 text-sm">
              Please wait while we identify your fish...
            </p>
          </div>
        )}

        {viewState === 'result' && detectedFish.length > 0 && (
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center">
                <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fish Identified!
              </h2>

              {detectedFish.map((fish) => (
                <div
                  key={fish.id}
                  className="mb-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedFish(fish);
                    setShowResultModal(true);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800">{fish.name}</h3>
                      <p className="text-gray-600 text-sm">{fish.family}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge variant="info">{fish.waterType}</Badge>
                        <Badge variant={fish.aiAccuracy > 80 ? 'success' : 'warning'}>
                          {fish.aiAccuracy}% Match
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mt-3 line-clamp-2">{fish.description}</p>
                </div>
              ))}

              <div className="flex gap-4 mt-6">
                <Button onClick={retakePhoto} variant="secondary" className="flex-1">
                  Track Another
                </Button>
                <Button onClick={goHome} variant="primary" className="flex-1">
                  View All Catches
                </Button>
              </div>
            </div>
          </div>
        )}

        {viewState === 'error' && (
          <div className="w-full max-w-md">
            <ErrorMessage message={error} onRetry={retakePhoto} />
            <div className="mt-4">
              <Button onClick={goHome} variant="ghost" className="w-full">
                Go to Home
              </Button>
            </div>
          </div>
        )}

        {/* Recent Detections List (Live Feed Mode) */}
        {liveFeedMode && detectedFish.length > 0 && (
          <div className="fixed right-4 top-20 bottom-4 w-64 bg-white rounded-lg shadow-xl p-4 overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-3">Recent Detections</h3>
            <div className="space-y-2">
              {detectedFish.map((fish, idx) => (
                <div
                  key={`${fish.id}-${idx}`}
                  className="p-2 bg-gray-50 rounded border border-gray-200 text-sm"
                  onClick={() => viewFishDetails(fish)}
                >
                  <p className="font-semibold text-gray-800">{fish.name}</p>
                  <p className="text-xs text-gray-600">{fish.aiAccuracy}% match</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {selectedFish && (
        <Modal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          title={selectedFish.name}
          size="large"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Family</p>
                <p className="font-medium">{selectedFish.family}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Water Type</p>
                <p className="font-medium">{selectedFish.waterType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Size Range</p>
                <p className="font-medium">{selectedFish.minSize} - {selectedFish.maxSize} cm</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Depth Range</p>
                <p className="font-medium">{selectedFish.depthRangeMin} - {selectedFish.depthRangeMax} m</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Conservation Status</p>
              <Badge
                variant={
                  selectedFish.conservationStatus === 'Least Concern' ? 'success' :
                  selectedFish.conservationStatus === 'Endangered' || selectedFish.conservationStatus === 'Critically Endangered' ? 'danger' :
                  'warning'
                }
                size="medium"
                className="mt-1"
              >
                {selectedFish.conservationStatus}
              </Badge>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-gray-800">{selectedFish.description}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Appearance</p>
              <p className="text-gray-800">{selectedFish.colorDescription}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={() => viewFishDetails(selectedFish)} variant="primary" className="flex-1">
                View Full Details
              </Button>
              <Button onClick={() => setShowResultModal(false)} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LiveTrackingPage;
