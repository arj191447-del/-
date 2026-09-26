import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sliders,
  Eye,
  Columns,
  Sparkles,
  Info,
  Maximize2,
  CheckCircle,
  AlertCircle,
  Camera,
  Layers,
} from 'lucide-react';
import { Language } from '../translations';
import { playClickSound } from '../utils/audioEffects';

interface ForensicImageInspectorProps {
  imageSrc: string;
  lang: Language;
  alt?: string;
}

type FilterMode = 'normal' | 'edges' | 'luminance' | 'contrast' | 'ela';

export default function ForensicImageInspector({
  imageSrc,
  lang,
  alt = 'Forensic Evidence Inspection',
}: ForensicImageInspectorProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('normal');
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitPos, setSplitPos] = useState(50); // percentage 0-100
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const [naturalDimensions, setNaturalDimensions] = useState({ width: 0, height: 0 });
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenImgRef = useRef<HTMLImageElement | null>(null);

  const isArabic = lang === 'ar';

  // Load and cache image with memory-safe dimensions
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      offscreenImgRef.current = img;
      setNaturalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      applyFilter('normal');
    };
  }, [imageSrc]);

  // Apply real-time forensic filters on canvas
  const applyFilter = useCallback((mode: FilterMode) => {
    setFilterMode(mode);
    const canvas = canvasRef.current;
    const img = offscreenImgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Constrain canvas processing dimension to max 1600px to protect mobile browsers
    const maxDimension = 1600;
    let procWidth = img.naturalWidth;
    let procHeight = img.naturalHeight;

    if (procWidth > maxDimension || procHeight > maxDimension) {
      if (procWidth > procHeight) {
        procHeight = Math.round((procHeight * maxDimension) / procWidth);
        procWidth = maxDimension;
      } else {
        procWidth = Math.round((procWidth * maxDimension) / procHeight);
        procHeight = maxDimension;
      }
    }

    canvas.width = procWidth;
    canvas.height = procHeight;

    ctx.drawImage(img, 0, 0, procWidth, procHeight);

    if (mode === 'normal') return;

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    const width = canvas.width;
    const height = canvas.height;

    if (mode === 'luminance') {
      // Heat/Luminance map to inspect lighting discrepancies
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < 64) {
          data[i] = 12;
          data[i + 1] = Math.round(lum * 3);
          data[i + 2] = Math.round(lum * 4);
        } else if (lum < 160) {
          data[i] = Math.round((lum - 64) * 2.5);
          data[i + 1] = 200;
          data[i + 2] = Math.round(255 - (lum - 64) * 2);
        } else {
          data[i] = 255;
          data[i + 1] = Math.round(200 + (lum - 160) * 0.5);
          data[i + 2] = Math.round((lum - 160) * 2.5);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (mode === 'edges') {
      // Sobel Edge Detection for spotting photoshop seams & mask boundaries
      const grayscale = new Float32Array(width * height);
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        grayscale[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const pixelIdx = idx * 4;

          const gx =
            -grayscale[idx - width - 1] +
            grayscale[idx - width + 1] -
            2 * grayscale[idx - 1] +
            2 * grayscale[idx + 1] -
            grayscale[idx + width - 1] +
            grayscale[idx + width + 1];

          const gy =
            -grayscale[idx - width - 1] -
            2 * grayscale[idx - width] -
            grayscale[idx - width + 1] +
            grayscale[idx + width - 1] +
            2 * grayscale[idx + width] +
            grayscale[idx + width + 1];

          const mag = Math.min(255, Math.hypot(gx, gy) * 1.4);
          data[pixelIdx] = Math.round(mag * 0.9);
          data[pixelIdx + 1] = Math.round(mag * 0.95);
          data[pixelIdx + 2] = Math.round(mag);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (mode === 'contrast') {
      // High contrast micro-detail enhancement
      for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          const v = data[i + c] / 255;
          const boosted = v < 0.5 ? 2 * v * v : 1 - 2 * (1 - v) * (1 - v);
          data[i + c] = Math.min(255, Math.max(0, boosted * 255));
        }
      }
      ctx.putImageData(imgData, 0, 0);
    } else if (mode === 'ela') {
      // Real Error Level Analysis (ELA)
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(img, 0, 0, width, height);
        const recompressedDataUrl = tempCanvas.toDataURL('image/jpeg', 0.88);
        const recompressedImg = new Image();
        recompressedImg.src = recompressedDataUrl;
        recompressedImg.onload = () => {
          tempCtx.drawImage(recompressedImg, 0, 0, width, height);
          const recompressedData = tempCtx.getImageData(0, 0, width, height).data;

          for (let i = 0; i < data.length; i += 4) {
            const diffR = Math.abs(data[i] - recompressedData[i]);
            const diffG = Math.abs(data[i + 1] - recompressedData[i + 1]);
            const diffB = Math.abs(data[i + 2] - recompressedData[i + 2]);

            // High scale multiplier to illuminate difference
            data[i] = Math.min(255, diffR * 18);
            data[i + 1] = Math.min(255, diffG * 18);
            data[i + 2] = Math.min(255, diffB * 18);
          }
          ctx.putImageData(imgData, 0, 0);
        };
      }
    }
  }, []);

  const handleSelectFilter = (mode: FilterMode) => {
    playClickSound();
    applyFilter(mode);
  };

  // Magnifier positioning
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    if (isDraggingSplit) {
      const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
      setSplitPos(pct);
    } else {
      setMagnifierPos({ x, y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isDraggingSplit) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width));
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const megapixels =
    naturalDimensions.width > 0
      ? ((naturalDimensions.width * naturalDimensions.height) / 1000000).toFixed(2)
      : '0';

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const rGcd =
    naturalDimensions.width > 0 && naturalDimensions.height > 0
      ? gcd(naturalDimensions.width, naturalDimensions.height)
      : 1;
  const aspectRatio =
    naturalDimensions.width > 0
      ? `${Math.round(naturalDimensions.width / rGcd)}:${Math.round(
          naturalDimensions.height / rGcd
        )}`
      : '1:1';

  return (
    <div className="bg-[#0B0E14] border border-white/5 p-4 sm:p-5 rounded-2xl text-white shadow-xl relative">
      {/* Top Header & Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 font-serif-vintage flex items-center gap-2">
              <span>{isArabic ? 'مجهر الفحص البصري' : 'Forensic Optical Workstation'}</span>
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-dossier mt-0.5">
              <span>{naturalDimensions.width} × {naturalDimensions.height} PX</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{megapixels} MP</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>{aspectRatio}</span>
            </div>
          </div>
        </div>

        {/* Toolbar Action Modes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Split Screen Slider Toggle */}
          <button
            onClick={() => {
              playClickSound();
              setIsSplitMode(!isSplitMode);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-sans-body flex items-center gap-1.5 transition-all cursor-pointer ${
              isSplitMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
                : 'bg-[#121622] text-slate-300 border-white/5 hover:text-white hover:bg-white/5'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isArabic ? 'مقارنة مقسومة' : 'Split View'}</span>
          </button>

          {/* Filter Mode Selector */}
          <div className="flex items-center gap-1 bg-[#121622] p-1 border border-white/5 text-xs rounded-lg font-sans-body">
            <button
              onClick={() => handleSelectFilter('normal')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filterMode === 'normal'
                  ? 'bg-white/10 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isArabic ? 'طبيعي' : 'Normal'}
            </button>

            <button
              onClick={() => handleSelectFilter('edges')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filterMode === 'edges'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                  : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              {isArabic ? 'كشف الحواف' : 'Edges'}
            </button>

            <button
              onClick={() => handleSelectFilter('luminance')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filterMode === 'luminance'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              {isArabic ? 'الإضاءة' : 'Luminance'}
            </button>

            <button
              onClick={() => handleSelectFilter('contrast')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filterMode === 'contrast'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              {isArabic ? 'الملمس' : 'Texture'}
            </button>

            <button
              onClick={() => handleSelectFilter('ela')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                filterMode === 'ela'
                  ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30'
                  : 'text-slate-400 hover:text-purple-400'
              }`}
            >
              {isArabic ? 'تحليل ELA' : 'ELA'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Inspection Canvas Frame */}
      <div
        ref={containerRef}
        onMouseEnter={() => !isSplitMode && setIsMagnifierActive(true)}
        onMouseLeave={() => {
          setIsMagnifierActive(false);
          setIsDraggingSplit(false);
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={() => setIsDraggingSplit(false)}
        onTouchEnd={() => setIsDraggingSplit(false)}
        className="relative overflow-hidden rounded-xl bg-black/80 border border-white/5 flex items-center justify-center cursor-crosshair group min-h-[280px] max-h-[500px] select-none no-touch-jitter"
      >
        {/* Underneath: Filter Canvas */}
        <canvas
          ref={canvasRef}
          className="max-h-[480px] max-w-full object-contain"
          aria-label={alt}
        />

        {/* If Split Mode is active, overlay original image clipped by splitPos */}
        {isSplitMode && (
          <>
            <div
              style={{
                clipPath: isArabic
                  ? `polygon(0 0, ${100 - splitPos}% 0, ${100 - splitPos}% 100%, 0 100%)`
                  : `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
              }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <img
                src={imageSrc}
                alt="Original"
                className="max-h-[480px] max-w-full object-contain"
              />
            </div>

            {/* Draggable Divider Handle with touch-action: none */}
            <div
              onMouseDown={() => setIsDraggingSplit(true)}
              onTouchStart={() => setIsDraggingSplit(true)}
              style={{
                left: isArabic ? `${100 - splitPos}%` : `${splitPos}%`,
              }}
              className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] cursor-ew-resize z-20 flex items-center justify-center no-touch-jitter"
            >
              <div className="w-6 h-6 bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg border border-slate-900 cursor-ew-resize rounded-xs">
                <Columns className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Split badges */}
            <div className="absolute top-3 start-3 bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono-dossier px-2 py-0.5 border border-white/20 z-10 pointer-events-none uppercase">
              {isArabic ? 'العرض الأصلي' : 'ORIGINAL EXHIBIT'}
            </div>
            <div className="absolute top-3 end-3 bg-black/80 backdrop-blur-xs text-amber-400 text-[10px] font-mono-dossier px-2 py-0.5 border border-amber-500/40 z-10 pointer-events-none uppercase">
              {isArabic ? `مرشح: ${filterMode.toUpperCase()}` : `FILTER // ${filterMode.toUpperCase()}`}
            </div>
          </>
        )}

        {/* Magnifying Loupe Overlay */}
        {!isSplitMode && isMagnifierActive && containerRef.current && (
          <div
            style={{
              left: `${magnifierPos.x - 75}px`,
              top: `${magnifierPos.y - 75}px`,
              width: '150px',
              height: '150px',
              backgroundImage: `url(${imageSrc})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${containerRef.current.clientWidth * 2.5}px ${
                containerRef.current.clientHeight * 2.5
              }px`,
              backgroundPosition: `-${magnifierPos.x * 2.5 - 75}px -${
                magnifierPos.y * 2.5 - 75
              }px`,
            }}
            className="absolute pointer-events-none rounded-full border-2 border-amber-400 shadow-2xl z-30 ring-4 ring-black/80 overflow-hidden"
          >
            {/* Crosshair indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-[1px] bg-amber-400/50" />
              <div className="h-full w-[1px] bg-amber-400/50 absolute" />
              <div className="w-3 h-3 rounded-full border border-amber-400/80 absolute" />
            </div>
            <span className="absolute bottom-2 start-1/2 -translate-x-1/2 bg-black/90 px-1.5 py-0.5 rounded text-[8px] font-mono-dossier text-amber-300 font-bold">
              2.5× OPTICAL
            </span>
          </div>
        )}

        {/* Tactical grid background overlay lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Bottom watermark status */}
        {!isSplitMode && (
          <div className="absolute bottom-3 end-3 pointer-events-none bg-black/80 backdrop-blur-xs text-slate-300 text-[10px] font-mono-dossier px-2.5 py-1 border border-white/10 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {filterMode === 'normal'
                ? isArabic ? 'مرر المؤشر للتكبير المجهري 2.5×' : 'Hover to inspect loupe'
                : filterMode.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Forensic Intelligence Advisory Footer */}
      <div className="mt-3.5 bg-black/50 border border-white/10 p-3 text-xs text-slate-300 font-sans-body flex items-start gap-2.5 rounded-xs">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          {filterMode === 'ela' && (
            <p>
              <strong className="text-white font-bold font-mono-dossier">
                {isArabic ? 'تحليل مستوى خطأ الضغط (ELA): ' : 'Error Level Analysis (ELA): '}
              </strong>
              {isArabic
                ? 'يقيس تفاوت معدل الضغط عبر أجزاء الصورة؛ البقع المضيئة بنمط شاذ مقارنة ببقية الصورة تدل على تعديل ودمج لاحق أو توليد خوارزمي غير متجانس.'
                : 'Measures compression disparity across the image. High-contrast anomalies highlight spliced or digitally synthesized segments.'}
            </p>
          )}
          {filterMode === 'edges' && (
            <p>
              <strong className="text-white font-bold font-mono-dossier">
                {isArabic ? 'كشف الحواف (Sobel Edges): ' : 'Edge Boundary Detection: '}
              </strong>
              {isArabic
                ? 'يكشف التداخلات والقص غير المتجانس حول خصلات الشعر، أطراف اليدين، والخطوط الخلفية المشوهة.'
                : 'Detects composite seams, halo blending, and blurred mask boundaries.'}
            </p>
          )}
          {filterMode === 'luminance' && (
            <p>
              <strong className="text-white font-bold font-mono-dossier">
                {isArabic ? 'خريطة السطوع والتدرج الفيزيائي: ' : 'Luminance & Light Consistency: '}
              </strong>
              {isArabic
                ? 'توضح اتجاه مصادر الضوء وسقوط الظلال؛ يساعد في كشف الوجوه المركبة التي تمت إضاءتها بزوايا غير متوافقة مع الخلفية.'
                : 'Maps optical illumination vectors to detect lighting mismatches between foreground subjects and backgrounds.'}
            </p>
          )}
          {filterMode === 'contrast' && (
            <p>
              <strong className="text-white font-bold font-mono-dossier">
                {isArabic ? 'مجهر الملمس والمسام: ' : 'Texture & Skin Detail: '}
              </strong>
              {isArabic
                ? 'يبرز تباين مسام البشرة والشعر لكشف النعومة البلاستيكية والشمعية المصطنعة لنماذج الذكاء الاصطناعي.'
                : 'Enhances micro-textures to detect waxy airbrushed skin and synthetic diffusion artifacts.'}
            </p>
          )}
          {filterMode === 'normal' && (
            <p>
              <strong className="text-white font-bold font-mono-dossier">
                {isArabic ? 'مختبر الفحص المجهري: ' : 'Optical Forensic Lab: '}
              </strong>
              {isArabic
                ? 'مرر المؤشر فوق أي منطقة لفحصها بتكبير 2.5×، أو فعّل "مقارنة مقسومة" لمقارنة الصورة الأصلية مع مرشحات الكشف الجنائي مباشرة.'
                : 'Hover to inspect with 2.5× optical loupe, or toggle Split View to slide between original and forensic filters.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
