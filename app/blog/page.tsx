'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost, formatDate, calculateReadingTime, BLOG_CATEGORIES } from '@/lib/blog';
import { Calendar, Clock, ArrowRight, Search } from 'lucide-react';

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/blogs?published=1')
      .then(r => r.json())
      .then(d => setBlogs(Array.isArray(d.blogs) ? d.blogs : []))
      .catch(() => setBlogs([]));
  }, []);

  const filtered = blogs.filter(b => {
    const matchCat = activeCategory === 'All' || b.category === activeCategory;
    const matchSearch = !searchQuery || b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 mb-4 transition font-medium">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-[#1A237E] mb-4">DocuPDF Blog</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Tips, tutorials, and guides to help you work smarter with PDFs.</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          <button onClick={() => setActiveCategory('All')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer ${activeCategory === 'All' ? 'bg-[#1A237E] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All</button>
          {BLOG_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition cursor-pointer ${activeCategory === cat ? 'bg-[#1A237E] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{cat}</button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search blogs..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-500">No blogs found. Check back soon for new articles!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(blog => (
            <article key={blog.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group flex flex-col">
              <Link href={`/blog/${blog.slug}`} className="block relative aspect-[1200/630] overflow-hidden bg-slate-100">
                {blog.featuredImage ? (
                  <Image src={blog.featuredImage} alt={blog.imageAlt || blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl font-bold bg-gradient-to-br from-indigo-50 to-slate-100">D</div>
                )}
              </Link>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-semibold">{blog.category}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(blog.publishDate)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{calculateReadingTime(blog.content)} min read</span>
                </div>
                <Link href={`/blog/${blog.slug}`}>
                  <h2 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#1A237E] transition-colors">{blog.title}</h2>
                </Link>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">{blog.shortDescription}</p>
                <Link href={`/blog/${blog.slug}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF6F00] hover:text-amber-600 transition mt-auto">
                  Read More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
