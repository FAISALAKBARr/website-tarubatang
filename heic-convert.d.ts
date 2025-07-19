// types/heic-convert.d.ts
declare module 'heic-convert' {
  interface ConvertOptions {
    buffer: Buffer | ArrayBuffer | Uint8Array;
    format: 'JPEG' | 'PNG';
    quality?: number; // 0-1 for JPEG quality
  }

  /**
   * Convert HEIC/HEIF images to JPEG or PNG format
   * @param options - Conversion options
   * @returns Promise that resolves to the converted image buffer
   */
  function convert(options: ConvertOptions): Promise<Buffer>;

  export default convert;
}