import { useRef, useEffect } from 'react';

// Defines the properties for a single particle in the animation.
interface Particle {
  x: number;
  y: number;
  speed: number;
  color: string;
  size: number;
  trail: { x: number, y: number }[];
  trailLength: number;
}

// Configuration settings for the animation based on the game state.
const stateConfigs = {
  intro: { density: 0.00012, speed: 2.5, glitch: 0.05, colors: ['#00FFFF', '#FFFFFF'] },
  registration: { density: 0.00004, speed: 0.8, glitch: 0.005, colors: ['#00FFFF', '#8A2BE2'] },
  briefing: { density: 0.00006, speed: 1.0, glitch: 0.01, colors: ['#32CD32', '#00FFFF'] },
  level1: { density: 0.00008, speed: 1.5, glitch: 0.02, colors: ['#FF4500', '#00FFFF', '#FFFF00'] },
  level2: { density: 0.00007, speed: 1.2, glitch: 0.015, colors: ['#32CD32', '#00FFFF', '#8A2BE2'] },
  level3: { density: 0.00010, speed: 2.0, glitch: 0.03, colors: ['#00FFFF', '#8A2BE2', '#FF4500'] },
};

const useParticleAnimation = (gameState: string) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mouse = {
        x: null as number | null,
        y: null as number | null,
        radius: 150
    };

    const handleMouseMove = (event: MouseEvent) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    };
    const handleMouseOut = () => {
        mouse.x = null;
        mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseOut);

    let animationFrameId: number;
    let particles: Particle[] = [];
    
    // Select the configuration for the current game state.
    const config = stateConfigs[gameState as keyof typeof stateConfigs] || stateConfigs.intro;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Creates a new particle with random properties based on the current config.
    const createParticle = (yPos?: number): Particle => {
      const x = Math.random() * canvas.width;
      const y = yPos !== undefined ? yPos : canvas.height + Math.random() * 100;
      const size = Math.random() * 2 + 1;
      const speed = (Math.random() * 0.5 + 0.5) * config.speed;
      const color = config.colors[Math.floor(Math.random() * config.colors.length)];
      const trailLength = Math.floor(Math.random() * 10) + 5;
      return { x, y, size, speed, color, trail: [], trailLength };
    };

    // Initializes the particles array.
    const initParticles = () => {
      particles = [];
      const particleCount = Math.floor(canvas.width * canvas.height * config.density);
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle(Math.random() * canvas.height));
      }
    };
    
    resizeCanvas();
    initParticles();
    
    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    // The main animation loop.
    const animate = () => {
      if (!ctx) return;
      
      // Use a semi-transparent background to create a motion blur/fading trail effect.
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Apply a glitch effect randomly.
      const doGlitch = Math.random() < config.glitch;
      if (doGlitch) {
        ctx.save();
        const xShift = (Math.random() - 0.5) * 20;
        const yShift = (Math.random() - 0.5) * 20;
        ctx.translate(xShift, yShift);
      }

      // Draw connecting lines between nearby particles (Plexus effect)
      const connectDistance = 120;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const pa = particles[a];
          const pb = particles[b];
          const distance = Math.sqrt(Math.pow(pa.x - pb.x, 2) + Math.pow(pa.y - pb.y, 2));

          if (distance < connectDistance) {
            const opacity = 1 - (distance / connectDistance);
            ctx.strokeStyle = `rgba(0, 255, 255, ${opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        }
      }

      // Update and draw each particle.
      particles.forEach((p, index) => {
        // Add mouse repulsion effect
        if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const force = (mouse.radius - distance) / mouse.radius;

            if (distance < mouse.radius) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const pushStrength = 3;
                p.x -= forceDirectionX * force * pushStrength;
                p.y -= forceDirectionY * force * pushStrength;
            }
        }

        p.y -= p.speed; // Move upwards

        // Add current position to the trail.
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > p.trailLength) {
          p.trail.shift();
        }

        // Draw the trail.
        p.trail.forEach((trailPart, i) => {
          const opacity = i / p.trailLength;
          ctx.fillStyle = `${p.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
          ctx.beginPath();
          ctx.arc(trailPart.x, trailPart.y, p.size * (i / p.trailLength), 0, Math.PI * 2);
          ctx.fill();
        });

        // Reset particle if it goes off-screen.
        if (p.y < -p.trailLength * 10 || p.x < -10 || p.x > canvas.width + 10) {
          particles[index] = createParticle();
        }
      });
      
      if (doGlitch) {
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseOut);
    };
  }, [gameState]); // Re-run the effect if the game state changes.

  return canvasRef;
};

export default useParticleAnimation;