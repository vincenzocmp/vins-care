'use client';

import { useEffect, useRef, useState } from 'react';

export default function SignaturePad({ onChange }: { onChange: (value: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scale = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const context = canvas.getContext('2d');
    context?.scale(scale, scale);
    if (context) {
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.strokeStyle = '#17324d';
    }
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const context = event.currentTarget.getContext('2d');
    const p = point(event);
    context?.beginPath();
    context?.moveTo(p.x, p.y);
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrawing(true);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    const context = event.currentTarget.getContext('2d');
    const p = point(event);
    context?.lineTo(p.x, p.y);
    context?.stroke();
    setHasInk(true);
  }

  function end(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing) return;
    setDrawing(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    const value = event.currentTarget.toDataURL('image/png');
    onChange(hasInk || value.length > 1000 ? value : null);
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    context?.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onChange(null);
  }

  return (
    <div className="signature-wrap">
      <canvas
        ref={canvasRef}
        className="signature-canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
      <div className="row between">
        <small>Firma dimostrativa con dito o pennino</small>
        <button type="button" className="button ghost small" onClick={clear}>Cancella firma</button>
      </div>
    </div>
  );
}
