import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Language, translations } from '../translations';
import { Activity, AlertOctagon } from 'lucide-react';

interface TrustGaugeProps {
  score: number; // 0 to 100
  aiGenProbability: number; // 0 to 100
  lang: Language;
}

export default function TrustGauge({ score, aiGenProbability, lang }: TrustGaugeProps) {
  const t = translations[lang];
  const isArabic = lang === 'ar';

  const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));
  const normalizedAiProb = Math.max(0, Math.min(100, Math.round(aiGenProbability)));

  // Live rolling/decimating digits effect
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 900;
    const startTime = performance.now();

    const animateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * normalizedScore));

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [normalizedScore]);

  // Color coding
  let statusText = isArabic ? 'محتوى مفبرك وتوليد آلي' : 'FABRICATED / SYNTHETIC';
  let statusColor = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  let barGradient = 'from-rose-600 via-rose-500 to-rose-400';

  if (normalizedScore >= 70) {
    statusText = isArabic ? 'أصالة مثبتة وموثقة' : 'VERIFIED GENUINE';
    statusColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    barGradient = 'from-emerald-600 via-emerald-500 to-emerald-400';
  } else if (normalizedScore >= 40) {
    statusText = isArabic ? 'شبهة تلاعب وغير مؤكد' : 'SUSPICIOUS / INCONCLUSIVE';
    statusColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    barGradient = 'from-amber-600 via-amber-500 to-amber-400';
  }

  return (
    <div className="bg-[#0B0E14] border border-white/5 p-5 sm:p-6 rounded-2xl flex flex-col justify-between text-start relative shadow-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="font-serif-vintage text-xs sm:text-sm font-bold text-slate-200">
            {t.trustScoreLabel}
          </span>
        </div>

        <span className={`text-[11px] font-sans-body px-2.5 py-0.5 border rounded-lg font-semibold ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Numerical Calibrated Meter */}
      <div className="my-2">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black font-mono-dossier tracking-tight text-white">
              {displayScore}
            </span>
            <span className="font-mono-dossier text-xs text-slate-400 font-bold">/ 100</span>
          </div>

          <span className="text-xs font-sans-body text-slate-400">
            {normalizedScore >= 70
              ? isArabic ? 'نطاق الأصالة العالي' : 'High Authenticity Band'
              : normalizedScore >= 40
              ? isArabic ? 'نطاق المراجعة الإضافية' : 'Scrutiny Band'
              : isArabic ? 'نطاق التزييف المرجح' : 'Critical Synthetic Band'}
          </span>
        </div>

        {/* Graduated Spectral Laboratory Bar */}
        <div className="w-full h-3.5 bg-[#121622] border border-white/10 p-0.5 rounded-full relative overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${normalizedScore}%` }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full rounded-full bg-gradient-to-r ${barGradient} shadow-sm`}
          />

          {/* Calibrated tick marks at 25%, 50%, 75% */}
          <div className="absolute top-0 bottom-0 left-[25%] w-[1px] bg-white/20 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-white/30 pointer-events-none" />
          <div className="absolute top-0 bottom-0 left-[75%] w-[1px] bg-white/20 pointer-events-none" />
        </div>

        <div className="flex justify-between items-center text-[10px] font-sans-body text-slate-500 mt-2">
          <span>0 ({isArabic ? 'مزيّف' : 'Fabricated'})</span>
          <span>50 ({isArabic ? 'غير مؤكد' : 'Uncertain'})</span>
          <span>100 ({isArabic ? 'أصلي' : 'Genuine'})</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 font-sans-body leading-relaxed my-3">
        {t.trustScoreDesc}
      </p>

      {/* Secondary Bar: AI Probability */}
      <div className="border-t border-white/5 pt-3.5 mt-2">
        <div className="flex justify-between items-center text-xs font-sans-body mb-2">
          <span className="text-slate-300 flex items-center gap-1.5 font-medium">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            <span>{t.aiGenProbLabel}:</span>
          </span>
          <span className="text-rose-400 font-bold font-mono-dossier text-sm">
            {normalizedAiProb}%
          </span>
        </div>

        <div className="w-full h-2 bg-[#121622] border border-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${normalizedAiProb}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
