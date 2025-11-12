// fishtracker-nextjs/src/components/RecentCatchesPanel.tsx
import React from 'react';
import { FishBasic } from '../types/dto'; // Assuming FishBasic is eventually defined

interface RecentCatchesPanelProps {
  fishes: FishBasic[];
  onRefresh: () => void;
  loadingFishes: boolean;
}

const RecentCatchesPanel: React.FC<RecentCatchesPanelProps> = ({ fishes, onRefresh, loadingFishes }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
      <h3 className="text-xl font-semibold mb-4">Recent Catches</h3>
      {loadingFishes ? (
        <p>Loading fishes...</p>
      ) : (
        fishes.length > 0 ? (
          <ul>
            {fishes.map(fish => (
              <li key={fish.id} className="mb-2">
                {fish.name} - {fish.trackedTime}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent catches.</p>
        )
      )}
      <button onClick={onRefresh} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
        Refresh Catches
      </button>
    </div>
  );
};

export default RecentCatchesPanel;
