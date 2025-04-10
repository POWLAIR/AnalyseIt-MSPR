import React from 'react';
import Link from 'next/link';

interface QuickAccessItem {
  title: string;
  description: string;
  icon?: React.ReactNode;
  href: string;
}

interface QuickAccessProps {
  items: QuickAccessItem[];
}

export default function QuickAccess({ items }: QuickAccessProps) {
  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold mb-6 text-primary-950 dark:text-white">
        Accès rapide
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="glass-card group p-8 flex flex-col hover:shadow-glass-lg transition-all duration-300 animate-fadeIn relative overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute -top-5 -right-5 w-32 h-32 rounded-full bg-gradient-soft opacity-20 blur-sm -z-10"></div>
            <h3 className="text-xl font-semibold text-primary-950 dark:text-white mb-2 text-center">
              {item.title}
            </h3>
            <p className="text-text-secondary dark:text-gray-400 text-center text-sm">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
} 