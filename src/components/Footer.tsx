import React from 'react';
import { Language, translations } from '../translations';
import { ActivePage } from '../types';
import { FileSearch, Archive, Info, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';

interface FooterProps {
  lang: Language;
  onPageChange: (page: ActivePage) => void;
}

export default function Footer({ lang, onPageChange }: FooterProps) {
  const t = translations[lang];

  return (
    <footer className="bg-[#080B10] border-t border-white/5 mt-16 no-print text-slate-300 font-sans-body">
      {/* Top Advisory Strip */}
      <div className="bg-[#06080C] text-slate-400 py-2.5 px-4 text-xs text-center border-b border-white/5 flex items-center justify-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="leading-relaxed">{t.footerDisclaimer}</span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#121622] border border-white/10 rounded-xl text-amber-400 flex items-center justify-center shadow-xs">
                <FileSearch className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-serif-vintage text-2xl font-bold text-white">
                {t.appName}
              </span>
              <span className="text-[10px] font-mono-dossier bg-white/5 text-slate-400 px-2 py-0.5 rounded-md border border-white/5 font-semibold">
                {t.appEnglishName}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans-body max-w-md leading-relaxed">
              {t.footerDesc}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#0B0E14] p-3 rounded-xl border border-white/5 max-w-md">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>{t.footerSecurityNote}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif-vintage font-bold text-xs uppercase text-slate-200 border-b border-white/5 pb-2 mb-3">
              {t.footerQuickLinks}
            </h4>
            <ul className="space-y-2.5 text-xs font-sans-body">
              <li>
                <button
                  onClick={() => {
                    onPageChange('investigator');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 flex items-center gap-2 cursor-pointer text-slate-400 transition-colors"
                >
                  <FileSearch className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.navInvestigate}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onPageChange('archive');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 flex items-center gap-2 cursor-pointer text-slate-400 transition-colors"
                >
                  <Archive className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.navArchive}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onPageChange('about');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-amber-400 flex items-center gap-2 cursor-pointer text-slate-400 transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.navAbout}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Standards & Engine */}
          <div>
            <h4 className="font-serif-vintage font-bold text-xs uppercase text-slate-200 border-b border-white/5 pb-2 mb-3">
              {lang === 'ar' ? 'معايير الفحص' : 'Forensic Standards'}
            </h4>
            <div className="space-y-2 text-xs text-slate-400 font-sans-body">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Multimodal Gemini AI Engine</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {lang === 'ar'
                  ? 'تحليل طيفي مجهري وتدقيق فيزياء الضوء ومطابقة الحقائق عبر نماذج الذكاء الاصطناعي الحديثة.'
                  : 'Multispectral micro-analysis, physical ray auditing, and semantic fact-checking.'}
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 pt-6 text-center text-xs text-slate-500 font-sans-body">
          {t.footerCopyright}
        </div>
      </div>
    </footer>
  );
}
