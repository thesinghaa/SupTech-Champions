import React from 'react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`holographic-panel bg-[#0d0f19]/80 text-white border border-[#00FFFF]/50 rounded-lg p-8 m-4 max-w-lg w-full transform transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#00FFFF] tracking-wider" style={{ textShadow: '0 0 5px #00FFFF' }}>
            HOW TO PLAY
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-3xl"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="space-y-4 text-gray-300 font-light">
          <p>
            <strong className="font-medium text-[#32CD32]">1. ASSUME YOUR IDENTITY:</strong> Enter an Agent Codename to begin your mission. This is how you'll be known within the Bureau.
          </p>
          <p>
            <strong className="font-medium text-[#32CD32]">2. ANALYZE THE EVIDENCE:</strong> You will be presented with case files, transaction logs, and encrypted messages. Pay close attention to the details.
          </p>
          <p>
            <strong className="font-medium text-[#32CD32]">3. ANSWER THE BRIEFING:</strong> Use the information you gather to answer questions and identify the missing data. The fate of the Bureau's secrets is in your hands.
          </p>
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="futuristic-btn btn-primary"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;
