import { useEffect, useState } from 'react';

export default function MouseAnimations() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [clicking, setClicking] = useState(false);
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    let animFrame;
    let smoothX = 0, smoothY = 0;

    const handleMove = (e) => {
      const tx = e.clientX;
      const ty = e.clientY;

      const animate = () => {
        smoothX += (tx - smoothX) * 0.15;
        smoothY += (ty - smoothY) * 0.15;
        setPos({ x: smoothX, y: smoothY });
        animFrame = requestAnimationFrame(animate);
      };
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(animate);

      setTrail(prev => {
        const next = [{ x: tx, y: ty, id: Date.now() + Math.random() }, ...prev.slice(0, 10)];
        return next;
      });
    };

    const handleDown = (e) => {
      setClicking(true);
      const id = Date.now();
      setRipples(prev => [...prev, { x: e.clientX, y: e.clientY, id }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
    };

    const handleUp = () => setClicking(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mousedown', handleDown);
    window.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mouseup', handleUp);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  return (
    <>
      {/* Glow aura */}
      <div style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9998,
        left: pos.x - 200, top: pos.y - 200,
        width: 400, height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)',
        transition: 'left 0.05s, top 0.05s',
      }} />

      {/* Trail dots */}
      {trail.map((t, i) => (
        <div key={t.id} style={{
          position: 'fixed', pointerEvents: 'none', zIndex: 9997,
          left: t.x - (6 - i * 0.4),
          top: t.y - (6 - i * 0.4),
          width: Math.max(2, 12 - i * 1.1),
          height: Math.max(2, 12 - i * 1.1),
          borderRadius: '50%',
          background: `rgba(79,70,229,${Math.max(0.05, 0.5 - i * 0.05)})`,
          transform: 'translate(-50%,-50%)',
          transition: 'opacity 0.3s',
        }} />
      ))}

      {/* Custom cursor outer ring */}
      <div style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9999,
        left: pos.x, top: pos.y,
        width: clicking ? 20 : 32,
        height: clicking ? 20 : 32,
        borderRadius: '50%',
        border: `2px solid rgba(79,70,229,${clicking ? 0.9 : 0.5})`,
        transform: 'translate(-50%,-50%)',
        transition: 'width 0.15s, height 0.15s, border-color 0.15s',
        mixBlendMode: 'multiply',
      }} />

      {/* Custom cursor inner dot */}
      <div style={{
        position: 'fixed', pointerEvents: 'none', zIndex: 9999,
        left: pos.x, top: pos.y,
        width: clicking ? 10 : 6,
        height: clicking ? 10 : 6,
        borderRadius: '50%',
        background: '#4f46e5',
        transform: 'translate(-50%,-50%)',
        transition: 'width 0.15s, height 0.15s',
      }} />

      {/* Click ripples */}
      {ripples.map(r => (
        <div key={r.id} style={{
          position: 'fixed', pointerEvents: 'none', zIndex: 9996,
          left: r.x, top: r.y,
          width: 0, height: 0,
          borderRadius: '50%',
          border: '2px solid rgba(79,70,229,0.6)',
          transform: 'translate(-50%,-50%)',
          animation: 'rippleOut 0.7s ease-out forwards',
        }} />
      ))}

      <style>{`
        * { cursor: none !important; }
        @keyframes rippleOut {
          0%   { width: 0px; height: 0px; opacity: 1; }
          100% { width: 80px; height: 80px; opacity: 0; }
        }
      `}</style>
    </>
  );
}
