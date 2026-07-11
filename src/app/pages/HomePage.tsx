import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Hero } from '../components/Hero';
import { TrustLogos } from '../components/TrustLogos';
import { AccordionCarousel } from '../components/AccordionCarousel';
import { PinnedCardStack } from '../components/PinnedCardStack';
import { ProcessSection } from '../components/ProcessSection';
import { LeadForm } from '../components/LeadForm';
import { TestimonialsSection } from '../components/TestimonialsSection';
import { SpriteCrowd } from '../components/SpriteCrowd';
import { BlogSection } from '../components/BlogSection';
import { ScrollPathSection } from '../components/ScrollPathSection';

const SECTIONS_TOP = [
  { Component: TrustLogos },
  { Component: AccordionCarousel },
];

const SECTIONS_MID = [
  { Component: ProcessSection },
  { Component: LeadForm },
  { Component: TestimonialsSection },
];

function AnimatedSection({
  Component,
  reducedMotion,
}: {
  Component: React.ComponentType;
  reducedMotion: boolean | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '0px 0px -60px 0px' });

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'relative' }}
      >
        <Component />
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  const heroScale = useTransform(scrollY, [0, 600], shouldReduceMotion ? [1, 1] : [1, 0.95]);
  const heroOpacity = useTransform(scrollY, [0, 350, 650], shouldReduceMotion ? [1, 1, 1] : [1, 1, 0.5]);

  return (
    <div style={{ overflowX: 'hidden', position: 'relative', backgroundColor: 'var(--background)' }}>
      <div ref={heroRef} style={{ position: 'relative', zIndex: 1 }}>
        <motion.div style={{ scale: heroScale, opacity: heroOpacity }}>
          <Hero />
        </motion.div>
      </div>

      {SECTIONS_TOP.map(({ Component }, i) => (
        <AnimatedSection key={`top-${i}`} Component={Component} reducedMotion={shouldReduceMotion} />
      ))}

      {/* System J: Pinned card stack — outside AnimatedSection so GSAP pin works */}
      <PinnedCardStack />

      {/* ScrollPathSection rendered directly — its useScroll target ref must not have a transformed ancestor */}
      <ScrollPathSection />

      {SECTIONS_MID.map(({ Component }, i) => (
        <AnimatedSection key={`mid-${i}`} Component={Component} reducedMotion={shouldReduceMotion} />
      ))}

      {/* System I: Sprite crowd engine — direct mount for GSAP ticker */}
      <SpriteCrowd />

      <AnimatedSection Component={BlogSection} reducedMotion={shouldReduceMotion} />
    </div>
  );
}
