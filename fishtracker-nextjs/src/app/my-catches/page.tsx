"use client";

import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import CatchesPaper from '../../components/CatchesPaper';
import { fishTrackerApi } from '../../services/fishTrackerApi';
import { deviceIdService } from '../../services/deviceIdService';
import { FishBasic, TrackedFishInfo } from '../../types/dto';

const MyCatchesPage: React.FC = () => {
  const [trackedToday, setTrackedToday] = useState<FishBasic[]>([]);
  const [trackedYesterday, setTrackedYesterday] = useState<FishBasic[]>([]);
  const [trackedOlder, setTrackedOlder] = useState<FishBasic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatches = async () => {
      setLoading(true);
      try {
        const deviceId = deviceIdService.getOrCreateDeviceId();
        const response = await fishTrackerApi.getFish(deviceId);
        const trackedFishInfos = response.data;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayCatches: FishBasic[] = [];
        const yesterdayCatches: FishBasic[] = [];
        const olderCatches: FishBasic[] = [];

        trackedFishInfos.forEach(info => {
          const catchDate = new Date(info.timestamp);
          catchDate.setHours(0, 0, 0, 0);

          const fish: FishBasic = {
            id: info.fishId,
            imgUrl: `https://wafishtrackerapi-dxekchh4dvdjg0g4.francecentral-01.azurewebsites.net/${info.imageUrl}`,
            name: info.fish.name,
            trackedTime: new Date(info.timestamp).toLocaleTimeString(),
            showRecentIcon: false,
          };

          if (catchDate.getTime() === today.getTime()) {
            todayCatches.push(fish);
          } else if (catchDate.getTime() === yesterday.getTime()) {
            fish.trackedTime = 'Yesterday';
            yesterdayCatches.push(fish);
          } else {
            fish.trackedTime = new Date(info.timestamp).toLocaleDateString();
            olderCatches.push(fish);
          }
        });

        setTrackedToday(todayCatches);
        setTrackedYesterday(yesterdayCatches);
        setTrackedOlder(olderCatches);

      } catch (error) {
        console.error("Failed to fetch catches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatches();
  }, []);

  return (
    <div>
      <PageHeader title="All catches" />
      <div className="p-4">
        <CatchesPaper title="Today" fishes={trackedToday} loadingFishes={loading} />
        <CatchesPaper title="Yesterday" fishes={trackedYesterday} loadingFishes={loading} />
        <CatchesPaper title="Older catches" fishes={trackedOlder} loadingFishes={loading} />
      </div>
    </div>
  );
};

export default MyCatchesPage;
