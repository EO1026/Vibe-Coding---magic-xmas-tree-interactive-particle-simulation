
import React, { useEffect, useRef, useState } from 'react';

interface HandTrackerProps {
  onFistDetected: (isFist: boolean) => void;
  onHandPresence: (present: boolean) => void;
}

const HandTracker: React.FC<HandTrackerProps> = ({ onFistDetected, onHandPresence }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let hands: any = null;
    let camera: any = null;

    const loadMediaPipe = async () => {
      try {
        // We inject the scripts via index.html or dynamic loading
        // For this environment, we'll use standard script loading via unpkg
        const scripts = [
          'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
          'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'
        ];

        for (const src of scripts) {
          if (!document.querySelector(`script[src="${src}"]`)) {
            const script = document.createElement('script');
            script.src = src;
            script.async = false;
            document.head.appendChild(script);
            await new Promise((res) => script.onload = res);
          }
        }

        const mpHands = (window as any).Hands;
        const mpCamera = (window as any).Camera;

        if (!mpHands || !mpCamera) {
          throw new Error("MediaPipe libraries failed to load");
        }

        hands = new mpHands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            onHandPresence(true);
            const landmarks = results.multiHandLandmarks[0];
            
            // Simple Fist Detection Logic:
            // Check if the tips of fingers (8, 12, 16, 20) are below the joints (6, 10, 14, 18)
            // or close to the palm base (0).
            let fingersClosed = 0;
            const fingerIndices = [
              [8, 6], // Index
              [12, 10], // Middle
              [16, 14], // Ring
              [20, 18] // Pinky
            ];

            fingerIndices.forEach(([tip, joint]) => {
              if (landmarks[tip].y > landmarks[joint].y) {
                fingersClosed++;
              }
            });

            // If 3 or more fingers are closed, consider it a fist
            onFistDetected(fingersClosed >= 3);
          } else {
            onHandPresence(false);
            onFistDetected(false);
          }
        });

        if (videoRef.current) {
          camera = new mpCamera(videoRef.current, {
            onFrame: async () => {
              await hands.send({ image: videoRef.current! });
            },
            width: 160,
            height: 120
          });
          camera.start();
        }
      } catch (err) {
        console.error("Hand tracking setup error:", err);
        setError("Camera access required for hand tracking.");
      }
    };

    loadMediaPipe();

    return () => {
      if (camera) camera.stop();
      if (hands) hands.close();
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 w-32 h-24 rounded-lg overflow-hidden border border-white/20 bg-black/50 z-50">
      <video ref={videoRef} className="w-full h-full object-cover grayscale opacity-50" playsInline />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-2 text-[8px] text-center text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default HandTracker;
