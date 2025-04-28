import React, { useState, useEffect } from 'react';

interface FilterParams {
  country?: string;
  pandemicType?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  active?: boolean;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterParams) => void;
  countries: string[];
  pandemicTypes: string[];
  currentFilters: FilterParams;
  onReset?: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  onFilterChange,
  countries = [],
  pandemicTypes = [],
  currentFilters,
  onReset
}) => {
  const [filters, setFilters] = useState<FilterParams>({
    country: currentFilters.country || '',
    pandemicType: currentFilters.pandemicType || '',
    startDate: currentFilters.startDate || null,
    endDate: currentFilters.endDate || null,
    active: currentFilters.active
  });

  // Mettre à jour l'état local quand les filtres actuels changent
  useEffect(() => {
    setFilters({
      country: currentFilters.country || '',
      pandemicType: currentFilters.pandemicType || '',
      startDate: currentFilters.startDate || null,
      endDate: currentFilters.endDate || null,
      active: currentFilters.active
    });
  }, [currentFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value ? new Date(value) : null
    }));
  };

  const handleActiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    let activeValue: boolean | undefined = undefined;
    
    if (value === 'true') activeValue = true;
    else if (value === 'false') activeValue = false;
    
    setFilters(prev => ({
      ...prev,
      active: activeValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const handleReset = () => {
    setFilters({
      country: '',
      pandemicType: '',
      startDate: null,
      endDate: null,
      active: undefined
    });
    
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Filtres</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Pays
          </label>
          <select
            id="country"
            name="country"
            value={filters.country || ''}
            onChange={handleChange}
            className="block w-full p-2 border border-gray-300 bg-white/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="">Tous les pays</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="pandemicType" className="block text-sm font-medium text-gray-700 mb-1">
            Type de pandémie
          </label>
          <select
            id="pandemicType"
            name="pandemicType"
            value={filters.pandemicType || ''}
            onChange={handleChange}
            className="block w-full p-2 border border-gray-300 bg-white/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="">Tous les types</option>
            {pandemicTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="active" className="block text-sm font-medium text-gray-700 mb-1">
            Statut
          </label>
          <select
            id="active"
            name="active"
            value={filters.active === undefined ? '' : String(filters.active)}
            onChange={handleActiveChange}
            className="block w-full p-2 border border-gray-300 bg-white/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="">Tous les statuts</option>
            <option value="true">En cours</option>
            <option value="false">Terminées</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de début
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
            onChange={handleDateChange}
            className="block w-full p-2 border border-gray-300 bg-white/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            Date de fin
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
            onChange={handleDateChange}
            className="block w-full p-2 border border-gray-300 bg-white/50 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        
        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-sm font-medium transition-colors"
          >
            Appliquer
          </button>
          
          {onReset && (
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm font-medium transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </form>
      
      {/* Afficher les filtres actifs */}
      {(filters.country || filters.pandemicType || filters.startDate || filters.endDate || filters.active !== undefined) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Filtres actifs:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.country && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Pays: {filters.country}
              </span>
            )}
            {filters.pandemicType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Type: {filters.pandemicType}
              </span>
            )}
            {filters.active !== undefined && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Statut: {filters.active ? 'En cours' : 'Terminées'}
              </span>
            )}
            {filters.startDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Depuis: {filters.startDate.toLocaleDateString()}
              </span>
            )}
            {filters.endDate && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Jusqu'à: {filters.endDate.toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel; 