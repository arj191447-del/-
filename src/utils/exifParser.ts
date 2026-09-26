import ExifReader from 'exifreader';

export interface ParsedExifData {
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

// Known synthetic diffusion generators and digital post-processing footprints
const AI_SOFTWARE_PATTERNS = [
  /midjourney/i,
  /stable diffusion/i,
  /dall-e/i,
  /dalle/i,
  /flux/i,
  /comfyui/i,
  /automatic1111/i,
  /firefly/i,
  /photoshop/i,
  /gimp/i,
  /waifu2x/i,
  /civitai/i,
  /novelai/i,
  /bing image creator/i,
  /copilot/i,
  /gen-2/i,
  /runway/i,
];

/**
 * Extracts and categorizes EXIF metadata from raw image file buffer.
 * Runs 100% locally in browser with zero network latency.
 */
export async function extractImageExif(file: File): Promise<ParsedExifData> {
  const result: ParsedExifData = {
    hasHardwareExif: false,
    isAiToolFlagged: false,
    rawDetails: {},
  };

  try {
    const arrayBuffer = await file.arrayBuffer();
    const tags = ExifReader.load(arrayBuffer, { expanded: true });

    const exif = tags.exif;
    const iptc = tags.iptc;
    const xmp = tags.xmp;
    const fileTags = tags.file;

    const getStringVal = (tag: any): string | undefined => {
      if (!tag) return undefined;
      if (typeof tag.description === 'string' && tag.description.trim().length > 0) {
        return tag.description.trim();
      }
      if (typeof tag.value === 'string' && tag.value.trim().length > 0) {
        return tag.value.trim();
      }
      return undefined;
    };

    // Camera hardware indicators
    result.make = getStringVal(exif?.Make) || getStringVal(xmp?.Make);
    result.model = getStringVal(exif?.Model) || getStringVal(xmp?.Model);
    result.lensModel = getStringVal(exif?.LensModel) || getStringVal(xmp?.LensModel);
    result.focalLength = getStringVal(exif?.FocalLength);
    result.fNumber = getStringVal(exif?.FNumber);
    result.exposureTime = getStringVal(exif?.ExposureTime);
    result.iso = getStringVal(exif?.ISOSpeedRatings);
    result.software = getStringVal(exif?.Software) || getStringVal(xmp?.Software) || getStringVal(xmp?.CreatorTool);
    result.dateTimeOriginal = getStringVal(exif?.DateTimeOriginal) || getStringVal(xmp?.DateTimeOriginal);

    if (result.make || result.model || result.lensModel || result.fNumber || result.exposureTime) {
      result.hasHardwareExif = true;
    }

    // Check for AI software footprints across software, description, and user comments
    const allCheckedText = [
      result.software || '',
      getStringVal(exif?.UserComment) || '',
      getStringVal(exif?.ImageDescription) || '',
      getStringVal(iptc?.['Special Instructions']) || '',
      getStringVal(xmp?.description) || '',
      getStringVal(xmp?.prompt) || '',
    ].join(' ');

    for (const pattern of AI_SOFTWARE_PATTERNS) {
      if (pattern.test(allCheckedText)) {
        result.isAiToolFlagged = true;
        result.aiFlagsDescription = `تم رصد بصمة أداة توليد/تعديل: ${allCheckedText.match(pattern)?.[0] || 'AI Software'}`;
        break;
      }
    }

    // Capture clean raw map
    if (result.make) result.rawDetails['Make'] = result.make;
    if (result.model) result.rawDetails['Model'] = result.model;
    if (result.lensModel) result.rawDetails['Lens'] = result.lensModel;
    if (result.focalLength) result.rawDetails['Focal Length'] = result.focalLength;
    if (result.fNumber) result.rawDetails['Aperture'] = result.fNumber;
    if (result.exposureTime) result.rawDetails['Exposure'] = result.exposureTime;
    if (result.iso) result.rawDetails['ISO'] = result.iso;
    if (result.software) result.rawDetails['Software'] = result.software;
    if (result.dateTimeOriginal) result.rawDetails['Timestamp'] = result.dateTimeOriginal;

    return result;
  } catch (err) {
    // If parsing fails or image has stripped metadata
    return result;
  }
}
