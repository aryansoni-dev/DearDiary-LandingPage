import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface NavbarProps {
  onJoinWaitlistClick: () => void;
  onEnterAppClick?: () => void;
  isShowingApp?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onJoinWaitlistClick,
  onEnterAppClick,
  isShowingApp = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', id: 'features' },
    { name: 'AI Insights', id: 'ai-assistant' },
    { name: 'Privacy', id: 'privacy-security' },
    { name: 'Screens', id: 'app-screens' },
    { name: 'Early Access', id: 'early-access' },
  ];

  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (isShowingApp && onEnterAppClick) {
      // If we are currently inside the interactive app view, toggle back to landing view,
      // and scroll to the section.
      onEnterAppClick();
      // Allow state to update, then scroll
      setTimeout(() => {
        if (id === 'hero') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const element = document.getElementById(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 150);
    } else {
      if (id === 'hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-[84px] transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-brand-primary-soft/30 shadow-[0_2px_12px_rgba(255,32,86,0.02)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo Only */}
          <a
            href="#hero"
            onClick={(e) => handleNavLinkClick(e, 'hero')}
            className="flex items-center gap-3 group"
          >
            <img
              src="https://res.cloudinary.com/sgw0dct9/image/upload/f_auto,q_auto/v1783934358/splash-logo_kmqgr7.png"
              alt="DearDiary elegant book and quill minimalist app brand logo"
              className="h-16 w-16 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="eager"
              width={64}
              height={64}
              onError={(e) => {
                // Safe elegant fallback in case the image doesn't load
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent && !parent.querySelector('.logo-fallback')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'logo-fallback flex items-center justify-center w-16 h-16 rounded-xl bg-brand-primary text-white text-xs font-bold';
                  fallback.innerHTML = 'DD';
                  parent.insertBefore(fallback, parent.firstChild);
                }
              }}
            />
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavLinkClick(e, link.id)}
                className="text-sm font-medium text-text-secondary hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/45 focus-visible:rounded px-2 py-1 -mx-2 -my-1 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 hover:after:w-full after:bg-brand-primary after:transition-all after:duration-300"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Call to Action */}
          <div className="hidden md:flex items-center gap-4">
            <Button onClick={onJoinWaitlistClick} className="!py-2 !px-5 text-sm">
              Join the Waitlist
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2.5">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-lg text-text-secondary hover:text-brand-primary hover:bg-brand-primary-soft/10 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop Overlay */}
      <div
        className={`fixed inset-0 top-[84px] bg-black/10 backdrop-blur-[2px] z-30 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Menu Dropdown */}
      <div
        className={`fixed top-[84px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-primary-soft/20 shadow-lg md:hidden transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen
            ? 'opacity-100 transform scale-y-100 max-h-[400px] py-6'
            : 'opacity-0 transform scale-y-0 max-h-0 pointer-events-none'
        }`}
      >
        <div className="px-4 sm:px-6 space-y-4 flex flex-col">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavLinkClick(e, link.id)}
              className="text-base font-medium text-text-secondary hover:text-brand-primary py-2 border-b border-gray-50 hover:pl-2 transition-all duration-300"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Button onClick={onJoinWaitlistClick} className="w-full text-center">
              Join the Waitlist
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
