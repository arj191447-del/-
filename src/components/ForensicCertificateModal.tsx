import React from 'react';
import { DossierReport } from '../types';
import { Language, translations } from '../translations';
import RubberStamp from './RubberStamp';
import { Printer, X, Award, FileCheck } from 'lucide-react';

interface ForensicCertificateModalProps {
  dossier: DossierReport;
  lang: Language;
  onClose: () => void;
}

export default function ForensicCertificateModal({
  dossier,
  lang,
  onClose,
}: ForensicCertificateModalProps) {
  const t = translations[lang];
  const isArabic = lang === 'ar';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto no-print-backdrop">
      <div className="bg-[#121622] max-w-2xl w-full border border-white/10 shadow-2xl relative my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:m-0 print:border-none print:shadow-none print:bg-white text-slate-100 print:text-slate-900 rounded-2xl">
        {/* Controls Toolbar (Hidden in Print) */}
        <div className="bg-[#0B0E14] border-b border-white/5 px-5 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-serif-vintage font-bold text-slate-200">
              {isArabic ? 'شهادة الفحص الجنائي الرسمية' : 'Official Forensic Certificate'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs rounded-lg"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isArabic ? 'طباعة / تصدير PDF' : 'Print / Export PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer transition-colors rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Sheet */}
        <div className="p-6 sm:p-10 relative bg-[#0B0E14] print:bg-white border border-white/10 print:border-slate-800 m-2 sm:m-4 rounded-xl">
          {/* Certificate Header */}
          <div className="text-center border-b border-white/10 print:border-slate-900 pb-5 mb-6">
            <div className="inline-block border border-amber-500/30 print:border-slate-800 px-3 py-0.5 text-xs font-sans-body font-semibold mb-2 text-amber-400 print:text-slate-800 rounded-md">
              {isArabic ? 'منصة مكشاف للتحري والتوثيق الجنائي' : 'MIKSHAF DIGITAL FORENSICS'}
            </div>
            <h2 className="font-serif-vintage text-2xl sm:text-3xl font-extrabold text-white print:text-slate-900">
              {isArabic ? 'شهادة الفحص والتوثيق الجنائي الرقمي' : 'Forensic Verification Certificate'}
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 font-sans-body mt-1">
              {isArabic
                ? 'وثيقة فحص جنائي رسمية مستخلصة عبر خوارزميات الذكاء الاصطناعي متقدمة الأطياف وتحليل البصمات التوليدية'
                : 'Authenticated digital forensic investigation record synthesized via multimodal forensic intelligence'}
            </p>
          </div>

          {/* Case Metadata Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#121622] print:bg-slate-50 border border-white/5 print:border-slate-300 p-3 mb-6 font-sans-body text-xs rounded-xl">
            <div>
              <span className="text-slate-400 block text-[10px]">
                {isArabic ? 'رقم القضية' : 'Case Number'}
              </span>
              <span className="font-bold text-amber-400 font-mono-dossier print:text-rose-700">#{dossier.caseId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">
                {isArabic ? 'تاريخ الفحص' : 'Date Recorded'}
              </span>
              <span className="font-semibold text-slate-200 print:text-slate-800 font-mono-dossier">
                {new Date(dossier.timestamp).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US')}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">
                {isArabic ? 'مؤشر الثقة' : 'Trust Score'}
              </span>
              <span className="font-bold text-slate-100 print:text-slate-900 font-mono-dossier">{dossier.trustScore}%</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">
                {isArabic ? 'احتمال الذكاء الاصطناعي' : 'AI Gen Prob'}
              </span>
              <span className="font-bold text-slate-100 print:text-slate-900 font-mono-dossier">{dossier.aiGeneratedProbability}%</span>
            </div>
          </div>

          {/* Verdict Centerpiece */}
          <div className="flex flex-col items-center justify-center my-6 py-4 border-y border-white/10 print:border-slate-300">
            <span className="text-xs font-sans-body text-slate-400 print:text-slate-500 font-semibold mb-2">
              {isArabic ? 'الحكم والقرار الجنائي النهائي' : 'FINAL FORENSIC VERDICT'}
            </span>
            <div className="my-1 scale-105">
              <RubberStamp
                verdict={dossier.verdict}
                lang={lang}
                size="large"
                dateStr={dossier.timestamp}
                isPrintMode={true}
              />
            </div>
            <p className="font-serif-vintage font-bold text-base sm:text-lg text-slate-200 print:text-slate-800 mt-2">
              {t.stamps[dossier.verdict]?.verdictText}
            </p>
          </div>

          {/* Key Findings List */}
          <div className="mb-6">
            <h4 className="font-serif-vintage font-bold text-sm text-slate-200 print:text-slate-900 mb-2.5 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-amber-400 print:text-slate-700" />
              <span>{isArabic ? 'أبرز الأدلة والقرائن الجنائية المثبتة:' : 'Documented Forensic Proofs:'}</span>
            </h4>
            <div className="space-y-2">
              {dossier.evidenceList.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#121622] print:bg-slate-50 border border-white/5 print:border-slate-300 text-xs font-sans-body flex items-start gap-2.5 rounded-xl"
                >
                  <span className="font-mono-dossier text-amber-400 print:text-slate-500 font-bold text-xs">
                    0{idx + 1}
                  </span>
                  <div>
                    <strong className="text-white print:text-slate-900 block font-serif-vintage">{item.title}</strong>
                    <span className="text-slate-400 print:text-slate-600 leading-relaxed block mt-0.5">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Legal Disclaimer Notice */}
          <div className="border border-white/5 print:border-slate-300 bg-white/5 print:bg-slate-50 p-3 my-4 text-xs text-slate-400 print:text-slate-600 font-sans-body leading-relaxed rounded-xl">
            <strong className="text-slate-300 print:text-slate-800">{isArabic ? 'إخلاء مسؤولية جنائي: ' : 'Legal Disclaimer: '}</strong>
            {isArabic
              ? 'تعتبر هذه الوثيقة تقريراً فنياً مستخلصاً عبر خوارزميات الفحص الجنائي الرقمي والذكاء الاصطناعي، ولا تعتبر بمثابة شهادة قضائية قطعية أو حكماً قانونياً ملزماً أمام المحاكم دون مقاطعتها ببيانات المصدر الأصلية.'
              : 'This document represents algorithmic forensic analysis and does not constitute statutory judicial testimony or absolute judicial proof without primary source cross-examination.'}
          </div>

          {/* Certificate Footer with Signature & Official QR Code */}
          <div className="border-t border-white/10 print:border-slate-900 pt-5 mt-4 flex flex-wrap items-end justify-between gap-4 text-xs font-sans-body">
            {/* Cryptographic Hash Placeholder */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white p-1 border border-white/20 print:border-slate-900 rounded-lg flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900 fill-current">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4-2h2v4h-2v-4zm6 4h2v4h-2v-4zm-4 2h2v2h-2v-2zm4-4h2v2h-2v-2zm-2-2h2v2h-2v-2z" />
                </svg>
              </div>
              <div className="text-[11px] text-slate-400 print:text-slate-600 leading-tight">
                <span className="font-bold block text-slate-200 print:text-slate-900">
                  {isArabic ? 'التوقيع الرقمي المشفر' : 'Cryptographic Signature'}
                </span>
                <span className="font-mono-dossier">SHA-256: 7e2f...b901</span>
              </div>
            </div>

            {/* Officer Signature Line */}
            <div className="text-center min-w-[170px]">
              <div className="font-serif-vintage italic text-slate-200 print:text-slate-800 text-sm mb-1 text-end border-b border-slate-600 print:border-slate-400 pb-1">
                {isArabic ? 'وحدة الفحص الجنائي الذكي' : 'Digital Forensics Unit'}
              </div>
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">
                {isArabic ? 'المصادقة الرقمية' : 'Authorized Signature'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
