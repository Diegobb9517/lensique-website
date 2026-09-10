import React from 'react';
import { blogPosts } from '../data/blogPosts';
import { ArrowLeft } from 'lucide-react';
import { marked } from 'marked';

export default function BlogPost({ slug }: { slug: string }) {
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <h2>ArtÃ­culo no encontrado</h2>
        <a href="/blog" style={{ color: '#0066cc', textDecoration: 'none' }}>Volver al blog</a>
      </div>
    );
  }

  const contentHtml = marked.parse(post.body) as string;

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '100px 20px 80px' }}>
        <a href="/blog" style={{ display: 'inline-flex', alignItems: 'center', color: '#64748b', textDecoration: 'none', marginBottom: '32px', fontSize: '14px', fontWeight: 500 }}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Todos los artÃ­culos
        </a>
        
        <div style={{ width: '100%', height: 'auto', maxHeight: '450px', overflow: 'hidden', borderRadius: '16px', marginBottom: '40px' }}>
          <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        
        <div className="blog-content-wrapper" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        
        <style dangerouslySetInnerHTML={{__html: `
          .blog-content-wrapper {
            font-family: 'Inter', sans-serif;
            color: '#1d1d1f';
          }
          .blog-content-wrapper h1 {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            font-weight: 700;
            color: #1d1d1f;
            margin-bottom: 24px;
            line-height: 1.2;
          }
          .blog-content-wrapper h2 {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: 600;
            color: #1d1d1f;
            margin-top: 48px;
            margin-bottom: 20px;
          }
          .blog-content-wrapper p {
            font-size: 18px;
            line-height: 1.6;
            color: #333336;
            margin-bottom: 20px;
          }
          .blog-content-wrapper ul {
            margin-bottom: 24px;
            padding-left: 24px;
          }
          .blog-content-wrapper li {
            font-size: 18px;
            line-height: 1.6;
            color: #333336;
            margin-bottom: 10px;
          }
          .blog-content-wrapper a {
            color: #0066cc;
            text-decoration: none;
            font-weight: 500;
          }
          .blog-content-wrapper a:hover {
            text-decoration: underline;
          }
          .blog-content-wrapper blockquote {
            border-left: 4px solid #0066cc;
            background: #f8fafc;
            padding: 24px;
            margin: 32px 0;
            border-radius: 0 8px 8px 0;
            font-style: italic;
            font-size: 18px;
            color: #1e293b;
          }
          .blog-content-wrapper blockquote p {
            margin-bottom: 0;
          }
          @media (max-width: 768px) {
            .blog-content-wrapper h1 { font-size: 32px; }
            .blog-content-wrapper h2 { font-size: 24px; }
            .blog-content-wrapper p, .blog-content-wrapper li, .blog-content-wrapper blockquote { font-size: 16px; }
          }
        `}} />
      </div>
    </div>
  );
}
