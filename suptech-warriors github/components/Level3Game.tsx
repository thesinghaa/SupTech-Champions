import React, { useState, useEffect, useRef } from 'react';
import { AgentData } from '../App';
import useAudio from '../hooks/useAudio';

interface Level2InvestigationProps {
    agentData: AgentData;
    onExitLevel: () => void;
    onComplete: (score: number) => void;
}

// New monochrome SVG icons
const LockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const MoneyBagIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v4"/><path d="M4 12v6a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-6"/><path d="M12 12h.01"/><path d="M16 12h.01"/><path d="M8 12h.01"/></svg>;
const WarningIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>;
const BarChartIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;

const violationsData = [
    { id: 'v1', text: 'Data Privacy Breach', icon: <LockIcon />, frameworkId: 'f1' },
    { id: 'v2', text: 'AML Compliance Failure', icon: <MoneyBagIcon />, frameworkId: 'f2' },
    { id: 'v3', text: 'Transaction Monitoring Gap', icon: <WarningIcon />, frameworkId: 'f3' },
    { id: 'v4', text: 'Reporting Delay', icon: <BarChartIcon />, frameworkId: 'f4' },
];

const frameworksData = [
    { id: 'f1', text: 'GDPR (Privacy & Data Protection)' },
    { id: 'f2', text: 'AML (Anti-Money Laundering)' },
    { id: 'f3', text: 'MiFID (Market Integrity)' },
    { id: 'f4', text: 'Basel III (Risk Reporting)' },
];

const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const Level3Game: React.FC<Level2InvestigationProps> = ({ onExitLevel, onComplete }) => {
    const [shuffledViolations, setShuffledViolations] = useState(violationsData);
    const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [score, setScore] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [scoreAnimation, setScoreAnimation] = useState<number | null>(null);
    const [isShaking, setIsShaking] = useState<string | null>(null);

    const { playSnapSound, playWrongSound, playTriumphantMusic, playHoverSound } = useAudio();

    const matchedCount = Object.keys(matchedPairs).length;
    const allMatched = matchedCount === violationsData.length;

    useEffect(() => {
        setShuffledViolations(shuffleArray(violationsData));
    }, []);
    
    useEffect(() => {
        if (allMatched) {
            playTriumphantMusic();
            setTimeout(() => setShowSummary(true), 500);
        }
    }, [allMatched, playTriumphantMusic]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, violationId: string) => {
        setDraggedItemId(violationId);
        setIsDragging(true);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, frameworkId: string) => {
        e.preventDefault();
        if (!draggedItemId || matchedPairs[frameworkId] || allMatched) return;

        const violation = violationsData.find(v => v.id === draggedItemId);
        if (violation && violation.frameworkId === frameworkId) {
            playSnapSound();
            const points = 60;
            setScore(prev => prev + points);
            setScoreAnimation(points);
            setTimeout(() => setScoreAnimation(null), 1000);

            setMatchedPairs(prev => ({ ...prev, [frameworkId]: violation.id }));
        } else {
            playWrongSound();
            setIsShaking(frameworkId);
            setTimeout(() => setIsShaking(null), 500);
        }
        setDraggedItemId(null);
        setIsDragging(false);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDraggedItemId(null);
    };

    return (
        <div className="w-full h-full max-w-6xl p-4 sm:p-6 flex flex-col bg-black/80 border-2 border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 backdrop-blur-md animate-fade-in-level investigation-container">
            <header className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-gray-700/50 w-full flex-shrink-0">
                <h1 className="text-h2-dynamic font-bold text-cyan-400 tracking-widest uppercase font-orbitron">LEVEL 2: VIOLATION INVESTIGATION</h1>
                <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-0 flex-wrap justify-center">
                    <div className="hud-item relative">
                        SCORE: <span className="font-bold text-white">{score}</span>
                        {scoreAnimation !== null && (
                            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-green-400 font-bold animate-score-popup">
                                +{scoreAnimation}
                            </span>
                        )}
                    </div>
                    <div className="match-counter">Match {matchedCount}/{violationsData.length}</div>
                    <button onClick={onExitLevel} onMouseEnter={playHoverSound} className="text-sm futuristic-btn p-2 uppercase">Exit</button>
                </div>
            </header>

            <div className="instruction-box text-center my-4">💡 Drag each violation to its primary regulatory framework.</div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 overflow-y-auto">
                <div>
                    <h2 className="text-xl font-bold text-cyan-400 mb-4">Detected Violations</h2>
                    <div className="space-y-4">
                        {shuffledViolations.map(violation => {
                            const isMatched = Object.values(matchedPairs).includes(violation.id);
                            if (isMatched) return (
                                <div key={violation.id} className="violation-item matched-source">
                                    <span className="violation-icon">{violation.icon}</span>
                                    <span>{violation.text}</span>
                                </div>
                            );
                            return (
                                <div
                                    key={violation.id}
                                    draggable={!isMatched}
                                    onDragStart={e => handleDragStart(e, violation.id)}
                                    onDragEnd={handleDragEnd}
                                    className={`violation-item ${isDragging && draggedItemId !== violation.id ? 'other-dragging' : ''} ${draggedItemId === violation.id ? 'is-dragging' : ''}`}
                                >
                                    <span className="violation-icon">{violation.icon}</span>
                                    <span>{violation.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-bold text-pink-500 mb-4">Regulatory Frameworks</h2>
                    <div className="space-y-4">
                        {frameworksData.map(framework => {
                            const matchedViolationId = matchedPairs[framework.id];
                            const matchedViolation = matchedViolationId ? violationsData.find(v => v.id === matchedViolationId) : null;
                            const isDropTarget = isDragging && !matchedViolation;
                            return (
                                <div
                                    key={framework.id}
                                    onDragOver={handleDragOver}
                                    onDrop={e => handleDrop(e, framework.id)}
                                    className={`framework-item ${matchedViolation ? 'matched' : ''} ${isDropTarget ? 'drop-target' : ''} ${isShaking === framework.id ? 'shake-horizontal' : ''}`}
                                >
                                    {matchedViolation ? (
                                        <div className="matched-item">
                                            <span className="violation-icon">{matchedViolation.icon}</span>
                                            <span>{matchedViolation.text}</span>
                                        </div>
                                    ) : (
                                        <span>{framework.text}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {showSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-md bg-[#0d0f19]/90 border-2 border-cyan-400/50 rounded-lg p-6 sm:p-8 text-white text-center holographic-panel">
                        <h2 className="text-2xl sm:text-3xl font-bold text-cyan-400 mb-4 font-orbitron">INVESTIGATION COMPLETE</h2>
                        <div className="space-y-2 my-6">
                            <div className="flex justify-center text-xl sm:text-2xl"><strong>Final Score:</strong> <strong className="text-yellow-400 ml-2">{score} pts</strong></div>
                        </div>
                        <button onClick={() => onComplete(score)} className="futuristic-btn btn-success uppercase">
                            Continue
                        </button>
                    </div>
                </div>
            )}
            
            <style>{`
                .investigation-container { background: #0D0D0D; background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0); background-size: 25px 25px; }
                .hud-item { background: rgba(0,0,0,0.2); border: 1px solid #00FFFF33; border-radius: 9999px; padding: 0.5rem 1rem; font-family: 'Orbitron', sans-serif; color: #00FFFFaa; font-size: clamp(0.8rem, 2vmin, 1rem); }
                .match-counter { background: rgba(0,255,255,0.1); border: 1px solid #00FFFF88; border-radius: 9999px; padding: 0.5rem 1rem; font-family: 'Orbitron', sans-serif; }
                .violation-item { display: flex; align-items: center; gap: 1rem; background: linear-gradient(90deg, #1f1f3a, #2a2a4e); border: 2px solid #8A2BE2; border-radius: 0.75rem; padding: 1rem; cursor: grab; transition: all 0.3s ease; box-shadow: 0 0 15px #8A2BE24D, inset 0 0 10px #8A2BE233; }
                .violation-item:hover { transform: scale(1.03); box-shadow: 0 0 25px #8A2BE280, inset 0 0 10px #8A2BE233; }
                .violation-item.is-dragging { opacity: 0.5; transform: scale(0.95) rotate(-2deg); cursor: grabbing; box-shadow: 0 0 30px #8A2BE2; }
                .violation-item.other-dragging { opacity: 0.6; filter: grayscale(50%); }
                .violation-item.matched-source { background: #222; border-color: #444; color: #666; cursor: default; box-shadow: none; }
                .violation-item.matched-source .violation-icon { color: #666; }
                .violation-icon { font-size: 1.5rem; width: 24px; height: 24px; color: #f1fa8c; flex-shrink: 0; }
                .framework-item { display: flex; align-items: center; justify-content: center; background: #00FFFF0D; border: 2px dashed #00FFFF80; border-radius: 0.75rem; padding: 1rem; min-height: 70px; transition: all 0.3s ease; color: #00FFFFCC; }
                .framework-item.drop-target { background: #00FFFF26; border-color: #00FFFF; transform: scale(1.02); }
                .framework-item.matched { border-style: solid; border-color: transparent; background: transparent; padding: 0; }
                .framework-item .matched-item { display: flex; align-items: center; gap: 1rem; color: #fff; font-weight: bold; width: 100%; height: 100%; padding: 1rem; background: linear-gradient(90deg, #1f1f3a, #2a2a4e); border: 2px solid #8A2BE2; border-radius: 0.75rem; box-shadow: 0 0 15px #8A2BE24D, inset 0 0 10px #8A2BE233; }
                .instruction-box { background: #00FFFF0D; border: 2px solid #00FFFF80; border-radius: 0.75rem; padding: 1rem; color: #00FFFFCC; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.5s 0.2s ease-out forwards; opacity: 0; }
                .animate-fade-in-level { animation: fade-in 0.7s ease-out forwards; }
                @keyframes score-popup { from { transform: translateY(0) scale(1); opacity: 1; } to { transform: translateY(-20px) scale(1.5); opacity: 0; } }
                .animate-score-popup { animation: score-popup 1s ease-out forwards; }
                .shake-horizontal { animation: shake-horizontal-anim 0.5s ease-in-out; border-color: var(--glow-color-danger) !important; }
                @keyframes shake-horizontal-anim { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
            `}</style>
        </div>
    );
}

export default Level3Game;