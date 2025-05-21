
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMapComponent } from './components/GoogleMapComponent';
import { InfoPanel } from './components/InfoPanel';
import { LoadingSpinner } from './components/LoadingSpinner';
import { fetchLocationDetails } from './services/geminiService';

interface SelectedCoordinates {
  lat: number;
  lng: number;
}

const App: React.FC = () => {
  const [selectedCoords, setSelectedCoords] = useState<SelectedCoordinates | null>(null);
  const [locationInfo, setLocationInfo] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mapsApiReady, setMapsApiReady] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [infoHasBeenFetched, setInfoHasBeenFetched] = useState<boolean>(false); // New state

  useEffect(() => {
    // Check if Google Maps API script has loaded and if the API key is placeholder
    const interval = setInterval(() => {
      if (window.google && window.google.maps) {
        setMapsApiReady(true);
        clearInterval(interval);
      }
    }, 100);

    // Check if the API key is a placeholder
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes('maps.googleapis.com/maps/api/js') && scripts[i].src.includes('YOUR_GOOGLE_MAPS_API_KEY')) {
        setApiKeyMissing(true);
        break;
      }
    }
    return () => clearInterval(interval);
  }, []);


  const handleMapClick = useCallback((coords: SelectedCoordinates) => {
    setSelectedCoords(coords);
    setLocationInfo(''); // Clear previous info
    setError(null); // Clear previous error
    setInfoHasBeenFetched(false); // Reset fetch state for new selection
  }, []);

  const handleFetchInfo = useCallback(async () => {
    if (!selectedCoords) return;

    setIsLoading(true);
    setError(null);
    setLocationInfo('');
    // infoHasBeenFetched is false here, it's set to true in finally

    try {
      const details = await fetchLocationDetails(selectedCoords.lat, selectedCoords.lng);
      setLocationInfo(details);
    } catch (err) {
      if (err instanceof Error) {
        setError(`Failed to fetch information: ${err.message}. Ensure your Gemini API key is correctly configured.`);
      } else {
        setError('An unknown error occurred while fetching location details.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
      setInfoHasBeenFetched(true); // Set to true once fetch attempt is complete
    }
  }, [selectedCoords]);

  const displaySelectedLocationName = () => {
    if (!selectedCoords) return '...';
    return `Lat: ${selectedCoords.lat.toFixed(4)}, Lng: ${selectedCoords.lng.toFixed(4)}`;
  }

  // Determine if the button should be in its active, styled state (gradient, shadow)
  const isButtonInteractable = selectedCoords && !isLoading && !apiKeyMissing && !infoHasBeenFetched;
  // Determine if the button should be logically disabled (affects clickability and potentially ARIA states)
  const isButtonDisabled = !selectedCoords || isLoading || apiKeyMissing || infoHasBeenFetched;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <header className="w-full max-w-5xl mb-6 md:mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          GeoExplorer
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">Click anywhere on the map, then hit 'INFO' to learn more!</p>
      </header>

      {apiKeyMissing && (
        <div className="w-full max-w-5xl my-4 p-4 bg-yellow-500 bg-opacity-30 text-yellow-300 border border-yellow-600 rounded-md text-center">
          <strong>Action Required:</strong> Please replace <code>YOUR_GOOGLE_MAPS_API_KEY</code> in <code>index.html</code> with your actual Google Maps JavaScript API key to enable the map.
        </div>
      )}

      <main className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 md:gap-8">
        <div className="lg:w-3/5 w-full aspect-video shadow-2xl rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
          {!apiKeyMissing && mapsApiReady ? (
            <GoogleMapComponent onMapClick={handleMapClick} selectedCoords={selectedCoords} />
          ) : !apiKeyMissing ? (
            <div className="w-full h-full flex items-center justify-center">
              <LoadingSpinner />
              <p className="ml-3 text-sky-400">Loading Map...</p>
            </div>
          ) : (
             <div className="w-full h-full flex items-center justify-center p-4 text-center text-slate-500">
              Map cannot be loaded. Please provide a Google Maps API key in index.html.
            </div>
          )}
        </div>
        <div className="lg:w-2/5 w-full bg-slate-800 bg-opacity-70 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-slate-700 flex flex-col">
          <InfoPanel
            selectedLocationIdentifier={selectedCoords ? displaySelectedLocationName() : null}
            info={locationInfo}
          />
          {isLoading && (
            <div className="flex justify-center items-center my-4">
              <LoadingSpinner />
              <p className="ml-3 text-sky-400">Fetching details...</p>
            </div>
          )}
          {error && (
            <div className="my-4 p-3 bg-red-500 bg-opacity-20 text-red-400 border border-red-500 rounded-md text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
          <button
            onClick={handleFetchInfo}
            disabled={isButtonDisabled}
            className={`mt-auto w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ease-in-out
              ${isButtonInteractable ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-sky-500/50' : 'bg-slate-600 cursor-not-allowed opacity-70'}
              focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50`}
            aria-live="polite" // To announce changes in button state/text if assistive tech needs it
          >
            {isLoading ? 'LOADING...' : `GET INFO FOR ${selectedCoords ? 'SELECTION' : '...'}`}
          </button>
        </div>
      </main>
      <footer className="w-full max-w-5xl mt-8 text-center text-slate-500 text-xs">
        <p>Powered by React, Tailwind CSS, Google Maps, and Google Gemini API.</p>
        <p>Location data is approximate. Map provided by Google.</p>
        <p>Created by Jonathan Nantel.</p>
      </footer>
    </div>
  );
};

export default App;
