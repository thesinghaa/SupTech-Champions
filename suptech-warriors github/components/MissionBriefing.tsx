import React, { useEffect } from 'react';
import { AgentData } from '../App';
import useAudio from '../hooks/useAudio';
import useFireworks from '../hooks/useFireworks';

interface MissionBriefingProps {
  agentData: AgentData;
  onStartLevel: (level: number) => void;
  levelCompletionStatus: { 1: boolean; 2: boolean; 3: boolean };
  celebrateLevel: number | null;
  onCelebrationEnd: () => void;
}

const UserIcon = () => (
    <svg className="w-full h-full p-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);


const MissionBriefing: React.FC<MissionBriefingProps> = ({ agentData, onStartLevel, levelCompletionStatus, celebrateLevel, onCelebrationEnd }) => {
  const { playHoverSound, playTriumphantMusic } = useAudio();
  const allLevelsComplete = Object.values(levelCompletionStatus).every(Boolean);

  const fireworksCanvasRef = useFireworks(!!celebrateLevel);

  useEffect(() => {
    if (celebrateLevel) {
      playTriumphantMusic();
      const timer = setTimeout(onCelebrationEnd, 4000); // Fireworks duration
      return () => clearTimeout(timer);
    }
  }, [celebrateLevel, onCelebrationEnd, playTriumphantMusic]);

  const levels = [
    { number: 1, title: "The Chronos System", unlocked: true },
    { number: 2, title: "Violation Investigation", unlocked: levelCompletionStatus[1] },
    { number: 3, title: "Decryption Grid", unlocked: levelCompletionStatus[2] },
  ];

  return (
    <div className="relative w-full max-w-4xl panel-padding-dynamic space-y-6 bg-black/80 border border-[#00FFFF]/20 rounded-lg shadow-2xl shadow-black backdrop-blur-md animate-fade-in mission-hub-panel">
      {!!celebrateLevel && (
        <canvas 
            ref={fireworksCanvasRef} 
            className="absolute top-0 left-0 w-full h-full z-20 pointer-events-none" 
        />
      )}
      <header className="flex flex-col sm:flex-row items-center justify-between mission-hub-header">
        <h1 className="text-h1-dynamic font-bold tracking-widest uppercase font-orbitron">
          MISSION HUB
        </h1>
        <div className="agent-info mt-4 sm:mt-0">
          <div className="agent-info-icon">
            <UserIcon />
          </div>
          <span className="text-p-dynamic text-white font-mono">AGENT: {agentData.codename}</span>
        </div>
      </header>
      
      <div className="directive-box">
        <h2 className="text-lg text-white font-bold mb-2 uppercase tracking-widest">Directive:</h2>
        <p className="text-p-dynamic font-mono">
          {allLevelsComplete
            ? `Excellent work, Agent ${agentData.codename}. All systems restored. The Bureau is in your debt. You may replay any simulation to hone your skills.`
            : `A critical data breach has occurred. Your mission is to restore the Bureau's systems by completing the following training modules. The fate of our data is in your hands.`}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        {levels.map(level => {
            const isCompleted = levelCompletionStatus[level.number as keyof typeof levelCompletionStatus];
            const isUnlocked = level.unlocked;
            const statusClass = !isUnlocked ? 'locked' : isCompleted ? 'completed' : 'unlocked';

            return (
              <button
                key={level.number}
                onClick={() => onStartLevel(level.number)}
                onMouseEnter={playHoverSound}
                disabled={!level.unlocked}
                className={`level-button ${statusClass}`}
              >
                <span className="level-number">Level {level.number}</span>
                <span className="level-title">{level.title}</span>
                {isCompleted && <span className="level-status">✓ Complete</span>}
              </button>
            )
        })}
      </div>
      <style>{`
        .mission-hub-panel {
          background: rgba(10, 15, 30, 0.7);
          border: 1px solid rgba(0, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          box-shadow: 0 0 25px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(0, 255, 255, 0.1);
        }

        .mission-hub-header h1 {
          color: #39FF14;
          text-shadow: 0 0 8px #39FF14, 0 0 12px #39FF14;
          animation: flicker 4s linear infinite;
        }

        .agent-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          border: 1px solid #00FFFF;
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          background: rgba(0, 255, 255, 0.1);
        }

        .agent-info-icon {
          width: 2rem;
          height: 2rem;
          color: #00FFFF;
        }

        .directive-box {
          background: rgba(0, 10, 5, 0.5);
          border: 2px solid #39FF14;
          box-shadow: inset 0 0 15px rgba(57, 255, 20, 0.2);
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          color: #39FF14;
          text-shadow: 0 0 5px rgba(57, 255, 20, 0.7);
        }
        .directive-box h2 {
          color: white;
          text-shadow: none;
        }

        .level-button {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 1.5rem 1rem;
          border-radius: 0.5rem;
          border: 2px solid #555;
          background: rgba(20, 20, 35, 0.8);
          color: #888;
          transition: all 0.3s ease;
          min-height: 120px;
          cursor: pointer;
        }
        .level-button:disabled {
          cursor: not-allowed;
          filter: grayscale(80%);
        }

        .level-button.unlocked:not(:disabled) {
          border-color: #00FFFF;
          color: white;
          background: rgba(0, 255, 255, 0.1);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.2);
        }
        .level-button.unlocked:not(:disabled):hover {
          background: rgba(0, 255, 255, 0.2);
          box-shadow: 0 0 20px rgba(0, 255, 255, 0.4);
          transform: translateY(-5px);
        }

        .level-button.completed {
          border-color: #00FFFF;
          color: #00FFFF;
          background: rgba(0, 255, 255, 0.05);
        }
        .level-button.completed:hover:not(:disabled) {
          background: rgba(0, 255, 255, 0.15);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
          transform: translateY(-5px);
        }
        
        .level-button .level-number {
          font-family: 'Orbitron', sans-serif;
          font-size: 0.9rem;
          font-weight: bold;
          color: #AAA;
        }
        .level-button.unlocked .level-number { color: #00FFFF; }

        .level-button .level-title {
          font-size: clamp(1rem, 3vmin, 1.2rem);
          font-weight: bold;
          text-transform: uppercase;
          text-align: center;
          margin-top: 0.25rem;
        }

        .level-button .level-status {
          margin-top: 0.5rem;
          font-size: 0.8rem;
          font-weight: bold;
          text-transform: uppercase;
          color: #39FF14;
          text-shadow: 0 0 5px #39FF14;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        @keyframes flicker { 0%, 19.9%, 22%, 62.9%, 64%, 64.9%, 70%, 100% { opacity: 0.99; } 20%, 21.9%, 63%, 63.9%, 65%, 69.9% { opacity: 0.4; text-shadow: none; } }
      `}</style>
    </div>
  );
};

export default MissionBriefing;