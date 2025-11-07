import React from 'react';
import useAudio from '../hooks/useAudio';

interface ScoringBriefingProps {
  onProceed: () => void;
}

const ScoringBriefing: React.FC<ScoringBriefingProps> = ({ onProceed }) => {
  const { playHoverSound, playClickSound } = useAudio();

  return (
    <div className="w-full max-w-2xl panel-padding-dynamic space-y-6 bg-black/70 border border-[#32CD32]/50 rounded-lg shadow-2xl shadow-black/50 backdrop-blur-md animate-fade-in holographic-panel">
      <header className="text-center pb-4 border-b border-gray-700/50">
        <h1 className="text-h2-dynamic font-bold text-[#32CD32] tracking-widest uppercase font-orbitron" style={{ textShadow: '0 0 10px #32CD32' }}>
          SCORING DIRECTIVE
        </h1>
      </header>
      
      <div className="space-y-4 text-gray-300 font-mono text-p-dynamic">
        <p><strong className="text-white">OBJECTIVE:</strong> Achieve a perfect score of 750.</p>
        <p>Your performance in each simulation will be evaluated. Points are awarded for correct answers. There are no score deductions for incorrect attempts or using hints.</p>
        <ul className="list-disc list-inside pl-4 space-y-2">
            <li><strong className="text-cyan-400">Accuracy is key:</strong> Correctly solving a puzzle or answering a question awards the full point value.</li>
            <li><strong className="text-cyan-400">Take your time:</strong> There are no time limits or penalties for thinking through your options.</li>
            <li><strong className="text-cyan-400">Strive for perfection:</strong> A flawless run is required for the maximum score.</li>
        </ul>
        <p className="pt-4 text-yellow-400 font-bold tracking-wider text-center bg-black/30 p-3 rounded-md border border-yellow-500/50">
          <span className="animate-pulse">CLASSIFIED:</span> The first agent to achieve a perfect score will receive a special commendation from the Bureau.
        </p>
      </div>
      
      <div className="text-center pt-4">
        <button
          onClick={() => {
            playClickSound();
            onProceed();
          }}
          onMouseEnter={playHoverSound}
          className="futuristic-btn btn-success"
        >
          Proceed to Mission Hub
        </button>
      </div>
      <style>{`
        /* Overriding holographic-panel glow for this component's theme */
        .holographic-panel {
            box-shadow: 0 0 20px 5px rgba(50, 205, 50, 0.3), inset 0 0 15px 3px rgba(50, 205, 50, 0.2);
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ScoringBriefing;