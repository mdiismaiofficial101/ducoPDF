'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPublishedBlogs, BlogPost, formatDate, calculateReadingTime, ALL_TOOLS, getBlogSchema, getBlogBreadcrumbSchema, getBlogFAQSchema } from '@/lib/blog';
import JsonLd from '@/components/JsonLd';
import Breadcrumbs from '@/components/Breadcrumbs';
import { Calendar, Clock, User, Tag, ArrowLeft, ArrowRight, Share2, Check } from 'lucide-react';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => {
        const all: BlogPost[] = Array.isArray(d.blogs) ? d.blogs : [];
        const post = all.find(b => b.slug === slug);
        setBlog(post || null);
        if (post) {
          const others = all.filter(b => b.id !== post.id);
          const relatedByTool = others.filter(b => b.relatedTools?.some(t => post.relatedTools?.includes(t)));
          const relatedByCat = others.filter(b => b.category === post.category && !relatedByTool.includes(b));
          setRelated([...relatedByTool, ...relatedByCat].slice(0, 3));
        }
      })
      .catch(() => setBlog(null));
  }, [slug]);

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Blog Not Found</h1>
        <p className="text-slate-600 mb-6">This blog post doesn&apos;t exist or has been removed.</p>
        <Link href="/blog" className="text-[#1A237E] font-semibold hover:underline">&larr; Back to Blog</Link>
      </div>
    );
  }

  const readingTime = calculateReadingTime(blog.content);
  const siteUrl = 'https://cybronetwork.online';

  const handleShare = () => {
    const shareUrl = `${siteUrl}/blog/${blog.slug}`;
    if (navigator.share) {
      navigator.share({ title: blog.title, url: shareUrl }).catch(() => {
        navigator.clipboard.writeText(shareUrl).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          const input = document.createElement('input');
          input.value = shareUrl;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={getBlogSchema(blog)} />
      <JsonLd data={getBlogBreadcrumbSchema(blog.slug, blog.title)} />
      {getBlogFAQSchema(blog.faq) && <JsonLd data={getBlogFAQSchema(blog.faq)!} />}

      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#1A237E] transition cursor-pointer mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <Breadcrumbs items={[
        { label: 'Blog', href: '/blog' },
        { label: blog.title },
      ]} />

        <article>
          <header className="mb-8">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
              <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold text-xs">{blog.category}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(blog.publishDate)}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {readingTime} min read</span>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {blog.author}</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">{blog.title}</h1>
            <p className="text-lg text-slate-600 leading-relaxed">{blog.shortDescription}</p>
          </header>

        {blog.featuredImage && (
          <div className="relative aspect-[1200/630] rounded-2xl overflow-hidden mb-8 bg-slate-100">
            <Image src={blog.featuredImage} alt={blog.imageAlt || blog.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 800px" priority />
          </div>
        )}

        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}

        {blog.faq && blog.faq.length > 0 && (
          <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Table of Contents</h2>
            <nav aria-label="Table of contents">
              <ul className="space-y-2">
                {blog.faq.map((faq, i) => (
                  <li key={i}><a href={`#faq-${i}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition">{i + 1}. {faq.question}</a></li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        <div className="prose prose-slate max-w-none prose-lg prose-headings:text-slate-900 prose-a:text-[#1A237E] prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: blog.content }} />

        {blog.faq && blog.faq.length > 0 && (
          <section className="mt-12 p-8 bg-white rounded-2xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {blog.faq.map((faq, i) => (
                <div key={i} id={`faq-${i}`} className="border border-slate-100 rounded-xl p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {blog.relatedTools && blog.relatedTools.length > 0 && (
          <section className="mt-12 p-8 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Try These PDF Tools</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {blog.relatedTools.map(toolName => {
                const tool = ALL_TOOLS.find(t => t.name === toolName);
                return tool ? (
                  <Link key={toolName} href={tool.href}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-slate-200 hover:border-[#FF6F00] hover:shadow-md transition-all text-sm font-semibold text-slate-700 hover:text-[#1A237E]">
                    {tool.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : null;
              })}
            </div>
          </section>
        )}

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200">
          <span className="text-sm text-slate-500">By <strong className="text-slate-700">{blog.author}</strong></span>
          <button onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition cursor-pointer">
            {copied ? <><Check className="w-4 h-4 text-green-600" /> Copied!</> : <><Share2 className="w-4 h-4" /> Share</>}
          </button>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map(r => (
              <Link key={r.id} href={`/blog/${r.slug}`} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                <div className="relative aspect-[1200/630] bg-slate-100">
                  {r.featuredImage ? (
                    <Image src={r.featuredImage} alt={r.imageAlt || r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl font-bold">D</div>
                  )}
                </div>
                <div className="p-4">
                  <span className="text-xs text-indigo-600 font-semibold">{r.category}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-1 group-hover:text-[#1A237E] transition">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(r.publishDate)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
