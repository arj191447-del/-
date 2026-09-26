export type ForensicVerdict = 'authentic' | 'fake' | 'uncertain';

export type ContentType = 'image' | 'text' | 'url';

export type ForensicComplexity = 'low' | 'medium' | 'high';

export interface EvidenceItem {
  type: 'supporting' | 'suspicious';
  title: string;
  description: string;
  forensicCategory: string;
}

export interface ExifReportData {
  make?: string;
  model?: string;
  lensModel?: string;
  focalLength?: string;
  fNumber?: string;
  exposureTime?: string;
  iso?: string;
  software?: string;
  dateTimeOriginal?: string;
  hasHardwareExif: boolean;
  isAiToolFlagged: boolean;
  aiFlagsDescription?: string;
  rawDetails: Record<string, string>;
}

export interface DossierReport {
  caseId: string;
  timestamp: string;
  contentType: ContentType;
  verdict: ForensicVerdict;
  trustScore: number;
  aiGeneratedProbability: number;
  summary: string;
  evidenceList: EvidenceItem[];
  recommendation: string;
  complexity: ForensicComplexity;
  inputPreview?: string;
  inputTitle?: string;
  exifData?: ExifReportData | null;
}

export type DetectiveRankId = 'rookie' | 'vigilant' | 'master' | 'chief';

export interface VigilanceState {
  points: number;
  totalCases: number;
  authenticCount: number;
  fakeCount: number;
  uncertainCount: number;
  rankId: DetectiveRankId;
}

export type ActivePage = 'investigator' | 'archive' | 'about';
