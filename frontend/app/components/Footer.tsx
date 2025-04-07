import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="glass-navbar mt-auto">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center mb-4 sm:mb-0">
            <span className="self-center text-2xl font-semibold text-primary-950 dark:text-white">
              Analyze<span className="text-accent-turquoise">IT</span>
            </span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-text-secondary sm:mb-0 dark:text-gray-400">
            <li>
              <Link href="/about" className="mr-4 hover:text-primary-600 dark:hover:text-primary-300 md:mr-6">À propos</Link>
            </li>
            <li>
              <Link href="/contact" className="mr-4 hover:text-primary-600 dark:hover:text-primary-300 md:mr-6">Contact</Link>
            </li>
            <li>
              <Link href="https://www.who.int/fr" target="_blank" rel="noopener noreferrer" className="hover:text-primary-600 dark:hover:text-primary-300">OMS</Link>
            </li>
          </ul>
        </div>
        <hr className="my-4 border-glass sm:mx-auto lg:my-6" />
        <span className="block text-sm text-text-secondary sm:text-center dark:text-gray-400">
          © {new Date().getFullYear()} <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-300">AnalyzeIT™</Link>. Tous droits réservés.
        </span>
      </div>
    </footer>
  );
} 