import { blogPosts, type BlogPost } from "@/content/blogs";
import { SectionHeading } from "@/components/ui/section-heading";
import { BlogCard } from "./blog-card";
import { CardCarousel } from "./card-carousel";

interface GuidesSectionProps {
  title?: string;
  eyebrow?: string;
  posts?: BlogPost[];
  tone?: "glow" | "surface";
}

export function GuidesSection({
  title = "Image Compression Guides",
  eyebrow = "Blogs",
  posts = blogPosts,
  tone = "glow",
}: GuidesSectionProps) {
  if (posts.length === 0) return null;
  return (
    <section
      aria-labelledby="guides-heading"
      className={`py-12 sm:py-16 md:py-24 ${tone === "glow" ? "bg-glow" : "bg-surface"}`}
    >
      <div className="container-page">
        <SectionHeading
          id="guides-heading"
          align="left"
          eyebrow={eyebrow}
          title={title}
          subtitle="Learn How To Compress, Optimize, And Manage Your Images For Better Quality, Smaller File Sizes, And Faster Websites."
        />
        <div className="mt-8 sm:mt-10 md:mt-12">
          <CardCarousel label={title}>
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </CardCarousel>
        </div>
      </div>
    </section>
  );
}
