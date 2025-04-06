'use client';

import React from 'react';
import QuickAccess from '../components/QuickAccess';
import { DashboardIcon, AdminIcon, DocumentTextIcon } from '../components/Icons';

export default function QuickAccessPage() {
  const quickAccessItems = [
    {
      title: "Tableau de bord",
      description: "Visualisation des données",
      icon: <DashboardIcon />,
      href: "/dashboard"
    },
    {
      title: "Administration",
      description: "Gestion des données",
      icon: <AdminIcon />,
      href: "/admin"
    },
    {
      title: "Statistiques",
      description: "Données détaillées",
      icon: <DocumentTextIcon />,
      href: "/stats"
    }
  ];

  return (
    <div className="space-y-8">
      <section className="glass-card p-8 animate-fadeIn">
        <h1 className="text-3xl font-bold mb-4 text-primary-950 dark:text-white">
          Page d'accès rapide
        </h1>
        <p className="text-lg text-text-secondary dark:text-gray-300 mb-6">
          Voici une démonstration du composant d'accès rapide avec notre style Glass-Data Minimalism.
        </p>
      </section>

      <QuickAccess items={quickAccessItems} />
    </div>
  );
} 