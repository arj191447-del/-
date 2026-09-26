import React, { useState } from 'react';
import { EvidenceItem } from '../types';
import { Language, translations } from '../translations';
import { playClickSound } from '../utils/audioEffects';
import {
  CheckCircle2,
  AlertTriangle,
  Layers,
  Copy,
  Check,
  Sun,
  User,
  Box,
  Activity,
  FileSearch,
  Sparkles,
} from 'lucide-react';

interface EvidenceBoardProps {
  evidenceList: EvidenceItem[];
  lang: Language;
}

const categoryDictArabic: Record<string, string> = {
  'lighting & shadows': 'الإضاءة والظلال والانعكاسات',
  'lighting & physics': 'الإضاءة والفيزياء البصرية',
  'lighting': 'الإضاءة والانعكاسات البصرية',
  'anatomy & textures': 'التشريح والملامح والأنسجة',
  'anatomy': 'التشريح البشري والأطراف',
  'textures': 'ملمس الأسطح والأنسجة المجهرية',
  'geometry & physics': 'الهندسة والفيزياء البصرية',
  'geometry & architecture': 'البنية الهندسية والمعمارية',
  'geometry': 'التناسق الهندسي والخطوط',
  'artifacts & noise': 'التشوهات والضجيج الرقمي',
  'sensor noise': 'ضجيج المستشعر الرقمي (PRNU)',
  'artifacts': 'التشوهات البرمجية والرقمية',
  'compression artifacts': 'آثار الضغط وتفكك البيكسلات',
  'fact-checking': 'فحص وتدقيق الحقائق',
  'fact checking': 'فحص وتدقيق الحقائق',
  'source credibility': 'موثوقية ومصداقية المصدر',
  'ai syntax': 'بصمات التوليد اللغوي الآلي',
  'ai syntax fingerprints': 'بصمات النماذج اللغوية (LLM)',
  'stylistic patterns': 'الأنماط الأسلوبية والتكرار',
  'logical coherence': 'التماسك والاتساق المنطقي',
  'semantics & tone': 'الدلالة والنبرة التعبيرية',
};

function getLocalizedCategory(cat: string, lang: Language): string {
  if (lang !== 'ar') return cat;
  const lower = (cat || '').trim().toLowerCase();
  if (categoryDictArabic[lower]) return categoryDictArabic[lower];
  for (const [eng, ar] of Object.entries(categoryDictArabic)) {
    if (lower.includes(eng)) return ar;
  }
  return cat;
}

export default function EvidenceBoard({ evidenceList, lang }: EvidenceBoardProps) {
  const [filter, setFilter] = useState<'all' | 'supporting' | 'suspicious'>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const t = translations[lang];

  const filteredList = evidenceList.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const supportingCount = evidenceList.filter((e) => e.type === 'supporting').length;
  const suspiciousCount = evidenceList.filter((e) => e.type === 'suspicious').length;

  const handleCopyEvidence = (item: EvidenceItem, idx: number) => {
    playClickSound();
    const textToCopy = `[${getLocalizedCategory(item.forensicCategory, lang)}] ${item.title}\n${item.description}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="bg-[#0B0E14] border border-white/5 p-5 sm:p-6 rounded-2xl relative">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif-vintage text-sm sm:text-base font-bold text-white">
              {t.evidenceBoardTitle}
            </h3>
            <p className="text-xs text-slate-400 font-sans-body">
              {t.evidenceBoardSubtitle}
            </p>
          </div>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1 bg-[#121622] p-1 border border-white/5 text-xs rounded-xl font-sans-body">
          <button
            onClick={() => {
              playClickSound();
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white/10 text-white font-semibold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.filterAll} ({evidenceList.length})
          </button>
          <button
            onClick={() => {
              playClickSound();
              setFilter('supporting');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'supporting'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.filterSupporting} ({supportingCount})</span>
          </button>
          <button
            onClick={() => {
              playClickSound();
              setFilter('suspicious');
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              filter === 'suspicious'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.filterSuspicious} ({suspiciousCount})</span>
          </button>
        </div>
      </div>

      {/* Grid of Clean Evidence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredList.map((item, index) => {
          const isSupporting = item.type === 'supporting';
          const localizedCategory = getLocalizedCategory(item.forensicCategory, lang);

          return (
            <div
              key={index}
              className={`p-4 bg-[#121622] border border-white/5 relative group transition-all hover:border-white/15 rounded-xl ${
                isSupporting
                  ? 'border-s-4 border-s-emerald-500/80'
                  : 'border-s-4 border-s-rose-500/80'
              }`}
            >
              {/* Category, Status & Copy */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-sans-body font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                  {localizedCategory}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 text-[11px] font-sans-body font-semibold ${
                      isSupporting ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isSupporting ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.evidenceTypeSupporting}</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{t.evidenceTypeSuspicious}</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => handleCopyEvidence(item, index)}
                    title={lang === 'ar' ? 'نسخ هذا الدليل' : 'Copy evidence note'}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-white border border-white/10 bg-white/5 rounded-md cursor-pointer"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h4 className="font-bold text-xs sm:text-sm text-slate-100 mb-1.5 leading-snug font-serif-vintage">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans-body">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
