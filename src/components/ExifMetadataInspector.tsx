import React from 'react';
import { Camera, Cpu, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { ParsedExifData } from '../utils/exifParser';
import { Language } from '../translations';

interface ExifMetadataInspectorProps {
  exif: ParsedExifData | null;
  lang: Language;
}

export default function ExifMetadataInspector({ exif, lang }: ExifMetadataInspectorProps) {
  if (!exif) return null;
  const isArabic = lang === 'ar';

  return (
    <div className="bg-[#0B0E14] border border-white/5 rounded-2xl p-4 sm:p-5 text-xs text-slate-300 shadow-xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-100 font-sans-body text-xs sm:text-sm">
            {isArabic ? 'بيانات الكاميرا والمستشعر (EXIF)' : 'Hardware Sensor & EXIF Metadata'}
          </span>
        </div>

        {/* Integrity status badge */}
        <div>
          {exif.isAiToolFlagged ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg font-sans-body">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{isArabic ? 'بصمة أداة ذكاء اصطناعي مرصودة' : 'AI Footprint Detected'}</span>
            </span>
          ) : exif.hasHardwareExif ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-lg font-sans-body">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isArabic ? 'بيانات مستشعر تصوير أصلي موثقة' : 'Authentic Hardware EXIF'}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg font-sans-body">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>{isArabic ? 'بيانات الكاميرا مفقودة (تجريد رقمي)' : 'Metadata Stripped'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Technical Grid of extracted camera values */}
      {exif.hasHardwareExif ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-2 text-xs">
          <div className="bg-[#121622] border border-white/5 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px] font-sans-body">
              {isArabic ? 'الشركة والموديل' : 'Make & Model'}
            </span>
            <span className="font-bold text-slate-200 truncate block mt-0.5 font-mono-dossier">
              {exif.make || ''} {exif.model || 'Unknown'}
            </span>
          </div>

          <div className="bg-[#121622] border border-white/5 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px] font-sans-body">
              {isArabic ? 'العدسة والبعد البؤري' : 'Lens & Focal Length'}
            </span>
            <span className="font-bold text-slate-200 truncate block mt-0.5 font-mono-dossier">
              {exif.focalLength || 'N/A'} {exif.lensModel ? `· ${exif.lensModel}` : ''}
            </span>
          </div>

          <div className="bg-[#121622] border border-white/5 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px] font-sans-body">
              {isArabic ? 'التعريض وحساسية ISO' : 'Exposure & ISO'}
            </span>
            <span className="font-bold text-slate-200 truncate block mt-0.5 font-mono-dossier">
              {exif.exposureTime || 'N/A'} {exif.fNumber ? `@ ${exif.fNumber}` : ''} {exif.iso ? `ISO ${exif.iso}` : ''}
            </span>
          </div>

          <div className="bg-[#121622] border border-white/5 p-3 rounded-xl">
            <span className="text-slate-400 block text-[10px] font-sans-body">
              {isArabic ? 'البرنامج ونظام المعالجة' : 'Software / Pipeline'}
            </span>
            <span className="font-bold text-slate-200 truncate block mt-0.5 font-mono-dossier">
              {exif.software || 'Camera Native'}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-[#121622] border border-white/5 p-3.5 rounded-xl text-xs text-slate-400 leading-relaxed my-2 font-sans-body">
          <p>
            {isArabic
              ? 'تنبيه: تم تجريد هذه الصورة بالكامل من بيانات EXIF الخاصة بمستشعر الكاميرا وفتحة العدسة وتاريخ الالتقاط الأصلي. هذا التجريد شائع جداً في الصور المنتجة بنماذج الذكاء الاصطناعي (Midjourney / Flux / DALL-E) أو الصور التي تم ضغطها وإعادة نشرها عبر شبكات التواصل الاجتماعي.'
              : 'Notice: All hardware capture metadata (camera sensor, aperture, focal length, ISO, and shutter speed) has been stripped. This pattern strongly correlates with generative AI outputs or aggressive social messaging re-compression.'}
          </p>
        </div>
      )}

      {/* AI Footprint warning banner if flagged */}
      {exif.isAiToolFlagged && exif.aiFlagsDescription && (
        <div className="mt-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2 font-sans-body">
          <Sparkles className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{exif.aiFlagsDescription}</span>
        </div>
      )}
    </div>
  );
}
