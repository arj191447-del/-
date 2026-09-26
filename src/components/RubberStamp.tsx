import React from 'react';
import { motion } from 'motion/react';
import { ForensicVerdict } from '../types';
import { Language, translations } from '../translations';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface RubberStampProps {
  verdict: ForensicVerdict;
  lang: Language;
  size?: 'normal' | 'small' | 'large';
  dateStr?: string;
  isPrintMode?: boolean;
}

export default function RubberStamp({
  verdict,
  lang,
  size = 'normal',
  dateStr,
  isPrintMode = false,
}: RubberStampProps) {
  const t = translations[lang];
  const stampConfig = t.stamps[verdict] || t.stamps.uncertain;

  // Dark lab aesthetic palette with authentic ink distress borders
  const colorMap = {
    authentic: {
      border: 'border-emerald-500',
      text: 'text-emerald-400',
      bgDark: 'bg-emerald-950/40',
      bgPrint: 'bg-emerald-50',
      textPrint: 'text-emerald-800',
      borderPrint: 'border-emerald-700',
      icon: CheckCircle2,
      rotation: '-rotate-2',
      glow: 'rgba(16, 185, 129, 0.25)',
    },
    fake: {
      border: 'border-rose-500',
      text: 'text-rose-400',
      bgDark: 'bg-rose-950/40',
      bgPrint: 'bg-rose-50',
      textPrint: 'text-rose-800',
      borderPrint: 'border-rose-700',
      icon: AlertTriangle,
      rotation: 'rotate-2',
      glow: 'rgba(244, 63, 94, 0.25)',
    },
    uncertain: {
      border: 'border-amber-500',
      text: 'text-amber-400',
      bgDark: 'bg-amber-950/40',
      bgPrint: 'bg-amber-50',
      textPrint: 'text-amber-800',
      borderPrint: 'border-amber-700',
      icon: HelpCircle,
      rotation: '-rotate-1',
      glow: 'rgba(245, 158, 11, 0.25)',
    },
  };

  const current = colorMap[verdict] || colorMap.uncertain;
  const Icon = current.icon;

  const sizeClasses = {
    small: 'px-2.5 py-1 text-[11px] border-2',
    normal: 'px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm border-[2.5px]',
    large: 'px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg border-3',
  }[size];

  return (
    <motion.div
      initial={{ scale: 1.2, opacity: 0, y: -16, filter: 'blur(3px)' }}
      animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        type: 'spring',
        stiffness: 420,
        damping: 24,
        mass: 0.6,
        delay: 0.08,
      }}
      className="inline-block select-none transform-gpu"
    >
      <div
        className={`rubber-stamp-physical rounded-xl ${sizeClasses} ${
          isPrintMode
            ? `${current.borderPrint} ${current.textPrint} ${current.bgPrint}`
            : `${current.border} ${current.text} ${current.bgDark}`
        } shadow-lg relative`}
        style={{
          boxShadow: isPrintMode ? 'none' : `0 0 20px ${current.glow}, inset 0 0 10px ${current.glow}`,
        }}
      >
        {/* Subtle authentication badge header */}
        <div className="flex items-center justify-center gap-1.5 opacity-90 text-[10px] font-mono-dossier border-b border-current/30 pb-1 mb-1 font-semibold">
          <Icon className="w-3 h-3 shrink-0" />
          <span>MIKSHAF · FORENSIC VERIFIED</span>
        </div>

        {/* Main Verdict Stamp Text (Clean Arabic & English typography) */}
        <div className="font-serif-vintage font-bold text-center leading-tight my-1 text-base sm:text-lg">
          {stampConfig.text}
        </div>

        {/* Sub classification code */}
        <div className="flex items-center justify-between text-[10px] font-mono-dossier opacity-80 border-t border-current/30 pt-1 mt-1">
          <span>{stampConfig.sub}</span>
          {dateStr && <span>{dateStr.slice(0, 10)}</span>}
        </div>
      </div>
    </motion.div>
  );
}
