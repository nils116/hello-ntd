"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  life: number;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

export default function Home() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [clickCount, setClickCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);
  const rippleIdRef = useRef(0);
  const frameRef = useRef<number>();

  const createParticle = useCallback((x: number, y: number, burst = false) => {
    const count = burst ? 12 : 1;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const speed = burst ? 3 + Math.random() * 4 : 0.5 + Math.random();
      
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: burst ? 4 + Math.random() * 6 : 2 + Math.random() * 3,
        hue: 200 + Math.random() * 160,
        life: 1,
      });
    }
    
    return newParticles;
  }, []);

  const createRipple = useCallback((x: number, y: number) => {
    return {
      id: rippleIdRef.current++,
      x,
      y,
      radius: 0,
      opacity: 1,
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        
        if (Math.random() > 0.7) {
          setParticles((prev) => [...prev, ...createParticle(e.clientX - rect.left, e.clientY - rect.top)]);
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        setParticles((prev) => [...prev, ...createParticle(x, y, true)]);
        setRipples((prev) => [...prev, createRipple(x, y)]);
        setClickCount((c) => c + 1);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [createParticle, createRipple]);

  useEffect(() => {
    const animate = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.05,
            life: p.life - 0.015,
            size: p.size * 0.98,
          }))
          .filter((p) => p.life > 0)
      );

      setRipples((prev) =>
        prev
          .map((r) => ({
            ...r,
            radius: r.radius + 8,
            opacity: r.opacity - 0.03,
          }))
          .filter((r) => r.opacity > 0)
      );

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  useEffect(() => {
    if (clickCount >= 10) {
      setShowSecret(true);
    }
  }, [clickCount]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative cursor-crosshair"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            transform: `translate(${(mousePos.x * -0.02)}px, ${(mousePos.y * -0.02)}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      </div>

      {/* Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full border-2 border-cyan-400 pointer-events-none"
          style={{
            left: ripple.x - ripple.radius,
            top: ripple.y - ripple.radius,
            width: ripple.radius * 2,
            height: ripple.radius * 2,
            opacity: ripple.opacity,
            boxShadow: `0 0 20px rgba(34, 211, 238, ${ripple.opacity})`,
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: particle.x - particle.size / 2,
            top: particle.y - particle.size / 2,
            width: particle.size,
            height: particle.size,
            backgroundColor: `hsl(${particle.hue}, 80%, 60%)`,
            opacity: particle.life,
            boxShadow: `0 0 ${particle.size * 2}px hsl(${particle.hue}, 80%, 60%)`,
          }}
        />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Floating title */}
        <div
          className="text-center mb-8"
          style={{
            transform: `translate(${(mousePos.x - (typeof window !== "undefined" ? window.innerWidth / 2 : 0)) * 0.01}px, ${(mousePos.y - (typeof window !== "undefined" ? window.innerHeight / 2 : 0)) * 0.01}px)`,
            transition: "transform 0.2s ease-out",
          }}
        >
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse">
            NTD Labs
          </h1>
          <p className="text-xl md:text-2xl text-purple-200 mt-4 font-light tracking-wider">
            Prototype. Play. Ship.
          </p>
        </div>

        {/* Interactive orb */}
        <div
          className="relative w-64 h-64 md:w-80 md:h-80"
          style={{
            transform: `rotate(${(mousePos.x + mousePos.y) * 0.02}deg)`,
            transition: "transform 0.3s ease-out",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 opacity-30 blur-3xl animate-pulse" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-400 via-purple-400 to-pink-400 opacity-50 blur-2xl" />
          <div className="absolute inset-0 rounded-full border-2 border-white/10 backdrop-blur-sm" />
          
          {/* Orbiting dots */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-white"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${i * 60 + (mousePos.x * 0.1)}deg) translateX(140px)`,
                opacity: 0.6 + Math.sin(i + clickCount * 0.5) * 0.4,
                transition: "transform 0.1s ease-out",
              }}
            />
          ))}
        </div>

        {/* Click counter */}
        <div className="mt-12 text-center">
          <p className="text-purple-300 text-sm uppercase tracking-widest mb-2">
            Clicks: {clickCount}
          </p>
          <p className="text-white/50 text-xs">
            {clickCount < 10 ? "Keep clicking..." : "✨ Secret unlocked! ✨"}
          </p>
        </div>

        {/* Secret message */}
        {showSecret && (
          <div className="mt-8 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-bounce">
            <p className="text-cyan-300 text-lg font-medium">
              🎉 You found the secret! 🎉
            </p>
            <p className="text-white/70 text-sm mt-2">
              Welcome to the NTD Consulting playground.
            </p>
            <p className="text-purple-300 text-xs mt-1">
              Ready to build something amazing?
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-white/30 text-sm">
            Move your mouse • Click anywhere • Find the secret
          </p>
        </div>
      </div>
    </div>
  );
}
