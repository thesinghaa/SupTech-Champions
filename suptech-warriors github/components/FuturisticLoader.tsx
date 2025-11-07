import React, { useState, useEffect } from 'react';

interface FuturisticLoaderProps {
  text: string;
  steps?: string[];
}

const FuturisticLoader: React.FC<FuturisticLoaderProps> = ({ text, steps }) => {
    const [displayText, setDisplayText] = useState(steps && steps.length > 0 ? steps[0] : text);

    useEffect(() => {
        if (steps && steps.length > 0) {
            let step = 0;
            setDisplayText(steps[step]); // Set initial step immediately
            const interval = setInterval(() => {
                step++;
                if (step < steps.length) {
                    setDisplayText(steps[step]);
                } else {
                    clearInterval(interval);
                }
            }, 800); // Duration per step

            return () => clearInterval(interval);
        } else {
            setDisplayText(text); // Fallback to static text
        }
    }, [steps, text]);

    return (
        <div className="flex flex-col items-center justify-center gap-8 text-center">
            <div className="loader-container">
                <div className="ring-1"></div>
                <div className="ring-2"></div>
                <div className="ring-3"></div>
                <div className="core"></div>
                {[...Array(20)].map((_, i) => <div key={i} className="particle" style={{'--i': i} as React.CSSProperties} />)}
            </div>
            <p className="text-lg text-[#00FFFF] tracking-widest uppercase font-mono loader-text" style={{ textShadow: '0 0 5px #00FFFF' }}>
                {displayText}
            </p>
            <style>{`
                .loader-container {
                    width: 150px;
                    height: 150px;
                    position: relative;
                    transform-style: preserve-3d;
                    perspective: 800px;
                    animation: container-glow 3s infinite alternate, glitch-effect 5s infinite step-end;
                }
                @keyframes container-glow {
                    from { filter: drop-shadow(0 0 5px #00FFFF); }
                    to { filter: drop-shadow(0 0 15px #32CD32); }
                }
                @keyframes glitch-effect {
                    0%, 100% { transform: none; }
                    5% { transform: skewX(5deg) translateX(5px); }
                    10% { transform: skewX(-5deg) translateX(-5px); }
                    15% { transform: none; }
                    40% { transform: scale(1.05, 1.02); }
                    42% { transform: none; }
                }
                .core, .ring-1, .ring-2, .ring-3 {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform-style: preserve-3d;
                }
                .core {
                    width: 30px;
                    height: 30px;
                    margin: -15px 0 0 -15px;
                    background-color: #00FFFF;
                    border-radius: 50%;
                    box-shadow: 0 0 20px 5px #00FFFF;
                    animation: core-pulse 1.5s infinite ease-in-out;
                }
                @keyframes core-pulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 0 20px 5px #00FFFF; }
                    50% { transform: scale(1.1); box-shadow: 0 0 30px 10px #00FFFF; }
                }
                .ring-1, .ring-2, .ring-3 {
                    border-radius: 50%;
                    border: 3px solid;
                    animation-duration: 4s;
                    animation-iteration-count: infinite;
                    animation-timing-function: linear;
                }
                .ring-1 {
                    width: 150px;
                    height: 150px;
                    margin: -75px 0 0 -75px;
                    border-color: #32CD32 transparent;
                    animation-name: rotate-1;
                }
                .ring-2 {
                    width: 120px;
                    height: 120px;
                    margin: -60px 0 0 -60px;
                    border-color: transparent #FF4500;
                    animation-name: rotate-2;
                    animation-direction: reverse;
                }
                .ring-3 {
                    width: 90px;
                    height: 90px;
                    margin: -45px 0 0 -45px;
                    border-color: #8A2BE2 transparent;
                    animation-name: rotate-3;
                }
                @keyframes rotate-1 {
                    from { transform: rotateX(70deg) rotateY(20deg) rotateZ(0deg); }
                    to { transform: rotateX(70deg) rotateY(20deg) rotateZ(360deg); }
                }
                @keyframes rotate-2 {
                    from { transform: rotateX(20deg) rotateY(60deg) rotateZ(0deg); }
                    to { transform: rotateX(20deg) rotateY(60deg) rotateZ(360deg); }
                }
                @keyframes rotate-3 {
                    from { transform: rotateX(45deg) rotateY(-45deg) rotateZ(0deg); }
                    to { transform: rotateX(45deg) rotateY(-45deg) rotateZ(360deg); }
                }

                .particle {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 4px;
                    height: 4px;
                    background: #00FFFF;
                    border-radius: 50%;
                    box-shadow: 0 0 10px #00FFFF;
                    animation: particle-burst 2.5s infinite ease-out;
                    animation-delay: calc(var(--i) * 0.08s);
                }
                @keyframes particle-burst {
                    0%, 20% {
                        transform: translate(-50%, -50%) rotate(calc(var(--i) * 18deg)) scale(0);
                        opacity: 1;
                    }
                    80% {
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) rotate(calc(var(--i) * 18deg)) translateX(120px) scale(0.5);
                        opacity: 0;
                    }
                }

                .loader-text {
                    animation: text-glow-pulse 1.5s infinite alternate;
                }
                @keyframes text-glow-pulse {
                    from { opacity: 0.8; text-shadow: 0 0 5px #00FFFF; }
                    to { opacity: 1; text-shadow: 0 0 10px #00FFFF, 0 0 15px #00FFFF; }
                }
            `}</style>
        </div>
    );
};

export default FuturisticLoader;
