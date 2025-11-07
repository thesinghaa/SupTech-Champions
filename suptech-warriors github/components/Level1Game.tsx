import React, { useState, useEffect, useMemo } from 'react';
import { AgentData } from '../App';
import useAudio from '../hooks/useAudio';
import FuturisticLoader from './FuturisticLoader';

interface Level1GameProps {
  agentData: AgentData;
  onExitLevel: () => void;
  onComplete?: (score: number) => void;
}

const UserIcon = () => (
    <svg className="w-full h-full p-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);

interface GameData {
  caseFile: string;
  question: string;
  answer: string;
  distractors: string[];
}

const staticGameData: GameData = {
  caseFile: "The corporate net of OmniCorp was breached last night, triggering a red alert across Sector 7. Initial reports indicate a sophisticated phish targeting executive credentials. Data exfiltration was detected from server 'Cerberus-03', specifically the 'Project Chimera' directory. Security logs show an anomaly: a phantom user account, 'Ghost_Protocol', accessing encrypted financial records. The breach occurred at precisely 02:17 AM. Forensics recovered a fragmented data packet, part of a transaction log, revealing a destination IP: 192.168.1.100. This IP address is not internal. The exfiltrated data appears to include schematics for a new neural interface. The security team is baffled",
  question: "What was the name of the server from which data exfiltration was detected?",
  answer: "Cerberus-03",
  distractors: ["Ghost_Protocol", "OmniCorp", "Project Chimera"]
};

const loadingSteps = [
    "CONNECTING TO CHRONOS MAINFRAME...",
    "DOWNLOADING CASE FILE D7-2A4B...",
    "DECRYPTING DATA PACKET...",
    "CONNECTION SECURE."
];

const Level1Game: React.FC<Level1GameProps> = ({ agentData, onExitLevel, onComplete }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isSolved, setIsSolved] = useState(false);
    const [incorrectSelection, setIncorrectSelection] = useState<string | null>(null);
    const [finalScore, setFinalScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    
    const { playHoverSound, playClickSound, playSuccessMessage, playWrongSound } = useAudio();

    const shuffleArray = (array: string[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    const options = useMemo(() => {
      if (!gameData) return [];
      return shuffleArray([gameData.answer, ...gameData.distractors]);
    }, [gameData]);
    
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setGameData(staticGameData);
            setIsLoading(false);
        }, 3500);
        return () => clearTimeout(timer);
    }, []);
    
    const handleOptionClick = (option: string) => {
      if (isSolved) return;
      playClickSound();
      setSelectedOption(option);

      const isCorrect = option.trim().toLowerCase() === gameData!.answer.trim().toLowerCase();

      if (isCorrect) {
          const score = 150;
          setFeedback(`ACCESS GRANTED. Data recovered.`);
          setIsSolved(true);
          setFinalScore(score);
          playSuccessMessage();
      } else {
          playWrongSound();
          setAttempts(prev => prev + 1);
          setFeedback('ACCESS DENIED. Incorrect analysis. Please try again.');
          setIncorrectSelection(option);
          setTimeout(() => {
              setIncorrectSelection(null);
          }, 500);
      }
    };
    
    return (
        <div className="w-full max-w-5xl panel-padding-dynamic space-y-4 bg-black/80 border border-[#FF4500]/50 rounded-lg shadow-2xl shadow-black/40 backdrop-blur-md animate-fade-in-level holographic-panel">
            <header className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-gray-700/50">
                <h1 className="text-h2-dynamic font-bold text-[#FF4500] tracking-widest uppercase" style={{ textShadow: '0 0 8px #FF4500', fontFamily: 'Orbitron' }}>
                    LEVEL 1 : THE CHRONOS SYSTEM
                </h1>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <div className="w-8 h-8 text-[#00FFFF] border-2 border-[#00FFFF] rounded-md"><UserIcon /></div>
                    <span className="text-md text-white font-mono">AGENT: {agentData.codename}</span>
                    <button onClick={onExitLevel} onMouseEnter={playHoverSound} className="exit-btn">Exit</button>
                </div>
            </header>

            {isLoading && (
                <div className="text-center py-10 flex items-center justify-center min-h-[50vh]">
                    <FuturisticLoader text="LOADING..." steps={loadingSteps} />
                </div>
            )}
            
            {gameData && !isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[50vh]">
                    <div className="case-file-terminal h-full max-h-[40vh] md:max-h-full overflow-y-auto text-p-dynamic">
                        <h2 className="text-lg font-bold text-white mb-2 border-b border-gray-600 pb-2">CASE FILE: D7-2A4B</h2>
                        {gameData.caseFile}
                    </div>
                    
                    <div className="flex flex-col justify-center gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-white mb-2 border-b border-gray-600 pb-2">ANALYTICS TASK</h2>
                            <p className="text-gray-300 text-p-dynamic">{gameData.question}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleOptionClick(option)}
                                    onMouseEnter={playHoverSound}
                                    disabled={isSolved}
                                    className={`
                                        analytical-option-btn font-mono text-p-dynamic
                                        ${isSolved
                                          ? (option.trim().toLowerCase() === gameData.answer.trim().toLowerCase()
                                            ? 'correct'
                                            : 'disabled')
                                          : ''
                                        }
                                        ${incorrectSelection === option ? 'incorrect' : ''}
                                    `}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        
                        {feedback && (
                            <div className={`mt-4 p-3 rounded-md text-center font-medium ${isSolved ? 'bg-green-500/20 text-green-300' : 'bg-[#FF4500]/20 text-[#FF4500]'}`}>
                                {feedback}
                            </div>
                        )}
                        
                        {isSolved && (
                            <div className="mt-4 text-center">
                                <button
                                    onClick={() => onComplete && onComplete(finalScore)}
                                    onMouseEnter={playHoverSound}
                                    className="w-full futuristic-btn btn-success"
                                >
                                    Return to Mission Hub
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fade-in-level { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in-level { animation: fade-in-level 0.7s ease-out forwards; }
                .case-file-terminal {
                    background-color: rgba(0, 0, 0, 0.7);
                    border: 1px solid var(--glow-color-primary);
                    border-radius: 0.375rem;
                    padding: 1.5rem;
                    font-family: 'IBM Plex Mono', monospace;
                    color: var(--glow-color-primary);
                    text-shadow: 0 0 5px var(--glow-color-primary);
                    box-shadow: inset 0 0 15px rgba(0, 255, 255, 0.2);
                }
                .exit-btn, .analytical-option-btn {
                    padding: 0.5rem 1rem;
                    border: 2px solid #555;
                    background: transparent;
                    color: #ccc;
                    border-radius: 0.375rem;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    font-weight: bold;
                }
                .analytical-option-btn {
                    text-align: left;
                    text-transform: none;
                }
                .exit-btn:hover, .analytical-option-btn:not(:disabled):hover {
                    border-color: var(--glow-color-primary);
                    background-color: color-mix(in srgb, var(--glow-color-primary) 10%, transparent);
                    box-shadow: 0 0 10px var(--glow-color-primary);
                    color: white;
                }
                .analytical-option-btn.correct {
                    border-color: var(--glow-color-success);
                    background-color: color-mix(in srgb, var(--glow-color-success) 20%, transparent);
                    color: #fff;
                    text-shadow: 0 0 5px #fff;
                    animation: glow-pulse-green 1.5s infinite;
                }
                .analytical-option-btn.incorrect {
                    animation: shake-horizontal 0.5s ease-in-out;
                    border-color: var(--glow-color-danger);
                    background-color: color-mix(in srgb, var(--glow-color-danger) 20%, transparent);
                }
                .analytical-option-btn.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                 @keyframes glow-pulse-green {
                  0% { box-shadow: inset 0 0 5px var(--glow-color-success); }
                  50% { box-shadow: inset 0 0 20px var(--glow-color-success); }
                  100% { box-shadow: inset 0 0 5px var(--glow-color-success); }
                }
                @keyframes shake-horizontal {
                  0%, 100% { transform: translateX(0); }
                  25% { transform: translateX(-8px); }
                  75% { transform: translateX(8px); }
                }
            `}</style>
        </div>
    );
};

export default Level1Game;