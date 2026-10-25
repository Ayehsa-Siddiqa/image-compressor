export interface FaqItem {
  question: string;
  answer: string;
}

/** Homepage FAQ. Questions are from the design; answers describe how this compressor actually behaves. */
export const homeFaq: FaqItem[] = [
  {
    question: "Does image compression affect quality?",
    answer:
      "At the default setting (80%) most images look the same as the original. Squishly uses advanced encoders (MozJPEG, libwebp, libavif and oxipng) that find smaller encodings without extra visible loss. Set quality to 100% for fully lossless compression, where no pixel changes.",
  },
  {
    question: "Which file formats are supported?",
    answer:
      "JPG, PNG, WebP, AVIF, GIF, HEIC/HEIF (iPhone photos), TIFF, BMP, SVG and ICO. JPG, PNG, WebP, AVIF and SVG keep their format by default. HEIC, TIFF, BMP, ICO and still GIFs are saved as JPG, or as PNG if they have transparency. In Advanced Options you can convert any image to JPG, PNG, WebP or AVIF. Animated GIFs aren't supported yet.",
  },
  {
    question: "Can I compress multiple images at once?",
    answer:
      "Yes. You can add up to 100 images at a time, download each one separately, or use Download All to get every compressed image in a single ZIP file.",
  },
  {
    question: "What is the maximum file size?",
    answer:
      "Each image can be up to 50 MB and up to 100 megapixels. Very large images need a lot of memory, so phones and older computers may not be able to process the largest files.",
  },
  {
    question: "Do I need to create an account?",
    answer: "No. Just choose your images and compress them. There's nothing to sign up for.",
  },
  {
    question: "Will the compressed image dimensions change?",
    answer:
      "No. The width and height stay exactly the same. Only the way the image data is stored changes. Photos taken on phones are saved the right way up.",
  },
  {
    question: "How fast is the compression?",
    answer:
      "Most images finish in a second or two. Because everything runs on your own device, speed depends on the image size and your device. Large PNGs, HEIC photos and AVIF output take longest, because they need the most processing to get the best result.",
  },
  {
    question: "What is the difference between lossy and lossless compression?",
    answer:
      "Lossy compression discards detail you're unlikely to notice to make files much smaller. Lossless compression keeps every pixel but saves less space. In Squishly, quality 100% is lossless for every format. For PNG, lower quality reduces the number of colours while keeping transparency, and every PNG gets an extra lossless optimisation pass.",
  },
];
