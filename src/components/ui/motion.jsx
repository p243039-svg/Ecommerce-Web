/**
 * motion.jsx — Shared Framer Motion animation primitives
 * All animations respect prefers-reduced-motion.
 * Single source of truth for easing and timing.
 */
import React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

// ─── Shared easing & timing ──────────────────────────────────────────────────
export const EASE = [0.16, 1, 0.3, 1]; // strong ease-out, used site-wide

// ─── FadeUp ──────────────────────────────────────────────────────────────────
// Single element entrance: opacity 0→1, translateY(20px)→0.
// Use the `delay` prop to stagger siblings manually in the hero.
export function FadeUp({ children, delay = 0, className, style, as = "div" }) {
  const shouldReduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      style={style}
      initial={shouldReduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay,
        ease: EASE,
      }}
    >
      {children}
    </Tag>
  );
}

// ─── SectionReveal ───────────────────────────────────────────────────────────
// Scroll-triggered: fades up + scales in once when section enters viewport.
export function SectionReveal({ children, className, style, delay = 0 }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={shouldReduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerGrid ─────────────────────────────────────────────────────────────
// Container that staggers its children 90ms apart when it enters the viewport.
const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 22, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

export function StaggerGrid({ children, className }) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {React.Children.map(children, (child, i) => (
        <motion.div key={i} variants={staggerChild}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── useHeroParallax ─────────────────────────────────────────────────────────
// Returns a motionValue for Y offset driven by scroll position within an element.
// Usage: const { ref, imageY } = useHeroParallax();
export function useHeroParallax(range = [-15, 15]) {
  const ref = React.useRef(null);
  const shouldReduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    shouldReduce ? [0, 0] : range
  );
  return { ref, imageY };
}
