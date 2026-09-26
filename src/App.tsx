import React, { useState, useEffect, useRef, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DossierReport, VigilanceState, ActivePage, DetectiveRankId } from './types';
import { Language, translations } from './translations';
import Header from './components/Header';
import RubberStamp from './components/RubberStamp';
import TrustGauge from './components/TrustGauge';
import EvidenceBoard from './components/EvidenceBoard';
import LoadingInvestigation from './components/LoadingInvestigation';
import DossierResultView from './components/DossierResultView';
import CaseArchiveView from './components/CaseArchiveView';
import AboutView from './components/AboutView';
import Footer from './components/Footer';
import ExifMetadataInspector from './components/ExifMetadataInspector';
import { extractImageExif, ParsedExifData } from './utils/exifParser';
import {
  playCameraShutterSound,
  playSuspiciousAlertSound,
  playAuthenticChimeSound,
  playSuccessChime,
  playPaperRustleSound,
  playClickSound,
  playTypewriterKeystroke,
} from './utils/audioEffects';
import {
  Image as ImageIcon,
  FileText,
  Upload,
  Link as LinkIcon,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Search,
  Shield,
  ShieldCheck,
  Activity,
  Lock,
  FileSearch,
  Camera,
  Crosshair,
  ClipboardCheck,
  Scan,
  Eye,
  Cpu,
  Layers,
  CheckCircle2,
} from 'lucide-react';

const STORAGE_VIGILANCE_KEY = 'mikshaf_vigilance';
const STORAGE_CASES_KEY = 'mikshaf_cases';
const STORAGE_LANG_KEY = 'mikshaf_lang';
const MAX_ARCHIVE_LIMIT = 30; // Rolling LRU limit to prevent storage exhaustion

/**
 * Creates an ultra-compact micro-thumbnail (max 100x100px WebP at 50% quality)
 * to prevent localStorage quota exhaustion crashes.
 */
async function createMicroThumbnail(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        const maxDim = 100;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, w);
        canvas.height = Math.max(1, h);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          try {
            resolve(canvas.toDataURL('image/webp', 0.5));
            return;
          } catch {
            resolve(canvas.toDataURL('image/jpeg', 0.5));
            return;
          }
        }
        resolve('');
      };
      img.onerror = () => resolve('');
      img.src = dataUrl;
    } catch {
      resolve('');
    }
  });
}

// Safe Storage Helpers to prevent SecurityError exceptions on Safari / cross-origin iframes
function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch {
    // Cross-origin iframe or private browsing restrictions
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // Cross-origin iframe or private browsing restrictions
  }
}

export default function App() {
  // Language & Direction state
  const [lang, setLang] = useState<Language>(() => {
    const saved = safeGetItem(STORAGE_LANG_KEY);
    return saved === 'en' ? 'en' : 'ar';
  });

  const t = translations[lang];

  // Navigation state
  const [activePage, setActivePage] = useState<ActivePage>('investigator');

  // Investigator tab: 'image' or 'text'
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');

  // Input states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedExif, setSelectedExif] = useState<ParsedExifData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [textInput, setTextInput] = useState('');

  // Processing & result states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentDossier, setCurrentDossier] = useState<DossierReport | null>(null);
  const [pastedToast, setPastedToast] = useState(false);

  // Archive & Vigilance state
  const [casesArchive, setCasesArchive] = useState<DossierReport[]>(() => {
    try {
      const saved = safeGetItem(STORAGE_CASES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [vigilance, setVigilance] = useState<VigilanceState>(() => {
    try {
      const saved = safeGetItem(STORAGE_VIGILANCE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      points: 25,
      totalCases: 0,
      authenticCount: 0,
      fakeCount: 0,
      uncertainCount: 0,
      rankId: 'rookie',
    };
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync lang & direction to DOM
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    safeSetItem(STORAGE_LANG_KEY, lang);
  }, [lang]);

  // Persist Vigilance State
  useEffect(() => {
    try {
      safeSetItem(STORAGE_VIGILANCE_KEY, JSON.stringify(vigilance));
    } catch (e) {
      console.warn('[Storage Error] Could not persist vigilance points:', e);
    }
  }, [vigilance]);

  // Persist Cases Archive safely with LRU discipline
  useEffect(() => {
    try {
      safeSetItem(STORAGE_CASES_KEY, JSON.stringify(casesArchive.slice(0, MAX_ARCHIVE_LIMIT)));
    } catch (e) {
      console.warn('[Storage Error] localStorage quota exceeded, trimming archive:', e);
      // Fallback: trim to top 10 if quota exceeded
      try {
        safeSetItem(STORAGE_CASES_KEY, JSON.stringify(casesArchive.slice(0, 10)));
      } catch {
        // Ignore if still failing
      }
    }
  }, [casesArchive]);

  // Determine detective rank based on points
  const calculateRank = (points: number): DetectiveRankId => {
    if (points >= 500) return 'chief';
    if (points >= 250) return 'master';
    if (points >= 100) return 'vigilant';
    return 'rookie';
  };

  // Add vigilance reward upon finishing an investigation
  const awardVigilancePoints = (verdict: 'authentic' | 'fake' | 'uncertain') => {
    setVigilance((prev) => {
      const newPoints = prev.points + 25;
      const newTotal = prev.totalCases + 1;
      const authenticCount = verdict === 'authentic' ? prev.authenticCount + 1 : prev.authenticCount;
      const fakeCount = verdict === 'fake' ? prev.fakeCount + 1 : prev.fakeCount;
      const uncertainCount = verdict === 'uncertain' ? prev.uncertainCount + 1 : prev.uncertainCount;
      const newRank = calculateRank(newPoints);

      return {
        points: newPoints,
        totalCases: newTotal,
        authenticCount,
        fakeCount,
        uncertainCount,
        rankId: newRank,
      };
    });
  };

  // File selection with client-side EXIF inspection & memory downscaling
  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage(lang === 'ar' ? 'يرجى اختيار ملف صورة صالح (JPG, PNG, WEBP)' : 'Please select a valid image file (JPG, PNG, WEBP)');
      return;
    }
    setErrorMessage(null);
    setCurrentDossier(null);
    setSelectedFile(file);

    // Extract raw EXIF metadata client-side immediately via exifreader
    try {
      const parsedExif = await extractImageExif(file);
      setSelectedExif(parsedExif);
    } catch (exifErr) {
      console.warn('[EXIF Extraction Warning]:', exifErr);
      setSelectedExif(null);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;

      // Downscale step-wise (maximum 1600px along longest axis) to protect mobile iOS Safari memory
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedUrl = canvas.toDataURL('image/jpeg', 0.9);
            setPreviewUrl(optimizedUrl);
            playCameraShutterSound();
            return;
          }
        }
        setPreviewUrl(rawDataUrl);
        playCameraShutterSound();
      };
      img.onerror = () => {
        setPreviewUrl(rawDataUrl);
        playCameraShutterSound();
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  // Clipboard Paste Handler (Ctrl + V / Cmd + V) for instant image inspection
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Only process when in the main investigator view on the image tab, and not currently running or viewing result
      if (activePage !== 'investigator' || activeTab !== 'image' || isLoading || currentDossier) {
        return;
      }

      // 1. Try clipboard files list
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.startsWith('image/')) {
            e.preventDefault();
            handleFile(file);
            setPastedToast(true);
            const timer = setTimeout(() => setPastedToast(false), 3500);
            return;
          }
        }
      }

      // 2. Try clipboard items list (e.g. copied screenshots or web images)
      const items = e.clipboardData?.items;
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            const pastedFile = item.getAsFile();
            if (pastedFile) {
              e.preventDefault();
              handleFile(pastedFile);
              setPastedToast(true);
              const timer = setTimeout(() => setPastedToast(false), 3500);
              return;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [activePage, activeTab, isLoading, currentDossier]);

  // Run Forensic Investigation Request
  const handleStartInvestigation = async () => {
    playClickSound();
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentDossier(null);

    try {
      let payload: any = {
        lang,
      };

      if (activeTab === 'image') {
        if (!selectedFile || !previewUrl) {
          throw new Error(lang === 'ar' ? 'يرجى اختيار صورة أولاً' : 'Please select an image first');
        }
        payload.type = 'image';
        payload.imageBase64 = previewUrl;
        payload.mimeType = selectedFile.type || 'image/jpeg';
      } else {
        if (!textInput.trim() || textInput.trim().length < 10) {
          throw new Error(
            lang === 'ar'
              ? 'يرجى إدخال نص أو رابط لا يقل عن 10 أحرف'
              : 'Please enter at least 10 characters of text or a valid URL'
          );
        }
        payload.type = 'text';
        payload.text = textInput.trim();
      }

      // Execute with automatic retry and strict timeout protection to prevent hanging requests
      let response: Response | null = null;
      let data: any = null;
      let lastFetchError: any = null;

      for (let attempt = 1; attempt <= 2; attempt++) {
        const controller = new AbortController();
        const timeoutDuration = 35000; // 35 seconds per attempt
        const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

        try {
          response = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          // Gracefully parse JSON response
          let parsedJson: any = null;
          try {
            parsedJson = await response.json();
          } catch {
            parsedJson = null;
          }

          data = parsedJson;

          if (response.ok && data && !data.error) {
            lastFetchError = null;
            clearTimeout(timeoutId);
            break;
          }

          const serverErrorMsg = data?.error || (
            response.status === 504 || response.status === 408
              ? (lang === 'ar' ? 'انتهت مهلة استجابة السيرفر الجنائي (Gateway Timeout).' : 'Forensic gateway request timed out.')
              : (lang === 'ar' ? 'تعذر إتمام الفحص في المحاولة الأولى، جاري المعالجة الاحتياطية...' : 'Initial attempt inconclusive, running fallback verification...')
          );
          lastFetchError = new Error(serverErrorMsg);
        } catch (fetchErr: any) {
          if (fetchErr.name === 'AbortError' || controller.signal.aborted) {
            lastFetchError = new Error(
              lang === 'ar'
                ? 'استغرقت عملية التحقيق الجنائي وقتاً أطول من المتوقع (انتهت المهلة). يرجى التحقق من الاتصال وإعادة المحاولة.'
                : 'The forensic investigation request timed out. Please check your connection and try again.'
            );
          } else {
            lastFetchError = fetchErr;
          }
        } finally {
          clearTimeout(timeoutId);
        }

        if (attempt < 2) {
          // Brief pause before transparent retry
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
      }

      if (!response || !response.ok || !data || data.error || lastFetchError) {
        throw (
          lastFetchError ||
          new Error(data?.error || (lang === 'ar' ? 'حدث خطأ أثناء إجراء التحقيق الجنائي، حاول مرة أخرى.' : 'Investigation failed'))
        );
      }

      const dossierResult: DossierReport = {
        ...data,
        inputPreview: activeTab === 'image' ? previewUrl! : undefined,
        inputTitle:
          activeTab === 'image'
            ? selectedFile?.name
            : textInput.slice(0, 60) + (textInput.length > 60 ? '...' : ''),
        exifData: selectedExif,
      };

      setCurrentDossier(dossierResult);
      awardVigilancePoints(dossierResult.verdict);

      // Play tailored forensic audio cue
      if (dossierResult.verdict === 'fake') {
        playSuspiciousAlertSound();
      } else if (dossierResult.verdict === 'authentic') {
        playAuthenticChimeSound();
      } else {
        playSuccessChime();
      }

      // Prepare lightweight archive item with micro-thumbnail to prevent localStorage quota crash
      let archiveThumb = dossierResult.inputPreview;
      if (archiveThumb && archiveThumb.startsWith('data:')) {
        archiveThumb = await createMicroThumbnail(archiveThumb);
      }

      const archiveItem: DossierReport = {
        ...dossierResult,
        inputPreview: archiveThumb,
      };

      // Prepend to archive with rolling LRU limit
      setCasesArchive((prev) => [archiveItem, ...prev.slice(0, MAX_ARCHIVE_LIMIT - 1)]);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err?.message ||
          (lang === 'ar'
            ? 'حدث خطأ أثناء إجراء التحقيق الجنائي، حاول مرة أخرى.'
            : 'An error occurred during forensic investigation. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Sample tests for quick evaluation
  const handleLoadSample = (sampleType: 'real-news' | 'fake-news' | 'sample-image' | 'real-image') => {
    setCurrentDossier(null);
    setErrorMessage(null);

    if (sampleType === 'sample-image') {
      setActiveTab('image');
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const bgGrad = ctx.createRadialGradient(320, 280, 50, 320, 320, 400);
        bgGrad.addColorStop(0, '#38bdf8');
        bgGrad.addColorStop(0.5, '#1e293b');
        bgGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 640, 640);

        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(320, 260, 110, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(320, 500, 190, 130, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#2563eb';
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(285, 255, 14, 0, Math.PI * 2);
        ctx.arc(355, 255, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(282, 251, 5, 0, Math.PI * 2);
        ctx.arc(352, 251, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXHIBIT: SYNTHETIC AI PORTRAIT AUDIT', 320, 580);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setPreviewUrl(dataUrl);
      setSelectedFile(new File(['sample_portrait'], 'sample_ai_portrait.jpg', { type: 'image/jpeg' }));
      setSelectedExif({
        hasHardwareExif: false,
        isAiToolFlagged: true,
        aiFlagsDescription: 'تم رصد تجريد بيانات المستشعر ونمط التوليد الاصطناعي',
        rawDetails: {},
      });
      playCameraShutterSound();
    } else if (sampleType === 'real-image') {
      setActiveTab('image');
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Natural landscape gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 300);
        skyGrad.addColorStop(0, '#60a5fa');
        skyGrad.addColorStop(1, '#bfdbfe');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 640, 300);

        // Ground
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 300, 640, 180);

        // Sun with natural flare
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(100, 100, 45, 0, Math.PI * 2);
        ctx.fill();

        // Natural mountains
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(150, 300);
        ctx.lineTo(280, 140);
        ctx.lineTo(410, 300);
        ctx.fill();

        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(330, 300);
        ctx.lineTo(460, 170);
        ctx.lineTo(590, 300);
        ctx.fill();

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXHIBIT: NATURAL SCENIC PHOTOGRAPHY', 320, 450);
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setPreviewUrl(dataUrl);
      setSelectedFile(new File(['sample_landscape'], 'sample_natural_photo.jpg', { type: 'image/jpeg' }));
      setSelectedExif({
        make: 'Sony',
        model: 'ILCE-7RM5 (Alpha 7R V)',
        lensModel: 'FE 24-70mm F2.8 GM II',
        focalLength: '35mm',
        fNumber: 'f/4.0',
        exposureTime: '1/250s',
        iso: '100',
        hasHardwareExif: true,
        isAiToolFlagged: false,
        rawDetails: {},
      });
      playCameraShutterSound();
    } else if (sampleType === 'fake-news') {
      setActiveTab('text');
      setTextInput(
        lang === 'ar'
          ? 'عاجل وحصري: اكتشاف كائن فضائي حي مدفون تحت أهرامات الجيزة يعود تاريخه لمليون عام! مصادر غير معلنة تؤكد إغلاق المجال الجوي بالكامل وتعتيم إعلامي دولي لحين الانتهاء من فحص المركبة الفضائية المخبأة!'
          : 'BREAKING: Secret archaeological expedition excavates live extraterrestrial bio-form inside ancient tomb! Unnamed whistleblowers claim world governments have issued an emergency blackout to suppress footage of advanced alien artifacts!'
      );
      playTypewriterKeystroke();
    } else if (sampleType === 'real-news') {
      setActiveTab('text');
      setTextInput(
        lang === 'ar'
          ? 'أعلنت وكالة الفضاء الدولية ناسا بالتعاون مع وكالة الفضاء الأوروبية عن التقاط تلسكوب جيمس ويب الفضائي صوراً جديدة بالأشعة تحت الحمراء القريبة لمجرة "ميسييه 51"، كاشفة عن تفرعات وتوزيعات الغبار الكوني في أذرعها الحلزونية بدقة غير مسبوقة.'
          : 'NASA in international collaboration with ESA and CSA has published high-resolution near-infrared observations of spiral galaxy M51 captured by the James Webb Space Telescope, revealing intricate cosmic dust filaments and active star-forming clusters.'
      );
      playTypewriterKeystroke();
    }
  };

  const handleResetInvestigation = () => {
    playPaperRustleSound();
    setCurrentDossier(null);
    setErrorMessage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedExif(null);
    setTextInput('');
  };

  // Detect URL in text
  const isUrlInText = /https?:\/\/[^\s]+/i.test(textInput);

  return (
    <div className="min-h-screen flex flex-col font-sans-body bg-[#0B0E14] text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <Header
        lang={lang}
        onLanguageChange={(newLang) => setLang(newLang)}
        activePage={activePage}
        onPageChange={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        vigilance={vigilance}
        archiveCount={casesArchive.length}
      />

      <main className="flex-1">
        {/* VIEW 1: Case Archive */}
        {activePage === 'archive' && (
          <CaseArchiveView
            cases={casesArchive}
            lang={lang}
            onOpenCase={(dossier) => {
              setCurrentDossier(dossier);
              setActivePage('investigator');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDeleteCase={(caseId) => {
              setCasesArchive((prev) => prev.filter((c) => c.caseId !== caseId));
            }}
            onClearArchive={() => {
              setCasesArchive([]);
            }}
          />
        )}

        {/* VIEW 2: About / Charter */}
        {activePage === 'about' && <AboutView lang={lang} />}

        {/* VIEW 3: Main Investigator Tool */}
        {activePage === 'investigator' && (
          <div className="max-w-5xl mx-auto pt-1 sm:pt-3 pb-12 px-4">
            {/* Clipboard Paste Floating Feedback Notification */}
            <AnimatePresence>
              {pastedToast && (
                <motion.div
                  initial={{ opacity: 0, y: -16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.95 }}
                  className="fixed top-18 left-1/2 -translate-x-1/2 z-50 bg-[#121622] border border-amber-500/50 text-amber-300 px-4 py-2.5 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex items-center gap-2.5 text-xs sm:text-sm font-sans-body font-semibold pointer-events-none"
                >
                  <ClipboardCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t.pasteSuccessToast}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* If Dossier is showing, present the official case file */}
            {currentDossier ? (
              <DossierResultView
                dossier={currentDossier}
                lang={lang}
                onNewInvestigation={handleResetInvestigation}
              />
            ) : (
              <>
                {/* Clean Hero Title & Investigation Unit Header */}
                <div className="text-center mb-3 sm:mb-4">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-sans-body mb-1.5">
                    <span className="text-amber-400 font-medium">
                      {lang === 'ar' ? 'منصة التحقيق الجنائي الرقمي' : 'Digital Forensics Bureau'}
                    </span>
                    <span aria-hidden="true" className="text-white/20">·</span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {lang === 'ar' ? 'المختبر نشط' : 'Lab Active'}
                    </span>
                  </div>
                  <h1 className="font-serif-vintage text-2xl sm:text-3xl font-extrabold text-white mb-1.5">
                    {t.appName}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-sans-body leading-relaxed mb-3">
                    {t.tagline}
                  </p>

                  {/* Social Proof & Trust Strip (Capsule Indicators) */}
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 pt-1 font-sans-body">
                    <div className="bg-[#111622] border border-white/5 px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-300 shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-medium">{t.trustStripAccuracy}</span>
                    </div>
                    <div className="bg-[#111622] border border-white/5 px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-300 shadow-xs">
                      <Activity className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="font-medium">{t.trustStripCount}</span>
                    </div>
                    <div className="bg-[#111622] border border-white/5 px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs text-slate-300 shadow-xs">
                      <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="font-medium">{t.trustStripPrivacy}</span>
                    </div>
                  </div>
                </div>

                {/* Main Investigation Panel (Clean Minimalist Navy-Charcoal) */}
                <div className="bg-[#121622] border border-white/5 p-4 sm:p-6 rounded-2xl shadow-xl relative">
                  {/* Refined Segmented Tabs (Soft Neutral Dark) */}
                  <div className="bg-[#0B0E14] p-1 rounded-xl border border-white/5 flex gap-1 mb-4">
                    <button
                      onClick={() => {
                        playPaperRustleSound();
                        setActiveTab('image');
                        setErrorMessage(null);
                      }}
                      className={`flex-1 py-2 sm:py-2.5 px-4 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-medium ${
                        activeTab === 'image'
                          ? 'bg-white/10 text-white font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>{t.tabImage}</span>
                    </button>

                    <button
                      onClick={() => {
                        playPaperRustleSound();
                        setActiveTab('text');
                        setErrorMessage(null);
                      }}
                      className={`flex-1 py-2 sm:py-2.5 px-4 rounded-lg text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer font-medium ${
                        activeTab === 'text'
                          ? 'bg-white/10 text-white font-semibold shadow-xs'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>{t.tabTextUrl}</span>
                    </button>
                  </div>

                  {/* Guidance Information Strip */}
                  <div className="bg-[#0B0E14] border border-white/5 rounded-xl p-2.5 sm:p-3 mb-4 text-xs text-slate-300 flex items-center gap-2.5 font-sans-body">
                    <Shield className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="leading-relaxed">{activeTab === 'image' ? t.tabImageDesc : t.tabTextUrlDesc}</span>
                  </div>

                  {/* TAB 1: Image Forensic Upload & Soft Gradient Dropzone */}
                  {activeTab === 'image' && (
                    <div className="space-y-4">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`rounded-2xl border-2 border-dashed p-5 sm:p-7 text-center cursor-pointer transition-all duration-200 relative overflow-hidden bg-gradient-to-b from-[#121622] to-[#0E121C] ${
                          isDragging
                            ? 'border-amber-400 bg-amber-500/10 scale-[1.005] shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                            : previewUrl
                            ? 'border-white/10 bg-[#0B0E14]'
                            : 'border-white/10 hover:border-amber-500/40 hover:bg-[#141926]'
                        }`}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />

                        {previewUrl ? (
                          <div className="space-y-3">
                            <div className="inline-block relative rounded-xl border border-white/10 p-1.5 bg-[#0B0E14] shadow-xl">
                              <img
                                src={previewUrl}
                                alt="Inspection exhibit"
                                className="max-h-60 max-w-full mx-auto object-contain rounded-lg"
                              />
                            </div>

                            <div className="text-xs text-slate-300 flex items-center justify-center gap-2 font-sans-body">
                              <span className="font-semibold text-slate-200">{t.fileSelected}</span>
                              <span className="truncate max-w-[200px] text-white font-medium">{selectedFile?.name}</span>
                              <span className="text-slate-400 font-mono-dossier">({((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB)</span>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                              }}
                              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 rounded-lg text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                              <span>{t.changeImage}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="py-3 sm:py-4 space-y-2">
                            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 text-amber-400 mx-auto flex items-center justify-center shadow-xs">
                              <Upload className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="font-serif-vintage text-base sm:text-lg font-bold text-white max-w-md mx-auto leading-snug">
                              {t.dragDropText}
                            </h3>
                            <p className="text-xs text-slate-400 font-sans-body">
                              {t.orBrowse}
                            </p>
                            <p className="text-[11px] text-slate-500 pt-0.5 font-sans-body">
                              {t.supportedFormats}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Client-Side EXIF Metadata Inspector Card (Shown immediately upon image selection) */}
                      {previewUrl && selectedExif && (
                        <div className="animate-in fade-in duration-200">
                          <ExifMetadataInspector exif={selectedExif} lang={lang} />
                        </div>
                      )}

                      {/* Primary Action Button (Amber Accent) */}
                      <button
                        onClick={handleStartInvestigation}
                        disabled={!selectedFile || isLoading}
                        className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)]"
                      >
                        <FileSearch className="w-5 h-5 text-slate-950" />
                        <span>{t.btnAnalyzeImage}</span>
                      </button>
                    </div>
                  )}

                  {/* TAB 2: Text & URL Fact-Check */}
                  {activeTab === 'text' && (
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="font-serif-vintage font-bold text-sm text-white">
                            {t.inputLabel}
                          </label>
                          <span className="font-mono-dossier text-[11px] text-slate-400">
                            {textInput.length} {lang === 'ar' ? 'حرف' : 'chars'} · {textInput.trim() ? textInput.trim().split(/\s+/).length : 0} {lang === 'ar' ? 'كلمة' : 'words'}
                          </span>
                        </div>
                        <div className="relative">
                          <textarea
                            rows={5}
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            placeholder={t.inputPlaceholder}
                            className="w-full p-4 bg-[#0B0E14] border border-white/10 rounded-xl font-sans-body text-xs sm:text-sm leading-relaxed text-slate-100 focus:outline-none focus:border-amber-400/70 focus:ring-1 focus:ring-amber-400/20 transition-all placeholder:text-slate-500"
                          />
                        </div>

                        {/* URL detection notification */}
                        {isUrlInText && (
                          <div className="mt-2.5 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs font-sans-body flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{t.urlDetectedNotice}</span>
                          </div>
                        )}
                      </div>

                      {/* Primary Action Button (Amber Accent) */}
                      <button
                        onClick={handleStartInvestigation}
                        disabled={!textInput.trim() || isLoading}
                        className="w-full bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-bold text-sm sm:text-base py-3.5 px-6 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)]"
                      >
                        <FileSearch className="w-5 h-5 text-slate-950" />
                        <span>{t.btnAnalyzeText}</span>
                      </button>
                    </div>
                  )}

                  {/* Quick Test Samples */}
                  <div className="mt-5 pt-4 border-t border-white/5 text-center">
                    <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-center gap-1.5 font-sans-body">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.quickSamplesTitle}</span>
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-sans-body">
                      <button
                        type="button"
                        onClick={() => handleLoadSample('fake-news')}
                        className="bg-[#0B0E14] hover:bg-white/5 text-rose-300 border border-rose-500/20 rounded-lg font-medium px-3 py-1.5 cursor-pointer transition-colors"
                      >
                        ⚡ {t.sampleFakeNews}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadSample('real-news')}
                        className="bg-[#0B0E14] hover:bg-white/5 text-emerald-300 border border-emerald-500/20 rounded-lg font-medium px-3 py-1.5 cursor-pointer transition-colors"
                      >
                        ✓ {t.sampleRealNews}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadSample('sample-image')}
                        className="bg-[#0B0E14] hover:bg-white/5 text-slate-300 border border-white/10 rounded-lg font-medium px-3 py-1.5 cursor-pointer transition-colors"
                      >
                        📷 {t.sampleAiPhoto}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLoadSample('real-image')}
                        className="bg-[#0B0E14] hover:bg-white/5 text-amber-300 border border-amber-500/20 rounded-lg font-medium px-3 py-1.5 cursor-pointer transition-colors"
                      >
                        🌿 {t.sampleRealPhoto}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Loading Sequence */}
                {isLoading && <LoadingInvestigation lang={lang} />}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 my-5 text-rose-200 shadow-lg animate-in fade-in duration-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-sm mb-1 text-rose-200">
                            {lang === 'ar' ? 'تنبيه التحقيق' : 'Investigation Alert'}
                          </h4>
                          <p className="text-xs sm:text-sm font-sans-body text-rose-200/90">{errorMessage}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleStartInvestigation}
                        className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-1.5 rounded-lg font-semibold text-xs cursor-pointer transition-colors shadow-xs"
                      >
                        {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive Forensic Inspection Pillars (How It Works & Capabilities) */}
                <section className="mt-10 pt-8 border-t border-white/5">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-amber-400 text-xs font-medium mb-2.5">
                      <Scan className="w-3.5 h-3.5" />
                      <span>{lang === 'ar' ? 'ركائز التحري الميداني' : 'Forensic Investigation Pillars'}</span>
                    </div>
                    <h3 className="font-serif-vintage text-xl sm:text-2xl font-bold text-white mb-2">
                      {t.forensicsPillarsTitle}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-sans-body leading-relaxed">
                      {t.forensicsPillarsSubtitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                    {/* Pillar 1: Error Level Analysis */}
                    <div className="rounded-2xl bg-[#111622] border border-white/5 p-5 hover:border-amber-500/25 transition-all duration-200 group flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                          <Scan className="w-5 h-5 text-amber-400" />
                        </div>
                        <div className="text-[11px] font-mono-dossier text-amber-400/80 font-semibold mb-1">
                          {t.pillar1Tag}
                        </div>
                        <h4 className="font-serif-vintage font-bold text-sm sm:text-base text-white mb-2">
                          {t.pillar1Title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 font-sans-body leading-relaxed">
                          {t.pillar1Desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-sans-body">
                        <span>{lang === 'ar' ? 'كشف تفاوت البيكسل' : 'PRNU Sensor Noise'}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>

                    {/* Pillar 2: Optical & Lighting Physics */}
                    <div className="rounded-2xl bg-[#111622] border border-white/5 p-5 hover:border-sky-500/25 transition-all duration-200 group flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                          <Eye className="w-5 h-5 text-sky-400" />
                        </div>
                        <div className="text-[11px] font-mono-dossier text-sky-400/80 font-semibold mb-1">
                          {t.pillar2Tag}
                        </div>
                        <h4 className="font-serif-vintage font-bold text-sm sm:text-base text-white mb-2">
                          {t.pillar2Title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 font-sans-body leading-relaxed">
                          {t.pillar2Desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-sans-body">
                        <span>{lang === 'ar' ? 'تطابق الظلال والبصريات' : 'Optical Coherence'}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>

                    {/* Pillar 3: Hardware Sensor & EXIF */}
                    <div className="rounded-2xl bg-[#111622] border border-white/5 p-5 hover:border-emerald-500/25 transition-all duration-200 group flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3.5 group-hover:scale-105 transition-transform">
                          <Camera className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div className="text-[11px] font-mono-dossier text-emerald-400/80 font-semibold mb-1">
                          {t.pillar3Tag}
                        </div>
                        <h4 className="font-serif-vintage font-bold text-sm sm:text-base text-white mb-2">
                          {t.pillar3Title}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-400 font-sans-body leading-relaxed">
                          {t.pillar3Desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-sans-body">
                        <span>{lang === 'ar' ? 'استخراج الميتا داتا والعتاد' : 'Camera EXIF Pipeline'}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer
        lang={lang}
        onPageChange={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
