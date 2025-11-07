import React from 'react';
import { AgentData } from '../App';
import useAudio from '../hooks/useAudio';
import useTypingEffect from '../hooks/useTypingEffect';

interface Level2BriefingProps {
  agentData: AgentData;
  onStartGame: () => void;
}

const characterAssets = {
    athena: 'https://storage.googleapis.com/aai-web-samples/scenarios/suptech-athena-cartoon.png',
};

const Level2Briefing: React.FC<Level2BriefingProps> = ({ agentData, onStartGame }) => {
  const { playHoverSound, playClickSound, playTypingSound } = useAudio();
  
  // Corrected text from user image and ensured it's grammatically sound.
  const briefingText = `Agent ${agentData.codename}, we've detected a massive surge of corrupted data packets flooding the Chronos Core. The signature matches Specter's previous attacks. Your mission is to manually oversee the transaction stream. Approve valid data packets to maintain system integrity, but flag any anomalies you identify. The system's stability is in your hands. Good luck.`;
  
  // Use typing effect with sound, and increase speed from 30ms to 20ms to improve UX.
  const displayedText = useTypingEffect(briefingText, 20, playTypingSound);
  const isTypingComplete = displayedText.length >= briefingText.length;

  const handleStart = () => {
    if (isTypingComplete) {
      playClickSound();
      onStartGame();
    }
  };

  return (
    <div className="w-full max-w-4xl panel-padding-dynamic space-y-6 bg-black/80 border-2 border-[#8A2BE2]/50 rounded-lg shadow-2xl shadow-black/50 backdrop-blur-md animate-fade-in holographic-panel">
        
        <header className="text-center pb-4 border-b border-gray-700/50">
            <h1 className="text-h2-dynamic font-bold text-[#8A2BE2] tracking-widest uppercase font-orbitron" style={{ textShadow: '0 0 10px #8A2BE2, 0 0 20px #8A2BE2' }}>
                MISSION BRIEFING: OVERSIGHT SIMULATION
            </h1>
        </header>

        <div className="flex flex-col md:flex-row items-center gap-6 p-2 sm:p-4">
            
            {/* Athena's Avatar Section, redesigned to match user image for better visibility */}
            <div className="w-full md:w-1/4 flex flex-col items-center flex-shrink-0">
                <div className="w-32 h-32 p-1 border-2 border-gray-600 bg-black/50 overflow-hidden">
                    <img 
                        src={characterAssets.athena} 
                        alt="Athena-9" 
                        className="w-full h-full object-cover object-top"
                    />
                </div>
                <p className="text-center font-bold text-white mt-2 tracking-widest">ATHENA-9</p>
            </div>
            
            {/* Briefing Text Section */}
            <div className="w-full md:w-3/4 bg-black/50 p-4 rounded-md border border-gray-500 min-h-[160px] md:min-h-[150px]">
                <p className="text-p-dynamic text-gray-200 font-mono">
                    {displayedText}
                    {!isTypingComplete && <span className="typing-cursor">|</span>}
                </p>
            </div>
        </div>

        <div className="text-center pt-4">
            <button
                onClick={handleStart}
                onMouseEnter={playHoverSound}
                disabled={!isTypingComplete}
                className={`futuristic-btn ${isTypingComplete ? 'btn-success' : 'btn-primary'}`}
            >
                {isTypingComplete ? 'BEGIN SIMULATION' : 'RECEIVING TRANSMISSION...'}
            </button>
        </div>
        <style>{`
            .typing-cursor { 
                animation: blink 1s step-end infinite; 
                color: var(--glow-color-success); 
                font-weight: bold;
            }
            @keyframes blink { 50% { opacity: 0; } }
            
            /* Overriding holographic-panel glow to match the scene's purple theme */
            .holographic-panel {
                box-shadow: 0 0 20px 5px rgba(138, 43, 226, 0.3), inset 0 0 15px 3px rgba(138, 43, 226, 0.2);
            }
        `}</style>
    </div>
  );
};

export default Level2Briefing;