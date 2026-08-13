import type { Metadata } from 'next';
import { getPageSEO } from '@/lib/seo';
import BlogListClient from './BlogListClient';
import { BlogPost } from '@/lib/blog';

const BLOG_API_URL = 'https://img.cybronetwork.online/blogs-api.php';

async function getPublishedBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${BLOG_API_URL}?published=1`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.blogs) ? data.blogs : [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = getPageSEO('blog');

export default async function BlogListPage() {
  const blogs = await getPublishedBlogs();
  return <BlogListClient initialBlogs={blogs} />;
}