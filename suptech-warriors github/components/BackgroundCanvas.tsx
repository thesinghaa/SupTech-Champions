import React from 'react';
import useParticleAnimation from '../hooks/useParticleAnimation';

interface BackgroundCanvasProps {
  gameState: string;
}

const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ gameState }) => {
  const canvasRef = useParticleAnimation(gameState);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-0 opacity-70"
    />
  );
};

export default BackgroundCanvas;