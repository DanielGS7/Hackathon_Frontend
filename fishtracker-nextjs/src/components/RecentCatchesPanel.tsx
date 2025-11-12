import React from 'react';
import { useRouter } from 'next/navigation';
import { FishBasic } from '../types/dto';
import { LoadingSpinner, EmptyState, Button } from './ui';

interface RecentCatchesPanelProps {
  fishes: FishBasic[];
  onRefresh: () => void;
  loadingFishes: boolean;
}

const RecentCatchesPanel: React.FC<RecentCatchesPanelProps> = ({ fishes, onRefresh, loadingFishes }) => {
  const router = useRouter();

  const handleFishClick = (fishId: string) => {
    router.push(`/fish/${fishId}`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Recent Catches
        </h3>
        <Button
          onClick={onRefresh}
          variant="ghost"
          size="small"
          isLoading={loadingFishes}
          className="flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </Button>
      </div>

      {loadingFishes ? (
        <div className="py-8">
          <LoadingSpinner size="medium" message="Loading your catches..." />
        </div>
      ) : fishes.length > 0 ? (
        <div className="space-y-3">
          {fishes.slice(0, 5).map((fish) => (
            <div
              key={fish.id}
              onClick={() => handleFishClick(fish.id)}
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative w-16 h-16 flex-shrink-0 mr-4">
                <img
                  src={fish.imgUrl}
                  alt={fish.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/images/Fish.svg';
                  }}
                />
                {fish.showRecentIcon && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    NEW
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                  {fish.name}
                </h4>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {fish.trackedTime}
                </p>
              </div>

              <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}

          {fishes.length > 5 && (
            <div className="text-center pt-2">
              <p className="text-sm text-gray-500">
                +{fishes.length - 5} more {fishes.length - 5 === 1 ? 'catch' : 'catches'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No catches yet"
          description="Start tracking fish to see them appear here"
          action={{
            label: 'Track Your First Fish',
            onClick: () => router.push('/live-tracking')
          }}
        />
      )}
    </div>
  );
};

export default RecentCatchesPanel;
