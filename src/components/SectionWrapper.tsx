import React, { useEffect, useRef, useState } from 'react';

interface SectionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, className = '', ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check user preferences for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);

    if (mediaQuery.matches) {
      setIsVisible(true);
      return () => {
        mediaQuery.removeEventListener('change', listener);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only trigger transition once
        }
      },
      {
        threshold: 0.05, // Trigger as soon as 5% of the section is visible
        rootMargin: '0px 0px -40px 0px' // Slightly offset trigger to avoid premature execution
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  // Compute transition styles
  const transitionClass = prefersReducedMotion 
    ? '' 
    : 'transition-all duration-[600ms] ease-out transform';
  
  const visibilityClass = prefersReducedMotion
    ? 'opacity-100 translate-y-0'
    : isVisible
      ? 'opacity-100 translate-y-0'
      : 'opacity-0 translate-y-6';

  const isVisibleClass = isVisible ? 'section-visible' : '';

  return (
    <section
      ref={ref}
      className={`py-12 md:py-20 px-5 sm:px-6 lg:px-8 scroll-mt-[84px] ${transitionClass} ${visibilityClass} ${isVisibleClass} ${className}`}
      {...props}
    >
      <div className="max-w-[1200px] mx-auto w-full">
        {children}
      </div>
    </section>
  );
};
