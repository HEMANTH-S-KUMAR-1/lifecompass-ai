import React from 'react';
import { AlertCircle, Check, WifiOff } from 'lucide-react';
import { isOfflineMode, toggleOfflineMode } from '../services/offlineMode';

const StatusIndicator = ({ backendStatus }) => {
  const [offlineMode, setOfflineMode] = React.useState(false);
  
  React.useEffect(() => {
    // Check initial offline mode status
    setOfflineMode(isOfflineMode());
  }, []);

  const handleToggleOfflineMode = () => {
    const newMode = toggleOfflineMode();
    setOfflineMode(newMode);
    // Reload the page to apply changes
    window.location.reload();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 flex items-center gap-3">
        {backendStatus.connected ? (
          <>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">Backend Connected</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-amber-500" />
              <span className="text-sm text-gray-600">
                {backendStatus.message || 'Backend Unavailable'}
              </span>
            </div>
          </>
        )}
        
        <div className="h-6 border-l border-gray-300 mx-1"></div>
        
        <label className="inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            value="" 
            className="sr-only peer" 
            checked={offlineMode}
            onChange={handleToggleOfflineMode}
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ms-2 text-sm font-medium text-gray-600">Offline Mode</span>
        </label>
      </div>
    </div>
  );
};

export default StatusIndicator;
