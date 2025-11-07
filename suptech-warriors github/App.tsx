import React, { useState, useEffect } from 'react';
import BackgroundCanvas from './components/BackgroundCanvas';
import RegistrationForm from './components/RegistrationForm';
import MissionBriefing from './components/MissionBriefing';
import Level1Game from './components/Level1Game';
import Level3Game from './components/Level3Game';
import CompletionScreen from './components/CompletionScreen';
import useAudio from './hooks/useAudio';
import FuturisticLoader from './components/FuturisticLoader';
import IntroScreen from './components/IntroScreen';
import Level2Crossword from './components/Level2Crossword';
import ScoringBriefing from './components/ScoringBriefing';

export type AgentData = {
  codename: string;
  avatarIndex: number;
};

type GameState = 'intro' | 'registration' | 'briefing' | 'scoringBriefing' | 'level1' | 'level2' | 'level3' | 'completion';

const initialLevelCompletion = { 1: false, 2: false, 3: false };

const authenticationSteps = [
    "VERIFYING CODENAME...",
    "CHECKING AVATAR SIGNATURE...",
    "ACCESSING BUREAU NETWORK...",
    "AUTHENTICATION SUCCESSFUL."
];

const MAX_POSSIBLE_SCORE = 750; // A target score for ranking purposes, matching the certificate design.

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('intro');
  const [agentData, setAgentData] = useState<AgentData | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [levelCompletion, setLevelCompletion] = useState(initialLevelCompletion);
  const [totalScore, setTotalScore] = useState(0);
  const [transitionClass, setTransitionClass] = useState('fade-in-fast');
  const [celebrateLevel, setCelebrateLevel] = useState<number | null>(null);
  const { playWelcomeMessage, playClickSound } = useAudio();

  const changeGameState = (newState: GameState) => {
    setTransitionClass('fade-out-fast');
    setTimeout(() => {
      setGameState(newState);
      setTransitionClass('fade-in-fast');
    }, 500); // This duration must match the CSS animation
  };
  
  const handleStartGame = () => {
    playClickSound();
    changeGameState('registration');
  };

  const handleStartInvestigation = (codename: string, avatarIndex: number) => {
    playClickSound();
    setTransitionClass('fade-out-fast'); // Fade out the registration form
    setTimeout(() => {
      setIsAuthenticating(true); // Show the loader
      playWelcomeMessage(codename);
      setAgentData({ codename, avatarIndex });
      setTotalScore(0); // Reset score for new game

      setTimeout(() => {
        setIsAuthenticating(false); // Hide the loader
        setGameState('scoringBriefing');
        setTransitionClass('fade-in-fast'); // Fade in the scoring briefing
      }, 3500); // Loader duration
    }, 500); // Fade out duration
  };
  
  const handleProceedToBriefing = () => {
    playClickSound();
    changeGameState('briefing');
  };

  const handleStartLevel = (level: number) => {
    playClickSound();
    if (level === 1) changeGameState('level1');
    if (level === 2) changeGameState('level2'); // Go directly to level 2
    if (level === 3) changeGameState('level3');
  };

  const handleExitLevel = () => {
    playClickSound();
    changeGameState('briefing');
  };

  const handleCompleteLevel1 = (score: number) => {
    playClickSound();
    setTotalScore(score); // Initialize score
    setLevelCompletion(prev => ({ ...prev, 1: true }));
    setCelebrateLevel(1);
    changeGameState('briefing');
  };
  
  // This is now for the investigation game (Level 2)
  const handleCompleteLevel2 = (score: number) => {
      playClickSound();
      setTotalScore(prev => prev + score);
      setLevelCompletion(prev => ({ ...prev, 2: true }));
      setCelebrateLevel(2);
      changeGameState('briefing');
  };

  // This is for the crossword game (Level 3)
  const handleCompleteLevel3 = (score: number) => {
    playClickSound();
    setTotalScore(prev => prev + score);
    setLevelCompletion(prev => ({ ...prev, 3: true }));
    changeGameState('completion');
  };

  const handleCelebrationEnd = () => {
    setCelebrateLevel(null);
  };
  
  const handleReplay = () => {
    playClickSound();
    setTransitionClass('fade-out-fast');
    setTimeout(() => {
        setLevelCompletion(initialLevelCompletion);
        setTotalScore(0);
        setGameState('briefing');
        setTransitionClass('fade-in-fast');
    }, 500);
  };

  const renderGameState = () => {
    if (isAuthenticating) {
      return <FuturisticLoader text="AUTHENTICATING..." steps={authenticationSteps} />;
    }
    switch (gameState) {
      case 'intro':
        return <IntroScreen onStartGame={handleStartGame} />;
      case 'registration':
        return <RegistrationForm onStartInvestigation={handleStartInvestigation} />;
      case 'scoringBriefing':
        return <ScoringBriefing onProceed={handleProceedToBriefing} />;
      case 'briefing':
        return agentData && <MissionBriefing 
          agentData={agentData} 
          onStartLevel={handleStartLevel} 
          levelCompletionStatus={levelCompletion} 
          celebrateLevel={celebrateLevel}
          onCelebrationEnd={handleCelebrationEnd}
        />;
      case 'level1':
        return agentData && <Level1Game agentData={agentData} onExitLevel={handleExitLevel} onComplete={handleCompleteLevel1} />;
      // LEVEL 2 (INVESTIGATION)
      case 'level2':
        return agentData && <Level3Game agentData={agentData} onExitLevel={handleExitLevel} onComplete={handleCompleteLevel2} />;
      // LEVEL 3 (CROSSWORD)
      case 'level3':
        return agentData && <Level2Crossword agentData={agentData} onExitLevel={handleExitLevel} onComplete={handleCompleteLevel3} />;
      case 'completion':
        return agentData && <CompletionScreen agentData={agentData} score={totalScore} maxScore={MAX_POSSIBLE_SCORE} onReplay={handleReplay} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="relative w-screen h-screen overflow-hidden bg-black text-[#00FFFF] game-content">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: "url('https://storage.googleapis.com/aai-web-samples/scenarios/bureau.png')",
            opacity: gameState === 'registration' || isAuthenticating ? 0.5 : 0.3,
          }}
        ></div>
        <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black via-transparent to-black"></div>
        <BackgroundCanvas gameState={gameState} />
        <div className="perspective-container w-full h-full">
          <main className={`relative z-10 flex items-center justify-center w-full h-full p-2 sm:p-4 ${transitionClass}`}>
            {renderGameState()}
          </main>
        </div>
        <div className="scanline-overlay"></div>
        {gameState === 'intro' && (
            <div className="absolute bottom-4 left-1/2 z-20 text-sm font-orbitron tracking-widest designer-credit">
                Made by - Aryan Singh & Duenna Dsouza
            </div>
        )}
      </div>
      <div id="orientation-blocker">
        <div className="text-center">
            <h2 className="text-3xl font-bold uppercase tracking-widest text-[#FF4500]" style={{ textShadow: '0 0 10px #FF4500' }}>
                Connection Error
            </h2>
            <p className="mt-4 text-lg">
                DATA HEIST PROTOCOL REQUIRES LANDSCAPE ORIENTATION.
            </p>
            <p className="mt-2 text-gray-400">
                PLEASE ROTATE YOUR DEVICE TO CONTINUE.
            </p>
        </div>
      </div>
       <style>{`
        :root {
            --glow-color-primary: #00FFFF;
            --glow-color-secondary: #8A2BE2;
            --glow-color-success: #32CD32;
            --glow-color-danger: #FF4500;
            --bg-dark: #0a0f1e;
            --bg-light: #1f1f3a;
            --text-color: #e0e0e0;
            --border-color: rgba(0, 255, 255, 0.3);
        }

        .perspective-container { 
          perspective: 1500px; 
        }
        .holographic-panel { 
          transform: rotateY(-5deg) rotateX(5deg); 
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); 
          animation: holographic-glow 4s infinite alternate;
        }
        .holographic-panel:hover { 
          transform: rotateY(0deg) rotateX(0deg) scale(1.02); 
          animation-play-state: paused;
        }

        @media (max-width: 768px) {
          .holographic-panel {
            transform: none !important;
            animation: none;
            box-shadow: 0 0 15px 5px rgba(0, 255, 255, 0.2), inset 0 0 10px 2px rgba(0, 255, 255, 0.1);
          }
          .holographic-panel:hover {
            transform: scale(1.02) !important;
          }
        }

        @keyframes holographic-glow {
          0% { box-shadow: 0 0 15px 5px rgba(0, 255, 255, 0.2), inset 0 0 10px 2px rgba(0, 255, 255, 0.1); }
          50% { box-shadow: 0 0 20px 8px rgba(138, 43, 226, 0.2), inset 0 0 12px 3px rgba(138, 43, 226, 0.1); }
          100% { box-shadow: 0 0 15px 5px rgba(50, 205, 50, 0.2), inset 0 0 10px 2px rgba(50, 205, 50, 0.1); }
        }

        .scanline-overlay {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            background: linear-gradient( to bottom, rgba(20, 20, 40, 0) 0%, rgba(20, 20, 40, 0.1) 50%, rgba(20, 20, 40, 0) 100% );
            background-size: 100% 4px;
            z-index: 5;
            animation: scanline-move 10s linear infinite;
        }
        @keyframes scanline-move {
          from { background-position: 0 0; }
          to { background-position: 0 -40px; }
        }

        /* NEW Transition Animations */
        .fade-in-fast { animation: fade-in-fast 0.5s ease-out forwards; }
        .fade-out-fast { animation: fade-out-fast 0.5s ease-in forwards; }
        @keyframes fade-in-fast {
          from { opacity: 0; transform: scale(0.98); filter: blur(5px); }
          to { opacity: 1; transform: scale(1); filter: blur(0px); }
        }
        @keyframes fade-out-fast {
          from { opacity: 1; transform: scale(1); filter: blur(0px); }
          to { opacity: 0; transform: scale(0.98); filter: blur(5px); }
        }
        
        /* Orientation Blocker */
        #orientation-blocker {
            display: none;
            position: fixed;
            inset: 0;
            background-color: #000;
            color: #00FFFF;
            z-index: 9999;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 1rem;
            font-family: 'Orbitron', monospace;
        }

        @media (orientation: portrait) {
            .game-content {
                display: none;
            }
            #orientation-blocker {
                display: flex;
            }
        }

        /* FUTURISTIC UI KIT */
        .futuristic-btn {
            position: relative;
            border: 2px solid var(--border-color);
            background: radial-gradient(circle, rgba(10, 20, 40, 0.8) 0%, rgba(5, 10, 20, 0.9) 100%);
            color: var(--text-color);
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 1px;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            cursor: pointer;
            transform: perspective(800px) rotateX(-5deg);
            transform-style: preserve-3d;
            transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease, background-color 0.4s ease;
        }
        .futuristic-btn:not(:disabled) {
            text-shadow: 0 0 5px currentColor;
        }
        .futuristic-btn:hover:not(:disabled) {
            transform: perspective(800px) rotateX(0deg) scale(1.05);
        }
        .futuristic-btn:disabled {
            cursor: not-allowed;
            background: #222;
            color: #666;
            border-color: #444;
            text-shadow: none;
            box-shadow: none;
            animation: none;
        }
        .futuristic-btn::before {
            content: '';
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%;
            background: #112;
            border-radius: 0.375rem;
            transform: translateZ(-10px);
            box-shadow: 0 0 5px #000;
            transition: transform 0.4s ease;
        }
        .futuristic-btn:hover:not(:disabled)::before { transform: translateZ(-15px); }
        .futuristic-btn::after {
            content: '';
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%;
            border-radius: 0.375rem;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 50%);
            pointer-events: none;
            transition: opacity 0.4s ease, background 0.4s ease;
        }
        
        .futuristic-btn.btn-success {
            color: #fff;
            border-color: var(--glow-color-success);
            background: radial-gradient(ellipse at center, color-mix(in srgb, var(--glow-color-success) 30%, transparent) 0%, transparent 70%);
            text-shadow: 0 0 8px #fff;
            animation: pulse-success 2s infinite;
        }
        .futuristic-btn.btn-success:hover:not(:disabled) {
            box-shadow: 0 0 25px var(--glow-color-success), inset 0 0 15px color-mix(in srgb, var(--glow-color-success) 70%, transparent);
            animation-play-state: paused;
        }
        @keyframes pulse-success {
            0% { box-shadow: 0 0 15px var(--glow-color-success), inset 0 0 10px color-mix(in srgb, var(--glow-color-success) 50%, transparent); }
            50% { box-shadow: 0 0 25px var(--glow-color-success), inset 0 0 18px color-mix(in srgb, var(--glow-color-success) 60%, transparent); }
            100% { box-shadow: 0 0 15px var(--glow-color-success), inset 0 0 10px color-mix(in srgb, var(--glow-color-success) 50%, transparent); }
        }
        
        .futuristic-btn.btn-primary { color: var(--glow-color-primary); border-color: color-mix(in srgb, var(--glow-color-primary) 40%, transparent); }
        .futuristic-btn.btn-primary:hover:not(:disabled) { border-color: var(--glow-color-primary); box-shadow: 0 0 20px var(--glow-color-primary), inset 0 0 10px color-mix(in srgb, var(--glow-color-primary) 20%, transparent); }
        .futuristic-btn.btn-primary::after { background: linear-gradient(135deg, color-mix(in srgb, var(--glow-color-primary) 20%, transparent) 0%, transparent 50%); }

        .futuristic-btn.btn-secondary { color: var(--glow-color-primary); background: transparent; }
        .futuristic-btn.btn-secondary:hover:not(:disabled) { background: color-mix(in srgb, var(--glow-color-primary) 10%, transparent); }

        .futuristic-input {
            background: transparent;
            border: 2px solid var(--glow-color-primary);
            border-radius: 0.375rem;
            color: white;
            padding: 0.75rem 1rem;
            transition: all 0.3s ease;
            box-shadow: inset 0 0 10px color-mix(in srgb, var(--glow-color-primary) 20%, transparent);
            text-align: center;
            font-size: 1.125rem;
        }
        .futuristic-input::placeholder { color: #888; }
        .futuristic-input:focus {
            outline: none;
            box-shadow: inset 0 0 15px color-mix(in srgb, var(--glow-color-primary) 40%, transparent), 0 0 15px var(--glow-color-primary);
        }

        .futuristic-terminal {
            background-color: rgba(0, 0, 0, 0.5);
            border: 1px solid var(--glow-color-success);
            border-radius: 0.375rem;
            padding: 1rem;
            font-family: 'IBM Plex Mono', monospace;
            color: var(--glow-color-success);
            text-shadow: 0 0 5px var(--glow-color-success);
            box-shadow: inset 0 0 15px rgba(50, 205, 50, 0.2);
            position: relative;
            overflow: hidden;
        }
        @media (min-width: 640px) {
            .futuristic-terminal {
                padding: 1.5rem;
            }
        }
        .futuristic-terminal::before {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background-image: linear-gradient( to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px );
            background-size: 100% 3px;
            opacity: 0.3;
            pointer-events: none;
            animation: scanline-move 8s linear infinite;
        }

        .futuristic-option-btn {
          position: relative; border: 2px solid #555; background: transparent;
          color: var(--text-color); padding: 0.75rem 1rem; border-radius: 0.375rem;
          cursor: pointer; transform-style: preserve-3d; transition: all 0.3s ease;
          text-align: left;
        }
        .futuristic-option-btn:not(:disabled):hover {
          border-color: var(--glow-color-primary);
          background-color: color-mix(in srgb, var(--glow-color-primary) 10%, transparent);
          box-shadow: 0 0 10px var(--glow-color-primary);
        }
        .futuristic-option-btn.selected {
          border-color: var(--glow-color-primary);
          background-color: color-mix(in srgb, var(--glow-color-primary) 20%, transparent);
          box-shadow: inset 0 0 15px var(--glow-color-primary);
        }
        .futuristic-option-btn.correct {
          border-color: var(--glow-color-success);
          background-color: color-mix(in srgb, var(--glow-color-success) 20%, transparent);
          color: #fff; text-shadow: 0 0 5px #fff;
          animation: glow-pulse-green 1.5s infinite;
        }
        .futuristic-option-btn:disabled { cursor: not-allowed; opacity: 0.6; }
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

        /* Responsive Typography & Layout */
        .text-h1-dynamic { font-size: clamp(1.8rem, 5vmin, 3rem); }
        .text-h2-dynamic { font-size: clamp(1.5rem, 4vmin, 2.25rem); }
        .text-p-dynamic { font-size: clamp(0.9rem, 2.5vmin, 1.1rem); }
        .panel-padding-dynamic { padding: clamp(1rem, 4vmin, 2rem); }

        /* Designer Credit Style */
        .designer-credit {
          color: rgba(0, 255, 255, 0.8);
          text-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
          animation: subtle-pulse 4s infinite alternate;
          transition: all 0.3s ease;
          cursor: default;
          transform: translateX(-50%);
        }
        .designer-credit:hover {
          color: #fff;
          text-shadow: 0 0 12px rgba(0, 255, 255, 1);
          transform: translateX(-50%) scale(1.05);
        }
        @keyframes subtle-pulse {
          from {
            opacity: 0.7;
            text-shadow: 0 0 6px rgba(0, 255, 255, 0.5);
          }
          to {
            opacity: 1;
            text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
          }
        }
      `}</style>
    </>
  );
};

export default App;