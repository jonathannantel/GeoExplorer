
import React from 'react';

interface InfoPanelProps {
  selectedLocationIdentifier: string | null;
  info: string;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ selectedLocationIdentifier, info }) => {
  return (
    <div className="flex-grow flex flex-col text-sm sm:text-base">
      {selectedLocationIdentifier ? (
        <h2 className="text-xl sm:text-2xl font-semibold text-sky-400 mb-3">
          Location: <span className="text-sky-300">{selectedLocationIdentifier}</span>
        </h2>
      ) : (
        <p className="text-slate-400 italic mb-4 text-center py-4">
          Click on the map to select a location.
        </p>
      )}

      {info && (
        <div 
          className="prose prose-sm sm:prose prose-invert max-w-none bg-slate-700 bg-opacity-50 p-4 rounded-md shadow overflow-y-auto min-h-[10rem] max-h-[20rem] sm:min-h-[12rem] sm:max-h-[24rem]"
          aria-live="polite"
        >
          {info.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
          ))}
        </div>
      )}
      
      {!selectedLocationIdentifier && !info && (
         <div className="flex-grow flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-slate-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
            <p className="text-slate-500 text-xs mt-2">
              Details about the selected location will appear here once fetched.
            </p>
         </div>
      )}
    </div>
  );
};
