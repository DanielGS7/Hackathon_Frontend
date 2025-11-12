// fishtracker-nextjs/src/components/CatchesPaper.tsx
import React from 'react';
import { FishBasic } from '../types/dto';

interface CatchesPaperProps {
  title: string;
  fishes: FishBasic[];
  loadingFishes: boolean;
}

const CatchesPaper: React.FC<CatchesPaperProps> = ({ title, fishes, loadingFishes }) => {
  if (loadingFishes) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">{title}</h2>
        <p>Loading...</p>
      </div>
    );
  }

  if (fishes.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {fishes.map(fish => (
          <div key={fish.id} className="border rounded-lg p-2 text-center">
            <img src={fish.imgUrl} alt={fish.name} className="w-full h-auto" />
            <p className="font-semibold mt-2">{fish.name}</p>
            <p className="text-sm text-gray-600">{fish.trackedTime}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatchesPaper;
