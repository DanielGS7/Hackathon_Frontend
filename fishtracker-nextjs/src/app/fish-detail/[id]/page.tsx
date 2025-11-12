"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '../../../components/PageHeader';
import { fishTrackerApi } from '../../../services/fishTrackerApi';
import { Fish } from '../../../types/dto';

const FishDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [fishDetails, setFishDetails] = useState<Fish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchFishDetails = async () => {
        setLoading(true);
        try {
          const response = await fishTrackerApi.getFishDetail(id);
          setFishDetails(response.data);
        } catch (error) {
          console.error("Failed to fetch fish details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchFishDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Fish detail" />
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  if (!fishDetails) {
    return (
      <div>
        <PageHeader title="Fish detail" />
        <div className="p-4">Fish not found.</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Fish detail" />
      <div className="p-4">
        <div className="flex flex-col items-center">
          <img src={`https://wafishtrackerapi-dxekchh4dvdjg0g4.francecentral-01.azurewebsites.net/${fishDetails.imageUrl}`} alt={fishDetails.name} className="w-full max-w-sm" />
          <h1 className="text-3xl font-bold mt-4">{fishDetails.name}</h1>
          <p className="text-lg text-gray-600">{fishDetails.family}</p>
        </div>

        <div className="flex justify-around mt-6">
          <div className="text-center">
            <p className="font-bold">{`${fishDetails.minSize}-${fishDetails.maxSize} cm`}</p>
            <p className="text-gray-600">Size</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{fishDetails.waterType}</p>
            <p className="text-gray-600">Water Type</p>
          </div>
          <div className="text-center">
            <p className="font-bold">Common</p>
            <p className="text-gray-600">Rarity</p>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold">More info</h2>
          <ul>
            <li><strong>Family:</strong> {fishDetails.family}</li>
            <li><strong>Environment:</strong> {fishDetails.environment}</li>
            <li><strong>Region:</strong> {fishDetails.region}</li>
            <li><strong>Conservation:</strong> {fishDetails.consStatusDescription}</li>
            <li><strong>Depth Range:</strong> {`${fishDetails.depthRangeMin} - ${fishDetails.depthRangeMax}`}</li>
            <li><strong>AI Accuracy:</strong> {fishDetails.aiAccuracy}</li>
          </ul>
        </div>

        <div className="mt-6">
          <div className="border rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold">Description</h2>
            <p>{fishDetails.description}</p>
          </div>
          <div className="border rounded-lg p-4 mb-4">
            <h2 className="text-xl font-bold">Color Description</h2>
            <p>{fishDetails.colorDescription}</p>
          </div>
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-bold">Conservation Description</h2>
            <p>{fishDetails.consStatusDescription}</p>
          </div>
        </div>
      </div>
      <button
        onClick={() => router.push('/fish-assistant')}
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700"
      >
        Chat
      </button>
    </div>
  );
};

export default FishDetailPage;
