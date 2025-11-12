"use client";

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fishTrackerApi } from '@/services/fishTrackerApi';
import { deviceIdService } from '@/services/deviceIdService';
import { Fish } from '@/types/dto';
import { LoadingSpinner, ErrorMessage, Button, Badge, Modal } from '@/components/ui';

type ViewState = 'camera' | 'preview' | 'uploading' | 'result' | 'error';

const LiveTrackingPage: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewState, setViewState] = useState<ViewState>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [detectedFish, setDetectedFish] = useState<Fish[]>([]);
  const [error, setError] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string>('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedFish, setSelectedFish] = useState<Fish | null>(null);

  useEffect(() => {
    const id = deviceIdService.getOrCreateDeviceId();
    setDeviceId(id);
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError('');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Camera access denied. Please enable camera permissions or upload an image from your gallery.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
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
        stopCamera();
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        setViewState('error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
        setViewState('preview');
        stopCamera();
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

    setViewState('uploading');
    setUploadProgress(0);

    try {
      const file = dataURLtoFile(capturedImage, `fish-${Date.now()}.jpg`);
      const response = await fishTrackerApi.uploadFishImage(
        deviceId,
        file,
        (progress) => setUploadProgress(Math.round(progress))
      );

      if (response.success && response.data.fishDetected) {
        setDetectedFish(response.data.fishes);
        setViewState('result');
        setShowResultModal(true);
      } else {
        setError('No fish detected in the image. Please try a clearer photo.');
        setViewState('error');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
      setViewState('error');
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setDetectedFish([]);
    setError('');
    setViewState('camera');
    startCamera();
  };

  const viewFishDetails = (fish: Fish) => {
    router.push(`/fish/${fish.id}`);
  };

  const goHome = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900">
      <header className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <button onClick={goHome} className="flex items-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="ml-2">Back</span>
        </button>
        <h1 className="text-xl font-bold">Fish Tracker</h1>
        <div className="w-16" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
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

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                      aria-label="Upload from gallery"
                    >
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>

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

                    <div className="w-16" />
                  </div>
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

              {detectedFish.map((fish, index) => (
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
