import React, { useEffect, useState, useRef } from 'react';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

interface SpotifyData {
  album: string;
  albumImageUrl: string;
  artist: string;
  isPlaying: boolean;
  songUrl: string;
  title: string;
}

function App() {
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://novatorem-spotify-git-main-jhoel-villcas-projects.vercel.app/api/spotify');
        
        if (!response.ok) {
          throw new Error('Failed to fetch Spotify data');
        }
        
        const data = await response.json();
        setSpotifyData(data);
        setError(null);
      } catch (err) {
        setError('Error fetching Spotify data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpotifyData();
    // Refresh data every 30 seconds
    const intervalId = setInterval(fetchSpotifyData, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Generate bars for the visualizer
  const generateBars = () => {
    const bars = [];
    for (let i = 1; i <= 84; i++) {
      const left = (i - 1) * 4;
      const animationDuration = Math.floor(Math.random() * 500) + 500;
      const delay = Math.floor(Math.random() * 800);
      
      bars.push(
        <div 
          key={i} 
          className="bar" 
          style={{
            left: `${left}px`,
            animationDuration: `15s, ${animationDuration}ms`,
            animationDelay: `0ms, ${delay}ms`
          }}
        ></div>
      );
    }
    return bars;
  };

  const downloadWidget = async () => {
    if (!widgetRef.current) return;
    
    try {
      const canvas = await html2canvas(widgetRef.current, {
        allowTaint: true,
        useCORS: true,
        scale: 2
      });
      
      // Convert canvas to gif-like image (actually PNG)
      const image = canvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.href = image;
      link.download = `spotify-now-playing-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error generating image:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[480px] relative">
        <button 
          onClick={downloadWidget}
          className="absolute -top-12 right-0 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md flex items-center gap-2 transition-colors"
        >
          <Download size={18} />
          Download Widget
        </button>
        
        <div ref={widgetRef}>
          <svg width="480" height="133" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <foreignObject width="480" height="133">
              <div xmlns="http://www.w3.org/1999/xhtml" className="container">
                {loading ? (
                  <div className="flex items-center justify-center h-[100px] bg-[#181414] rounded-md">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-[100px] bg-[#181414] rounded-md text-red-400">
                    <p>{error}</p>
                  </div>
                ) : !spotifyData?.isPlaying ? (
                  <div className="flex items-center justify-center h-[100px] bg-[#181414] rounded-md text-gray-400">
                    <p>Not currently playing</p>
                  </div>
                ) : (
                  <div className="main">
                    <a className="art" href={spotifyData.songUrl} target="_blank" rel="noopener noreferrer">
                      <center>
                        <img src={spotifyData.albumImageUrl} className="cover" alt={`${spotifyData.album} cover`} />
                      </center>
                    </a>

                    <div className="content">
                      <a href={spotifyData.songUrl} target="_blank" rel="noopener noreferrer">
                        <div className="song">{spotifyData.title}</div>
                      </a>
                      <a href={`https://open.spotify.com/search/${encodeURIComponent(spotifyData.artist)}`} target="_blank" rel="noopener noreferrer">
                        <div className="artist">{spotifyData.artist}</div>
                      </a>
                      <div id="bars">
                        {generateBars()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </foreignObject>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default App;