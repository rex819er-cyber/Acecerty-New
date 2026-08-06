import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';

const ARTICLES = [
  { id: 0, tag: 'CYBERSECURITY', readTime: '8 min read', title: 'A Ranked Look at the Hardest CISSP Domains', excerpt: 'Breaking down all 8 CISSP domains by difficulty, with expert strategies for tackling the toughest sections in your exam prep.', color: '#dc2626', gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0B1D3A 100%)' },
  { id: 1, tag: 'CERTIFICATIONS', readTime: '12 min read', title: 'Top 15 Cyber Security Certifications for 2026', excerpt: 'A comprehensive guide to the most in-demand cybersecurity certifications ranked by salary potential, job demand, and difficulty.', color: '#7c3aed', gradient: 'linear-gradient(135deg, #2d1b69 0%, #1a0e40 100%)' },
  { id: 2, tag: 'ISACA', readTime: '10 min read', title: 'The Complete 2026 Guide to ISACA Certifications', excerpt: 'Everything you need to know about CISA, CISM, CGRC, and CDPSE — requirements, costs, exam tips, and career outcomes.', color: '#0891b2', gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0B1D3A 100%)' },
  { id: 3, tag: 'SECURITY', readTime: '6 min read', title: 'Encryption Best Practices 2026: Guide to Data Protection', excerpt: 'From AES-256 to post-quantum cryptography — the encryption standards every security professional needs to understand today.', color: '#059669', gradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' },
];

export function BlogSection() {

  return (
    <section className="py-20 lg:py-28 bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#00A2B6' }}>Resources</p>
            <h2 className="text-foreground" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800 }}>
              What's New in IT Certification
            </h2>
            <p className="mt-2 text-muted-foreground" style={{ fontSize: '1.05rem' }}>
              Expert insights, career guides, and certification trends.
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all whitespace-nowrap flex-shrink-0"
            style={{ border: '1px solid var(--ace-brand)', color: '#00A2B6' }}
          >
            View All Articles <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ARTICLES.map((article) => (
            <article
              key={article.id}
              className="group flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,162,182,0.12)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
            >
              <div className="h-44 flex flex-col justify-between p-5" style={{ background: article.gradient }}>
                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: article.color, letterSpacing: '0.04em' }}>
                  {article.tag}
                </span>
                <div className="flex items-center gap-2 text-white/50 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{article.readTime}</span>
                </div>
              </div>

              <div className="flex flex-col flex-1 p-5">
                <h3
                  className="mb-3 leading-snug transition-colors text-foreground" style={{ fontSize: '0.95rem', fontWeight: 700 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#00A2B6')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--foreground)')}
                >
                  {article.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1 mb-4 text-muted-foreground">
                  {article.excerpt}
                </p>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#00A2B6' }}>
                  Read More <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
