import Image from "next/image";
import Link from "next/link";
import { formatPostDate, type BlogPost } from "@/content/blogs";

export function BlogCard({ post, headingLevel = "h3" }: { post: BlogPost; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const href = `/blogs/${post.slug}`;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-card shadow-card transition-shadow duration-200 hover:shadow-[0_12px_32px_rgb(17_17_17/0.08)]">
      <Link href={href} tabIndex={-1} aria-hidden className="block overflow-hidden">
        <Image
          src={post.cardImage}
          alt=""
          placeholder="blur"
          sizes="(min-width: 1024px) 410px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[410/259] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <time dateTime={post.publishedAt} className="text-sm text-subtle sm:text-base md:text-lg">
          {formatPostDate(post.publishedAt)}
        </time>
        <Heading className="mt-3 font-sans text-xl leading-[1.25] font-normal text-ink sm:text-2xl md:text-[28px]">
          <Link href={href} className="hover:text-accent">
            {post.cardTitle}
          </Link>
        </Heading>
        <div className="mt-auto pt-5">
          <Link
            href={href}
            className="inline-flex h-9 items-center rounded-full border border-primary px-4 text-sm sm:h-10 sm:px-[18px] sm:text-base text-body transition-colors hover:bg-primary hover:text-white"
            aria-label={`Read more: ${post.cardTitle}`}
          >
            Read More
          </Link>
        </div>
      </div>
    </article>
  );
}
