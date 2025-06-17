
import type { FakeEngagementData } from '../types';

const getRandomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

export const generateFakeEngagementData = (): FakeEngagementData => {
  const reads = getRandomInt(5000, 25000); // e.g., 1.2w
  const collections = getRandomInt(Math.floor(reads * 0.2), Math.floor(reads * 0.8)); // e.g., 8900
  
  const likeRateNum = getRandomInt(75, 98); // e.g., 92%
  const completionRateNum = getRandomInt(60, 85); // e.g., 78%

  return {
    reads: formatNumber(reads),
    collections: formatNumber(collections),
    likeRate: `${likeRateNum}%`,
    completionRate: `${completionRateNum}%`,
  };
};
