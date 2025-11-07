import { useState, useEffect } from 'react';

/**
 * A custom hook that simulates a typing effect for a given string.
 * @param text The full string to be typed out.
 * @param speed The delay in milliseconds between each character.
 * @param onType Optional callback to execute on each typed character.
 * @returns The portion of the text that has been "typed" so far.
 */
const useTypingEffect = (text: string, speed: number = 50, onType?: () => void) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    // Reset the text when the input `text` prop changes.
    setDisplayedText(''); 
    
    // Ensure there is text to type.
    if (text) {
      let i = 0;
      const intervalId = setInterval(() => {
        // Append the next character from the full text.
        const char = text.charAt(i);
        setDisplayedText(prev => prev + char);
        if (onType && char !== ' ') { // Play sound for non-space characters
          onType();
        }
        i++;
        
        // Stop the interval when the end of the text is reached.
        if (i > text.length - 1) {
          clearInterval(intervalId);
        }
      }, speed);

      // Cleanup function to clear the interval when the component unmounts or dependencies change.
      return () => clearInterval(intervalId);
    }
  }, [text, speed, onType]);

  return displayedText;
};

export default useTypingEffect;