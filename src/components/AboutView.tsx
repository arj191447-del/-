import React from 'react';
import { motion } from 'motion/react';
import { Language, translations } from '../translations';
import { Cpu, AlertTriangle, Search, BookOpen } from 'lucide-react';

interface AboutViewProps {
  lang: Language;
}

export default function AboutView({ lang }: AboutViewProps) {
  const t = translations[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto py-6 sm:py-8 px-4 font-sans-body"
    >
      {/* Page Header */}
      <div className="bg-[#121622] border border-white/5 p-6 sm:p-8 mb-6 rounded-2xl text-center relative overflow-hidden shadow-xl">
        <div className="inline-flex items-center gap-2 bg-[#0B0E14] text-amber-400 font-sans-body text-xs px-3 py-1 border border-white/5 rounded-lg mb-3">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ar' ? 'ميثاق الشفافية ومبادئ التحري الرقمي' : 'Forensic Transparency & Ethical Charter'}</span>
        </div>
        <h1 className="font-serif-vintage text-2xl sm:text-4xl font-extrabold text-white mb-2.5">
          {t.aboutTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto font-sans-body leading-relaxed">
          {t.aboutSubtitle}
        </p>
      </div>

      <div className="space-y-5">
        {/* Section 1: Vision */}
        <div className="bg-[#121622] border border-white/5 p-6 sm:p-7 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <h2 className="font-serif-vintage text-lg sm:text-xl font-bold text-white">
              {t.aboutSection1Title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans-body">
            {t.aboutSection1Content}
          </p>
        </div>

        {/* Section 2: Methodology */}
        <div className="bg-[#121622] border border-white/5 p-6 sm:p-7 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-3 border-b border-white/5 pb-3">
            <div className="w-9 h-9 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="font-serif-vintage text-lg sm:text-xl font-bold text-white">
              {t.aboutSection2Title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans-body mb-5">
            {t.aboutSection2Content}
          </p>

          {/* Forensic Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-[#0B0E14] border border-white/5 rounded-xl">
              <span className="font-bold text-amber-400 text-xs block mb-1 font-serif-vintage">
                {lang === 'ar' ? '1. فحص فيزياء الضوء والظلال' : '1. Optical Physics & Specular Lighting'}
              </span>
              <span className="text-slate-400 font-sans-body text-xs leading-relaxed">
                {lang === 'ar'
                  ? 'مراجعة اتساق زوايا الظل، بريق العيون الطبيعي، ومصادر الإنارة الفيزيائية.'
                  : 'Verifying shadow cast angles, corneal catchlights, and physical ray coherence.'}
              </span>
            </div>

            <div className="p-3.5 bg-[#0B0E14] border border-white/5 rounded-xl">
              <span className="font-bold text-amber-400 text-xs block mb-1 font-serif-vintage">
                {lang === 'ar' ? '2. تشريح الملامح المجهرية' : '2. Micro-Anatomy & Skin Pores'}
              </span>
              <span className="text-slate-400 font-sans-body text-xs leading-relaxed">
                {lang === 'ar'
                  ? 'رصد عيوب الأصابع، بنية الأسنان، والتشويه البلاستيكي في أنسجة البشرة.'
                  : 'Auditing hands, fingernails, dental geometry, and synthetic plastic skin sheen.'}
              </span>
            </div>

            <div className="p-3.5 bg-[#0B0E14] border border-white/5 rounded-xl">
              <span className="font-bold text-amber-400 text-xs block mb-1 font-serif-vintage">
                {lang === 'ar' ? '3. بصمات نصوص LLM' : '3. LLM Stylistic Fingerprints'}
              </span>
              <span className="text-slate-400 font-sans-body text-xs leading-relaxed">
                {lang === 'ar'
                  ? 'كشف التكرار الأسلوبي النمطي، العبارات الانتقالية المكررة، والحيادية المصطنعة.'
                  : 'Detecting synthetic cadence, clichéd transitional markers, and faux neutrality.'}
              </span>
            </div>

            <div className="p-3.5 bg-[#0B0E14] border border-white/5 rounded-xl">
              <span className="font-bold text-amber-400 text-xs block mb-1 font-serif-vintage">
                {lang === 'ar' ? '4. التحقق والتقصي المصدري' : '4. Fact-Checking & Attribution'}
              </span>
              <span className="text-slate-400 font-sans-body text-xs leading-relaxed">
                {lang === 'ar'
                  ? 'مقارنة الادعاءات بالأدلة المعرفية، وتدقيق التضخيم العاطفي والمصادر المجهولة.'
                  : 'Evaluating claims against grounded factual records and unmasking clickbait.'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Transparency & Official Disclaimer */}
        <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2.5 border-b border-rose-500/20 pb-2.5">
            <div className="w-8 h-8 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <h2 className="font-serif-vintage text-base sm:text-lg font-bold text-rose-200">
              {t.aboutSection3Title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-sans-body text-rose-200/80 leading-relaxed font-normal">
            {t.aboutSection3Content}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
