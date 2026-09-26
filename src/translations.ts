export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    appName: 'مكشاف',
    appEnglishName: 'MIKSHAF',
    tagline: 'وحدة التحقيق الجنائي الرقمي لكشف التزييف والتوليد بالذكاء الاصطناعي',
    classification: 'سري للغاية · ملف قضية رسمي',
    
    // Navigation
    navInvestigate: 'غرفة التحقيق',
    navArchive: 'أرشيف القضايا',
    navAbout: 'عن مكشاف والميثاق',
    
    // Vigilance
    vigilanceTitle: 'نقاط اليقظة الرقمية',
    vigilanceBadge: 'رتبة التحقيق',
    pointsEarned: 'نقطة يقظة',
    pts: 'نقطة',
    totalCasesLogged: 'إجمالي القضايا المفحوصة',
    authenticFound: 'حالات موثوقة',
    fakesUnmasked: 'تزييف مكشوف',
    ranks: {
      rookie: {
        title: 'محقق مبتدئ',
        desc: 'في بداية رحلة التحقق وفحص الوسائط الرقمية.',
        threshold: 0,
      },
      vigilant: {
        title: 'محقق يقظ',
        desc: 'اكتسب مهارات كشف التشوهات والعيوب الشائعة للذكاء الاصطناعي.',
        threshold: 100,
      },
      master: {
        title: 'محقق خبير',
        desc: 'يتقن تدقيق فيزياء الإضاءة والبصمات اللغوية العميقة.',
        threshold: 250,
      },
      chief: {
        title: 'رئيس الأدلة الجنائية',
        desc: 'أعلى رتبة في تفكيك التزييف الممنهج والتضليل الرقمي.',
        threshold: 500,
      },
    },
    vigilanceModalTitle: 'نظام رتب اليقظة الرقمية (Digital Vigilance)',
    vigilanceModalDesc: 'كل عملية فحص وتقصٍّ جنائي تنفذها تمنحك +25 نقطة يقظة، مما يرفع رتبتك القيادية في مكافحة التزييف الرقمي.',
    close: 'إغلاق',

    // Tabs
    tabImage: 'فحص الصور والوسائط',
    tabTextUrl: 'فحص النصوص والروابط',
    tabImageDesc: 'كشف صور Deepfake، توليد الذكاء الاصطناعي (Midjourney / Flux / DALL-E)، وتعديلات الفوتوشوب والتوليف البصري.',
    tabTextUrlDesc: 'كشف المقالات والأخبار الكاذبة، الادعاءات المضللة، والنصوص المكتوبة بالكامل بنماذج الذكاء الاصطناعي (ChatGPT / Claude).',

    // Trust Strip
    trustStripAccuracy: 'دقة كشف تتجاوز 96% عبر النماذج متعددة الأطياف',
    trustStripCount: 'أكثر من 15,000+ ملف وصورة تم تدقيقها',
    trustStripPrivacy: 'معالجة مشفرة بدون تخزين بياناتك أو مشاركتها',

    // How It Works / Forensic Pillars
    forensicsPillarsTitle: 'منظومة التدقيق الجنائي الرقمي',
    forensicsPillarsSubtitle: 'ثلاث ركائز تقنية تكشف التزييف التوليدي والتلاعب المجهري',
    pillar1Title: 'تحليل فروقات الضغط (ELA)',
    pillar1Desc: 'فحص التفاوت البيكسلي الدقيق وكشف أي تلاعب أو دمج تركيبي لاحق.',
    pillar1Tag: 'تحليل البيكسل والضغط',
    pillar2Title: 'فيزياء الإضاءة وانعكاسات البؤبؤ',
    pillar2Desc: 'مطابقة سقوط الظلال والبريق العيني للتأكد من الاتساق البصري الطبيعي.',
    pillar2Tag: 'الاتساق البصري والظلال',
    pillar3Title: 'بصمات المستشعر والميتا داتا (EXIF)',
    pillar3Desc: 'استخراج بيانات الكاميرا والعدسة وكشف تجريد البيانات الملازم لنماذج الذكاء الاصطناعي.',
    pillar3Tag: 'بصمة العتاد والكاميرا',

    // Image Upload
    dragDropText: 'اسحب ملف الصورة وأفلته هنا، أو اضغط للاختيار، أو الصقها مباشرة (Ctrl + V)',
    pasteSuccessToast: 'تم لصق الصورة من الحافظة بنجاح!',
    orBrowse: 'أو اضغط لاختيار صورة من جهازك',
    supportedFormats: 'الصيغ المدعومة: JPG, PNG, WEBP, GIF (حتى 20 ميغابايت)',
    fileSelected: 'الدليل المرفق:',
    changeImage: 'استبدال الصورة',
    btnAnalyzeImage: 'بدء التحقيق الجنائي في الصورة',

    // Text & URL Input
    inputLabel: 'أدخل نص الخبر، المقال، أو الصق رابط صفحة ويب (URL):',
    inputPlaceholder: 'الصق الرابط أو النص هنا للتدقيق الجنائي... مثال: https://news.example.com/article أو مقال يدعي حدوث واقعة مثيرة للجدل...',
    urlDetectedNotice: 'تم رصد رابط ويب! سيقوم السيرفر بجلب محتوى الصفحة وتحليله بعمق.',
    btnAnalyzeText: 'فحص الادعاء ومحتوى الرابط',

    // Quick Samples
    quickSamplesTitle: 'أو جرّب قضية تجريبية فورية:',
    sampleAiPhoto: 'صورة AI (نمط فوتوغرافي)',
    sampleRealPhoto: 'صورة طبيعية حقيقية',
    sampleFakeNews: 'خبر مضلل (ادعاء زائف)',
    sampleRealNews: 'بيان علمي موثق',

    // Investigation Loading Screen
    investigatingTitle: 'إجراءات التحقيق الجنائي جارية...',
    investigationSteps: [
      'جاري فحص أنماط الضوضاء البيكسلية (PRNU Sensor Noise)...',
      'جاري تدقيق تناسق الإضاءة والظلال والانعكاسات الفيزيائية...',
      'جاري فحص الملامح التشريحية، الأطراف، وتناسق الأنسجة المجهرية...',
      'جاري تدقيق البصمات اللغوية ومقارنة الحقائق ومصادر الإسناد...',
      'جاري إعداد تقرير الأدلة الجنائية وختم الحكم النهائي للملف...',
    ],

    // Dossier Results
    caseReportTitle: 'تقرير ملف القضية الجنائية',
    caseNumber: 'رقم القضية:',
    dateInspected: 'تاريخ الفحص:',
    complexityLevel: 'مستوى التعقيد الجنائي:',
    complexity: {
      low: 'بسيط / مؤشرات واضحة',
      medium: 'متوسط / يتطلب تدقيقاً',
      high: 'عالي / متقدم وتقني',
    },

    // Stamps
    stamps: {
      authentic: {
        text: 'حقيقي وموثوق',
        sub: 'AUTHENTIC · VERIFIED',
        verdictText: 'أصلي وطبيعي',
      },
      fake: {
        text: 'مزيّف ومولّد',
        sub: 'FABRICATED · FAKE',
        verdictText: 'تزييف أو توليد بالذكاء الاصطناعي',
      },
      uncertain: {
        text: 'غير مؤكد ومشبوه',
        sub: 'SUSPECT · UNCERTAIN',
        verdictText: 'أدلة متضاربة أو غير حاسمة',
      },
    },

    // Metrics
    trustScoreLabel: 'مؤشر الثقة والمصداقية',
    trustScoreDesc: 'درجة من 100 توضح سلامة المحتوى من التزييف الرقمي.',
    aiGenProbLabel: 'احتمال التوليد الآلي بالذكاء الاصطناعي',
    aiGenProbDesc: 'نسبة ترجيح إنتاج المحتوى بواسطة خوارزميات التوليد.',

    // Evidence Board
    evidenceBoardTitle: 'لوحة الأدلة والقرائن الجنائية',
    evidenceBoardSubtitle: 'ملاحظات وبصمات مثبتة على لوحة التحقيق:',
    filterAll: 'كافة الأدلة',
    filterSupporting: 'أدلة مؤيدة للأصالة',
    filterSuspicious: 'مؤشرات شبهة وتلاعب',
    evidenceTypeSupporting: 'دليل مؤيد للأصالة',
    evidenceTypeSuspicious: 'مؤشر تلاعب أو شبهة',

    // Detective Recommendation
    recommendationTitle: 'توصية المحقق الجنائي الميدانية',

    // Actions on Case
    btnNewInvestigation: 'بدء تحقيق جديد',
    btnPrintDossier: 'طباعة / تصدير التقرير الرسمي',
    btnExportPdfCertificate: 'تصدير التقرير والشهادة الجنائية (PDF)',
    btnSaveArchive: 'تم الحفظ تلقائياً في الأرشيف',

    // Archive Page
    archiveTitle: 'أرشيف القضايا الجنائية',
    archiveSubtitle: 'سجل عمليات الفحص السابقة المحفوظة محلياً على متصفحك.',
    archiveEmpty: 'لم يتم تسجيل أي قضايا في الأرشيف حتى الآن.',
    archiveEmptyDesc: 'قم بإجراء أول فحص صورة أو نص ليتم توثيقه وتخزينه كملف قضية رسمي.',
    btnClearArchive: 'تفريغ الأرشيف بالكامل',
    confirmClearArchive: 'هل أنت متأكد من رغبتك في حذف جميع القضايا المحفوظة محلياً؟',
    btnViewDossier: 'فتح ملف القضية',
    btnDeleteCase: 'حذف القضية',

    // About Page
    aboutTitle: 'عن منصة "مكشاف" والميثاق الجنائي',
    aboutSubtitle: 'أداة مفتوحة للتوعية الرقمية والتحري الجنائي ضد طوفان التزييف الرقمي والتضليل التوليدي.',
    aboutSection1Title: '1. الفكرة والهدف الجوهري',
    aboutSection1Content: 'أُطلقت منصة "مكشاف" (MIKSHAF) لسد الفجوة المتنامية بين التطور المتسارع لأدوات التوليد بالذكاء الاصطناعي (Generative AI) وقدرة المستخدم العادي على تمييز الحقيقة من الزيف. نحن نحول عملية التحقق الجافة إلى تجربة "ملف قضية محقق" ترتكز على استعراض الأدلة، تفنيد البصمات، وشرح منطق الحكم بدلاً من تقديم إجابة رقمية غامضة.',
    aboutSection2Title: '2. كيف تعمل آلية الفحص والتحليل؟',
    aboutSection2Content: 'تعتمد المنصة على نماذج Google Gemini المتقدمة ومتعددة الوسائط (Multimodal) التي تقوم بمسح شامل: فحص توزيع الإضاءة، انعكاسات العيون، التشوهات التشريحية الدقيقة في الأصابع والأسنان، تفاوت تشويش البيكسلات، بالإضافة إلى التحليل الدلالي ومقارنة الادعاءات بالأدلة المعرفية الموثوقة.',
    aboutSection3Title: '3. ميثاق الشفافية وإخلاء المسؤولية الرسمي',
    aboutSection3Content: 'منصة "مكشاف" أداة مساعدة واستشارية تهدف لتعزيز اليقظة النقدية والحس التحقيقي لدى الأفراد والصحفيين والباحثين. نتائج الفحص مستنتجة عبر خوارزميات الذكاء الاصطناعي وليست شهادة قانونية أو حكماً قضائياً ملزماً 100%. ننصح دائماً بمقاطعة النتائج مع مصادر التحقق المستقلة قبل اتخاذ أي قرارات مصيرية.',

    // Footer
    footerDesc: 'مكشاف (MIKSHAF) — المنصة الذكية للتحري الجنائي الرقمي وكشف تزييف الوسائط والأخبار المضللة.',
    footerQuickLinks: 'روابط سريعة',
    footerSecurityNote: 'حماية البيانات: لا يتم تخزين صورك أو نصوصك في أي قاعدة بيانات سحابية؛ تُحفظ سجلاتك محلياً في متصفحك فقط.',
    footerCopyright: 'كافة الحقوق محفوظة © 2026 مكشاف (MIKSHAF) — أداة أمان رقمي مفتوحة.',
    footerDisclaimer: 'تنبيه: مكشاف أداة إرشادية وتوعوية مدعومة بالذكاء الاصطناعي؛ يُرجى التحقق الإضافي في القضايا ذات الحساسية العالية.',
  },

  en: {
    appName: 'MIKSHAF',
    appEnglishName: 'MIKSHAF',
    tagline: 'Digital Forensics & AI Deepfake Detection Investigation Bureau',
    classification: 'OFFICIAL FORENSIC RECORD',

    // Navigation
    navInvestigate: 'Investigation Room',
    navArchive: 'Case Archive',
    navAbout: 'About & Charter',

    // Vigilance
    vigilanceTitle: 'Digital Vigilance Score',
    vigilanceBadge: 'Detective Rank',
    pointsEarned: 'Vigilance Points',
    pts: 'PTS',
    totalCasesLogged: 'Total Cases Analyzed',
    authenticFound: 'Verified Authentic',
    fakesUnmasked: 'Fakes Unmasked',
    ranks: {
      rookie: {
        title: 'Rookie Investigator',
        desc: 'Embarking on the digital media forensics and fact-checking journey.',
        threshold: 0,
      },
      vigilant: {
        title: 'Vigilant Detective',
        desc: 'Proficient in spotting common AI diffusion flaws and deceptive patterns.',
        threshold: 100,
      },
      master: {
        title: 'Master Inspector',
        desc: 'Expert at analyzing complex optical lighting and latent stylistic artifacts.',
        threshold: 250,
      },
      chief: {
        title: 'Chief Forensics Officer',
        desc: 'Top rank in dismantling orchestrated disinformation and hyper-realistic deepfakes.',
        threshold: 500,
      },
    },
    vigilanceModalTitle: 'Digital Vigilance Rank System',
    vigilanceModalDesc: 'Every completed forensic investigation awards you +25 vigilance points, progressing your detective rank in combating synthetic disinformation.',
    close: 'Close',

    // Tabs
    tabImage: 'Image & Media Forensics',
    tabTextUrl: 'Text & URL Verification',
    tabImageDesc: 'Examine deepfakes, AI synthesis (Midjourney, Flux, DALL-E), and digital composites or lighting manipulations.',
    tabTextUrlDesc: 'Analyze fabricated news, unverified assertions, sensational spin, and LLM AI-generated texts (ChatGPT, Claude).',

    // Trust Strip
    trustStripAccuracy: '96%+ detection accuracy via multispectral models',
    trustStripCount: '15,000+ files & images inspected',
    trustStripPrivacy: 'Encrypted processing with zero data storage',

    // How It Works / Forensic Pillars
    forensicsPillarsTitle: 'Digital Forensic Inspection System',
    forensicsPillarsSubtitle: 'Three technical pillars identifying synthetic generation and micro-manipulations',
    pillar1Title: 'Error Level Analysis (ELA)',
    pillar1Desc: 'High-precision pixel disparity inspection detecting composite blending and secondary compression.',
    pillar1Tag: 'Pixel Compression',
    pillar2Title: 'Lighting Physics & Corneal Glint',
    pillar2Desc: 'Cross-referencing light vectors, shadow angles, and corneal eye reflections to verify natural optical coherence.',
    pillar2Tag: 'Optical Coherence',
    pillar3Title: 'Sensor Signatures & EXIF Metadata',
    pillar3Desc: 'Hardware sensor fingerprints and camera lens profile verification, uncovering AI metadata stripping.',
    pillar3Tag: 'Hardware Footprint',

    // Image Upload
    dragDropText: 'Drag & drop image here, click to browse, or paste directly (Ctrl + V)',
    pasteSuccessToast: 'Image pasted from clipboard successfully!',
    orBrowse: 'Or click to select an image from your device',
    supportedFormats: 'Supported Formats: JPG, PNG, WEBP, GIF (Up to 20MB)',
    fileSelected: 'Selected Evidence:',
    changeImage: 'Change Image',
    btnAnalyzeImage: 'Launch Forensic Image Investigation',

    // Text & URL Input
    inputLabel: 'Enter news claim, article text, or paste a webpage URL:',
    inputPlaceholder: 'Paste article link or text claim here... e.g., https://news.example.com/breaking-story or suspicious social post text...',
    urlDetectedNotice: 'Web URL detected! The server will scrape and deeply scrutinize the full page content.',
    btnAnalyzeText: 'Investigate Claim & Article Content',

    // Quick Samples
    quickSamplesTitle: 'Or test an instant sample case:',
    sampleAiPhoto: 'AI Photo (Hyper-realistic)',
    sampleRealPhoto: 'Genuine Authentic Photo',
    sampleFakeNews: 'Fabricated News Claim',
    sampleRealNews: 'Verified Factual News',

    // Investigation Loading Screen
    investigatingTitle: 'Forensic Investigation in Progress...',
    investigationSteps: [
      'Scanning sensor PRNU noise and pixel compression discrepancies...',
      'Scrutinizing lighting vectors, specular physics, and ray reflections...',
      'Inspecting anatomical geometry, fingers, micro-skin textures, and hair boundaries...',
      'Cross-examining linguistic cadence, factual assertions, and sourcing attributions...',
      'Compiling the forensic evidence board and striking final official stamp...',
    ],

    // Dossier Results
    caseReportTitle: 'Official Case Investigation Dossier',
    caseNumber: 'CASE FILE ID:',
    dateInspected: 'DATE RECORDED:',
    complexityLevel: 'FORENSIC COMPLEXITY:',
    complexity: {
      low: 'Low · Clear indicators',
      medium: 'Medium · Scrutiny required',
      high: 'High · Complex synthetic cues',
    },

    // Stamps
    stamps: {
      authentic: {
        text: 'AUTHENTIC & VERIFIED',
        sub: 'GENUINE CONTENT · PASS',
        verdictText: 'Authentic & Unaltered',
      },
      fake: {
        text: 'FABRICATED · FAKE',
        sub: 'AI SYNTHESIZED OR MANIPULATED',
        verdictText: 'Manipulated or AI-Generated',
      },
      uncertain: {
        text: 'SUSPECT · UNCERTAIN',
        sub: 'INCONCLUSIVE EVIDENCE',
        verdictText: 'Ambiguous or Conflicting Evidence',
      },
    },

    // Metrics
    trustScoreLabel: 'Trust & Authenticity Score',
    trustScoreDesc: 'Score out of 100 representing confidence that content is genuine.',
    aiGenProbLabel: 'AI Generation Probability',
    aiGenProbDesc: 'Likelihood percentage that content was synthesized by generative models.',

    // Evidence Board
    evidenceBoardTitle: 'Forensic Evidence Board',
    evidenceBoardSubtitle: 'Physical notes & clues pinned to the case board:',
    filterAll: 'All Evidence',
    filterSupporting: 'Authenticity Markers',
    filterSuspicious: 'Suspicious Anomalies',
    evidenceTypeSupporting: 'Authenticity Clue',
    evidenceTypeSuspicious: 'Manipulation Anomaly',

    // Detective Recommendation
    recommendationTitle: 'Detective\'s Tactical Advisory',

    // Actions on Case
    btnNewInvestigation: 'Start New Investigation',
    btnPrintDossier: 'Print / Export Dossier',
    btnExportPdfCertificate: 'Export Dossier & Forensic Certificate (PDF)',
    btnSaveArchive: 'Saved to Local Archive',

    // Archive Page
    archiveTitle: 'Investigative Case Archive',
    archiveSubtitle: 'Historical record of previous forensic investigations saved locally in your browser.',
    archiveEmpty: 'No case files recorded in the archive yet.',
    archiveEmptyDesc: 'Submit your first image or article claim to generate and store an official forensic case dossier.',
    btnClearArchive: 'Purge Entire Archive',
    confirmClearArchive: 'Are you sure you want to permanently clear all locally stored case dossiers?',
    btnViewDossier: 'Open Case File',
    btnDeleteCase: 'Delete Case',

    // About Page
    aboutTitle: 'About MIKSHAF & The Digital Forensics Charter',
    aboutSubtitle: 'An open forensic initiative countering the proliferation of synthetic deepfakes and disinformation.',
    aboutSection1Title: '1. The Vision & Core Mission',
    aboutSection1Content: 'MIKSHAF was founded to bridge the widening gap between generative AI tooling and the public\'s capacity to differentiate reality from synthetic manipulation. Rather than delivering a dry, opaque probability number, MIKSHAF adopts the aesthetic and analytical rigor of a detective case file—detailing optical anomalies, linguistic hallmarks, and actionable recommendations.',
    aboutSection2Title: '2. Forensic Methodology',
    aboutSection2Content: 'Powered by multimodal Google Gemini models, MIKSHAF executes rigorous forensic verification: checking lighting physics, corneal specular reflections, micro-texture artifacts, finger and dental anatomy, sensor noise uniformity, as well as semantic coherence and fact-grounding.',
    aboutSection3Title: '3. Transparency & Official Disclaimer',
    aboutSection3Content: 'MIKSHAF serves as an investigative aid designed to hone digital vigilance. Findings represent probabilistic algorithmic analysis and do not constitute absolute legal certitude. Users are urged to cross-reference high-stakes assessments with primary sources before making definitive decisions.',

    // Footer
    footerDesc: 'MIKSHAF — The intelligent digital forensics investigation platform detecting synthetic deepfakes and deceptive media.',
    footerQuickLinks: 'Quick Navigation',
    footerSecurityNote: 'Privacy First: No images or text inputs are stored on remote servers; all case files are stored strictly on your local device.',
    footerCopyright: 'All rights reserved © 2026 MIKSHAF — Open Digital Security Initiative.',
    footerDisclaimer: 'Notice: MIKSHAF is an AI-assisted investigative tool; always perform secondary corroboration for sensitive forensic matters.',
  },
};
