import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse coordinates with smoothing
    const mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };
    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Particle setup
    const particleCount = Math.min(Math.floor((width * height) / 12000), 100);
    const particles = [];
    const colors = [
      'rgba(255, 26, 83, ', // cine-red
      'rgba(168, 85, 247, ', // cine-purple
      'rgba(0, 240, 255, ', // cine-cyan
      'rgba(255, 255, 255, ' // white
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 1.5 + 0.5, // depth factor for 3D parallax
        baseRadius: Math.random() * 1.8 + 0.6,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        colorPrefix: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.6 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseVal: Math.random() * Math.PI
      });
    }

    let tick = 0;

    const render = () => {
      tick += 0.01;
      // Smooth mouse follow
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle ambient nebula glow behind particles
      const nebula1X = width * 0.25 + Math.sin(tick * 0.5) * 80;
      const nebula1Y = height * 0.35 + Math.cos(tick * 0.4) * 60;
      const grad1 = ctx.createRadialGradient(nebula1X, nebula1Y, 10, nebula1X, nebula1Y, 450);
      grad1.addColorStop(0, 'rgba(255, 26, 83, 0.04)');
      grad1.addColorStop(0.5, 'rgba(168, 85, 247, 0.02)');
      grad1.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const nebula2X = width * 0.75 + Math.cos(tick * 0.3) * 100;
      const nebula2Y = height * 0.65 + Math.sin(tick * 0.5) * 80;
      const grad2 = ctx.createRadialGradient(nebula2X, nebula2Y, 10, nebula2X, nebula2Y, 500);
      grad2.addColorStop(0, 'rgba(0, 240, 255, 0.035)');
      grad2.addColorStop(0.6, 'rgba(124, 58, 237, 0.02)');
      grad2.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Render 3D particles
      const mouseOffsetX = (mouse.x - width / 2) * 0.025;
      const mouseOffsetY = (mouse.y - height / 2) * 0.025;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        // 3D parallax offset based on depth (p.z)
        const renderX = p.x + mouseOffsetX * p.z;
        const renderY = p.y + mouseOffsetY * p.z;

        p.pulseVal += p.pulseSpeed;
        const currentAlpha = Math.max(0.1, Math.min(0.9, p.alpha + Math.sin(p.pulseVal) * 0.25));

        ctx.beginPath();
        ctx.arc(renderX, renderY, p.baseRadius * p.z, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorPrefix}${currentAlpha})`;
        ctx.shadowBlur = 10 * p.z;
        ctx.shadowColor = `${p.colorPrefix}0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70 transition-opacity duration-1000"
      style={{ willChange: 'transform' }}
    />
  );
}
