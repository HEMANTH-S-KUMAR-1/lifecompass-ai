import React from 'react';

const LoadingFallback = () => {
  return (
    <div className="flex items-center justify-center w-full min-h-[400px]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
