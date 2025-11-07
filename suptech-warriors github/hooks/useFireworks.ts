import { useRef, useEffect } from 'react';

// Helper function to get a random number within a range
const random = (min: number, max: number) => Math.random() * (max - min) + min;

interface Particle {
  x: number;
  y: number;
  sx: number;
  sy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
}

interface Firework {
  x: number;
  y: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  distanceToTarget: number;
  distanceTraveled: number;
  particles: Particle[];
  hue: number;
}

const useFireworks = (isActive: boolean) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // FIX: Initialize useRef with null to provide an initial value.
  const animationFrameId = useRef<number | null>(null);
  const fireworks = useRef<Firework[]>([]);
  const particles = useRef<Particle[]>([]);
  const hue = useRef(120);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) {
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      return;
    };
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let timerTick = 0;
    let timerTotal = 80;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.lineCap = 'round';
    };
    
    const createFirework = () => {
        const startX = canvas.width / 2;
        const startY = canvas.height;
        fireworks.current.push({
            x: startX,
            y: startY,
            sx: startX,
            sy: startY,
            tx: random(0, canvas.width),
            ty: random(0, canvas.height / 2),
            distanceToTarget: 0,
            distanceTraveled: 0,
            particles: [],
            hue: hue.current,
        });
        fireworks.current[fireworks.current.length-1].distanceToTarget = Math.sqrt(
            Math.pow(startX - fireworks.current[fireworks.current.length-1].tx, 2) + Math.pow(startY - fireworks.current[fireworks.current.length-1].ty, 2)
        );
        hue.current += random(10, 20);
    }

    const createParticles = (x: number, y: number, fireworkHue: number) => {
        const particleCount = 30;
        for(let i=0; i < particleCount; i++) {
            const angle = random(0, Math.PI * 2);
            const speed = random(1, 10);
            particles.current.push({
                x: x,
                y: y,
                sx: Math.cos(angle) * speed,
                sy: Math.sin(angle) * speed,
                alpha: 1,
                decay: random(0.015, 0.03),
                color: `hsl(${fireworkHue}, 50%, 50%)`,
                size: 3
            });
        }
    }

    const loop = () => {
        if (!ctx) return;
        
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        
        // Fireworks logic
        fireworks.current.forEach((fw, i) => {
            ctx.beginPath();
            ctx.moveTo(fw.x, fw.y);
            const angle = Math.atan2(fw.ty - fw.sy, fw.tx - fw.sx);
            const speed = 8;
            fw.x += Math.cos(angle) * speed;
            fw.y += Math.sin(angle) * speed;
            fw.distanceTraveled = Math.sqrt(Math.pow(fw.x - fw.sx, 2) + Math.pow(fw.y - fw.sy, 2));

            ctx.lineTo(fw.x, fw.y);
            ctx.strokeStyle = `hsl(${fw.hue}, 50%, 50%)`;
            ctx.stroke();

            if(fw.distanceTraveled >= fw.distanceToTarget) {
                createParticles(fw.tx, fw.ty, fw.hue);
                fireworks.current.splice(i, 1);
            }
        });

        // Particles logic
        particles.current.forEach((p, i) => {
            p.x += p.sx;
            p.y += p.sy;
            p.alpha -= p.decay;
            
            if(p.alpha <= p.decay) {
                particles.current.splice(i, 1);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
                ctx.fillStyle = `hsla(${p.color.match(/(\d+)/)![0]}, 50%, 50%, ${p.alpha})`;
                ctx.fill();
            }
        });

        if (timerTick >= timerTotal) {
            createFirework();
            timerTick = 0;
            timerTotal = random(60, 100);
        } else {
            timerTick++;
        }
      
        animationFrameId.current = requestAnimationFrame(loop);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    loop();

    return () => {
      if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isActive]);

  return canvasRef;
};

export default useFireworks;
