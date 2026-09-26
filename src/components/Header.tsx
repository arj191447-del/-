import React, { useState, useEffect } from 'react';
import { Award, FileSearch, Archive, Info, Languages, Shield, X, Volume2, VolumeX, SlidersHorizontal } from 'lucide-react';
import { ActivePage, VigilanceState } from '../types';
import { Language, translations } from '../translations';
import { getSoundEnabled, setSoundEnabled, playClickSound } from '../utils/audioEffects';
import SoundFxControlModal from './SoundFxControlModal';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (newLang: Language) => void;
  activePage: ActivePage;
  onPageChange: (page: ActivePage) => void;
  vigilance: VigilanceState;
  archiveCount: number;
}

export default function Header({
  lang,
  onLanguageChange,
  activePage,
  onPageChange,
  vigilance,
  archiveCount,
}: HeaderProps) {
  const [showVigilanceModal, setShowVigilanceModal] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(getSoundEnabled());
  }, []);

  const handleToggleSound = (enabled: boolean) => {
    setSoundOn(enabled);
    setSoundEnabled(enabled);
    if (enabled) playClickSound();
  };

  const t = translations[lang];
  const currentRank = t.ranks[vigilance.rankId] || t.ranks.rookie;

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'ar' ? 'en' : 'ar';
    onLanguageChange(nextLang);
  };

  return (
    <>
      <header className="bg-[#0B0E14]/90 backdrop-blur-md border-b border-white/5 sticky top-0 z-30 no-print transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          {/* Right (in RTL): Brand Logo & Name */}
          <div
            onClick={() => onPageChange('investigator')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 bg-[#121622] border border-white/10 rounded-xl flex items-center justify-center text-amber-400 shadow-sm group-hover:border-amber-500/40 transition-colors">
              <FileSearch className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif-vintage text-xl sm:text-2xl font-bold text-white">
                {t.appName}
              </span>
              <span className="text-[10px] font-mono-dossier text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/5 font-semibold">
                {t.appEnglishName}
              </span>
            </div>
          </div>

          {/* Center: Main Navigation Tabs (Neutral Dark Modern Segmented Control) */}
          <nav className="flex items-center gap-1 bg-[#121622] p-1 rounded-xl border border-white/5">
            <button
              onClick={() => onPageChange('investigator')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                activePage === 'investigator'
                  ? 'bg-white/10 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>{t.navInvestigate}</span>
            </button>

            <button
              onClick={() => onPageChange('archive')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-1.5 relative cursor-pointer font-medium ${
                activePage === 'archive'
                  ? 'bg-white/10 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{t.navArchive}</span>
              {archiveCount > 0 && (
                <span className="bg-rose-500/80 text-white font-mono-dossier text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {archiveCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onPageChange('about')}
              className={`px-3 sm:px-3.5 py-1.5 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer font-medium ${
                activePage === 'about'
                  ? 'bg-white/10 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>{t.navAbout}</span>
            </button>
          </nav>

          {/* Left (in RTL): Grouped Controls Capsule (Vigilance, Sound, Language) */}
          <div className="flex items-center gap-1.5 bg-[#121622] p-1 rounded-xl border border-white/5">
            {/* Vigilance Score Badge */}
            <button
              onClick={() => setShowVigilanceModal(true)}
              className="px-2.5 py-1.5 hover:bg-white/5 rounded-lg flex items-center gap-2 text-xs cursor-pointer text-slate-200 transition-colors"
              title={t.vigilanceTitle}
            >
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="text-start leading-tight hidden sm:block">
                <span className="font-semibold block text-[11px] text-slate-200">
                  {currentRank.title}
                </span>
                <span className="text-[10px] text-amber-400 font-mono-dossier">
                  {vigilance.points} {t.pts}
                </span>
              </div>
            </button>

            <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />

            {/* Sound Toggle */}
            <button
              onClick={() => handleToggleSound(!soundOn)}
              className={`p-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer transition-colors ${
                soundOn
                  ? 'text-slate-400 hover:text-white hover:bg-white/5'
                  : 'text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
              }`}
              title={soundOn ? (lang === 'ar' ? 'كتم الصوت' : 'Mute Sound') : (lang === 'ar' ? 'تفعيل الصوت' : 'Enable Sound')}
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-slate-300" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            </button>

            {/* Sound Studio Options Modal Button */}
            <button
              onClick={() => {
                playClickSound();
                setShowSoundModal(true);
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-colors hidden md:flex items-center justify-center"
              title={lang === 'ar' ? 'مؤثرات الصوت' : 'Audio Studio'}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-white/10" />

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="px-2 py-1 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Toggle Language (العربية / English)"
            >
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Vigilance Rank Information Modal (Modern Dark Theme) */}
      {showVigilanceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121622] max-w-lg w-full p-6 sm:p-7 rounded-2xl relative shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-150 text-white">
            <button
              onClick={() => setShowVigilanceModal(false)}
              className="absolute top-4 end-4 w-7 h-7 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-serif-vintage text-lg font-bold text-white">
                  {t.vigilanceModalTitle}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'ar' ? 'مستوى الخبرة وتدقيق المحتوى' : 'Forensic Proficiency Level'}
                </p>
              </div>
            </div>

            <p className="text-xs font-sans-body mb-5 text-slate-300 leading-relaxed bg-[#0B0E14] p-3 rounded-xl border border-white/5">
              {t.vigilanceModalDesc}
            </p>

            <div className="space-y-2 mb-5">
              {(['rookie', 'vigilant', 'master', 'chief'] as const).map((rKey) => {
                const rankInfo = t.ranks[rKey];
                const isCurrent = vigilance.rankId === rKey;
                return (
                  <div
                    key={rKey}
                    className={`rounded-xl p-3 border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-[#0B0E14] border-white/5 opacity-75'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <Shield className={`w-3.5 h-3.5 ${isCurrent ? 'text-amber-400' : 'text-slate-500'}`} />
                        <span className="font-bold text-xs text-white">
                          {rankInfo.title}
                        </span>
                        {isCurrent && (
                          <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-md font-bold">
                            {lang === 'ar' ? 'رتبتك الحالية' : 'Current Rank'}
                          </span>
                        )}
                      </div>
                      <span className="font-mono-dossier text-xs font-bold text-amber-400">
                        {rankInfo.threshold}+ {t.pts}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans-body">
                      {rankInfo.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#0B0E14] rounded-xl border border-white/5 p-3 mb-5 text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">{t.totalCasesLogged}</span>
                <span className="font-bold text-base text-slate-100 font-mono-dossier">{vigilance.totalCases}</span>
              </div>
              <div>
                <span className="text-emerald-400/90 block text-[10px]">{t.authenticFound}</span>
                <span className="font-bold text-base text-emerald-400 font-mono-dossier">{vigilance.authenticCount}</span>
              </div>
              <div>
                <span className="text-rose-400/90 block text-[10px]">{t.fakesUnmasked}</span>
                <span className="font-bold text-base text-rose-400 font-mono-dossier">{vigilance.fakeCount}</span>
              </div>
            </div>

            <button
              onClick={() => setShowVigilanceModal(false)}
              className="w-full bg-white/10 hover:bg-white/15 text-white font-medium py-2 rounded-xl text-xs cursor-pointer transition-colors"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* Sound Effects Interactive Studio Modal */}
      <SoundFxControlModal
        isOpen={showSoundModal}
        onClose={() => setShowSoundModal(false)}
        lang={lang}
        soundEnabled={soundOn}
        onSoundToggle={handleToggleSound}
      />
    </>
  );
}
