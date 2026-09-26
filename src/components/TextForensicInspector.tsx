import React, { useState } from 'react';
import { FileText, Sparkles, AlertTriangle, Copy, Check } from 'lucide-react';
import { Language } from '../translations';
import { playClickSound } from '../utils/audioEffects';

interface TextForensicInspectorProps {
  text: string;
  lang: Language;
  aiProbability: number;
}

export default function TextForensicInspector({
  text,
  lang,
  aiProbability,
}: TextForensicInspectorProps) {
  const [highlightMode, setHighlightMode] = useState<'none' | 'connectors' | 'assertions'>('none');
  const [copied, setCopied] = useState(false);
  const isArabic = lang === 'ar';

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const arabicConnectorRegex =
    /(علاوة على ذلك|بالإضافة إلى ذلك|من الجدير بالذكر|وفي هذا السياق|ومما لا شك فيه|ومن هذا المنطلق|تجدر الإشارة إلى|وعلى صعيد متصل|ومن المثير للاهتمام|بشكل لا لبس فيه)/gi;
  const englishConnectorRegex =
    /\b(furthermore|moreover|in addition|it is worth noting|in this context|undoubtedly|interestingly|it is important to remember|consequently)\b/gi;

  const handleCopyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const toggleHighlight = (mode: 'none' | 'connectors' | 'assertions') => {
    playClickSound();
    setHighlightMode(highlightMode === mode ? 'none' : mode);
  };

  const renderAnnotatedText = () => {
    if (highlightMode === 'none') {
      return text;
    }

    if (highlightMode === 'connectors') {
      const regex = isArabic ? arabicConnectorRegex : englishConnectorRegex;
      const parts = text.split(regex);
      return parts.map((part, i) => {
        if (part.match(regex)) {
          return (
            <mark
              key={i}
              className="bg-amber-400 text-slate-950 font-semibold px-1 mx-0.5 rounded"
              title={isArabic ? 'عبارة انتقالية نمطية للذكاء الاصطناعي' : 'Synthetic transitional marker'}
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    }

    if (highlightMode === 'assertions') {
      const sentences = text.split(/([.!?؟\n]+)/);
      return sentences.map((part, i) => {
        const hasAssertion = /(أكد|أعلنت|اكتشاف|كارثة|حصري|عاجل|ثبت|قطعياً|confirmed|revealed|shocking|urgent)/i.test(
          part
        );
        if (hasAssertion && part.trim().length > 10) {
          return (
            <mark
              key={i}
              className="bg-rose-500/80 text-white font-semibold px-1 mx-0.5 rounded"
              title={isArabic ? 'ادعاء رئيسي خاضع للفحص الجنائي' : 'Key factual claim requiring verification'}
            >
              {part}
            </mark>
          );
        }
        return part;
      });
    }

    return text;
  };

  return (
    <div className="bg-[#0B0E14] border border-white/5 p-4 sm:p-5 rounded-2xl text-white shadow-xl relative">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-3 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 font-serif-vintage flex items-center gap-2">
              <span>{isArabic ? 'مجهر الفحص اللغوي والنصي' : 'Forensic Linguistic Workstation'}</span>
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-sans-body mt-0.5">
              <span className="font-mono-dossier">{wordCount}</span> <span>{isArabic ? 'كلمة' : 'words'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono-dossier">{charCount}</span> <span>{isArabic ? 'حرف' : 'chars'}</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300">
                {aiProbability > 50
                  ? isArabic ? 'بصمات توليد لغوي مرصودة' : 'LLM Cadence Detected'
                  : isArabic ? 'تدفق لغوي طبيعي' : 'Natural Cadence'}
              </span>
            </div>
          </div>
        </div>

        {/* Highlight Toggles */}
        <div className="flex items-center gap-1.5 font-sans-body">
          <button
            onClick={() => toggleHighlight('connectors')}
            className={`px-2.5 py-1.5 border text-xs flex items-center gap-1.5 transition-all cursor-pointer rounded-lg ${
              highlightMode === 'connectors'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold shadow-xs'
                : 'bg-[#121622] text-slate-300 border-white/5 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isArabic ? 'بصمات AI' : 'AI Markers'}</span>
          </button>

          <button
            onClick={() => toggleHighlight('assertions')}
            className={`px-2.5 py-1.5 border text-xs flex items-center gap-1.5 transition-all cursor-pointer rounded-lg ${
              highlightMode === 'assertions'
                ? 'bg-rose-500 text-white border-rose-400 font-semibold shadow-xs'
                : 'bg-[#121622] text-slate-300 border-white/5 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isArabic ? 'الادعاءات' : 'Key Claims'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="p-1.5 bg-[#121622] hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 cursor-pointer transition-colors rounded-lg"
            title={isArabic ? 'نسخ النص' : 'Copy text'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Text Content Frame */}
      <div className="relative bg-[#121622] border border-white/5 p-4 max-h-72 overflow-y-auto font-sans-body text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-amber-500 selection:text-black rounded-xl">
        {renderAnnotatedText()}
      </div>

      {/* Footer Advisory */}
      <div className="mt-3 text-[11px] text-slate-400 font-sans-body flex items-center justify-between">
        <span>
          {highlightMode === 'connectors' &&
            (isArabic
              ? 'تم تظليل العبارات الانتقالية البلاغية التي تكررها نماذج الذكاء الاصطناعي لاصطناع الحيادية.'
              : 'Highlighted repetitive synthetic transition connectors common in generated texts.')}
          {highlightMode === 'assertions' &&
            (isArabic
              ? 'تم تظليل الادعاءات الحساسة التي تتطلب توثيقاً بمصادر خارجية مستقلة.'
              : 'Highlighted sensitive factual assertions requiring independent verification.')}
          {highlightMode === 'none' &&
            (isArabic
              ? 'اضغط على أزرار التظليل بالأعلى لتحديد البصمات الأسلوبية أو الادعاءات المشددة داخل النص.'
              : 'Click highlight buttons above to pinpoint linguistic patterns or assertive claims.')}
        </span>
      </div>
    </div>
  );
}
