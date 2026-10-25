/**
 * Site-wide settings. The social icons are shown as in the design but do nothing
 * until a profile URL is set here.
 */

export type SiteLink = { label: string; href: string | null };

export type SocialNetwork = "x" | "instagram" | "facebook" | "youtube" | "linkedin";

/** Email address that receives messages from the contact/feedback form. Until it's set, the form is hidden. */
const FEEDBACK_EMAIL: string | null = null;

export function feedbackHref(subject = "Squishly feedback", body = ""): string | null {
  if (!FEEDBACK_EMAIL) return null;
  const query = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `mailto:${FEEDBACK_EMAIL}?${query}`;
}

export const siteConfig = {
  name: "Squishly",
  tagline: "The fastest way to compress images without sacrificing quality.",
  copyrightYear: 2026,
  title: "Squishly – Compress Images Without Losing Quality",
  description:
    "Reduce JPG, PNG, WebP, AVIF, HEIC and other image file sizes in seconds while keeping excellent quality. Free, private image compression that runs entirely in your browser.",

  /** Rating shown under the upload area. Values come from the design — replace with real figures. */
  rating: { value: 4.8, outOf: 5, count: 3480 },

  mainNav: [
    { label: "Compress", href: "/" },
    { label: "Features", href: "/#features" },
    { label: "About", href: "/about" },
    { label: "Blogs", href: "/blogs" },
    { label: "Give Suggestions", href: "/contact" },
  ] satisfies SiteLink[],

  account: {
    login: { label: "Login", href: "/login" } as SiteLink,
    signUp: { label: "Sign Up", href: "/signup" } as SiteLink,
  },

  social: {
    x: null,
    instagram: null,
    facebook: null,
    youtube: null,
    linkedin: null,
  } as Record<SocialNetwork, string | null>,

  footerNav: [
    {
      title: "Product",
      links: [
        { label: "Image Compressor", href: "/" },
        { label: "How It Works", href: "/#how-it-works" },
        { label: "Features", href: "/#features" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Compression Guides", href: "/blogs" },
        { label: "Blog", href: "/blogs" },
        { label: "FAQ", href: "/#faq" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Feedback", href: "/contact#feedback" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Cookies", href: "/cookies" },
      ],
    },
  ] satisfies { title: string; links: SiteLink[] }[],
};

export function withHref<T extends SiteLink>(links: T[]): (T & { href: string })[] {
  return links.filter((link): link is T & { href: string } => link.href !== null);
}
