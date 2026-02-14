
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Scene from './components/Scene';
import HandTracker from './components/HandTracker';

const App: React.FC = () => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [isFist, setIsFist] = useState(false);

  // Combine interactions: gather if mouse is down OR hand is a fist
  const effectivelyGathered = useMemo(() => isMouseDown || isFist, [isMouseDown, isFist]);

  const handleInteractionStart = useCallback(() => setIsMouseDown(true), []);
  const handleInteractionEnd = useCallback(() => setIsMouseDown(false), []);

  return (
    <div className="relative w-screen h-screen bg-neutral-950 overflow-hidden">
      {/* 3D Scene */}
      <Scene 
        isGathered={effectivelyGathered} 
        onMouseDown={handleInteractionStart} 
        onMouseUp={handleInteractionEnd} 
      />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 pointer-events-none z-10">
        <div className={`px-6 py-2 rounded-full border transition-all duration-300 backdrop-blur-md ${
          effectivelyGathered ? 'bg-red-500/20 border-red-500 scale-110' : 'bg-white/5 border-white/20'
        }`}>
          <span className={`text-sm font-bold uppercase tracking-widest ${effectivelyGathered ? 'text-red-400' : 'text-neutral-300'}`}>
            {effectivelyGathered ? '✨ Gathering Magic ✨' : 'Click or Make a Fist to Summon'}
          </span>
        </div>
      </div>

      {/* Hand Tracker Component */}
      <HandTracker 
        onFistDetected={(isFistNow) => setIsFist(isFistNow)}
        onHandPresence={(present) => setHandDetected(present)}
      />

      {/* Hand Tracking Status */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-none z-10">
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono uppercase ${handDetected ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-neutral-500'}`}>
           <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-green-400 animate-pulse' : 'bg-neutral-600'}`} />
           {handDetected ? 'Hand Tracking Active' : 'Waiting for Camera...'}
        </div>
        {handDetected && (
          <div className={`text-[10px] font-bold uppercase tracking-widest ${isFist ? 'text-blue-400' : 'text-neutral-500'}`}>
            Gesture: {isFist ? 'FIST (GATHERING)' : 'OPEN PALM (SCATTERED)'}
          </div>
        )}
      </div>
      
      {/* Help info */}
      <div className="absolute bottom-6 right-6 text-neutral-500 text-[10px] uppercase tracking-widest pointer-events-none">
        React • Three.js • Shaders • MediaPipe
      </div>
    </div>
  );
};

export default App;
