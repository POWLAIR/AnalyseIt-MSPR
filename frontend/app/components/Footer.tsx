import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center mb-4 sm:mb-0">
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">AnalyseIt</span>
          </Link>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <Link href="/about" className="mr-4 hover:underline md:mr-6">À propos</Link>
            </li>
            <li>
              <Link href="/contact" className="mr-4 hover:underline md:mr-6">Contact</Link>
            </li>
            <li>
              <Link href="https://www.who.int/fr" target="_blank" rel="noopener noreferrer" className="hover:underline">OMS</Link>
            </li>
          </ul>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © {new Date().getFullYear()} <Link href="/" className="hover:underline">AnalyseIt™</Link>. Tous droits réservés.
        </span>
      </div>
    </footer>
  );
} 