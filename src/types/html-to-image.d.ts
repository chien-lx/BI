declare module 'html-to-image' {
  export interface Options {
    backgroundColor?: string;
    width?: number;
    height?: number;
    style?: Record<string, string | number>;
    filter?: (node: Node) => boolean;
    pixelRatio?: number;
    cacheBust?: boolean;
    imagePlaceholder?: string;
    skipFonts?: boolean;
    fontEmbedCSS?: string;
    preferredFontFormat?: string;
    canvasWidth?: number;
    canvasHeight?: number;
  }

  export function toPng(node: HTMLElement, options?: Options): Promise<string>;
  export function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  export function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
  export function toPixelData(node: HTMLElement, options?: Options): Promise<Uint8ClampedArray>;
  export function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  export function toCanvas(node: HTMLElement, options?: Options): Promise<HTMLCanvasElement>;
}
