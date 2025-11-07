import { useCallback, useRef } from 'react';

const useAudio = () => {
  // Use a ref to store the AudioContext to ensure it's created only once.
  const audioContextRef = useRef<AudioContext | null>(null);

  // Function to initialize AudioContext, must be called after a user interaction.
  const initAudioContext = useCallback(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;
      } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
      }
    }
    return audioContextRef.current;
  }, []);

  // Generates a sound programmatically using the Web Audio API.
  const createSound = useCallback(async (type: 'hover' | 'click' | 'snap' | 'wrong' | 'typing' | 'triumph') => {
    const context = initAudioContext();
    if (!context) return;

    // Resume context if it's suspended (e.g., due to browser autoplay policies).
    if (context.state === 'suspended') {
      await context.resume();
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    if (type === 'hover') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(200, context.currentTime);
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.1);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    } else if (type === 'click') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      gainNode.gain.setValueAtTime(0.2, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.08);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.08);
    } else if (type === 'snap') {
      // Short, satisfying click for correct placement
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, context.currentTime);
      gainNode.gain.setValueAtTime(0.15, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.05);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.05);
    } else if (type === 'wrong') {
      // Low-frequency buzz for incorrect placement
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, context.currentTime);
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.2);
    } else if (type === 'typing') {
      // Subtle click for typing feedback
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(440, context.currentTime);
      gainNode.gain.setValueAtTime(0.02, context.currentTime); // Very low volume
      gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.03);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.03);
    } else if (type === 'triumph') {
        const now = context.currentTime;
        const gainNode = context.createGain();
        gainNode.connect(context.destination);
        gainNode.gain.setValueAtTime(0.15, now);
        
        // A simple C-major arpeggio
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        frequencies.forEach((freq, i) => {
            const osc = context.createOscillator();
            osc.connect(gainNode);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.1);
        });
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    }
  }, [initAudioContext]);

  // Plays a synthesized welcome message.
  const playWelcomeMessage = useCallback((codename: string) => {
    const context = initAudioContext();
    if (!context || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Resume context if suspended
    if (context.state === 'suspended') {
        context.resume();
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(`Welcome, Agent ${codename}. Your mission is ready.`);
    utterance.pitch = 0.8;
    utterance.rate = 1.1;
    utterance.volume = 0.7;

    const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer a UK Female voice for a more "AI assistant" feel, fallback to any english voice.
        const voice = voices.find(v => v.name.includes('Google UK English Female')) || voices.find(v => v.lang.startsWith('en-'));
        if (voice) {
            utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
    };

    // Voices may load asynchronously.
    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
        setVoiceAndSpeak();
    }
  }, [initAudioContext]);

  // Plays a synthesized success message.
  const playSuccessMessage = useCallback(() => {
    const context = initAudioContext();
    if (!context || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (context.state === 'suspended') {
        context.resume();
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance("Case successfully solved. Proceeding to next objective.");
    utterance.pitch = 0.9;
    utterance.rate = 1.0;
    utterance.volume = 0.8;

    const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name.includes('Google UK English Female')) || voices.find(v => v.lang.startsWith('en-'));
        if (voice) {
            utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
        setVoiceAndSpeak();
    }
  }, [initAudioContext]);

  const playFinalCompletionMessage = useCallback(() => {
    const context = initAudioContext();
    if (!context || typeof window === 'undefined' || !window.speechSynthesis) return;

    if (context.state === 'suspended') {
        context.resume();
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance("Congratulations, Agent. You have completed all the missions.");
    utterance.pitch = 0.9;
    utterance.rate = 1.0;
    utterance.volume = 0.8;

    const setVoiceAndSpeak = () => {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name.includes('Google UK English Female')) || voices.find(v => v.lang.startsWith('en-'));
        if (voice) {
            utterance.voice = voice;
        }
        window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
    } else {
        setVoiceAndSpeak();
    }
  }, [initAudioContext]);

  const playTriumphantMusic = useCallback(() => {
    createSound('triumph');
  }, [createSound]);

  const playHoverSound = useCallback(() => {
    createSound('hover');
  }, [createSound]);

  const playClickSound = useCallback(() => {
    createSound('click');
  }, [createSound]);

  const playSnapSound = useCallback(() => {
    createSound('snap');
  }, [createSound]);

  const playWrongSound = useCallback(() => {
    createSound('wrong');
  }, [createSound]);

  const playTypingSound = useCallback(() => {
    createSound('typing');
  }, [createSound]);

  return { 
    playWelcomeMessage, 
    playHoverSound, 
    playClickSound, 
    playSuccessMessage, 
    playSnapSound, 
    playWrongSound,
    playTriumphantMusic,
    playTypingSound, // Export new typing sound function
    playFinalCompletionMessage,
  };
};

export default useAudio;