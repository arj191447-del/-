import React from 'react';
import {
  Volume2,
  VolumeX,
  X,
  Camera,
  Radio,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  Stamp,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import {
  getSoundEnabled,
  setSoundEnabled,
  playStampSound,
  playCameraShutterSound,
  playRadarPingSound,
  playSuspiciousAlertSound,
  playAuthenticChimeSound,
  playPaperRustleSound,
  playTypewriterKeystroke,
  playClickSound,
} from '../utils/audioEffects';
import { Language } from '../translations';

interface SoundFxControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
}

export default function SoundFxControlModal({
  isOpen,
  onClose,
  lang,
  soundEnabled,
  onSoundToggle,
}: SoundFxControlModalProps) {
  if (!isOpen) return null;
  const isArabic = lang === 'ar';

  const soundGallery = [
    {
      id: 'stamp',
      nameAr: 'ارتطام ختم القضية',
      nameEn: 'Rubber Stamp Impact',
      descAr: 'صوت ميكانيكي عميق ورضّي عند دمغ الحكم الرسمي على وثيقة القضية',
      descEn: 'Tactile mechanical thud when verdict is stamped on case dossier',
      icon: <Stamp className="w-4 h-4 text-rose-500" />,
      play: playStampSound,
    },
    {
      id: 'shutter',
      nameAr: 'شاتر كاميرا الأدلة',
      nameEn: 'Forensic Camera Shutter',
      descAr: 'نقرة مزدوجة لمرآة الغالق عند التقاط أو إدراج الحرز البصري',
      descEn: 'Dual-curtain mechanical click upon loading image evidence exhibit',
      icon: <Camera className="w-4 h-4 text-cyan-400" />,
      play: playCameraShutterSound,
    },
    {
      id: 'radar',
      nameAr: 'رادار المسح الرقمي',
      nameEn: 'Radar Spectrum Ping',
      descAr: 'تردد سونار تحليلي مستمر أثناء فحص خوارزميات البيكسلات',
      descEn: 'Acoustic frequency sonar ping during active multiscale analysis',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
      play: playRadarPingSound,
    },
    {
      id: 'suspicious',
      nameAr: 'تنبيه كشف التزييف',
      nameEn: 'Forgery Alarm Cue',
      descAr: 'نغمة إنذار جنائية حادة عند رصد Deepfake أو تلاعب بالذكاء الاصطناعي',
      descEn: 'Investigative warning cue when artificial synthesis is detected',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
      play: playSuspiciousAlertSound,
    },
    {
      id: 'authentic',
      nameAr: 'رنين توثيق الأصالة',
      nameEn: 'Authentic Harmonic Chime',
      descAr: 'توافق صوتي نقي ومطمئن عند ثبوت سلامة المحتوى وخلوه من الفبركة',
      descEn: 'Crystalline harmonic confirmation chord when verified authentic',
      icon: <CheckCircle2 className="w-4 h-4 text-amber-400" />,
      play: playAuthenticChimeSound,
    },
    {
      id: 'paper',
      nameAr: 'حفيف الوثائق الجنائية',
      nameEn: 'Paper Dossier Rustle',
      descAr: 'حفيف ورقي ناعم عند فتح الشهادات الرسمية واستعراض الأرشيف',
      descEn: 'Crisp tactile paper rustle when unfolding reports or certificates',
      icon: <FileCheck className="w-4 h-4 text-indigo-400" />,
      play: playPaperRustleSound,
    },
    {
      id: 'typewriter',
      nameAr: 'الآلة الكاتبة الجنائية',
      nameEn: 'Forensic Typewriter Key',
      descAr: 'نقرات تدوين التقارير والمحاضر الأمنية أثناء استخلاص النتائج',
      descEn: 'Mechanical keystroke clicks when drafting conclusions',
      icon: <Keyboard className="w-4 h-4 text-slate-300" />,
      play: playTypewriterKeystroke,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121622] border border-white/10 max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white relative">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-[#0B0E14]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif-vintage text-base font-bold text-white">
                {isArabic ? 'استوديو المؤثرات الصوتية الجنائية' : 'Forensic Audio Synthesizer'}
              </h3>
              <p className="text-xs text-slate-400 font-sans-body">
                {isArabic
                  ? 'مؤثرات تفاعلية فورية مبنية ببرمجية Web Audio API'
                  : 'Synthesized zero-latency audio engine for tactical immersion'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Global Master Switch */}
        <div className="p-3.5 bg-[#0E121C] border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
            <span className="text-xs font-medium text-slate-200 font-sans-body">
              {isArabic ? 'تشغيل المؤثرات الصوتية' : 'Master Audio Immersion'}
            </span>
          </div>

          <button
            onClick={() => onSoundToggle(!soundEnabled)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
              soundEnabled
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            {soundEnabled
              ? isArabic
                ? 'مفعل'
                : 'ENABLED'
              : isArabic
              ? 'مكتوم'
                : 'MUTED'}
          </button>
        </div>

        {/* Sound Interactive Test Gallery */}
        <div className="p-4 sm:p-5 max-h-[380px] overflow-y-auto space-y-2.5">
          <div className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5 font-sans-body">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {isArabic
                ? 'اضغط للاستماع وتجربة كل مؤثر صوتي:'
                : 'Click to audition each sound effect:'}
            </span>
          </div>

          {soundGallery.map((snd) => (
            <div
              key={snd.id}
              className="p-3 bg-[#0B0E14] hover:bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#121622] border border-white/10 flex items-center justify-center shrink-0">
                  {snd.icon}
                </div>
                <div>
                  <h4 className="font-serif-vintage text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                    {isArabic ? snd.nameAr : snd.nameEn}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-sans-body line-clamp-1">
                    {isArabic ? snd.descAr : snd.descEn}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  snd.play();
                }}
                className="px-2.5 py-1 bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-slate-200 rounded-lg text-xs font-medium transition-all cursor-pointer border border-white/10 shrink-0"
              >
                {isArabic ? 'تجربة ▶' : 'Play ▶'}
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#0B0E14] border-t border-white/5 text-center text-xs text-slate-400 font-sans-body">
          {isArabic
            ? 'يتم توليد جميع الأصوات فيزيائياً بدون تحميل أي ملفات صوتية خارجية لضمان السرعة الفائقة.'
            : 'Synthesized locally in real-time via Web Audio API oscillators for instant response.'}
        </div>
      </div>
    </div>
  );
}
