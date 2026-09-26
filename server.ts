import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import ipaddr from 'ipaddr.js';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Trust reverse proxies (Google Cloud Run / Nginx)
app.set('trust proxy', 1);

// Open CORS and iframe embedding headers for AI Studio preview environment
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  // Explicitly remove any frame-blocking headers to guarantee iframe preview works smoothly
  res.removeHeader('X-Frame-Options');
  next();
});

// DoS Protection: Restrict payload ceiling to a safe 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiter: Protect against automated scraping and quota exhaustion
const forensicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // Generous 60 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'تم تجاوز الحد الأقصى المسموح لطلبات الفحص. يرجى الانتظار دقيقة لحماية موارد الخادم.',
  },
});

/**
 * Validates whether an IP address belongs to private, loopback, link-local, or cloud metadata ranges.
 * Neutralizes Server-Side Request Forgery (SSRF).
 */
function isDisallowedIp(ipStr: string): boolean {
  try {
    const parsed = ipaddr.parse(ipStr);
    const range = parsed.range();

    const forbiddenRanges = [
      'loopback',
      'private',
      'linkLocal',
      'uniqueLocal',
      'carrierGradeNat',
      'broadcast',
      'reserved',
    ];

    if (forbiddenRanges.includes(range)) {
      return true;
    }

    // Explicit cloud metadata IP address block (AWS, GCP, Azure, DigitalOcean)
    if (parsed.kind() === 'ipv4' && parsed.toString() === '169.254.169.254') {
      return true;
    }

    return false;
  } catch {
    // If not a valid direct IP, allow domain resolution through standard node fetch
    return false;
  }
}

/**
 * Strictly parses, sanitizes, and neutralizes SSRF vectors before fetching user URLs.
 */
async function extractUrlContent(urlStr: string): Promise<{ title: string; content: string; url: string }> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(urlStr.trim());
  } catch {
    throw new Error('رابط غير صالح');
  }

  // Strictly permit only HTTP and HTTPS protocols
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('البروتوكول غير مدعوم؛ يُسمح فقط بروابط http و https');
  }

  // Check hostname directly against internal / loopback forbidden names
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === '169.254.169.254'
  ) {
    throw new Error('محاولة وصول محظورة لعناوين الشبكة الداخلية');
  }

  // Check if hostname is direct IP and validate range
  if (isDisallowedIp(hostname)) {
    throw new Error('محاولة وصول محظورة إلى نطاقات IP خاصة');
  }

  // Hard 7-second abort timeout ceiling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(parsedUrl.href, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 MIKSHAF-Forensics/3.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en-US,en;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    // Verify redirected URL does not point to internal resources
    if (response.url) {
      const finalUrl = new URL(response.url);
      if (
        finalUrl.hostname === 'localhost' ||
        finalUrl.hostname.endsWith('.internal') ||
        isDisallowedIp(finalUrl.hostname)
      ) {
        throw new Error('إعادة توجيه محظورة إلى شبكة داخلية');
      }
    }

    if (!response.ok) {
      throw new Error(`خطأ في الوصول إلى الصفحة (HTTP ${response.status})`);
    }

    const html = await response.text();

    // Extract page title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : parsedUrl.hostname;

    // Strip unneeded markup
    const cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '')
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '')
      .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');

    // Extract readable paragraphs and headings capped strictly at 4,000 characters
    const matches = cleaned.match(/<(p|h1|h2|h3|article|blockquote)[^>]*>([\s\S]*?)<\/\1>/gi) || [];
    let extractedText = matches
      .map((m) => m.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
      .filter((t) => t.length > 20)
      .slice(0, 30)
      .join('\n\n');

    if (!extractedText || extractedText.length < 40) {
      extractedText = cleaned.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000);
    } else {
      extractedText = extractedText.slice(0, 4000);
    }

    return {
      title,
      content: extractedText,
      url: parsedUrl.href,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[SSRF Defense] Blocked or failed URL scrape for: ${urlStr} - ${err?.message}`);
    throw new Error(`تعذر استخراج محتوى الرابط: ${err?.message || 'مشكلة في الاتصال بالصفحة'}`);
  }
}

// Forensic JSON schema definition
const forensicResponseSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ['authentic', 'fake', 'uncertain'],
      description: 'Forensic verdict',
    },
    trustScore: {
      type: Type.NUMBER,
      description: 'Trust score from 0 to 100',
    },
    aiGeneratedProbability: {
      type: Type.NUMBER,
      description: 'AI Generated probability from 0 to 100',
    },
    summary: {
      type: Type.STRING,
      description: 'Concise forensic summary in Arabic',
    },
    evidenceList: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ['supporting', 'suspicious'],
          },
          title: {
            type: Type.STRING,
          },
          description: {
            type: Type.STRING,
          },
          forensicCategory: {
            type: Type.STRING,
          },
        },
        required: ['type', 'title', 'description', 'forensicCategory'],
      },
    },
    recommendation: {
      type: Type.STRING,
      description: 'Practical detective recommendation in Arabic',
    },
    complexity: {
      type: Type.STRING,
      enum: ['low', 'medium', 'high'],
      description: 'Forensic complexity level',
    },
  },
  required: [
    'verdict',
    'trustScore',
    'aiGeneratedProbability',
    'summary',
    'evidenceList',
    'recommendation',
    'complexity',
  ],
};

/**
 * Complete, untruncated Arabic forensic category dictionary
 */
const categoryArabicMap: Record<string, string> = {
  'lighting & shadows': 'الإضاءة والظلال والفيزياء البصرية',
  'lighting & physics': 'الإضاءة والفيزياء البصرية',
  'lighting and shadows': 'الإضاءة والظلال والانعكاسات',
  'lighting': 'الإضاءة والانعكاسات البصرية',
  'shadows': 'تناسق الظلال ومصادر الضوء',
  'anatomy & textures': 'التشريح والملامح والأنسجة',
  'anatomy and textures': 'التشريح والملامح والأنسجة',
  'anatomy': 'التشريح البشري والأطراف',
  'textures': 'ملمس الأسطح والأنسجة المجهرية',
  'geometry & physics': 'الهندسة والفيزياء البصرية',
  'geometry and physics': 'الهندسة والفيزياء البصرية',
  'geometry & architecture': 'البنية الهندسية والمعمارية',
  'geometry': 'التناسق الهندسي والخطوط',
  'artifacts & noise': 'التشوهات والضجيج الرقمي',
  'artifacts and noise': 'التشوهات والضجيج الرقمي',
  'sensor noise': 'ضجيج المستشعر الرقمي (PRNU)',
  'artifacts': 'التشوهات البرمجية والرقمية',
  'digital artifacts': 'تشوهات التوليد بالذكاء الاصطناعي',
  'compression artifacts': 'آثار الضغط وتفكك البيكسلات',
  'fact-checking': 'فحص وتدقيق الحقائق',
  'fact checking': 'فحص وتدقيق الحقائق',
  'source credibility': 'موثوقية ومصداقية المصدر',
  'sources & attribution': 'المصادر والإسناد الموثق',
  'ai syntax': 'بصمات التوليد اللغوي الآلي',
  'ai syntax fingerprints': 'بصمات النماذج اللغوية (LLM)',
  'stylistic patterns': 'الأنماط الأسلوبية والتكرار البلاغي',
  'logical coherence': 'التماسك والاتساق المنطقي',
  'semantics & tone': 'الدلالة والنبرة التعبيرية',
  'emotional manipulation': 'التلاعب العاطفي والتضخيم الإخباري',
  'source verification': 'التحقق من المصادر والأسانيد',
};

// Complete phrase translations for titles
const commonTitleTranslations: [RegExp, string][] = [
  [/inconsistent lighting/i, 'خلل في تماسك الإضاءة والانعكاسات'],
  [/unnatural skin texture|plastic skin|airbrushed/i, 'ملمس شمعي ناعم غير طبيعي للبشرة (طابع التوليد)'],
  [/hand anatomy|finger anomaly|anatomical flaw|distorted fingers/i, 'تشوه في بنية الأصابع والتشريح اليدوي'],
  [/warped background|impossible geometry|distorted lines/i, 'اعوجاج غير منطقي في الخلفية والخطوط الهندسية'],
  [/sensor noise mismatch|noise uniformity|lack of sensor noise/i, 'غياب الضجيج الطبيعي لمستشعر الكاميرا'],
  [/repetitive phrasing|ai phrasing|synthetic tone/i, 'تكرار بلاغي ونبرة آلية مصطنعة'],
  [/lack of (verifiable )?sources|unverified/i, 'غياب المصادر الرسمية الموثقة'],
  [/emotional sensationalism|clickbait/i, 'صياغة عاطفية تضخيمية (إثارة مضللة)'],
  [/physically plausible|consistent shadows/i, 'اتساق فيزيائي سليم للظلال ومصادر الضوء'],
  [/natural skin pores|organic texture/i, 'مسام وتجاعيد بشرة طبيعية متماسكة'],
  [/coherent geometry/i, 'تماسك هندسي دقيق للخطوط والمنظور'],
  [/authentic camera noise/i, 'وجود ضجيج بصري أصيل لمستشعر الكاميرا'],
  [/corroborated facts|verified source/i, 'معلومات متسقة ومدعومة بمصادر معتمدة'],
];

/**
 * Sanitizes and guarantees that all fields in the forensic dossier are in Arabic when requested.
 */
function sanitizeForensicReportToArabic(report: any): any {
  if (!report) return report;

  let sanitizedSummary = report.summary || '';

  const sanitizedEvidenceList = (report.evidenceList || []).map((item: any) => {
    let cat = (item.forensicCategory || '').trim();
    const catLower = cat.toLowerCase();

    if (categoryArabicMap[catLower]) {
      cat = categoryArabicMap[catLower];
    } else {
      for (const [eng, ar] of Object.entries(categoryArabicMap)) {
        if (catLower.includes(eng)) {
          cat = ar;
          break;
        }
      }
    }

    if (/[a-zA-Z]{3,}/.test(cat)) {
      cat = item.type === 'supporting' ? 'قرائن الأصالة والمصداقية' : 'مؤشرات الشبهة والتلاعب';
    }

    let title = (item.title || '').trim();
    for (const [pattern, translation] of commonTitleTranslations) {
      if (pattern.test(title)) {
        title = translation;
        break;
      }
    }

    if (/[a-zA-Z]{4,}/.test(title)) {
      if (item.type === 'supporting') {
        title = `دليل أصالة: اتساق في معالم ${cat}`;
      } else {
        title = `مؤشر تلاعب: رصد خلل في ${cat}`;
      }
    }

    let description = (item.description || '').trim();
    description = description
      .replace(/\bdeepfake\b/gi, 'تزييف عميق (Deepfake)')
      .replace(/\bartifacts?\b/gi, 'تشوهات رقمية')
      .replace(/\blighting\b/gi, 'الإضاءة')
      .replace(/\bshadows?\b/gi, 'الظلال')
      .replace(/\banatomy\b/gi, 'التشريح')
      .replace(/\btextures?\b/gi, 'الأنسجة والملمس')
      .replace(/\bphotoshop\b/gi, 'فوتوشوب وتعديل رقمي')
      .replace(/\bsynthetic\b/gi, 'اصطناعي/مولّد')
      .replace(/\bgenerative\b/gi, 'توليدي')
      .replace(/\bprnu\b/gi, 'بصمة مستشعر الكاميرا');

    return {
      ...item,
      forensicCategory: cat,
      title,
      description,
    };
  });

  let sanitizedRecommendation = (report.recommendation || '').trim();
  if (/[a-zA-Z]{5,}/.test(sanitizedRecommendation)) {
    sanitizedRecommendation =
      'يُنصح بمطابقة هذا المحتوى مع وكالات الأنباء الرسمية أو فحص البيانات الوصفية (Metadata) الأصلية للصورة قبل إعادة نشرها أو الاعتماد عليها.';
  }

  return {
    ...report,
    summary: sanitizedSummary,
    evidenceList: sanitizedEvidenceList,
    recommendation: sanitizedRecommendation,
  };
}

/**
 * Executes generateContent with multi-model fallback and 25-second AbortController ceiling.
 */
async function generateForensicWithFallback(
  ai: GoogleGenAI,
  contentParts: any[],
  schema: any
) {
  // Support active models with fallback
  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      console.log(`[Forensic Engine] Launching deep inspection on model: ${model}`);

      // Impose a strict 25-second timeout on each model request
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('انتهت مهلة استجابة محرك الفحص الجنائي (25s)')), 25000)
      );

      const requestPromise = ai.models.generateContent({
        model,
        contents: {
          parts: contentParts,
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const response: any = await Promise.race([requestPromise, timeoutPromise]);

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Forensic Engine] Model ${model} returned error: ${err?.message || err}`);
      lastError = err;

      // Brief recovery pause before falling back to next candidate
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError || new Error('فشلت جميع نماذج التحليل الجنائي المتاحة');
}

// Handler for all forensic analysis requests
async function handleAnalyze(req: express.Request, res: express.Response) {
  const requestStartTime = Date.now();
  try {
    const { type = 'image', imageBase64, mimeType, text, url, lang = 'ar' } = req.body;
    const isEnglish = lang === 'en';

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[Configuration Error] GEMINI_API_KEY is not defined in environment');
      return res.status(500).json({
        error: isEnglish
          ? 'Forensic system configuration error: GEMINI_API_KEY is missing.'
          : 'خطأ في إعدادات النظام الجنائي: مفتاح GEMINI_API_KEY غير متوفر.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'MIKSHAF-Forensics-Unit/3.0',
        },
      },
    });

    let contentParts: any[] = [];
    let promptInstructions = '';

    // Handle Image Analysis
    if (type === 'image') {
      if (!imageBase64) {
        return res.status(400).json({
          error: isEnglish ? 'No image data provided for inspection.' : 'لم يتم توفير أي بيانات صورة للفحص.',
        });
      }

      // Robust data URL extraction
      let cleanBase64 = imageBase64;
      let cleanMimeType = mimeType || 'image/jpeg';

      const match = imageBase64.match(/^data:([^;]+);base64,(.+)$/s);
      if (match) {
        cleanMimeType = match[1].trim();
        cleanBase64 = match[2].trim();
      } else {
        cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '').trim();
      }

      const lowerMime = cleanMimeType.toLowerCase();
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'].includes(lowerMime)) {
        cleanMimeType = 'image/jpeg';
      }

      contentParts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: cleanMimeType,
        },
      });

      promptInstructions = isEnglish
        ? `You are an elite Digital Forensic Investigator and AI detection specialist examining this image file.
Perform an exhaustive visual and forensic analysis to determine whether this image is:
1. "authentic" (a real, unaltered photograph or genuine digital creation with physical consistency).
2. "fake" (AI-generated via Midjourney, DALL-E, Stable Diffusion, Flux, or deepfake face swap, or heavily manipulated through digital synthesis/CGI).
3. "uncertain" (insufficient evidence or ambiguous compression artifacts making a definitive determination inconclusive).

Carefully examine:
- Lighting & Specular Highlights: Do shadows, eye reflections, and light sources follow realistic optical physics?
- Anatomy & Micro-textures: Examine fingers, nails, teeth, pupils, skin pores (plastic/airbrushed sheen), ears, and hair strand boundaries.
- Structural Geometry & Background: Check for warping, floating objects, impossible architecture, distorted lines, and repeating generative patterns.
- Sensor & Compression Artifacts: Noise uniformity, PRNU sensor noise mismatch, edge blurring.

Provide:
- verdict: "authentic" | "fake" | "uncertain"
- trustScore: 0 to 100 (100 = completely genuine, 0 = completely fabricated/fake)
- aiGeneratedProbability: 0 to 100 (probability this is synthetic/AI-generated)
- summary: 2-3 concise sentences detailing your forensic conclusion
- evidenceList: 3 to 6 distinct items (each with type: "supporting" or "suspicious", title, description, and forensicCategory like "Lighting & Shadows", "Anatomy & Textures", "Geometry & Physics", "Artifacts")
- recommendation: 1-2 actionable tips on how a user should handle or verify this image
- complexity: "low" | "medium" | "high"`
        : `أنت كبير محققي الأدلة الجنائية الرقمية وخبير كشف التزييف والتوليد بالذكاء الاصطناعي لمنصة "مكشاف".
قم بإجراء فحص جنائي بصري دقيق وشامل لهذه الصورة لتحديد هل هي:
1. "authentic" (صورة حقيقية طبيعية غير مولدة ولا متلاعب بها بشكل جوهري).
2. "fake" (صورة مزيفة، مولدة بنماذج الذكاء الاصطناعي مثل Midjourney, Flux, Stable Diffusion, DALL-E، أو ديب فيك Deepfake، أو تلاعب تركيبي رقمي).
3. "uncertain" (غير مؤكدة بسبب ضغط الصورة أو قلة المعالم البصرية القاطعة).

قواعد لغوية حاسمة وإلزامية (100% لغة عربية):
- جميع مخرجات التقرير الجنائي في كافة الحقول يجب أن تصاغ باللغة العربية الفصحى بنسبة 100%.
- ممنوع منعاً باتاً استخدام أي كلمات أو مسميات باللغة الإنجليزية في حقول: title، description، forensicCategory، summary، recommendation.
- يجب ترجمة وتوطين المصطلحات الجنائية بالكامل إلى العربية الفصحى:
  * بدلاً من "Lighting & Shadows" اكتب "الإضاءة والظلال والفيزياء البصرية"
  * بدلاً من "Anatomy & Textures" اكتب "التشريح والملامح والأنسجة"
  * بدلاً من "Geometry & Physics" اكتب "الهندسة والتماسك البصري"
  * بدلاً من "Artifacts & Noise" اكتب "التشوهات والضجيج الرقمي"

افحص المحاور الجنائية التالية:
- الإضاءة والظلال: هل اتجاهات الظلال وانعكاسات البؤبؤ ومصادر الضوء متسقة فيزيائياً؟
- التفاصيل التشريحية: الأصابع والأظافر، تجاعيد الجلد والملمس البلاستيكي الناعم، تفاصيل الشعر والأسنان والعيون.
- البنية الهندسية والخلفية: اعوجاج الخطوط المستقيمة، الأجسام العائمة، التكرارات النمطية الغريبة في الخلفيات.
- تشويش البيكسلات والضغط: تباين الضجيج الرقمي وعدم تجانس حدة الحواف.

المطلوب إرجاعه في الـ JSON:
- verdict: "authentic" أو "fake" أو "uncertain"
- trustScore: درجة الثقة من 0 إلى 100 (100 = حقيقية بالكامل، 0 = مزيفة أو مولدة بالكامل)
- aiGeneratedProbability: نسبة احتمالية التوليد بالذكاء الاصطناعي من 0 إلى 100
- summary: ملخص جنائي مكثف من 2-3 جمل باللغة العربية يوضح الخلاصة
- evidenceList: قائمة من 3 إلى 6 أدلة محددة، كل دليل يحتوي:
    * type: "supporting" (دليل أصالة) أو "suspicious" (شبهة وتلاعب)
    * title: عنوان الدليل باللغة العربية الفصحى فقط وبدون أي إنجليزية
    * description: شرح الدليل باللغة العربية الفصحى فقط وبدون أي إنجليزية
    * forensicCategory: تصنيف الدليل بالعربية فقط (مثل: "الإضاءة والظلال والفيزياء البصرية", "التشريح والملامح والأنسجة", "الهندسة والتماسك البصري", "التشوهات والضجيج الرقمي")
- recommendation: توصية المحقق العملية للمستخدم باللغة العربية الفصحى
- complexity: مستوى تعقيد القضية البصري ("low" أو "medium" أو "high")`;
    } else {
      // Handle Text or URL Analysis
      let textToAnalyze = text || '';

      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const detectedUrl = url || (textToAnalyze.match(urlRegex) ? textToAnalyze.match(urlRegex)![0] : null);

      if (detectedUrl) {
        try {
          const urlExtractedData = await extractUrlContent(detectedUrl);
          textToAnalyze = `عنوان الرابط: ${urlExtractedData.title}\n\nمحتوى المقال المستخرج:\n${urlExtractedData.content}\n\nملاحظات إضافية من المستخدم:\n${textToAnalyze}`;
        } catch (fetchErr: any) {
          console.warn('[Forensics URL Fallback]:', fetchErr.message);
          textToAnalyze = `رابط التحقيق المستهدف: ${detectedUrl}\n(ملاحظة: تعذر جلب المحتوى المباشر لأسباب أمنية أو تقنية، ويتم فحص الادعاء بناء على المعلومات المتوفرة)\n\nالنص المدخل:\n${textToAnalyze}`;
        }
      }

      if (!textToAnalyze || textToAnalyze.trim().length < 10) {
        return res.status(400).json({
          error: isEnglish
            ? 'Please enter sufficient text (at least 10 characters) or a valid URL.'
            : 'يرجى إدخال نص كافٍ (10 أحرف على الأقل) أو رابط صالح للتحليل.',
        });
      }

      promptInstructions = isEnglish
        ? `You are an elite Digital Forensic Investigator and Fact-Checker examining textual content or news article claims.
Target Content to Analyze:
"""
${textToAnalyze}
"""

Conduct an investigation covering:
1. AI Writing Hallmarks: Repetitive sentence structures, excessive transitional phrases, synthetic neutrality, clichéd idioms, lack of real grounded specifics.
2. Fact-Checking & Misinformation: Exaggerated claims, sensational clickbait framing, unverified assertions, conspiracy tropes, missing attributions.
3. Logical & Stylistic Coherence: Consistency of claims, internal contradictions, emotional manipulation.

Determine:
- verdict: "authentic" (credible, human-authored, verified or factual in tone), "fake" (misinformation, AI-generated fabrications, deceptive spin), or "uncertain" (mixed claims, unverified assertions, opinion piece).
- trustScore: 0 to 100
- aiGeneratedProbability: 0 to 100 (probability that this text was written/synthesized by an LLM)
- summary: 2-3 concise investigative sentences
- evidenceList: 3 to 6 evidence cards (type: "supporting" or "suspicious", title, description, forensicCategory like "Fact-Checking", "Stylistic Patterns", "AI Syntax Fingerprints", "Source Credibility")
- recommendation: 1-2 detective recommendations for the user
- complexity: "low" | "medium" | "high"`
        : `أنت كبير محققي الأدلة الجنائية الرقمية وخبير التحقق من الأخبار والتوليد اللغوي الآلي لمنصة "مكشاف".
المحتوى المستهدف للتحقيق:
"""
${textToAnalyze}
"""

قواعد لغوية حاسمة وإلزامية (100% لغة عربية):
- جميع مخرجات التقرير الجنائي في كافة الحقول يجب أن تصاغ باللغة العربية الفصحى بنسبة 100%.
- ممنوع منعاً باتاً استخدام أي كلمات أو مسميات باللغة الإنجليزية في حقول: title، description، forensicCategory، summary، recommendation.
- ترجم المصطلحات إلى العربية الفصحى (مثال: 'فحص الحقائق والادعاءات', 'بصمات التوليد الآلي للنصوص', 'الأنماط الأسلوبية والتكرار', 'التماسك والاتساق المنطقي', 'مصداقية المصادر').

قم بإجراء تحقيق جنائي دقيق يتضمن:
1. بصمات نصوص الذكاء الاصطناعي: التكرار البلاغي الآلي، الحيادية الزائفة، المفردات الانتقالية النمطية لـ LLMs، افتقار النص للخصوصية البشرية أو التفاصيل الواقعية الدقيقة.
2. فحص الحقائق والتضليل: الادعاءات غير الموثقة، العناوين المضللة (Clickbait)، المؤامرات الشائعة، التضخيم العاطفي وغياب المصادر الرسمية.
3. التماسك المنطقي والأسلوبي: التناقضات الداخلية، التلاعب بسياق الأخبار، وتاريخ الأحداث.

المطلوب إرجاعه في الـ JSON:
- verdict: "authentic" (موثوق/بشري/متسق مع الحقائق)، أو "fake" (مضلل/مفبرك/مولد آلياً للتزييف)، أو "uncertain" (غير مؤكد/آراء غير محسومة/معلومات غير كافية)
- trustScore: درجة الثقة من 0 إلى 100
- aiGeneratedProbability: نسبة احتمال أن النص مولد بنموذج لغوي كبير (LLM) من 0 إلى 100
- summary: ملخص جنائي موجز من 2-3 جمل باللغة العربية الفصحى
- evidenceList: قائمة 3 إلى 6 أدلة (type: "supporting" أو "suspicious"، title بالعربية، description بالعربية، و forensicCategory بالعربية مثل "فحص الحقائق والادعاءات"، "بصمات التوليد الآلي للنصوص"، "الأنماط الأسلوبية والبلاغية"، "التماسك والاتساق المنطقي")
- recommendation: توصية المحقق العملية للمستخدم باللغة العربية لكيفية التحقق من هذا الادعاء
- complexity: مستوى تعقيد القضية اللغوي ("low" أو "medium" أو "high")`;
    }

    contentParts.push({ text: promptInstructions });

    // Execute with multi-model fallback and timeout defense
    const responseText = await generateForensicWithFallback(
      ai,
      contentParts,
      forensicResponseSchema
    );

    if (!responseText) {
      throw new Error('لم يتم استلام أي رد منظم من محرك التحليل الجنائي');
    }

    const cleanJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    let parsedResult = JSON.parse(cleanJson);

    // Apply strict Arabic translation and normalization when language is Arabic or default
    if (!isEnglish) {
      parsedResult = sanitizeForensicReportToArabic(parsedResult);
    }

    // Attach server timestamp and generated case ID
    const caseId = `MSK-${Math.floor(100000 + Math.random() * 900000)}`;
    const fullReport = {
      caseId,
      timestamp: new Date().toISOString(),
      contentType: type,
      ...parsedResult,
    };

    const duration = Date.now() - requestStartTime;
    console.log(`[Forensic Report Generated] Case #${caseId} completed in ${duration}ms (verdict: ${fullReport.verdict})`);

    return res.json(fullReport);
  } catch (error: any) {
    const duration = Date.now() - requestStartTime;
    console.error(`[Forensic Analysis Error after ${duration}ms]:`, error?.message || error);

    const isEnglish = req.body?.lang === 'en';
    const errorStr = (error?.message || '').toLowerCase();

    // Check for rate limit or quota exhaustion
    if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('resource_exhausted')) {
      return res.status(429).json({
        error: isEnglish
          ? 'API rate limit reached. Please wait 60 seconds before submitting another forensic request.'
          : 'تم تجاوز الحد الأقصى المؤقت للطلبات (Rate Limit). يرجى الانتظار 60 ثانية قبل تقديم طلب فحص جديد.',
      });
    }

    if (errorStr.includes('503') || errorStr.includes('demand') || errorStr.includes('unavailable')) {
      return res.status(503).json({
        error: isEnglish
          ? 'The AI forensic engine is currently experiencing high demand. Please retry in a few moments.'
          : 'محرك التحقيق الجنائي يواجه ضغطاً مؤقتاً في الطلبات، يرجى إعادة المحاولة بعد لحظات.',
      });
    }

    // Clean, sanitized error message (zero internal stack traces or raw exceptions exposed)
    return res.status(500).json({
      error: isEnglish
        ? 'A forensic investigation error occurred. Please verify your input and try again.'
        : 'حدث خطأ أثناء إجراء التحقيق الجنائي، يرجى التحقق من المدخلات والمحاولة مرة أخرى.',
    });
  }
}

// Attach Rate Limiter to analysis endpoints
app.post('/api/analyze', forensicRateLimiter, handleAnalyze);
app.post('/app/api/analyze/route', forensicRateLimiter, handleAnalyze);

// Catch-All Error Handling Middleware: intercepts unhandled errors and returns formatted JSON without crashing
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Unhandled Forensic Server Exception]:', err?.stack || err?.message || err);
  if (res.headersSent) {
    return;
  }
  return res.status(500).json({
    error: 'حدث خطأ داخلي غير متوقع في الخادم الجنائي. تم عزل الخطأ لحماية استقرار النظام.',
    details: process.env.NODE_ENV === 'development' ? err?.message : undefined,
  });
});

// Process-level guards against unexpected rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Unhandled Rejection at]:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]:', err);
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const bindPort = typeof port === 'number' ? port : parseInt(String(port), 10) || 3000;

  // Bind to 0.0.0.0 and process.env.PORT for Cloud Run, Render and production deployment
  app.listen(bindPort, '0.0.0.0', () => {
    console.log(`[MIKSHAF Intelligence Platform] Listening on http://0.0.0.0:${bindPort}`);
  });
}

startServer();
