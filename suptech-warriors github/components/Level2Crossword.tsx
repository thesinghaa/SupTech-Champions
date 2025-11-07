import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { AgentData } from '../App';
import useAudio from '../hooks/useAudio';

interface Level2CrosswordProps {
  agentData: AgentData;
  onExitLevel: () => void;
  onComplete: (score: number) => void;
}

const avatars = [
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M50,32 a15,15 0 1,0 0,36 a15,15 0 1,0 0,-36" /><path d="M28,80 C 28,60, 72,60, 72,80 Z" /></svg>,
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M25 80 L50 20 L75 80 Z" /><path d="M38 70 L62 70" /></svg>,
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" fill="none" strokeWidth="5"><circle cx="45" cy="45" r="30" /><line x1="68" y1="68" x2="90" y2="90" strokeLinecap="round" /></svg>,
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"><path d="M25 85 C 25 40, 75 40, 75 85 L 50 65 Z" fill="none"/><circle cx="40" cy="55" r="4" fill="currentColor" stroke="none"/><circle cx="60" cy="55" r="4" fill="currentColor" stroke="none"/></svg>
];

type WordDataItem = {
    number: number;
    clue: string;
    answer: string;
    startRow: number;
    startCol: number;
    direction: 'across' | 'down';
};

const crosswordData: WordDataItem[] = [
    { number: 1, clue: "Creative ideas and advancements that transform regulatory technology", answer: "INNOVATION", startRow: 0, startCol: 8, direction: "down" },
    { number: 2, clue: "Technology designed to strengthen supervisory capacity and improve monitoring", answer: "SUPTECH", startRow: 0, startCol: 16, direction: "down" },
    { number: 3, clue: "A secure testing environment where new regulatory tools are safely trialed", answer: "SANDBOX", startRow: 2, startCol: 6, direction: "across" },
    { number: 4, clue: "Continuous supervision and monitoring that ensures the system stays on track", answer: "OVERSIGHT", startRow: 3, startCol: 8, direction: "across" },
    { number: 5, clue: "Smart processes that reduce manual effort and enhance efficiency", answer: "AUTOMATION", startRow: 4, startCol: 6, direction: "down" },
    { number: 6, clue: "Guidelines or rules that steer decisions and ensure compliance within digital supervision", answer: "POLICY", startRow: 7, startCol: 5, direction: "across" },
    { number: 7, clue: "Raw, unprocessed information that powers modern SupTech systems", answer: "DATA", startRow: 10, startCol: 7, direction: "down" },
    { number: 8, clue: "Framework ensuring accountability, fairness, and transparency in regulatory systems", answer: "GOVERNANCE", startRow: 14, startCol: 0, direction: "across" },
];

const GRID_ROWS = 15;
const GRID_COLS = 18;

type CellData = {
    char: string | null;
    clueNumbers: number[];
    isLetterCell: boolean;
    isSolvedChar: boolean;
    wordIndices: number[];
};

interface CellComponentProps {
    cellData: CellData;
    isActive: boolean;
    isSolved: boolean;
    clueNumberVisible: boolean;
    isJustSolved: boolean;
}

const CellComponent: React.FC<CellComponentProps> = React.memo(({ cellData, isActive, isSolved, clueNumberVisible, isJustSolved }) => {
    if (!cellData.isLetterCell) {
        return <div className="cell empty" />;
    }

    return (
        <div className={`cell ${isSolved ? 'solved' : ''} ${isActive ? 'active' : ''} ${isJustSolved ? 'just-solved-glow' : ''}`}>
            {clueNumberVisible && cellData.clueNumbers.length > 0 && (
                <span className="clue-number">{cellData.clueNumbers[0]}</span>
            )}
            <div className="cell-letter">
                {(isSolved || cellData.isSolvedChar) && cellData.char}
            </div>
        </div>
    );
});


const Level2Crossword: React.FC<Level2CrosswordProps> = ({ agentData, onExitLevel, onComplete }) => {
    const { playHoverSound, playSnapSound, playWrongSound, playFinalCompletionMessage, playTriumphantMusic, playClickSound } = useAudio();
    
    const [solvedWords, setSolvedWords] = useState<boolean[]>(Array(crosswordData.length).fill(false));
    const [currentClueIndex, setCurrentClueIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState('');
    const [isWrongAnswer, setIsWrongAnswer] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [hint, setHint] = useState<string | null>(null);
    const answerInputRef = useRef<HTMLInputElement>(null);
    const [score, setScore] = useState(0);
    const [scoreUpdate, setScoreUpdate] = useState<{ points: number, key: number } | null>(null);

    const [wrongAttempts, setWrongAttempts] = useState<Record<number, number>>({});
    const [showHintModal, setShowHintModal] = useState(false);
    const [justSolvedWordIndex, setJustSolvedWordIndex] = useState<number | null>(null);

    const TOTAL_WORDS = crosswordData.length;
    const solvedWordsCount = solvedWords.filter(Boolean).length;

    const displayGrid = useMemo(() => {
        const grid: CellData[][] = Array(GRID_ROWS).fill(null).map(() => 
            Array(GRID_COLS).fill(null).map(() => ({ char: null, clueNumbers: [], isLetterCell: false, isSolvedChar: false, wordIndices: [] }))
        );

        crosswordData.forEach((word, wordIndex) => {
            for (let i = 0; i < word.answer.length; i++) {
                let r = word.startRow;
                let c = word.startCol;

                if (word.direction === 'across') c += i;
                else r += i;

                if (r < GRID_ROWS && c < GRID_COLS) {
                    const cell = grid[r][c];
                    cell.char = word.answer[i];
                    cell.isLetterCell = true;
                    if (i === 0) cell.clueNumbers.push(word.number);
                    if (!cell.wordIndices.includes(wordIndex)) cell.wordIndices.push(wordIndex);
                    if (solvedWords[wordIndex]) cell.isSolvedChar = true;
                    cell.wordIndices.forEach(idx => { if (solvedWords[idx]) cell.isSolvedChar = true; });
                }
            }
        });
        return grid;
    }, [solvedWords]);

    useEffect(() => {
        answerInputRef.current?.focus();
    }, []);

    const handleSubmit = useCallback(() => {
        if (currentClueIndex >= TOTAL_WORDS) return;
        const clue = crosswordData[currentClueIndex];
        if (currentAnswer.trim().toUpperCase() === clue.answer) {
            playSnapSound();

            const points = 45;
            setScore(prev => prev + points);
            setScoreUpdate({ points, key: Date.now() });
            setTimeout(() => setScoreUpdate(null), 1000);

            setJustSolvedWordIndex(currentClueIndex);
            setTimeout(() => setJustSolvedWordIndex(null), 2000);

            setSolvedWords(prev => { const newSolved = [...prev]; newSolved[currentClueIndex] = true; return newSolved; });
            if (solvedWordsCount + 1 === TOTAL_WORDS) {
                 playTriumphantMusic(); playFinalCompletionMessage(); setTimeout(() => setShowModal(true), 1000);
            } else {
                let nextIndex = (currentClueIndex + 1) % TOTAL_WORDS;
                while(solvedWords[nextIndex] || (nextIndex === currentClueIndex && solvedWordsCount + 1 < TOTAL_WORDS)) {
                    nextIndex = (nextIndex + 1) % TOTAL_WORDS;
                }
                setCurrentClueIndex(nextIndex);
            }
            setCurrentAnswer(''); setIsWrongAnswer(false); setHint(null);
        } else {
            playWrongSound();
            setIsWrongAnswer(true);
            const newAttemptCount = (wrongAttempts[currentClueIndex] || 0) + 1;
            setWrongAttempts(prev => ({...prev, [currentClueIndex]: newAttemptCount}));

            if(newAttemptCount >= 3) {
                setShowHintModal(true);
            } else {
                setHint(`Hint: The word starts with '${clue.answer[0]}'.`);
            }
            setCurrentAnswer('');
            setTimeout(() => setIsWrongAnswer(false), 500);
        }
    }, [currentClueIndex, currentAnswer, solvedWords, solvedWordsCount, wrongAttempts, playSnapSound, playTriumphantMusic, playFinalCompletionMessage, playWrongSound, TOTAL_WORDS]);
    
    useEffect(() => { answerInputRef.current?.focus(); }, [currentClueIndex]);
    
    const handleFinishMission = () => {
        onComplete(score);
    };

    const handleReplay = () => {
        setSolvedWords(Array(crosswordData.length).fill(false));
        setCurrentClueIndex(0);
        setCurrentAnswer('');
        setWrongAttempts({});
        setScore(0);
        setShowModal(false);
    };

    const handleGetHint = useCallback(() => {
        playClickSound();
        const clue = crosswordData[currentClueIndex];
        const answer = clue.answer;
        const hintLength = Math.ceil(answer.length / 2);
        const hintText = answer.substring(0, hintLength) + '•'.repeat(answer.length - hintLength);
        setHint(`Hint: ${hintText}`);
        setWrongAttempts(prev => ({...prev, [currentClueIndex]: 0}));
        setShowHintModal(false);
        answerInputRef.current?.focus();
    }, [currentClueIndex, playClickSound]);

    const CompletionModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative bg-gradient-to-br from-[#1F1F3A] to-[#0A0F1E] border-2 border-[#32CD32] rounded-lg shadow-2xl shadow-[#32CD32]/50 p-8 text-center w-full max-w-lg m-4 overflow-hidden">
                <h2 className="text-3xl font-bold text-white mb-4 animate-slide-fade">DECRYPTION COMPLETE!</h2>
                <p className="text-gray-300 text-lg mb-6">Congratulations, Agent! You’ve decoded the core of SupTech.</p>
                <div className="flex justify-center gap-4">
                    <button onClick={handleReplay} className="futuristic-btn btn-primary">Replay</button>
                    <button onClick={handleFinishMission} className="futuristic-btn btn-success">Finish Mission</button>
                </div>
            </div>
        </div>
    );

    const HintModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative bg-gradient-to-br from-[#1F1F3A] to-[#0A0F1E] border-2 border-[#FF4500] rounded-lg shadow-2xl shadow-[#FF4500]/50 p-8 text-center w-full max-w-lg m-4">
                <h2 className="text-3xl font-bold text-white mb-4">Challenge Detected</h2>
                <p className="text-gray-300 text-lg mb-6">You've made 3 incorrect attempts. How do you wish to proceed?</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => { playClickSound(); onExitLevel(); }} className="futuristic-btn btn-secondary">End Game</button>
                    <button onClick={handleGetHint} className="futuristic-btn btn-primary">Get Hint & Continue</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-2 sm:p-4 space-y-4 bg-gradient-to-br from-[#0A0F1E] to-[#1F1F3A] border border-[#00FFFF]/30 rounded-lg shadow-2xl shadow-[#00FFFF]/20 backdrop-blur-md animate-fade-in-level holographic-panel">
            {showModal && <CompletionModal />}
            {showHintModal && <HintModal />}
            <header className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-gray-700/50 gap-4 flex-wrap">
                 <h1 className="text-h2-dynamic font-bold text-[#00FFFF] tracking-widest uppercase header-flicker text-center" style={{ fontFamily: 'Orbitron', textShadow: '0 0 10px #00FFFF' }}>
                    LEVEL 3 : DECRYPTION GRID
                </h1>
                <div className="flex items-center gap-4 flex-wrap justify-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 p-1 border-2 border-[#00FFFF] rounded-lg text-[#00FFFF]">{avatars[agentData.avatarIndex]}</div>
                        <span className="text-md text-white">AGENT: {agentData.codename}</span>
                    </div>
                    <button onClick={onExitLevel} onMouseEnter={playHoverSound} className="text-sm futuristic-btn p-2" style={{'--glow-color-primary': '#FF4500'} as React.CSSProperties}>Exit</button>
                </div>
                 <div className="w-full flex flex-col items-center gap-2">
                    <div className="flex justify-between w-full max-w-md items-center">
                        <p className="text-gray-400 text-sm uppercase tracking-widest">Progress: {solvedWordsCount}/{TOTAL_WORDS}</p>
                        <div className="text-gray-400 text-sm uppercase tracking-widest relative">
                            Score: <span className="text-white font-bold">{score}</span>
                            {scoreUpdate && <span key={scoreUpdate.key} className="absolute -top-5 left-1/2 text-green-400 animate-score-popup">+{scoreUpdate.points}</span>}
                        </div>
                    </div>
                    <div className="w-full max-w-md h-2 bg-black/50 rounded-full overflow-hidden border border-gray-700">
                        <div className="h-full bg-[#32CD32] shadow-[0_0_8px_#32CD32] transition-all duration-500" style={{width: `${(solvedWordsCount / TOTAL_WORDS) * 100}%`}}></div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 relative w-full h-full min-h-[40vh] lg:min-h-full p-2 sm:p-4 border border-dashed border-[#00FFFF]/30 rounded-lg flex items-center justify-center overflow-hidden" id="decryption-canvas">
                    <div className="w-full">
                        <div
                            className="crossword-grid"
                            style={{
                                gridTemplateColumns: `repeat(${GRID_COLS}, var(--cell-size))`,
                                gridTemplateRows: `repeat(${GRID_ROWS}, var(--cell-size))`,
                            }}
                        >
                            {displayGrid.map((row, rIdx) =>
                                row.map((cellData, cIdx) => {
                                    const isCurrentCell = crosswordData[currentClueIndex] && (
                                        (crosswordData[currentClueIndex].direction === 'across' && rIdx === crosswordData[currentClueIndex].startRow && cIdx >= crosswordData[currentClueIndex].startCol && cIdx < crosswordData[currentClueIndex].startCol + crosswordData[currentClueIndex].answer.length) ||
                                        (crosswordData[currentClueIndex].direction === 'down' && cIdx === crosswordData[currentClueIndex].startCol && rIdx >= crosswordData[currentClueIndex].startRow && rIdx < crosswordData[currentClueIndex].startRow + crosswordData[currentClueIndex].answer.length)
                                    );
                                    const clueNumberVisible = crosswordData.some(w => w.startRow === rIdx && w.startCol === cIdx);
                                    const isJustSolved = cellData.wordIndices.includes(justSolvedWordIndex ?? -1);
                                    return <CellComponent key={`${rIdx}-${cIdx}`} cellData={cellData} isActive={isCurrentCell} isSolved={cellData.isSolvedChar} clueNumberVisible={clueNumberVisible} isJustSolved={isJustSolved} />;
                                })
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="w-full flex flex-col justify-center items-center gap-4 bg-black/30 p-4 sm:p-6 rounded-lg border border-gray-700">
                    {crosswordData[currentClueIndex] ? (
                        <div className="bg-black/40 p-4 rounded-md text-center">
                            <p className="text-p-dynamic text-gray-300">
                                <strong className="text-[#00FFFF]">{crosswordData[currentClueIndex].number}. {crosswordData[currentClueIndex].clue}</strong> ({crosswordData[currentClueIndex].answer.length} letters)
                            </p>
                        </div>
                    ) : (
                        <p className="text-lg text-green-400 text-center">Grid Decrypted!</p>
                    )}
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="w-full max-w-sm flex flex-col gap-3">
                         <input
                            ref={answerInputRef}
                            type="text"
                            value={currentAnswer}
                            onChange={(e) => { setCurrentAnswer(e.target.value); if (hint) setHint(null); }}
                            placeholder="ENTER DECRYPTION KEY"
                            className={`futuristic-input transition-all duration-300 ${isWrongAnswer ? 'animate-shake-horizontal border-red-500' : ''}`}
                            disabled={solvedWordsCount === TOTAL_WORDS}
                        />
                        <button type="submit" className="futuristic-btn btn-success" disabled={solvedWordsCount === TOTAL_WORDS || !currentAnswer}>
                           Submit
                        </button>
                    </form>
                    {hint && <div className="mt-2 p-3 rounded-md text-center font-medium bg-yellow-500/20 text-yellow-300 animate-fade-in-hint">{hint}</div>}
                </div>
            </div>

            <style>{`
                 .header-flicker { animation: flicker 4s linear infinite; }
                @keyframes flicker { 0%, 19.9%, 22%, 62.9%, 64%, 64.9%, 70%, 100% { opacity: 0.99; text-shadow: 0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF80; } 20%, 21.9%, 63%, 63.9%, 65%, 69.9% { opacity: 0.4; text-shadow: none; } }
                
                .crossword-grid {
                    display: grid;
                    --cell-size: clamp(12px, 2.8vmin, 24px);
                    max-width: fit-content;
                    margin: 0 auto;
                }

                .cell { position: relative; width: var(--cell-size); height: var(--cell-size); display: flex; align-items: center; justify-content: center; background-color: transparent; border: 1px solid #39FF1420; transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease-in-out; }
                .cell.empty { background-color: transparent; border-color: transparent; }
                .cell.solved { background-color: #32CD3210; border-color: #32CD3280; }
                .cell.active { background-color: #00FFFF15; border-color: #00FFFF; box-shadow: 0 0 10px #00FFFF; z-index: 2; }
                .clue-number { position: absolute; top: 1px; left: 2px; font-size: calc(var(--cell-size) * 0.35); font-weight: bold; color: #39FF14; z-index: 1; }
                .cell-letter { font-family: 'Orbitron', sans-serif; font-size: calc(var(--cell-size) * 0.65); font-weight: bold; color: #39FF14; text-transform: uppercase; text-shadow: 0 0 8px #39FF14, 0 0 12px #39FF14; opacity: 0; animation: fade-in-char 0.5s ease-out forwards; }
                .cell.solved .cell-letter, .cell-letter { opacity: 1; }

                @keyframes subtle-glow {
                    0% { box-shadow: 0 0 10px #32CD32, inset 0 0 5px #32CD3255; }
                    50% { box-shadow: 0 0 25px #32CD32, inset 0 0 10px #32CD32AA; }
                    100% { box-shadow: 0 0 10px #32CD32, inset 0 0 5px #32CD3255; }
                }

                .just-solved-glow {
                    animation: subtle-glow 2s ease-in-out;
                }
                
                @keyframes score-popup { from { transform: translateY(0) scale(1); opacity: 1; } to { transform: translateY(-20px) scale(1.5); opacity: 0; } }
                .animate-score-popup { animation: score-popup 1s ease-out forwards; }

                @keyframes fade-in-char { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
                .animate-shake-horizontal { animation: shake-horizontal 0.5s ease-in-out; }
                @keyframes shake-horizontal { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
                @keyframes slide-fade { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fade-in-level { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in-level { animation: fade-in-level 0.7s ease-out forwards; }
                .score-increase { animation: score-update-glow-green 0.8s ease-out; }
                .score-decrease { animation: score-update-glow-red 0.8s ease-out; }
                @keyframes score-update-glow-green { 0% { transform: scale(1); text-shadow: none; } 50% { transform: scale(1.2); color: #39FF14; text-shadow: 0 0 15px #39FF14; } 100% { transform: scale(1); } }
                @keyframes score-update-glow-red { 0% { transform: scale(1); text-shadow: none; } 50% { transform: scale(1.2); color: #FF4500; text-shadow: 0 0 15px #FF4500; } 100% { transform: scale(1); } }
                @keyframes fade-in-hint { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-hint { animation: fade-in-hint 0.4s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Level2Crossword;