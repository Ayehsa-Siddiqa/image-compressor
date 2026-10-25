// Minimal types for packages that don't ship their own.

declare module "utif" {
  interface IFD {
    width: number;
    height: number;
    [key: string]: unknown;
  }
  const UTIF: {
    decode(buffer: ArrayBuffer): IFD[];
    decodeImage(buffer: ArrayBuffer, ifd: IFD): void;
    toRGBA8(ifd: IFD): Uint8Array;
  };
  export default UTIF;
}

declare module "@jsquash/jpeg/encode.js" {
  export { default } from "@jsquash/jpeg/encode";
}
declare module "@jsquash/webp/encode.js" {
  export { default } from "@jsquash/webp/encode";
}
