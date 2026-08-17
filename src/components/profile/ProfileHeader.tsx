import React from 'react';

interface ProfileHeaderProps {
  name: string;
  isArtist: boolean;
  isVerified: boolean;
  subscriptionPlan: 'Free' | 'Premium';
}

export default function ProfileHeader({ name, isArtist, isVerified, subscriptionPlan }: ProfileHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 bg-gray-800 rounded-lg text-white">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-600 rounded-full"></div>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {name}
            {isArtist && isVerified && (
              <span className="bg-blue-500 text-xs px-2 py-1 rounded-full">Verified</span>
            )}
          </h1>
          <p className="text-gray-400">{isArtist ? 'Artist' : 'Standard User'}</p>
        </div>
      </div>
      <div>
        <span className={`px-4 py-2 rounded-full font-bold ${subscriptionPlan === 'Premium' ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'}`}>
          {subscriptionPlan === 'Premium' ? 'Premium' : 'Free'}
        </span>
      </div>
    </div>
  );
}
