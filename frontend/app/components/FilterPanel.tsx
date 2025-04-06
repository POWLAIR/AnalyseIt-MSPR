import React from 'react';

interface FilterPanelProps {
  onFilterChange: (filters: {
    country?: string;
    pandemicType?: string;
    startDate?: Date | null;
    endDate?: Date | null;
  }) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 text-primary-950 dark:text-white">Filtres</h3>
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-2">
            Pays
          </label>
          <select
            onChange={(e) => onFilterChange({ country: e.target.value })}
            className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-xs border border-glass text-text-primary dark:text-white text-sm rounded-lg focus:ring-accent-turquoise focus:border-accent-turquoise block w-full p-2.5 transition-all duration-300"
          >
            <option value="">Tous les pays</option>
            <option value="FR">France</option>
            <option value="US">États-Unis</option>
            <option value="GB">Royaume-Uni</option>
            {/* Add more countries as needed */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-2">
            Type de pandémie
          </label>
          <select
            onChange={(e) => onFilterChange({ pandemicType: e.target.value })}
            className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-xs border border-glass text-text-primary dark:text-white text-sm rounded-lg focus:ring-accent-turquoise focus:border-accent-turquoise block w-full p-2.5 transition-all duration-300"
          >
            <option value="">Tous les types</option>
            <option value="VIRAL">Virale</option>
            <option value="BACTERIAL">Bactérienne</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary dark:text-gray-300 mb-2">
            Période
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              onChange={(e) => onFilterChange({ startDate: e.target.value ? new Date(e.target.value) : null })}
              className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-xs border border-glass text-text-primary dark:text-white text-sm rounded-lg focus:ring-accent-turquoise focus:border-accent-turquoise block w-full p-2.5 transition-all duration-300"
              placeholder="Date de début"
            />
            <input
              type="date"
              onChange={(e) => onFilterChange({ endDate: e.target.value ? new Date(e.target.value) : null })}
              className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-xs border border-glass text-text-primary dark:text-white text-sm rounded-lg focus:ring-accent-turquoise focus:border-accent-turquoise block w-full p-2.5 transition-all duration-300"
              placeholder="Date de fin"
            />
          </div>
        </div>
        
        <button className="glass-button w-full mt-4">
          Appliquer les filtres
        </button>
      </div>
    </div>
  );
} 