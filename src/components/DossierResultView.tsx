import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DossierReport } from '../types';
import { Language, translations } from '../translations';
import RubberStamp from './RubberStamp';
import TrustGauge from './TrustGauge';
import EvidenceBoard from './EvidenceBoard';
import ForensicImageInspector from './ForensicImageInspector';
import TextForensicInspector from './TextForensicInspector';
import ExifMetadataInspector from './ExifMetadataInspector';
import ForensicCertificateModal from './ForensicCertificateModal';
import { Printer, RotateCcw, ShieldCheck, FileCheck, Award, FileDown } from 'lucide-react';
import { playStampSound, playClickSound } from '../utils/audioEffects';

interface DossierResultViewProps {
  dossier: DossierReport;
  lang: Language;
  onNewInvestigation: () => void;
}

export default function DossierResultView({
  dossier,
  lang,
  onNewInvestigation,
}: DossierResultViewProps) {
  const [showCertificate, setShowCertificate] = useState(false);
  const [isScreenShaking, setIsScreenShaking] = useState(false);
  const t = translations[lang];
  const isImage = dossier.contentType === 'image';
  const isArabic = lang === 'ar';

  // Play tactile stamp sound and trigger physical screen micro-shake upon dossier result mount
  useEffect(() => {
    const timer = setTimeout(() => {
      playStampSound();
      setIsScreenShaking(true);
      setTimeout(() => setIsScreenShaking(false), 140);
    }, 280);
    return () => clearTimeout(timer);
  }, []);

  const complexityColors = {
    low: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    medium: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    high: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  }[dossier.complexity];

  const handlePrint = () => {
    playClickSound();
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-5xl mx-auto my-6 px-4 ${isScreenShaking ? 'animate-forensic-shake' : ''}`}
    >
      {/* Certificate Modal */}
      {showCertificate && (
        <ForensicCertificateModal
          dossier={dossier}
          lang={lang}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 no-print">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono-dossier text-slate-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
            #{dossier.caseId}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              playClickSound();
              setShowCertificate(true);
            }}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-[0_2px_15px_rgba(245,158,11,0.3)] hover:shadow-[0_2px_20px_rgba(245,158,11,0.45)] rounded-xl active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4 text-slate-950" />
            <span>{isArabic ? 'تصدير التقرير والشهادة الجنائية (PDF)' : (t.btnExportPdfCertificate || 'Export Dossier & Certificate (PDF)')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs rounded-xl"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>{t.btnPrintDossier}</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onNewInvestigation();
            }}
            className="px-4 py-2.5 bg-white text-slate-950 hover:bg-slate-200 font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs rounded-xl active:scale-[0.98]"
          >
            <RotateCcw className="w-4 h-4 text-amber-500" />
            <span>{t.btnNewInvestigation}</span>
          </button>
        </div>
      </div>

      {/* Main Dossier File Container */}
      <div className="bg-[#121622] border border-white/5 p-5 sm:p-8 rounded-2xl relative shadow-xl">
        {/* Section 1: Official Header & Verdict Stamp */}
        <div className="border-b border-white/5 pb-6 mb-7">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <div className="text-xs text-amber-400 font-semibold mb-1">
                {isArabic ? 'تقرير التحقق الجنائي الرقمي' : 'Digital Forensics Official Report'}
              </div>
              <h2 className="font-serif-vintage text-2xl sm:text-3xl font-extrabold text-white">
                {t.caseReportTitle}
              </h2>

              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-sans-body text-slate-400">
                <span className="font-bold text-amber-400 font-mono-dossier">#{dossier.caseId}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{new Date(dossier.timestamp).toLocaleString(isArabic ? 'ar-EG' : 'en-US')}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className={`px-2.5 py-0.5 border rounded-lg font-medium text-[11px] ${complexityColors}`}>
                  {t.complexityLevel} {t.complexity[dossier.complexity]}
                </span>
              </div>
            </div>

            {/* Official Verdict Stamp */}
            <div className="shrink-0 flex items-center justify-center">
              <RubberStamp
                verdict={dossier.verdict}
                lang={lang}
                size="large"
                dateStr={dossier.timestamp}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Laboratory Trust Meter */}
        <div className="mb-7">
          <TrustGauge
            score={dossier.trustScore}
            aiGenProbability={dossier.aiGeneratedProbability}
            lang={lang}
          />
        </div>

        {/* Section 3: Evidence Workstation (Optical Inspector or Linguistic Syntax) */}
        <div className="mb-7">
          {isImage && dossier.inputPreview ? (
            <div className="space-y-4">
              <ForensicImageInspector
                imageSrc={dossier.inputPreview}
                lang={lang}
                alt="Analyzed Evidence Exhibit"
              />

              {/* Hardware EXIF card if available */}
              {dossier.exifData && (
                <ExifMetadataInspector exif={dossier.exifData} lang={lang} />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {dossier.inputTitle && (
                <TextForensicInspector
                  text={dossier.inputTitle}
                  lang={lang}
                  aiProbability={dossier.aiGeneratedProbability}
                />
              )}
            </div>
          )}
        </div>

        {/* Section 4: Forensic Executive Summary */}
        <div className="bg-[#0B0E14] border border-white/5 p-5 sm:p-6 rounded-xl mb-7">
          <p className="text-xs text-amber-400 font-bold mb-2 flex items-center gap-1.5 font-sans-body">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>{isArabic ? 'الخلاصة الجنائية الرسمية للمحقق:' : 'OFFICIAL INVESTIGATIVE CONCLUSION:'}</span>
          </p>
          <p className="text-sm sm:text-base leading-relaxed text-slate-200 font-sans-body">
            {dossier.summary}
          </p>
        </div>

        {/* Section 5: Evidence Board */}
        <div className="mb-7">
          <EvidenceBoard evidenceList={dossier.evidenceList} lang={lang} />
        </div>

        {/* Section 6: Tactical Advisory */}
        <div className="bg-[#0B0E14] border border-amber-500/20 p-5 rounded-xl">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-amber-400 mb-1 font-sans-body">
                {t.recommendationTitle}
              </h4>
              <p className="text-xs sm:text-sm font-sans-body text-slate-300 leading-relaxed">
                {dossier.recommendation}
              </p>
            </div>
          </div>
        </div>

        {/* Section 7: Bottom Official Action Bar (PDF Export & New Investigation) */}
        <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-3.5 no-print">
          <button
            onClick={() => {
              playClickSound();
              setShowCertificate(true);
            }}
            className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_2px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_2px_25px_rgba(245,158,11,0.5)] rounded-xl active:scale-[0.98]"
          >
            <FileDown className="w-4 h-4 text-slate-950" />
            <span>{isArabic ? 'تصدير التقرير والشهادة الجنائية (PDF)' : (t.btnExportPdfCertificate || 'Export Dossier & Forensic Certificate (PDF)')}</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors rounded-xl"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>{t.btnPrintDossier}</span>
            </button>

            <button
              onClick={() => {
                playClickSound();
                onNewInvestigation();
              }}
              className="flex-1 sm:flex-initial px-5 py-3 bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors rounded-xl active:scale-[0.98]"
            >
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span>{t.btnNewInvestigation}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
