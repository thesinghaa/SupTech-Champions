import React from 'react';
import { AgentData } from '../App';
import useAudio from '../hooks/useAudio';
import useFireworks from '../hooks/useFireworks';
import useCountUp from '../hooks/useCountUp';

interface CompletionScreenProps {
  agentData: AgentData;
  score: number;
  maxScore: number;
  onReplay: () => void;
}

const CompletionScreen: React.FC<CompletionScreenProps> = ({ agentData, score, maxScore, onReplay }) => {
  const { playHoverSound, playClickSound } = useAudio();
  const fireworksCanvasRef = useFireworks(true);
  const animatedScore = useCountUp(score, { duration: 2000 });

  const getRank = (finalScore: number) => {
    if (finalScore >= 750) return { name: "Elite Agent", medal: "🏆" };
    if (finalScore >= 450) return { name: "Skilled Agent", medal: "🥈" };
    return { name: "Rookie Agent", medal: "🥉" };
  };

  const rank = getRank(score);
  const scorePercentage = Math.min((score / maxScore) * 100, 100);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 relative">
      <canvas 
        ref={fireworksCanvasRef} 
        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none" 
      />
      <div className="w-full max-w-5xl relative z-10">
        <header className="flex justify-between items-center text-white p-2">
          <h1 className="font-orbitron font-bold text-lg md:text-xl tracking-wider text-shadow-cyan">SupTech Champions</h1>
          <div className="agent-info-header">
            Agent <span className="font-bold text-pink-400">{agentData.codename}</span> | Score: <span className="font-bold text-green-400">{animatedScore}</span>
          </div>
        </header>
        <div className="w-full h-1 bg-black/50 rounded-full my-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-cyan-500" style={{width: `${scorePercentage}%`}}></div>
            <div className="scanner-bar"></div>
        </div>
      </div>

      <main className="relative z-10 w-full max-w-4xl bg-black/50 border-2 border-cyan-500/50 rounded-2xl p-4 sm:p-6 md:p-8 mt-4 shadow-lg shadow-cyan-500/20 backdrop-blur-sm overflow-hidden certificate-container">
        <div className="text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-wider animate-reveal-1">
                🎉 Mission Complete 🎉
            </h2>
            <p className="text-5xl md:text-7xl font-orbitron font-extrabold score-gradient my-2 animate-reveal-2">
                {animatedScore}
            </p>
        </div>

        <div className="w-full max-w-3xl mx-auto mt-4 bg-gray-900/50 border border-purple-500/50 rounded-xl p-4 sm:p-6 text-center animate-reveal-3 certificate-inner-panel">
            <h3 className="text-xl md:text-2xl font-bold text-yellow-400 tracking-widest">
                🏆 CERTIFICATE OF COMPLETION 🏆
            </h3>
            <div className="text-gray-300 mt-4 text-sm md:text-base space-y-3">
                <p>This is to certify that</p>
                <p className="text-2xl md:text-3xl font-bold agent-name-gradient">
                    Agent {agentData.codename}
                </p>
                <p>
                    has successfully completed the <span className="font-bold text-cyan-400">SupTech Champions Simulation</span>,
                </p>
                <p>demonstrating strong capability across supervisory missions</p>
                <p>
                    with a total score of <span className="text-2xl font-bold text-green-400">{score} / {maxScore}</span>.
                </p>
                <p>Awarded the title of</p>
                <div className="animate-reveal-4 opacity-0">
                    <p className="text-3xl md:text-4xl font-bold text-white">
                        {rank.medal} {rank.name}
                    </p>
                    <p className="text-purple-300 italic">
                        for advancing SupTech knowledge and skills.
                    </p>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 animate-reveal-5 opacity-0">
          <button
            onClick={() => { playClickSound(); onReplay(); }}
            onMouseEnter={playHoverSound}
            className="w-full sm:w-auto futuristic-btn btn-primary"
          >
            Replay Missions
          </button>
          <a
            href="https://www.bis.org/publ/othp_suptech.htm"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playHoverSound}
            onClick={playClickSound}
            className="w-full sm:w-auto futuristic-btn btn-secondary text-center"
          >
            Learn More
          </a>
        </div>
      </main>
      <style>{`
        .agent-info-header {
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid rgba(0, 255, 255, 0.5);
            border-radius: 9999px;
            padding: 0.5rem 1rem;
            font-size: clamp(0.8rem, 2.5vmin, 1rem);
            backdrop-filter: blur(5px);
        }
        .certificate-container {
            background: #0D0D0D;
            background-image: 
                radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0);
            background-size: 20px 20px;
        }
        .certificate-inner-panel {
            background: #1a1a2e;
        }
        .text-shadow-cyan {
            text-shadow: 0 0 8px rgba(0, 255, 255, 0.7);
        }
        .scanner-bar {
            position: absolute;
            top: 0;
            left: -100px;
            width: 100px;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.8), transparent);
            animation: scan 4s linear infinite;
        }
        @keyframes scan {
            from { left: -100px; }
            to { left: calc(100% + 100px); }
        }
        .score-gradient {
            background: linear-gradient(45deg, #00FFFF, #32CD32);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            filter: drop-shadow(0 0 10px #00FFFF);
        }
        .agent-name-gradient {
            background: linear-gradient(45deg, #ff79c6, #f1fa8c);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        @keyframes reveal { 
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal-1 { animation: reveal 0.5s 0.2s ease-out forwards; opacity: 0; }
        .animate-reveal-2 { animation: reveal 0.5s 0.5s ease-out forwards; opacity: 0; }
        .animate-reveal-3 { animation: reveal 0.5s 0.8s ease-out forwards; opacity: 0; }
        .animate-reveal-4 { animation: reveal 0.8s 2.2s ease-out forwards; }
        .animate-reveal-5 { animation: reveal 0.5s 2.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default CompletionScreen;