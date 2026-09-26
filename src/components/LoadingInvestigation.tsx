import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../translations';
import { Search, ShieldAlert, Cpu, Eye, Binary, Radio } from 'lucide-react';
import { playRadarPingSound } from '../utils/audioEffects';

interface LoadingInvestigationProps {
  lang: Language;
}

export default function LoadingInvestigation({ lang }: LoadingInvestigationProps) {
  const t = translations[lang];
  const steps = t.investigationSteps;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Play subtle radar ping on initial start
    playRadarPingSound();

    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        playRadarPingSound();
        return (prev + 1) % steps.length;
      });
    }, 1800);
    return () => clearInterval(timer);
  }, [steps.length]);

  const stepIcons = [Binary, Eye, Search, Cpu, ShieldAlert];
  const CurrentIcon = stepIcons[currentStepIndex % stepIcons.length];

  return (
    <div className="bg-[#121622] p-7 sm:p-8 text-center my-6 max-w-xl mx-auto border border-white/5 shadow-2xl rounded-2xl relative overflow-hidden text-white">
      {/* Sleek Scanner Visual */}
      <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        {/* Soft pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.05, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full border-2 border-amber-400/50"
        />

        {/* Center Scanner Orb */}
        <div className="w-12 h-12 bg-[#0B0E14] text-white rounded-full flex items-center justify-center shadow-md relative z-10 border border-amber-500/30">
          <motion.div
            key={currentStepIndex}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <CurrentIcon className="w-5 h-5 text-amber-400" />
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mb-1">
        <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
        <h3 className="font-serif-vintage text-lg sm:text-xl font-bold text-white">
          {t.investigatingTitle}
        </h3>
      </div>
      <p className="text-xs text-slate-400 font-sans-body mb-3">
        {lang === 'ar' ? 'جاري فحص المعالم البصرية واللغوية عبر النموذج الذكي' : 'Multispectral forensic deep scan in progress'}
      </p>

      {/* Smooth Step Transition */}
      <div className="min-h-[50px] flex items-center justify-center my-2 px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-xs sm:text-sm text-slate-200 font-medium bg-[#0B0E14] border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-2.5 max-w-md shadow-inner font-sans-body"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>{steps[currentStepIndex]}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress Bar with Phase Counter */}
      <div className="max-w-xs mx-auto mt-4">
        <div className="flex justify-between items-center text-xs font-sans-body text-slate-400 mb-1.5 font-medium">
          <span>
            {lang === 'ar'
              ? `المرحلة 0${currentStepIndex + 1} من 0${steps.length}`
              : `Phase 0${currentStepIndex + 1} of 0${steps.length}`}
          </span>
          <span className="text-amber-400 font-mono-dossier font-semibold">
            {Math.round(((currentStepIndex + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-[#0B0E14] rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
            animate={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </div>
  );
}
