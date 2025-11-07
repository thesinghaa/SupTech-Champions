import React, { useState, useEffect } from 'react';
import HowToPlayModal from './HowToPlayModal';
import useAudio from '../hooks/useAudio';

interface RegistrationFormProps {
  onStartInvestigation: (codename: string, avatarIndex: number) => void;
}

// An array of new character-themed SVG elements for a more engaging avatar selection.
const avatars = [
  // Avatar 1: Detective - Classic investigator for a noir feel.
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />
    <path d="M2 20.2c0-3.3 2.7-6 6-6h8c3.3 0 6 2.7 6 6" />
    <path d="M5 18a9 9 0 0 1 14 0" />
    <path d="M3 20.2V19a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.2" />
  </svg>,
  // Avatar 2: Analyst - A tech-savvy agent with data-glasses.
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
    <path d="M7 12h10" />
  </svg>,
  // Avatar 3: Phantom - A stealthy, ghost-like operative.
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
    <path d="M6 15a6 6 0 0 0 12 0" />
  </svg>,
  // Avatar 4: Cyborg - A futuristic android for a high-tech edge.
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
    <circle cx="12" cy="14" r="2" />
    <path d="M8 11h8" />
  </svg>
];


const RegistrationForm: React.FC<RegistrationFormProps> = ({ onStartInvestigation }) => {
  const [codename, setCodename] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  
  const { playHoverSound, playClickSound } = useAudio();
  
  const isCodenameValid = codename.length >= 2;

  useEffect(() => {
    if (codename.length > 0 && codename.length < 2) {
      setError('Codename must be at least 2 characters.');
    } else {
      setError('');
    }
  }, [codename]);
  
  const handleStart = () => {
    if (isCodenameValid) {
      onStartInvestigation(codename, selectedAvatar);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleStart();
    }
  };
  
  const useDefaultCodename = () => {
    playClickSound();
    setCodename('Agent Smith');
  };
  
  const handleOpenModal = () => {
    playClickSound();
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    playClickSound();
    setIsModalOpen(false);
  };

  const handlePrevAvatar = () => {
    playClickSound();
    setSelectedAvatar(prev => (prev === 0 ? avatars.length - 1 : prev - 1));
  };

  const handleNextAvatar = () => {
      playClickSound();
      setSelectedAvatar(prev => (prev === avatars.length - 1 ? 0 : prev + 1));
  };


  return (
    <>
      <div className="w-full max-w-[90vmin] sm:max-w-md panel-padding-dynamic space-y-4 sm:space-y-6 bg-black/60 border border-[#8A2BE2]/50 rounded-lg shadow-2xl shadow-[#8A2BE2]/20 backdrop-blur-md text-center animate-fade-in holographic-panel">
        <header>
          <h1 className="text-h1-dynamic font-bold text-[#00FFFF] tracking-widest uppercase" style={{ textShadow: '0 0 8px #00FFFF, 0 0 12px #00FFFF' }}>
            SupTech Champions
          </h1>
          <p className="mt-2 text-p-dynamic text-gray-300 tracking-wider">
            Agent Registration Protocol
          </p>
        </header>

        <p className="text-gray-400 text-sm">
          A critical data breach has been detected. Sensitive records have vanished. Enter your codename and select an avatar to begin.
        </p>

        <div className="pt-2">
            <label className="block text-gray-300 mb-4 text-sm tracking-widest uppercase">Select Your Avatar</label>
            <div className="flex justify-center items-center gap-4">
                <button onClick={handlePrevAvatar} className="avatar-nav-btn" aria-label="Previous Avatar">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
                </button>
                <div className="avatar-display-box">
                    <div className="w-full h-full text-[#32CD32] p-4">
                        {avatars[selectedAvatar]}
                    </div>
                </div>
                <button onClick={handleNextAvatar} className="avatar-nav-btn" aria-label="Next Avatar">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
                </button>
            </div>
        </div>

        <div className="w-full">
          <label htmlFor="codename" className="sr-only">Enter your Agent Codename</label>
          <input
            id="codename"
            type="text"
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ENTER AGENT CODENAME"
            className="w-full futuristic-input text-p-dynamic"
          />
          {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleStart}
            onMouseEnter={playHoverSound}
            disabled={!isCodenameValid}
            className="w-full sm:w-auto futuristic-btn btn-success"
          >
            Start Investigation
          </button>
          <button
            onClick={useDefaultCodename}
            onMouseEnter={playHoverSound}
            className="w-full sm:w-auto futuristic-btn btn-secondary"
          >
            Use Default Codename
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleOpenModal}
            onMouseEnter={playHoverSound}
            className="text-gray-400 hover:text-white hover:underline transition-colors"
          >
            How to Play
          </button>
        </div>

        <p className="text-xs text-gray-500 animate-pulse">
            Tip: Press Enter to start quickly.
        </p>
      </div>

      <HowToPlayModal isOpen={isModalOpen} onClose={handleCloseModal} />
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .avatar-nav-btn {
            width: 3rem;
            height: 3rem;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #555;
            color: #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            flex-shrink: 0;
        }
        .avatar-nav-btn:hover {
            background: rgba(0, 255, 255, 0.2);
            border-color: #00FFFF;
            color: #00FFFF;
            transform: scale(1.1);
        }
        .avatar-display-box {
            width: clamp(6rem, 25vmin, 8rem);
            height: clamp(6rem, 25vmin, 8rem);
            background: radial-gradient(circle, rgba(10, 20, 40, 0.5) 0%, rgba(5, 10, 20, 0.6) 100%);
            border: 3px solid #32CD32;
            border-radius: 1rem;
            box-shadow: 0 0 25px #32CD32, inset 0 0 15px #32CD3255;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: box-shadow 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default RegistrationForm;