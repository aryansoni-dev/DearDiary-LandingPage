import React, { useEffect, useState, useRef } from 'react';
import Lottie from 'lottie-react';
import { Smile, Heart, Sunrise, ShieldAlert, Frown, Sparkles } from 'lucide-react';
import { MoodType } from '../types';

interface LottieEmojiProps {
  mood: MoodType;
  className?: string;
  size?: number;
}

const MOOD_URLS: Record<MoodType, string> = {
  happy: 'https://res.cloudinary.com/sgw0dct9/raw/upload/v1783934472/happy_p2ridm.json',
  calm: 'https://res.cloudinary.com/sgw0dct9/raw/upload/v1783934474/calm_aresgt.json',
  grateful: 'https://res.cloudinary.com/sgw0dct9/raw/upload/v1783934472/grateful_vwjgdq.json',
  anxious: 'https://res.cloudinary.com/sgw0dct9/raw/upload/v1783934473/anxious_mtwhsz.json',
  sad: 'https://res.cloudinary.com/sgw0dct9/raw/upload/v1783934473/sad_ys2m3g.json',
  motivated: 'https://res.cloudinary.com/sgw0dct9/raw/upload/v1783934472/motivated_c6gsfp.json',
};

export const LottieEmoji: React.FC<LottieEmojiProps> = ({ mood, className = '', size = 36 }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<any>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const url = MOOD_URLS[mood] || MOOD_URLS.calm;

  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    setIsLoaded(false);

    // Dynamic pre-fetch verification to safely catch network issues/load failures
    fetch(url, { method: 'GET' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch Lottie JSON status: ${res.status}`);
        }
        if (isMounted) {
          setIsLoaded(true);
        }
      })
      .catch((err) => {
        console.warn(`Lottie load failed for mood ${mood} at ${url}:`, err);
        if (isMounted) {
          setHasError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url, mood]);

  // Viewport Intersection Observer for pausing/playing
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
      observer.disconnect();
    };
  }, []);

  // Dynamic pause/play controls to save precious user CPU cycles when not in viewport
  useEffect(() => {
    if (lottieRef.current) {
      if (isIntersecting) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [isIntersecting]);

  // Elegant fallback icons (static SVG with CSS animation transitions) if loading fails
  const getFallbackIcon = () => {
    const iconSize = size * 0.6;
    switch (mood) {
      case 'happy':
        return (
          <div className="flex items-center justify-center rounded-full bg-amber-100 text-amber-500 animate-bounce" style={{ width: size, height: size }}>
            <Smile size={iconSize} strokeWidth={2.5} />
          </div>
        );
      case 'calm':
        return (
          <div className="flex items-center justify-center rounded-full bg-teal-100 text-teal-600 animate-pulse" style={{ width: size, height: size }}>
            <Heart size={iconSize} strokeWidth={2.5} />
          </div>
        );
      case 'grateful':
        return (
          <div className="flex items-center justify-center rounded-full bg-pink-100 text-pink-500 animate-pulse" style={{ width: size, height: size }}>
            <Sunrise size={iconSize} strokeWidth={2.5} />
          </div>
        );
      case 'anxious':
        return (
          <div className="flex items-center justify-center rounded-full bg-purple-100 text-purple-500 animate-wiggle" style={{ width: size, height: size }}>
            <ShieldAlert size={iconSize} strokeWidth={2.5} />
          </div>
        );
      case 'sad':
        return (
          <div className="flex items-center justify-center rounded-full bg-blue-100 text-blue-500 animate-pulse" style={{ width: size, height: size }}>
            <Frown size={iconSize} strokeWidth={2.5} />
          </div>
        );
      case 'motivated':
        return (
          <div className="flex items-center justify-center rounded-full bg-rose-100 text-rose-500 animate-bounce" style={{ width: size, height: size }}>
            <Sparkles size={iconSize} strokeWidth={2.5} />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center rounded-full bg-gray-100 text-gray-500" style={{ width: size, height: size }}>
            <Smile size={iconSize} strokeWidth={2.5} />
          </div>
        );
    }
  };

  if (hasError || !isLoaded) {
    return (
      <div ref={containerRef} className={`inline-block ${className}`} style={{ width: size, height: size }}>
        {getFallbackIcon()}
      </div>
    );
  }

  // Uses path prop to stream remote JSON exactly matching requested configuration
  return (
    <div ref={containerRef} className={`inline-block flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <Lottie
        {...({
          path: url,
          loop: true,
          autoplay: isIntersecting,
          style: { width: size, height: size },
          lottieRef: lottieRef
        } as any)}
      />
    </div>
  );
};
