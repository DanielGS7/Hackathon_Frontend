"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fishTrackerApi } from '@/services/fishTrackerApi';
import { inaturalistApi, INatPhoto } from '@/services/inaturalistApi';
import { Fish } from '@/types/dto';
import { LoadingSpinner, ErrorMessage, Badge, Button, Modal } from '@/components/ui';
import { deviceIdService } from '@/services/deviceIdService';

const FishDetailsPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const fishId = params.fishId as string;

  const [fish, setFish] = useState<Fish | null>(null);
  const [inatPhotos, setInatPhotos] = useState<INatPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<INatPhoto | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    loadFishDetails();
  }, [fishId]);

  const loadFishDetails = async () => {
    try {
      setLoading(true);

      // Get device ID - required to fetch tracked fish list
      const deviceId = deviceIdService.getOrCreateDeviceId();

      console.log('🔍 [FISH DETAILS] Loading fish:', fishId);
      console.log('🔍 [FISH DETAILS] Device ID:', deviceId);

      const fishData = await fishTrackerApi.getFishDetails(deviceId, fishId);

      if (!fishData) {
        console.warn('⚠️ [FISH DETAILS] Fish not found in tracked fish list');
        setError('Fish not found');
        setLoading(false);
        return;
      }

      console.log('✅ [FISH DETAILS] Fish loaded:', fishData.name);
      setFish(fishData);
      setLoading(false);

      loadINatPhotos(fishData.name);
    } catch (err) {
      console.warn('⚠️ [FISH DETAILS] Failed to load fish details:', err);
      setError('Failed to load fish details');
      setLoading(false);
    }
  };

  const loadINatPhotos = async (fishName: string) => {
    try {
      setLoadingPhotos(true);
      const photos = await inaturalistApi.getFishImages(fishName, 12);
      setInatPhotos(photos);
    } catch (err) {
      console.error('Error loading iNaturalist photos:', err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const getConservationStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      'Least Concern': 'bg-green-100 text-green-800 border-green-300',
      'Near Threatened': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'Vulnerable': 'bg-orange-100 text-orange-800 border-orange-300',
      'Endangered': 'bg-red-100 text-red-800 border-red-300',
      'Critically Endangered': 'bg-red-200 text-red-900 border-red-400',
      'Extinct in the Wild': 'bg-gray-200 text-gray-800 border-gray-400',
      'Extinct': 'bg-gray-300 text-gray-900 border-gray-500',
      'Data Deficient': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const openImageModal = (photo: INatPhoto) => {
    setSelectedPhoto(photo);
    setShowImageModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm p-4">
          <button onClick={() => router.back()} className="flex items-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="ml-2">Back</span>
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="large" message="Loading fish details..." />
        </main>
      </div>
    );
  }

  if (error || !fish) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm p-4">
          <button onClick={() => router.back()} className="flex items-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="ml-2">Back</span>
          </button>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <ErrorMessage message={error} onRetry={loadFishDetails} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
        <button onClick={() => router.back()} className="flex items-center text-blue-600 hover:text-blue-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="ml-2 font-medium">Back</span>
        </button>
      </header>

      <main className="flex-1 pb-20">
        <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{fish.name}</h1>
            <p className="text-blue-100 text-lg italic">{fish.family}</p>
            {fish.aiAccuracy && (
              <div className="mt-3">
                <Badge variant="default" className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                  {fish.aiAccuracy}% AI Match
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 -mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Facts</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Water Type</p>
                <Badge variant="info" className="text-xs">{fish.waterType}</Badge>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Size Range</p>
                <p className="font-semibold text-gray-800">{fish.minSize}-{fish.maxSize} cm</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Depth Range</p>
                <p className="font-semibold text-gray-800">{fish.depthRangeMin}-{fish.depthRangeMax} m</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Region</p>
                <p className="font-semibold text-gray-800 text-sm">{fish.region || 'Various'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Conservation Status</h2>
            <div className={`p-4 rounded-lg border-2 ${getConservationStatusColor(fish.conservationStatus)}`}>
              <div className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-bold text-lg mb-1">{fish.conservationStatus}</p>
                  {fish.consStatusDescription && (
                    <p className="text-sm opacity-90">{fish.consStatusDescription}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">{fish.description}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Physical Characteristics</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Coloration</p>
                <p className="text-gray-700">{fish.colorDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Minimum Size</p>
                  <p className="text-gray-700">{fish.minSize} cm</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Maximum Size</p>
                  <p className="text-gray-700">{fish.maxSize} cm</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Habitat</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Environment</p>
                <p className="text-gray-700">{fish.environment}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">Geographic Region</p>
                <p className="text-gray-700">{fish.region}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Depth Range</p>
                  <p className="text-gray-700">{fish.depthRangeMin} - {fish.depthRangeMax} meters</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">Water Type</p>
                  <p className="text-gray-700">{fish.waterType}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Photo Gallery</h2>
              {loadingPhotos && <LoadingSpinner size="small" />}
            </div>
            {inatPhotos.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {inatPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg"
                      onClick={() => openImageModal(photo)}
                    >
                      <img
                        src={photo.mediumUrl}
                        alt={`${fish.name} observation`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Photos from iNaturalist community observations
                </p>
              </>
            ) : (
              !loadingPhotos && (
                <p className="text-gray-500 text-center py-8">No community photos available</p>
              )
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button
            onClick={() => router.push('/live-tracking')}
            variant="secondary"
            className="flex-1"
          >
            Track Another Fish
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="primary"
            className="flex-1"
          >
            View All Catches
          </Button>
        </div>
      </div>

      {selectedPhoto && (
        <Modal
          isOpen={showImageModal}
          onClose={() => setShowImageModal(false)}
          size="large"
        >
          <div className="space-y-4">
            <img
              src={selectedPhoto.largeUrl}
              alt={`${fish.name} observation`}
              className="w-full rounded-lg"
            />
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <span className="font-semibold">Attribution:</span> {selectedPhoto.attribution}
              </p>
              <p>
                <span className="font-semibold">License:</span> {selectedPhoto.license}
              </p>
              <a
                href={selectedPhoto.observationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                View on iNaturalist
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FishDetailsPage;
