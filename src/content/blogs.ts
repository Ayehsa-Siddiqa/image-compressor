import type { StaticImageData } from "next/image";
import type { FaqItem } from "./faq";
import compressPngFiles from "@/assets/blog/compress-png-files.webp";
import webpVsJpgVsPng from "@/assets/blog/webp-vs-jpg-vs-png.webp";
import bestCompressionTools from "@/assets/blog/best-compression-tools.webp";
import compressOnlineHero from "@/assets/blog/compress-images-online-hero.webp";

/** A run of text; `**bold**` segments are rendered in bold and `[label](/href)` as links. */
type Rich = string;

export type ArticleBlock =
  | { type: "paragraphs"; lines: Rich[] }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "list"; items: Rich[] }
  | { type: "faq"; title: string; subtitle: string; items: FaqItem[] };

export interface BlogPost {
  slug: string;
  /** Title used on cards. */
  cardTitle: string;
  /** Title used on the article page. */
  title: string;
  description: string;
  publishedAt: string;
  cardImage: StaticImageData;
  cardImageAlt: string;
  heroImage: StaticImageData;
  heroImageAlt: string;
  body: ArticleBlock[];
}

const howToCompress: BlogPost = {
  slug: "how-to-compress-images-without-losing-quality",
  cardTitle: "How to Compress Images Without Losing Quality",
  title: "How to Compress Images Online Without Losing Quality",
  description:
    "Learn how image compression works, which image format to choose, how to reduce file size, and how to keep the best possible image quality.",
  publishedAt: "2026-08-20",
  cardImage: compressPngFiles,
  cardImageAlt: "Illustration of a 5.25 MB PNG file being compressed to 128 KB",
  heroImage: compressOnlineHero,
  heroImageAlt:
    "Original 2.4 MB mountain photo next to a 184 KB compressed copy at the same 4000 × 2667 size, with JPG, PNG, WebP, AVIF and GIF format icons",
  body: [
    {
      type: "paragraphs",
      lines: [
        "Large image files can take up storage space, slow down websites, and make uploading images more difficult. Whether you are preparing photos for a website, sending images by email, or uploading files to an online form, reducing image size can make the process easier.",
        "The good news is that you can compress images online in just a few steps without making them look noticeably worse.",
        "In this guide, you will learn how image compression works, which image format to choose, how to reduce file size, and how to maintain the best possible image quality.",
      ],
    },
    { type: "h2", text: "What Is Image Compression?" },
    {
      type: "paragraphs",
      lines: [
        "Image compression is the process of reducing the amount of data needed to store an image. A compressed image takes up less disk space and can be faster to upload, download, or display on a website.",
        "There are two main types of image compression:",
        "Lossy compression: This method removes some image information to reduce file size. JPEG and many WebP compression workflows use this approach. When configured carefully, the visual difference can be difficult to notice.",
        "Lossless compression: This method reduces file size without discarding the original image information. It is useful when preserving exact image data is important, although the file-size reduction may be smaller.",
        "The best method depends on the image, its format, and how you plan to use it.",
      ],
    },
    { type: "h2", text: "How to Compress Images Online" },
    {
      type: "paragraphs",
      lines: ["You can reduce image file size without installing desktop software. Follow these simple steps."],
    },
    { type: "h3", text: "Step 1: Choose Your Image" },
    {
      type: "paragraphs",
      lines: [
        "Open an online image compressor and upload your image. Depending on the tool, you may be able to select JPEG, PNG, WebP, AVIF, or other supported formats.",
      ],
    },
    { type: "h3", text: "Step 2: Select Your Compression Settings" },
    {
      type: "paragraphs",
      lines: [
        "Choose automatic compression for a quick result or adjust the quality setting if the tool provides one.",
        "For photos, a moderate quality setting can often reduce file size considerably while keeping the image visually appealing. Graphics, screenshots, and images with transparent backgrounds may need different settings.",
      ],
    },
    { type: "h3", text: "Step 3: Preview the Result" },
    {
      type: "paragraphs",
      lines: [
        "Compare the original image with the compressed version. Check small text, edges, fine details, gradients, and transparent areas where supported.",
      ],
    },
    { type: "h3", text: "Step 4: Download the Compressed Image" },
    {
      type: "paragraphs",
      lines: [
        "If the result looks good and meets your file-size requirements, download it and use it on your website, in your documents, or wherever it is needed.",
      ],
    },
    {
      type: "paragraphs",
      lines: [
        "**Tip:** If you need an image under a specific limit, such as 100 KB, choose a tool that supports target file sizes. Ordinary compression does not guarantee that every image will reach a particular size.",
      ],
    },
    { type: "h2", text: "Which Image Format Should You Use?" },
    { type: "paragraphs", lines: ["Different formats work better for different types of images."] },
    { type: "h3", text: "JPEG or JPG" },
    {
      type: "paragraphs",
      lines: [
        "JPEG is commonly used for photographs, product images, and other images with many colours. It offers a practical balance between image quality and file size.",
        "Use JPEG when you need compact photographic images and do not need transparency.",
      ],
    },
    { type: "h3", text: "PNG" },
    {
      type: "paragraphs",
      lines: [
        "PNG is useful for logos, interface graphics, screenshots, and images that require transparent backgrounds. It can preserve image details, but complex photographs may produce larger files than JPEG or other modern formats.",
        "Use PNG when transparency or lossless image data matters.",
      ],
    },
    { type: "h3", text: "WebP" },
    {
      type: "paragraphs",
      lines: [
        "WebP supports lossy and lossless compression, as well as transparency. It is a useful option for website images because it can provide smaller files while maintaining suitable visual quality.",
        "Use WebP when you want an efficient format for web delivery and your workflow supports it.",
      ],
    },
    { type: "h3", text: "AVIF" },
    {
      type: "paragraphs",
      lines: [
        "AVIF is a modern image format that can provide efficient compression. It can be useful for websites that want to reduce image transfer sizes, although compatibility and workflow requirements should be checked for your intended audience.",
      ],
    },
    { type: "h3", text: "GIF" },
    {
      type: "paragraphs",
      lines: [
        "GIF is mainly used for simple animations and limited-colour graphics. Animated GIFs can become large because they contain multiple frames. Depending on your requirements, optimizing the animation or converting it to a more suitable format may help.",
      ],
    },
    { type: "h2", text: "How to Reduce Image Size Without Noticeable Quality Loss" },
    {
      type: "paragraphs",
      lines: ["The right settings depend on the original image. These tips can help you get a better result."],
    },
    { type: "h3", text: "1. Choose the Right Format" },
    {
      type: "paragraphs",
      lines: [
        "Do not use the same format for every image. Photographs, transparent logos, illustrations, and animations have different needs.",
      ],
    },
    { type: "h3", text: "2. Resize Oversized Images" },
    {
      type: "paragraphs",
      lines: [
        "If an image is 4000 pixels wide but only needs to appear at 800 pixels wide, reducing its dimensions can significantly reduce its file size.",
        "Always keep a suitable copy of the original before resizing.",
      ],
    },
    { type: "h3", text: "3. Adjust Quality Gradually" },
    {
      type: "paragraphs",
      lines: [
        "For lossy formats, try moderate compression first. Compare the output and increase compression only when the visual quality remains acceptable.",
      ],
    },
    { type: "h3", text: "4. Remove Unnecessary Metadata" },
    {
      type: "paragraphs",
      lines: [
        "Some images contain metadata such as camera details or location information. Removing unnecessary metadata may reduce file size and help protect privacy, depending on the image.",
      ],
    },
    { type: "h3", text: "5. Compare Before and After" },
    {
      type: "paragraphs",
      lines: [
        "Never judge compression by file size alone. An extremely small image is not useful if important details become blurry or unwanted artifacts appear.",
      ],
    },
    { type: "h2", text: "Why Should You Compress Images for a Website?" },
    { type: "paragraphs", lines: ["Image optimization can improve the experience of people visiting your website."] },
    {
      type: "paragraphs",
      lines: [
        "**Faster image delivery:** Smaller files generally require less data to transfer.",
        "**Lower bandwidth usage:** Optimized images can reduce the amount of data your website serves.",
        "**Improved mobile experience:** Visitors on slower connections may benefit from smaller image downloads.",
        "**More efficient storage:** Smaller image files can make media libraries easier to manage.",
      ],
    },
    { type: "h2", text: "Common Image Compression Mistakes" },
    { type: "paragraphs", lines: ["Avoid these common problems when optimizing images."] },
    {
      type: "list",
      items: [
        "**Compressing too aggressively:** This can cause blur, visible artifacts, or banding.",
        "**Using the wrong format:** A format that works well for a photo may not be suitable for a transparent logo.",
        "**Ignoring dimensions:** A very large image may remain unnecessarily heavy even after quality adjustment.",
        "**Converting without checking transparency:** Some conversions can replace transparent areas with a solid background.",
        "**Overwriting the original:** Keep a backup when image quality or future editing matters.",
        "**Assuming compression guarantees a specific size:** Results depend on image content, format, dimensions, and compression settings.",
      ],
    },
    {
      type: "faq",
      title: "Frequently Asked Questions",
      subtitle: "We Take Privacy Seriously. Your Images Stay Yours Always.",
      items: [
        {
          question: "Can I compress images online for free?",
          answer:
            "Yes. Many online image compressors offer free compression. Check whether the service has file-size limits, usage restrictions, watermarks, or account requirements.",
        },
        {
          question: "Does image compression always reduce quality?",
          answer:
            "No. Lossless compression keeps every pixel. Lossy compression removes some detail, but at moderate settings the difference is often hard to see. Always compare the result with the original.",
        },
        {
          question: "Which image format is best for website speed?",
          answer:
            "For photos, WebP or AVIF usually produce the smallest files, with JPEG as a widely compatible fallback. For logos and graphics with transparency, PNG or WebP are better choices.",
        },
        {
          question: "Can I compress multiple images at once?",
          answer:
            "Many tools support batch compression. Squishly lets you add up to 100 images at a time and download them together as a ZIP file.",
        },
        {
          question: "How can I reduce an image to 100 KB?",
          answer:
            "Start by resizing the image to the dimensions you actually need, then lower the quality gradually and check the file size after each step. Some images need a different format to reach a small target.",
        },
        {
          question: "Does compressing an image change its dimensions?",
          answer:
            "Not by itself. Compression changes how the image data is stored, not its width and height. Resizing is a separate step.",
        },
        {
          question: "Is it safe to upload personal images to an online compressor?",
          answer:
            "It depends on the service. Read its privacy policy to see whether files are uploaded, stored or shared. Squishly compresses images directly in your browser, so your files are never uploaded.",
        },
      ],
    },
    { type: "h2", text: "Final Thoughts" },
    {
      type: "paragraphs",
      lines: [
        "Image compression is a simple way to reduce file sizes, make image uploads easier, and optimize website media. The best results come from choosing a suitable format, using appropriate compression settings, and checking the final image before publishing it.",
        "If you regularly work with website graphics, product photos, screenshots, or personal images, an online image compressor can help simplify your workflow.",
        "Ready to optimize your images? Use our [free online image compressor](/) to reduce image file sizes and find the right balance between size and visual quality.",
      ],
    },
  ],
};

const formatComparison: BlogPost = {
  slug: "jpg-vs-png-vs-webp",
  cardTitle: "JPG vs PNG vs WebP: Which Image Format Is Best?",
  title: "JPG vs PNG vs WebP: Which Image Format Is Best?",
  description:
    "Compare JPG, PNG and WebP by file size, transparency and quality to choose the right format for photos, logos and website images.",
  publishedAt: "2026-08-20",
  cardImage: webpVsJpgVsPng,
  cardImageAlt: "Comparison chart of WebP, JPG and PNG file size and transparency support",
  heroImage: webpVsJpgVsPng,
  heroImageAlt: "Comparison chart of WebP, JPG and PNG file size and transparency support",
  body: [
    {
      type: "paragraphs",
      lines: [
        "JPG, PNG and WebP are the three image formats you will meet most often on the web. Each one stores images differently, so the right choice depends on what the image contains and where it will be used.",
      ],
    },
    { type: "h2", text: "JPG: Best for Photographs" },
    {
      type: "paragraphs",
      lines: [
        "JPG (also written JPEG) uses lossy compression designed for photographs. It handles smooth gradients and millions of colours well and keeps files small, which is why almost every camera and phone saves photos as JPG.",
        "JPG does not support transparency, and repeated editing and re-saving can slowly reduce quality. Sharp edges and text can show visible artifacts at low quality settings.",
      ],
    },
    { type: "h2", text: "PNG: Best for Graphics and Transparency" },
    {
      type: "paragraphs",
      lines: [
        "PNG uses lossless compression, so every pixel is preserved exactly. It supports full transparency, which makes it the usual choice for logos, icons, screenshots and interface graphics.",
        "The trade-off is size: a photograph saved as PNG is often several times larger than the same photo saved as JPG. Reducing the number of colours in a PNG can shrink it considerably while keeping transparency.",
      ],
    },
    { type: "h2", text: "WebP: A Modern All-Rounder" },
    {
      type: "paragraphs",
      lines: [
        "WebP was created by Google for the web. It supports both lossy and lossless compression, transparency and animation in a single format. Google reports that lossy WebP files are typically 25–34% smaller than comparable JPG files.",
        "All current major browsers can display WebP. Some older software and some image editors still have limited support, so keep a JPG or PNG copy if you need to share files outside the web.",
      ],
    },
    { type: "h2", text: "Quick Comparison" },
    {
      type: "list",
      items: [
        "**File size:** WebP is usually smallest, JPG is small for photos, PNG is largest for photos.",
        "**Transparency:** Supported by PNG and WebP, not by JPG.",
        "**Compression:** JPG is lossy, PNG is lossless, WebP can be either.",
        "**Compatibility:** JPG and PNG work almost everywhere, while WebP works in all modern browsers.",
      ],
    },
    { type: "h2", text: "Which Format Should You Choose?" },
    {
      type: "list",
      items: [
        "**Photos for a website:** WebP, with JPG as a fallback for older tools.",
        "**Photos to share or print:** JPG.",
        "**Logos, icons and screenshots:** PNG, or WebP when you only need it on the web.",
        "**Anything with a transparent background:** PNG or WebP. Never JPG.",
      ],
    },
    { type: "h2", text: "Final Thoughts" },
    {
      type: "paragraphs",
      lines: [
        "There is no single best format. Match the format to the image, then compress it to remove the data you don't need. You can [compress JPG, PNG and WebP images](/) with Squishly directly in your browser. Each image keeps its original format, so transparency is preserved.",
      ],
    },
  ],
};

const bestLevel: BlogPost = {
  slug: "best-image-compression-level",
  cardTitle: "What Is the Best Image Compression Level?",
  title: "What Is the Best Image Compression Level?",
  description:
    "Find out which quality setting gives the best balance between file size and visual quality for photos, graphics and transparent images.",
  publishedAt: "2026-08-20",
  cardImage: bestCompressionTools,
  cardImageAlt: "Illustration of an image being squeezed in a press next to quality and speed sliders",
  heroImage: bestCompressionTools,
  heroImageAlt: "Illustration of an image being squeezed in a press next to quality and speed sliders",
  body: [
    {
      type: "paragraphs",
      lines: [
        "Most image compressors give you a quality setting, usually from 0 to 100. Lower numbers produce smaller files with more visible loss, and higher numbers keep more detail but save less space. So which number should you choose?",
      ],
    },
    { type: "h2", text: "There Is No Single Perfect Number" },
    {
      type: "paragraphs",
      lines: [
        "The same quality setting can look very different on different images. A busy landscape photo hides compression artifacts well, while a flat illustration or an image with text shows them quickly. Quality numbers also aren't comparable between tools or formats. JPG quality 80 in one app is not the same as WebP quality 80 in another.",
      ],
    },
    { type: "h2", text: "Good Starting Points" },
    {
      type: "list",
      items: [
        "**Photos (JPG or WebP):** Start around 75–85. This range usually removes a large share of the file size with little visible difference.",
        "**Large hero or background images:** Try 65–75, since they are often viewed quickly and at a distance.",
        "**Images with text, sharp edges or UI elements:** Stay at 85–90, or use PNG to avoid blurry edges.",
        "**PNG graphics:** Quality controls how many colours are kept. Simple logos and icons often look identical with a much smaller palette.",
      ],
    },
    { type: "h2", text: "How to Find the Right Level for Your Image" },
    {
      type: "list",
      items: [
        "**Start in the middle:** Compress at a moderate setting such as 80.",
        "**Compare at full size:** Look closely at faces, text, edges and smooth gradients such as skies.",
        "**Adjust in small steps:** Lower the quality until you notice a difference, then go back up a step.",
        "**Check the file size:** Stop once the file is small enough for where it will be used.",
      ],
    },
    { type: "h2", text: "When Compression Can't Help" },
    {
      type: "paragraphs",
      lines: [
        "If an image has already been heavily compressed, saving it again may barely change the size or even make it larger. Squishly detects this and keeps your original file instead of giving you a bigger one. In that case, resizing the image or choosing a different format is usually the better option.",
      ],
    },
    { type: "h2", text: "Final Thoughts" },
    {
      type: "paragraphs",
      lines: [
        "The best compression level is the lowest one where the image still looks right for its purpose. With [Squishly](/), you can adjust the quality slider under Advanced Options, see the estimated output size, and compare before and after before you download.",
      ],
    },
  ],
};

export const blogPosts: BlogPost[] = [howToCompress, formatComparison, bestLevel];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function formatPostDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
