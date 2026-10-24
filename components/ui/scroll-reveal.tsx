'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: 'fade-in-up' | 'fade-in' | 'scale-in' | 'slide-in-right' | 'slide-in-left';
  delayMs?: number;
  durationMs?: number;
  threshold?: number;
  once?: boolean;
}

/**
 * ScrollReveal Component
 * Hardware-accelerated (transform & opacity only) scroll reveal container using native IntersectionObserver.
 * Silky cubic-bezier easing curve matching luxury design aesthetic.
 */
export function ScrollReveal({
  children,
  animation = 'fade-in-up',
  delayMs = 0,
  durationMs = 600,
  threshold = 0.08,
  once = true,
  className,
  style,
  ...props
}: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // If IntersectionObserver is not supported (or SSR), reveal immediately
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once && domRef.current) {
              observer.unobserve(domRef.current);
            }
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once]);

  // Initial transform state before becoming visible in viewport
  const getInitialTransform = () => {
    switch (animation) {
      case 'fade-in-up':
        return 'translateY(24px)';
      case 'scale-in':
        return 'scale(0.96)';
      case 'slide-in-right':
        return 'translateX(24px)';
      case 'slide-in-left':
        return 'translateX(-24px)';
      case 'fade-in':
      default:
        return 'none';
    }
  };

  const animStyle: React.CSSProperties = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'none' : getInitialTransform(),
    transitionProperty: 'opacity, transform',
    transitionDuration: `${durationMs}ms`,
    transitionDelay: `${delayMs}ms`,
    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    willChange: 'opacity, transform',
    ...style
  };

  return (
    <div ref={domRef} style={animStyle} className={cn(className)} {...props}>
      {children}
    </div>
  );
}
