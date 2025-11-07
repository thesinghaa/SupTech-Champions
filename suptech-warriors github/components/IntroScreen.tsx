import React from 'react';

// New concentric circles animation with rotation
const ScanningReticle = () => (
    <svg viewBox="0 0 100 100" className="w-48 h-48 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}>
        {/* Static crosshair elements */}
        <line x1="50" y1="0" x2="50" y2="10" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="50" y1="100" x2="50" y2="90" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="0" y1="50" x2="10" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        <line x1="100" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
        
        {/* Central glowing core */}
        <circle cx="50" cy="50" r="4" fill="currentColor">
            <animate attributeName="r" values="4;5;4" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Group for rotating rings */}
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
            {/* Ring 1 - Dashed - CW */}
            <circle cx="50" cy="50" r="12" strokeDasharray="3 10">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="15s" repeatCount="indefinite" />
            </circle>
            {/* Ring 2 - Dotted - CCW */}
            <circle cx="50" cy="50" r="20" strokeDasharray="1 8" strokeWidth="2">
                <animateTransform attributeName="transform" type="rotate" from="360 50 50" to="0 50 50" dur="10s" repeatCount="indefinite" />
            </circle>
            {/* Ring 3 - Solid, pulsing opacity - No rotation */}
            <circle cx="50" cy="50" r="28">
                 <animate attributeName="stroke-opacity" values="0.1;0.5;0.1" dur="4s" repeatCount="indefinite" />
            </circle>
            {/* Ring 4 - Dashed - CW Fast */}
            <circle cx="50" cy="50" r="36" strokeDasharray="8 8">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="8s" repeatCount="indefinite" />
            </circle>
            {/* Ring 5 - Dotted - CCW Slow */}
            <circle cx="50" cy="50" r="44" strokeDasharray="1 12" strokeWidth="1">
                <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="-360 50 50" dur="20s" repeatCount="indefinite" />
            </circle>
        </g>
    </svg>
);


interface IntroScreenProps {
  onStartGame: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStartGame }) => {
    return (
        <div className="w-full max-w-2xl text-center space-y-8 flex flex-col items-center">
            <ScanningReticle />
            <header>
                <h1 
                    className="text-h1-dynamic font-bold text-[#00FFFF] tracking-widest uppercase font-orbitron" 
                    style={{ textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF' }}
                >
                    SupTech Champions
                </h1>
                <p className="mt-2 text-p-dynamic text-gray-300 tracking-wider">
                    A Data Heist Simulation
                </p>
            </header>
            <button
                onClick={onStartGame}
                className="futuristic-btn btn-success mt-8"
            >
                Start Mission
            </button>
             <style>{`
                /* Animation is self-contained in the SVG component */
            `}</style>
        </div>
    );
};

export default IntroScreen;