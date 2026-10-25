import type { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { blogPosts } from "@/content/blogs";

export const metadata: Metadata = {
  title: "Image Compression Guides",
  description:
    "Learn how to compress, optimize, and manage your images for better quality, smaller file sizes, and faster websites.",
};

export default function BlogsPage() {
  return (
    <section className="bg-hero pt-10 pb-14 sm:pt-14 sm:pb-20 md:pt-16 md:pb-28">
      <div className="container-page">
        <SectionHeading
          as="h1"
          title="Image Compression Guides"
          subtitle="Learn How To Compress, Optimize, And Manage Your Images For Better Quality, Smaller File Sizes, And Faster Websites."
        />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 md:mt-12">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} headingLevel="h2" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
