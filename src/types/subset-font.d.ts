declare module 'subset-font' {
  export default function subsetFont(
    font: Uint8Array,
    text: string,
    options?: {
      targetFormat?: 'woff2' | 'woff' | 'truetype' | 'sfnt';
      preserveNameIds?: number[];
      variationAxes?: Record<string, number | { min: number; max: number; default?: number }>;
      noLayoutClosure?: boolean;
    },
  ): Promise<Uint8Array>;
}
