import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../context/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    label: 'Accelerated Bootcamps',
    heading: 'Compress months of study into days',
    body: 'Our intensive, instructor-led formats deliver exam-ready knowledge at speed — structured for working professionals who need results fast.',
    tag: 'Learn',
    accent: '#00A2B6',
    bg: 'linear-gradient(135deg, #0A1628 0%, #0D2040 100%)',
  },
  {
    label: 'Practice Exam Engine',
    heading: '10,000+ questions refined by exam experts',
    body: 'Adaptive question banks mirror real exam formats, identify weak spots, and build timed confidence so nothing surprises you on test day.',
    tag: 'Practice',
    accent: '#00C4DC',
    bg: 'linear-gradient(135deg, #071A12 0%, #0A2A1C 100%)',
  },
  {
    label: 'Exam Pass Guarantee',
    heading: 'Pass first time — or we cover your retake',
    body: 'Every bootcamp comes with our no-questions-asked retake guarantee. We only win when you do, which is why our pass rate sits at 95%.',
    tag: 'Certify',
    accent: '#00A2B6',
    bg: 'linear-gradient(135deg, #1A0A00 0%, #2A1200 100%)',
  },
  {
    label: 'Career Support',
    heading: 'Certification is just the beginning',
    body: 'Post-certification career guidance, job-board access, and alumni networking connect your new credential to real opportunities.',
    tag: 'Grow',
    accent: '#00D4A0',
    bg: 'linear-gradient(135deg, #0A0A1A 0%, #14143A 100%)',
  },
];

export function PinnedCardStack() {
  const { isDark } = useTheme();
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;

    const cards = Array.from(sticky.querySelectorAll<HTMLElement>('.stack-card'));
    if (cards.length < 2) return;

    // Set all cards except first off-screen below
    cards.forEach((card, i) => {
      if (i === 0) {
        gsap.set(card, { y: '0%', scale: 1, rotation: 0, zIndex: cards.length - i });
      } else {
        gsap.set(card, { y: '100%', scale: 1, rotation: 0, zIndex: cards.length - i });
      }
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${window.innerHeight * (cards.length - 1)}`,
        scrub: 0.6,
        pin: sticky,
        pinSpacing: true,
      },
    });

    for (let i = 0; i < cards.length - 1; i++) {
      tl.to(cards[i], { scale: 0.82, rotation: 3, ease: 'none' }, i)
        .to(cards[i + 1], { y: '0%', ease: 'none' }, i);
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  const textPrimary = '#FFFFFF';
  const textMuted = 'rgba(255,255,255,0.55)';

  return (
    null
  );
}
