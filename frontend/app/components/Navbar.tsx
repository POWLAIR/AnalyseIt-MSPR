'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Ferme le menu lorsqu'un utilisateur navigue vers une nouvelle page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Accueil', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ) },
    { href: '/dashboard', label: 'Tableau de bord', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    ) },
    { href: '/pandemics', label: 'Pandémies', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 0-8 8c0 5.4 7.4 11.5 7.8 11.8a.4.4 0 0 0 .5 0c.4-.3 7.7-6.4 7.7-11.8a8 8 0 0 0-8-8Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    ) },
    { href: '/stats', label: 'Statistiques', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21H5a2 2 0 0 1-2-2V3"></path>
        <path d="M9 7l4 4l8-8"></path>
        <path d="M19 17v-7a2 2 0 0 0-2-2h-4l-4-4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2Z"></path>
      </svg>
    ) },
    { href: '/admin', label: 'Administration', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
        <path d="M5 20v-1a7 7 0 0 1 7-7v0a7 7 0 0 1 7 7v1"></path>
      </svg>
    ) }
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };
  
  return (
    <header className="sticky top-0 left-0 right-0 z-50">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 pl-1">
            <span className="self-center text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-turquoise bg-clip-text text-transparent">
              AnalyzeIT
            </span>
          </Link>
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              type="button" 
              className="inline-flex items-center justify-center size-10 p-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Ouvrir le menu</span>
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="6" x2="20" y2="6"></line>
                  <line x1="4" y1="18" x2="20" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:block md:w-auto">
            <ul className="flex space-x-1">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link 
                      href={link.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        active 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                      }`}
                    >
                      <span className={`mr-2 ${active ? 'text-primary-600' : 'text-gray-500'}`}>
                        {link.icon}
                      </span>
                      {link.label}
                      {active && (
                        <span className="ml-2 flex h-2 w-2 rounded-full bg-primary-600"></span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Mobile Navigation */}
          <div className={`${isMenuOpen ? 'block' : 'hidden'} w-full md:hidden mt-3 bg-white rounded-lg shadow-lg overflow-hidden`}>
            <ul className="flex flex-col border-t border-gray-200/50">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center px-4 py-3 border-b border-gray-100 ${
                        active 
                          ? 'bg-primary-50 text-primary-700 border-l-4 border-l-primary-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className={`mr-3 ${active ? 'text-primary-600' : 'text-gray-500'}`}>
                        {link.icon}
                      </span>
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
} 