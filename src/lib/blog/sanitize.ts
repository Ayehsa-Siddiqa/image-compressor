import "server-only";
import sanitizeHtml from "sanitize-html";

/** Keeps only what the dashboard editor produces, so saved articles can't carry scripts or styles. */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "hr", "img", "code", "pre"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "width", "height"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: {
      // Links to other sites open in a new tab without giving that site access to this one.
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href);
        const kept: sanitizeHtml.Attributes = external ? { href, target: "_blank", rel: "noopener noreferrer" } : { href };
        return { tagName, attribs: kept };
      },
    },
  });
}
