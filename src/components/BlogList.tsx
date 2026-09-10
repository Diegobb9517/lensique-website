import React from 'react';
import { blogPosts } from '../data/blogPosts';
import { Calendar, ChevronRight } from 'lucide-react';

export default function BlogList() {
  return (
    <div style={{ paddingTop: '80px', backgroundColor: '#f8fafc', paddingBottom: '80px', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, color: '#1d1d1f', textAlign: 'center', marginBottom: '16px' }}>
          El Blog de Lensique
        </h1>
        <p style={{ textAlign: 'center', color: '#515154', fontSize: '18px', marginBottom: '60px', maxWidth: '600px', margin: '0 auto 60px' }}>
          Consejos, guías y verdades sobre salud visual, explicadas con honestidad por nuestros expertos.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '32px' }}>
          {blogPosts.map(post => (
            <a 
              key={post.slug} 
              href={`/blog/${post.slug}`} 
              style={{ 
                textDecoration: 'none', 
                backgroundColor: '#fff', 
                borderRadius: '16px', 
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                color: 'inherit'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ width: '100%', height: '220px', overflow: 'hidden' }}>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>
                  <Calendar size={14} />
                  <span>{new Date(post.datePublished).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1d1d1f', marginBottom: '12px', lineHeight: 1.3 }}>
                  {post.title.replace(' | Óptica Lensique', '')}
                </h2>
                <p style={{ color: '#515154', fontSize: '15px', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>
                  {post.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', color: '#0066cc', fontWeight: 500, fontSize: '14px', marginTop: 'auto' }}>
                  Leer más <ChevronRight size={16} style={{ marginLeft: '4px' }} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
