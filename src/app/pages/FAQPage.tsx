import React, { useState } from 'react';
import { ChevronDown, HelpCircle, BookOpen, Ticket, ClipboardCheck, CreditCard, Shield } from 'lucide-react';
import { Link } from 'react-router';

interface FAQItem {
  q: string;
  a: string;
}

interface FAQCategory {
  label: string;
  icon: React.ElementType;
  color: string;
  items: FAQItem[];
}

const FAQ_CATEGORIES: FAQCategory[] = [
  {
    label: 'Courses & Training',
    icon: BookOpen,
    color: '#0B1D3A',
    items: [
      {
        q: 'What types of training formats do you offer?',
        a: 'We offer live in-person bootcamps, live online virtual classrooms, and self-paced online courses. All formats are led by certified expert instructors and include hands-on lab time where applicable.',
      },
      {
        q: 'How long are the bootcamps?',
        a: 'Bootcamp durations vary by certification — typically 3 to 10 days of intensive training. Each course listing shows the exact duration. We also offer extended schedules for those who prefer a slower pace.',
      },
      {
        q: 'Do courses include study materials?',
        a: 'Yes. All courses include official courseware, digital study guides, and access to our online learning portal. Some courses also include practice exam access and flashcard decks.',
      },
      {
        q: 'What happens if I fail the exam after training?',
        a: 'We offer a Free Retake Guarantee on eligible bootcamps. If you attend the full course and fail your first exam attempt, we will provide a free voucher for a second attempt — at no extra charge.',
      },
      {
        q: 'Can my employer pay for my training?',
        a: 'Absolutely. We offer purchase orders, invoicing, and direct billing for corporate clients. Contact our enterprise team for volume pricing and custom quotes.',
      },
    ],
  },
  {
    label: 'Exam Vouchers',
    icon: Ticket,
    color: '#c0392b',
    items: [
      {
        q: 'Are your exam vouchers official?',
        a: 'Yes. All vouchers sold through Acecerty are 100% official vouchers purchased directly from the vendor (CompTIA, Microsoft, Cisco, ISC2, etc.). They are redeemable through the vendor\'s official testing platform.',
      },
      {
        q: 'How are vouchers delivered?',
        a: 'Vouchers are delivered electronically to your registered email address within 1 business day of purchase. Most orders are processed within a few hours during business hours.',
      },
      {
        q: 'Do vouchers expire?',
        a: 'Voucher expiration varies by vendor — typically 12 months from the purchase date. Expiration details are listed on each voucher\'s product page.',
      },
      {
        q: 'Can I get a refund on a voucher?',
        a: 'Unused vouchers may be eligible for a refund within 30 days of purchase, subject to vendor policy. Once a voucher has been redeemed or an exam scheduled, refunds are not available.',
      },
    ],
  },
  {
    label: 'Practice Exams',
    icon: ClipboardCheck,
    color: '#1a5276',
    items: [
      {
        q: 'How do your practice exams help me prepare?',
        a: 'Our practice exams are written by certified subject matter experts and mirror the format, difficulty, and question style of the actual exam. Each question includes a detailed explanation so you understand why an answer is correct.',
      },
      {
        q: 'How many questions are in each practice exam?',
        a: 'Practice exam sets range from 75 to 250+ questions depending on the certification. You can take timed full-length exams or drill specific topic domains.',
      },
      {
        q: 'How long do I have access to practice exams?',
        a: 'Practice exam access is valid for 90 days from the date of activation. Extended access options are available at checkout.',
      },
      {
        q: 'Are the practice exams updated for the latest exam versions?',
        a: 'Yes. Our team monitors vendor exam updates and refreshes question banks within 30 days of any official exam version change.',
      },
    ],
  },
  {
    label: 'Billing & Payments',
    icon: CreditCard,
    color: '#7c3aed',
    items: [
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), ACH/bank transfers, PayPal, and purchase orders for qualifying organizations.',
      },
      {
        q: 'Do you offer payment plans or financing?',
        a: 'Yes. We partner with financing providers to offer monthly payment options for training packages. Select "Apply for Financing" at checkout to see options with no hard credit pull required to pre-qualify.',
      },
      {
        q: 'Can I use GI Bill® benefits?',
        a: 'Acecerty is approved for GI Bill® benefits. Contact our veterans services team with your Certificate of Eligibility and we will process your enrollment through the VA.',
      },
    ],
  },
  {
    label: 'Certifications & Exams',
    icon: Shield,
    color: '#065f46',
    items: [
      {
        q: 'Which certifications do you offer training for?',
        a: 'We cover 100+ certifications across cybersecurity (CISSP, CISM, Security+, CEH), cloud (AWS, Azure, GCP), networking (CCNA, CCNP), project management (PMP, CAPM), IT service management (ITIL), and more.',
      },
      {
        q: 'Where do I take the actual certification exam?',
        a: 'Exams are administered through the vendor\'s approved testing centers (e.g., Pearson VUE, Prometric) or via online proctoring from your home or office. We guide you through the scheduling process.',
      },
      {
        q: 'How do I know which certification to pursue first?',
        a: 'Our course advisors offer free 30-minute consultations to map out a certification roadmap based on your current experience, career goals, and target role. Book a session via our Contact page.',
      },
    ],
  },
];

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-4 py-5 px-1 text-left transition-colors"
        style={{ color: isOpen ? 'var(--ace-brand)' : 'var(--foreground)' }}
      >
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, lineHeight: 1.5 }}>{item.q}</span>
        <div
          className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center transition-all mt-0.5"
          style={{
            backgroundColor: isOpen ? 'var(--ace-brand)' : 'var(--muted)',
            color: isOpen ? '#fff' : 'var(--muted-foreground)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </button>

      {isOpen && (
        <div className="pb-5 px-1">
          <p className="leading-relaxed text-muted-foreground" style={{ fontSize: '0.9rem' }}>{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const category = FAQ_CATEGORIES[activeCategory];

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'var(--ace-font)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#050D1A 0%,#0A1628 100%)' }} className="pt-24 sm:pt-28 pb-14 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-5 w-5" style={{ color: 'var(--ace-brand)' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--ace-brand)' }}>Help Centre</p>
          </div>
          <h1 className="text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 800 }}>
            Frequently Asked Questions
          </h1>
          <p className="text-white/60" style={{ fontSize: '1.05rem', maxWidth: 500 }}>
            Everything you need to know about our courses, vouchers, practice exams, and billing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Category sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <p className="text-xs font-bold uppercase tracking-wider mb-3 px-1 text-muted-foreground">Topics</p>
            <div className="relative flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {FAQ_CATEGORIES.map((cat, i) => {
                const Icon = cat.icon;
                const active = i === activeCategory;
                return (
                  <button
                    key={cat.label}
                    onClick={() => { setActiveCategory(i); setOpenIndex(0); }}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap lg:whitespace-normal text-left transition-all flex-shrink-0 lg:flex-shrink"
                    style={{
                      backgroundColor: active ? 'var(--ace-brand)' : 'var(--card)',
                      color: active ? '#fff' : 'var(--foreground)',
                      border: `1px solid ${active ? 'var(--ace-brand)' : 'var(--border)'}`,
                    }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" style={{ color: active ? '#fff' : 'var(--muted-foreground)' }} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </aside>

          {/* FAQ accordion */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: category.color }}
              >
                <category.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-foreground" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{category.label}</h2>
                <p className="text-sm text-muted-foreground">{category.items.length} questions</p>
              </div>
            </div>

            <div className="rounded-2xl shadow-sm px-6 bg-card border border-border">
              {category.items.map((item, i) => (
                <AccordionItem
                  key={i}
                  item={item}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>

            {/* Still need help CTA */}
            <div
              className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: 'linear-gradient(135deg,#071224,#0B1D3A)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex-1">
                <p className="text-white font-semibold mb-1">Still have questions?</p>
                <p className="text-white/55 text-sm">Our course advisors are available Mon–Fri, 8am–8pm ET.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href="tel:+18005551234"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
                >
                  Call Us
                </a>
                <Link
                  to="/courses"
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--ace-brand)' }}
                >
                  Browse Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
