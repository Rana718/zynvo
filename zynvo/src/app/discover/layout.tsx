'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Handle screen resize to determine mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  const handleMainContentClick = () => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black ">
      {/* Mobile Menu Toggle Button */}
      {isMobileView && (
        <Button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed top-4 left-4 z-50 p-2 size-10 bg-gray-800 rounded-md text-white"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X size={60} color="#e1d71f" strokeWidth={6} />
          ) : (
            <Menu size={60} color="#dc6c72fe" />
          )}
        </Button>
      )}

      {/* Sidebar - hidden on mobile by default, shown when toggled */}
      <div
        className={`
          ${isMobileMenuOpen ? 'fixed inset-0 z-40 bg-black/60 backdrop-blur-sm' : 'hidden'} 
          md:relative md:block md:bg-transparent
        `}
        onClick={() => isMobileView && setIsMobileMenuOpen(false)}
      >
        <div
          className={`
            fixed left-0 top-0 bottom-0 w-64 bg-black z-40
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            md:relative md:translate-x-0 md:z-auto
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar />
        </div>
      </div>

      {/* Main content area - takes remaining width */}
      <main
        className={`
          flex-1 overflow-auto p-4 md:p-6 
          bg-gradient-to-br from-black to-gray-900
          pt-16 md:pt-6 /* Add padding-top for mobile to avoid content behind the toggle button */
        `}
        onClick={handleMainContentClick}
      >
        {children}
      </main>
    </div>
  );
}
