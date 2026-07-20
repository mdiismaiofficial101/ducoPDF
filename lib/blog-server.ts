import { BLOG_API_URL } from "./blog-server-config";
import type { BlogPost } from "./blog";

export async function fetchBlogs(publishedOnly = false): Promise<BlogPost[]> {
  try {
    const url = publishedOnly ? `${BLOG_API_URL}?published=1` : BLOG_API_URL;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (data && Array.isArray(data.blogs)) return data.blogs as BlogPost[];
    return [];
  } catch {
    return [];
  }
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost | undefined> {
  const blogs = await fetchBlogs(false);
  return blogs.find((b) => b.slug === slug);
}

export async function fetchPublishedBlogs(): Promise<BlogPost[]> {
  const blogs = await fetchBlogs(true);
  return blogs.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );
}

export async function fetchBlogsForSitemap() {
  const blogs = await fetchPublishedBlogs();
  return blogs.map((b) => ({
    url: `https://cybronetwork.online/blog/${b.slug}`,
    lastModified: new Date(b.updatedAt || b.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
}
