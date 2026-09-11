import React, { useEffect, useRef, useState } from 'react';
import { Check, Eraser, Maximize2, Minimize2, PenLine } from 'lucide-react';

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  initialDataUrl?: string;
  requesterName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  onSave,
  initialDataUrl,
  requesterName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 3.0;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (initialDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(true);
      };
      img.src = initialDataUrl;
    }
  }, [initialDataUrl]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    onSave('');
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
        <span className="flex items-center gap-1.5 font-bold">
          <PenLine className="w-4 h-4 text-blue-600" />
          Cadre de Signature du Demandeur {requesterName ? `(${requesterName})` : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
            title={isExpanded ? 'Réduire la taille' : 'Agrandir le cadre de signature'}
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Format standard</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Agrandir</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1 text-slate-600 hover:text-red-600 transition-colors text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 bg-white hover:bg-red-50 cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5 text-red-500" />
            Effacer
          </button>
        </div>
      </div>

      {/* Enlarged interactive signature box */}
      <div
        className={`relative border-2 border-dashed rounded-2xl bg-slate-50/90 overflow-hidden transition-all duration-200 shadow-inner ${
          hasDrawn ? 'border-emerald-400 bg-emerald-50/20' : 'border-slate-300 hover:border-blue-400'
        }`}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={280}
          className={`w-full touch-none cursor-crosshair block transition-all ${
            isExpanded ? 'h-64 sm:h-72' : 'h-44 sm:h-52'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Signing baseline guide */}
        <div className="absolute bottom-6 left-6 right-6 border-b border-dashed border-slate-300/80 pointer-events-none flex items-center justify-between px-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            ✕ Émargement
          </span>
          <span className="text-[10px] text-slate-400 font-medium italic">
            Ligne de signature
          </span>
        </div>

        {!hasDrawn && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-400 text-xs p-4">
            <div className="w-10 h-10 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center mb-2 shadow-2xs">
              <PenLine className="w-5 h-5 opacity-80" />
            </div>
            <span className="font-semibold text-slate-600">
              Signez confortablement avec le doigt ou la souris dans ce grand cadre
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">
              La signature sera scellée et imprimée sur le bon de sortie de carburant
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[11px]">
        {hasDrawn ? (
          <p className="text-emerald-700 font-semibold flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-emerald-600" /> Signature enregistrée et validée
          </p>
        ) : (
          <span className="text-slate-400 italic">
            Signature requise pour valider le bon de sortie
          </span>
        )}
        <span className="text-slate-400 font-mono text-[10px]">
          Haute résolution • Format {isExpanded ? 'Maxi (72)' : 'Confort (52)'}
        </span>
      </div>
    </div>
  );
};
