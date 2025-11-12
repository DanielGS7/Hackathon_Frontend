"use client";

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const LiveTrackingPage: React.FC = () => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Could not access camera. Please ensure you have a camera and granted permissions.");
      }
    };

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const stopTracking = () => {
    router.push('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen" style={{ backgroundColor: '#0dcaf0' }}>
      <h1 className="text-2xl font-bold text-white mb-4">Live Fish Tracking</h1>
      <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-md h-auto rounded-lg shadow-lg"></video>
      <button
        onClick={stopTracking}
        className="mt-8 px-6 py-4 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 transition-colors"
      >
        Stop Tracking
      </button>
    </div>
  );
};

export default LiveTrackingPage;

