import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleBody } from "@/components/blog/article-body";
import { GuidesSection } from "@/components/blog/guides-section";
import { blogPosts, getPost } from "@/content/blogs";
import { siteConfig } from "@/config/site";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blogs/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      siteName: siteConfig.name,
      images: [{ url: post.heroImage.src, width: post.heroImage.width, height: post.heroImage.height, alt: post.heroImageAlt }],
    },
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
  const post = getPost((await params).slug);
  if (!post) notFound();

  const related = blogPosts.filter((other) => other.slug !== post.slug);

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
              src={post.heroImage}
              alt={post.heroImageAlt}
              priority
              placeholder="blur"
              sizes="(min-width: 960px) 896px, 100vw"
              className="w-full rounded-xl sm:rounded-[20px]"
            />
            <div className="mt-8 sm:mt-10">
              <ArticleBody blocks={post.body} />
            </div>
          </div>
        </div>
      </article>

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
