// noinspection HttpUrlsUsage

/**
 * Represents the metadata properties available in an image.
 */
export interface IImageMetadataCheck {
  hasExif: boolean;
  hasGps: boolean;
  hasIcc: boolean;
  hasXmp: boolean;
  hasIptc: boolean;
  hasAny: boolean;
}

/**
 * Analyzes an image file's binary data to detect the presence of various metadata types such as Exif, GPS, ICC, XMP, and IPTC.
 * @param {ArrayBuffer} buffer The binary data of the image file to analyze.
 * @return {IImageMetadataCheck} An object summarizing the presence of different metadata types in the image file.
 */
export function checkImageMetadata(buffer: ArrayBuffer): IImageMetadataCheck {
  const bytes = new Uint8Array(buffer);
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50;
  const isWebp =
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';

  const result: IImageMetadataCheck = {
    hasExif: false,
    hasGps: false,
    hasIcc: false,
    hasXmp: false,
    hasIptc: false,
    hasAny: false,
  };

  if (isJpeg) {
    for (let i = 2; i < bytes.length - 4; i++) {
      if (bytes[i] !== 0xff) continue;
      const marker = bytes[i + 1];
      if (marker === 0xe1) {
        const tag = String.fromCharCode(...bytes.slice(i + 4, i + 10));
        if (tag === 'Exif\0\0') result.hasExif = true;
        if (tag.startsWith('http://')) result.hasXmp = true;
      }
      if (marker === 0xe2) result.hasIcc = true;
      if (marker === 0xed) result.hasIptc = true;
      if (marker === 0xda) break;
    }

    if (result.hasExif) {
      const needle = 'GPS';
      const str = new TextDecoder('latin1').decode(bytes.slice(0, 65536));
      result.hasGps = str.includes(needle);
    }
  } else if (isPng) {
    const str = new TextDecoder('latin1').decode(bytes.slice(0, 4096));
    result.hasExif = str.includes('eXIf');
    result.hasXmp = str.includes('iTXt');
    result.hasIcc = str.includes('iCCP');
    result.hasIptc = str.includes('tEXt');
  } else if (isWebp) {
    const str = new TextDecoder('latin1').decode(bytes.slice(0, 65536));
    result.hasExif = str.includes('EXIF');
    result.hasXmp = str.includes('XMP ');
    result.hasIcc = str.includes('ICCP');
  }

  result.hasAny = result.hasExif || result.hasIcc || result.hasXmp || result.hasIptc;

  return result;
}
