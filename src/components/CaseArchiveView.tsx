import React, { useState } from 'react';
import { DossierReport } from '../types';
import { Language, translations } from '../translations';
import RubberStamp from './RubberStamp';
import { Archive, Trash2, ExternalLink, Image as ImageIcon, FileText, Search, AlertCircle } from 'lucide-react';
import { playClickSound, playPaperRustleSound } from '../utils/audioEffects';

interface CaseArchiveViewProps {
  cases: DossierReport[];
  lang: Language;
  onOpenCase: (dossier: DossierReport) => void;
  onDeleteCase: (caseId: string) => void;
  onClearArchive: () => void;
}

export default function CaseArchiveView({
  cases,
  lang,
  onOpenCase,
  onDeleteCase,
  onClearArchive,
}: CaseArchiveViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'all' | 'authentic' | 'fake' | 'uncertain'>('all');
  const t = translations[lang];

  const filteredCases = cases.filter((c) => {
    const matchesVerdict = verdictFilter === 'all' || c.verdict === verdictFilter;
    const matchesSearch =
      c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.inputTitle && c.inputTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesVerdict && matchesSearch;
  });

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4">
      {/* Archive Header */}
      <div className="bg-[#121622] border border-white/5 p-5 sm:p-7 rounded-2xl mb-7 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-vintage text-2xl sm:text-3xl font-extrabold text-white">
                {t.archiveTitle}
              </h2>
              <p className="text-xs text-slate-400 font-sans-body">
                {t.archiveSubtitle} ({cases.length} {t.totalCasesLogged})
              </p>
            </div>
          </div>

          {cases.length > 0 && (
            <button
              onClick={() => {
                playClickSound();
                if (window.confirm(t.confirmClearArchive)) {
                  onClearArchive();
                }
              }}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.btnClearArchive}</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        {cases.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 start-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={lang === 'ar' ? 'بحث برقم القضية أو ملخص الفحص...' : 'Search by Case ID or summary...'}
                  className="w-full bg-[#0B0E14] border border-white/5 rounded-xl py-2 ps-10 pe-3.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400/60 transition-all placeholder:text-slate-500 font-sans-body"
                />
              </div>
            </div>

            {/* Verdict Filter Controls */}
            <div className="flex items-center gap-1 bg-[#0B0E14] p-1 border border-white/5 text-xs rounded-xl font-sans-body">
              {(['all', 'authentic', 'fake', 'uncertain'] as const).map((vKey) => {
                const label =
                  vKey === 'all'
                    ? t.filterAll
                    : t.stamps[vKey]?.verdictText || vKey;
                return (
                  <button
                    key={vKey}
                    onClick={() => {
                      playClickSound();
                      setVerdictFilter(vKey);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
                      verdictFilter === vKey
                        ? 'bg-white/10 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Case List or Empty State */}
      {cases.length === 0 ? (
        <div className="bg-[#121622] border border-white/5 p-12 text-center rounded-2xl my-6">
          <div className="w-14 h-14 bg-[#0B0E14] border border-white/5 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Archive className="w-6 h-6 text-amber-500/50" />
          </div>
          <h3 className="font-serif-vintage text-xl font-bold text-white mb-2">
            {t.archiveEmpty}
          </h3>
          <p className="text-xs font-sans-body text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
            {t.archiveEmptyDesc}
          </p>
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="bg-[#121622] border border-white/5 p-8 text-center rounded-2xl my-6">
          <AlertCircle className="w-7 h-7 text-amber-500/60 mx-auto mb-2" />
          <p className="text-xs font-sans-body text-slate-400">
            {lang === 'ar' ? 'لم يتم العثور على أي قضايا تطابق معايير البحث.' : 'No cases match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCases.map((dossier) => {
            const isImage = dossier.contentType === 'image';

            return (
              <div
                key={dossier.caseId}
                className="bg-[#121622] border border-white/5 hover:border-white/15 p-4 sm:p-5 rounded-2xl transition-all flex flex-col justify-between group shadow-lg"
              >
                {/* Case Top Bar */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3 text-xs font-sans-body">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0B0E14] text-amber-400 border border-white/5 px-2 py-0.5 rounded-md font-bold font-mono-dossier text-[11px]">
                      #{dossier.caseId}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                      {isImage ? <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> : <FileText className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{isImage ? (lang === 'ar' ? 'صورة' : 'Image') : (lang === 'ar' ? 'نص / رابط' : 'Text / URL')}</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono-dossier">
                    {new Date(dossier.timestamp).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                  </span>
                </div>

                {/* Content preview & Stamp */}
                <div className="flex items-start gap-3.5 mb-3.5">
                  {isImage && dossier.inputPreview ? (
                    <div className="w-16 h-16 shrink-0 bg-[#0B0E14] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-0.5">
                      <img
                        src={dossier.inputPreview}
                        alt="Case Thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 shrink-0 bg-[#0B0E14] border border-white/5 rounded-xl flex items-center justify-center text-slate-500">
                      <FileText className="w-6 h-6 text-slate-400" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <RubberStamp verdict={dossier.verdict} lang={lang} size="small" />
                    </div>
                    <p className="text-xs text-slate-300 font-sans-body line-clamp-2 leading-relaxed">
                      {dossier.summary}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="border-t border-white/5 pt-3 flex items-center justify-between font-sans-body">
                  <span className="text-xs text-slate-400">
                    {lang === 'ar' ? 'الموثوقية:' : 'Trust:'} <strong className="text-white font-mono-dossier">{dossier.trustScore}%</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        playClickSound();
                        onDeleteCase(dossier.caseId);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer rounded-lg hover:bg-white/5"
                      title={t.btnDeleteCase}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        playPaperRustleSound();
                        onOpenCase(dossier);
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors rounded-lg shadow-xs"
                    >
                      <span>{t.btnViewDossier}</span>
                      <ExternalLink className="w-3 h-3 text-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
