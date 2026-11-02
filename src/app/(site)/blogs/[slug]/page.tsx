import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleBody } from "@/components/blog/article-body";
import { GuidesSection } from "@/components/blog/guides-section";
import { blogPosts as builtInPosts, type BlogPost } from "@/content/blogs";
import { getPublishedPost, getPublishedPosts } from "@/lib/blog/posts";
import { siteConfig } from "@/config/site";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  // At least one param is required; with nothing published yet, the built-in slugs simply render 404s.
  return (posts.length > 0 ? posts : builtInPosts).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return {};
  // Empty SEO fields fall back to the post's own title, summary and main image.
  const seo = post.seo ?? {};
  const title = seo.title || post.title;
  const description = seo.description || post.description;
  const image = seo.ogImage ?? post.heroImage;
  return {
    title,
    description,
    keywords: seo.keywords?.length ? seo.keywords : undefined,
    alternates: { canonical: seo.canonical || `/blogs/${post.slug}` },
    robots: seo.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      title,
      description,
      url: `/blogs/${post.slug}`,
      publishedTime: post.publishedAt,
      siteName: siteConfig.name,
      images: [{ url: image.src, width: image.width, height: image.height, alt: seo.ogImage ? title : post.heroImageAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.src] },
  };
}

// The page shell doesn't read `params`; the post itself does, inside <Suspense>. Every slug is prerendered
// by generateStaticParams, so direct visits get full static HTML. The skeleton only appears briefly on an
// in-app navigation that hasn't been prefetched yet. (Required by Cache Components' instant navigation check.)
export default function BlogPostPage({ params }: PageProps<"/blogs/[slug]">) {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <BlogPost params={params} />
    </Suspense>
  );
}

async function BlogPost({ params }: Pick<PageProps<"/blogs/[slug]">, "params">) {
  const { slug } = await params;
  const posts = await getPublishedPosts();
  const post = posts.find((other) => other.slug === slug);
  if (!post) notFound();

  const related = posts.filter((other) => other.slug !== post.slug);

  return (
    <>
      <article className="bg-hero pt-10 pb-14 sm:pt-14 sm:pb-20 md:pt-16 md:pb-28">
        <div className="container-page">
          <header className="mx-auto max-w-[900px] text-center">
            <h1 className="font-display text-[28px] leading-[1.15] font-bold text-ink sm:text-[40px] lg:text-[56px] lg:leading-[1.18]">
              {post.title}
            </h1>
          </header>

          <div className="mx-auto mt-8 max-w-[896px] sm:mt-10">
            <Image
              src={post.heroImage.src}
              width={post.heroImage.width}
              height={post.heroImage.height}
              alt={post.heroImageAlt}
              priority
              placeholder={post.heroImage.blurDataURL ? "blur" : "empty"}
              blurDataURL={post.heroImage.blurDataURL}
              sizes="(min-width: 960px) 896px, 100vw"
              className="w-full rounded-xl sm:rounded-[20px]"
            />
            <div className="mt-8 sm:mt-10">
              {post.contentHtml ? (
                // Sanitised when saved in the dashboard (src/lib/blog/sanitize.ts).
                <div className="article-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
              ) : (
                <ArticleBody blocks={post.body} />
              )}
              {post.faq && <ArticleBody blocks={[{ type: "faq", ...post.faq }]} />}
            </div>
          </div>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(post) }} />
      <GuidesSection title="Must Read Relevant Blogs" eyebrow="" posts={related} tone="surface" />
    </>
  );
}

function ArticleSkeleton() {
  return (
    <div className="bg-hero pt-14 pb-20 md:pt-16 md:pb-28" aria-busy="true" aria-label="Loading article">
      <div className="container-page animate-pulse">
        <div className="mx-auto flex max-w-[900px] flex-col items-center gap-4">
          <div className="h-10 w-full max-w-[760px] rounded-xl bg-line md:h-14" />
          <div className="h-10 w-2/3 max-w-[520px] rounded-xl bg-line md:h-14" />
        </div>
        <div className="mx-auto mt-10 aspect-[1693/942] max-w-[896px] rounded-[20px] bg-line" />
        <div className="mx-auto mt-10 max-w-[896px] space-y-3">
          {["w-full", "w-11/12", "w-full", "w-4/5"].map((width, i) => (
            <div key={i} className={`h-4 rounded bg-line ${width}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Article (and FAQ, when present) structured data for search engines. */
function structuredData(post: BlogPost): string {
  const faq = post.faq ?? post.body.find((block) => block.type === "faq");
  const data: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.seo?.title || post.title,
      description: post.seo?.description || post.description,
      image: [(post.seo?.ogImage ?? post.heroImage).src],
      datePublished: post.publishedAt,
      keywords: post.seo?.keywords?.join(", ") || undefined,
      publisher: { "@type": "Organization", name: siteConfig.name },
      mainEntityOfPage: `/blogs/${post.slug}`,
    },
  ];
  if (faq) {
    data.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
    });
  }
  // Escape "<" so text in the JSON can't close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
