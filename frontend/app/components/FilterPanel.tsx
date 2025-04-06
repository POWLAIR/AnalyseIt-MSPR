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
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Filtres</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Pays
          </label>
          <select
            onChange={(e) => onFilterChange({ country: e.target.value })}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Tous les pays</option>
            <option value="FR">France</option>
            <option value="US">États-Unis</option>
            <option value="GB">Royaume-Uni</option>
            {/* Add more countries as needed */}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type de pandémie
          </label>
          <select
            onChange={(e) => onFilterChange({ pandemicType: e.target.value })}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="VIRAL">Virale</option>
            <option value="BACTERIAL">Bactérienne</option>
            <option value="OTHER">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Période
          </label>
          <div className="flex space-x-4">
            <input
              type="date"
              onChange={(e) => onFilterChange({ startDate: e.target.value ? new Date(e.target.value) : null })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Date de début"
            />
            <input
              type="date"
              onChange={(e) => onFilterChange({ endDate: e.target.value ? new Date(e.target.value) : null })}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Date de fin"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 