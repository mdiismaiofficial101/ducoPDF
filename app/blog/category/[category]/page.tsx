'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedBlogs, BlogPost, formatDate, calculateReadingTime } from '@/lib/blog';
import { Calendar, Clock, ArrowRight, FileText } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const category = decodeURIComponent(params?.category as string || '');
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    const load = () => setBlogs(getPublishedBlogs().filter(b => b.category === category));
    load();
    window.addEventListener('blog-updated', load);
    return () => window.removeEventListener('blog-updated', load);
  }, [category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <Link href="/blog" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition mb-4 inline-block">&larr; All Blogs</Link>
        <h1 className="text-4xl font-bold text-[#1A237E] mb-2">{category}</h1>
        <p className="text-slate-500">{blogs.length} articles in this category</p>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No articles found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map(blog => (
            <article key={blog.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group">
              <Link href={`/blog/${blog.slug}`} className="block relative aspect-[1200/630] bg-slate-100">
                {blog.featuredImage ? (
                  <Image src={blog.featuredImage} alt={blog.imageAlt || blog.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="(max-width: 768px) 100vw, 50vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl font-bold">D</div>
                )}
              </Link>
              <div className="p-5">
                <span className="text-xs text-indigo-600 font-semibold">{blog.category}</span>
                <Link href={`/blog/${blog.slug}`}>
                  <h2 className="text-lg font-bold text-slate-900 mt-1 group-hover:text-[#1A237E] transition">{blog.title}</h2>
                </Link>
                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{blog.shortDescription}</p>
                <p className="text-xs text-slate-500 mt-3 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(blog.publishDate)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{calculateReadingTime(blog.content)} min</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
