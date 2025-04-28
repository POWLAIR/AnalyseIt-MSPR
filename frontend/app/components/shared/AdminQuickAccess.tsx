import React from 'react';
import Link from 'next/link';
import { DatabaseIcon, ChartPieIcon, GlobeIcon, DocumentTextIcon } from './Icons';

interface AdminQuickAccessItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  bgColor?: string;
  isAvailable?: boolean;
}

export default function AdminQuickAccess() {
  const adminItems: AdminQuickAccessItem[] = [
    {
      title: "Pandémies",
      description: "Gestion des entités pandémiques",
      icon: <ChartPieIcon className="h-6 w-6" />,
      href: "/admin/pandemics",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      isAvailable: true
    },
    {
      title: "Entrées journalières",
      description: "Suivi des cas quotidiens",
      icon: <DocumentTextIcon className="h-6 w-6" />,
      href: "/admin/daily-entries",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      isAvailable: false
    },
    {
      title: "Localisations",
      description: "Gestion des zones géographiques",
      icon: <GlobeIcon className="h-6 w-6" />,
      href: "/admin/locations",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      isAvailable: false
    },
    {
      title: "Sources de données",
      description: "Configuration des API externes",
      icon: <DatabaseIcon className="h-6 w-6" />,
      href: "/admin/data-sources",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      isAvailable: false
    }
  ];

  return (
    <div className="glass-card p-8">
      <h2 className="text-2xl font-bold mb-6 text-primary-950 dark:text-white">
        Administration
      </h2>
      <p className="text-text-primary dark:text-gray-300 mb-8">
        Gérez les données et configurations de la plateforme dans cet espace d'administration.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminItems.map((item, index) => (
          <div
            key={index}
            className={`relative group overflow-hidden rounded-lg border border-glass shadow-glass transition-all duration-300 animate-fadeIn ${item.bgColor || 'bg-white/50 dark:bg-gray-800/50'}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
                  <div className="text-accent-turquoise">
                    {item.icon}
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-primary-950 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-text-secondary dark:text-gray-400 text-sm mb-3">
                {item.description}
              </p>
              {item.isAvailable ? (
                <Link
                  href={item.href}
                  className="glass-button-outline w-full text-center text-sm py-1 block"
                >
                  Accéder
                </Link>
              ) : (
                <div className="glass-button-outline w-full text-center text-sm py-1 opacity-70 cursor-not-allowed">
                  Bientôt disponible
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-24 h-24 -mr-12 -mb-12 rounded-full bg-white/30 dark:bg-gray-700/30 backdrop-blur-sm group-hover:scale-125 transition-transform duration-500 ease-out"></div>
          </div>
        ))}
      </div>
    </div>
  );
} 