import { Input } from '../../../ui/Input';
import { Search } from 'lucide-react';
import { CompanyFilters as CompanyFiltersType } from '../../../../services/companyService';

interface CompanyFiltersProps {
  filters: CompanyFiltersType;
  onFiltersChange: (filters: CompanyFiltersType) => void;
}

export function CompanyFilters({ filters, onFiltersChange }: CompanyFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search companies by name, industry..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <Input
            placeholder="e.g., Technology"
            value={filters.industry || ''}
            onChange={(e) => onFiltersChange({ ...filters, industry: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Employees
            </label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={filters.minEmployees || ''}
              onChange={(e) => onFiltersChange({ ...filters, minEmployees: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Employees
            </label>
            <Input
              type="number"
              min="0"
              placeholder="∞"
              value={filters.maxEmployees || ''}
              onChange={(e) => onFiltersChange({ ...filters, maxEmployees: e.target.value ? parseInt(e.target.value) : undefined })}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Min Revenue ($M)
          </label>
          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="0"
            value={filters.minRevenue ? (filters.minRevenue / 1000000).toString() : ''}
            onChange={(e) => onFiltersChange({ ...filters, minRevenue: e.target.value ? parseFloat(e.target.value) * 1000000 : undefined })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Revenue ($M)
          </label>
          <Input
            type="number"
            min="0"
            step="0.1"
            placeholder="∞"
            value={filters.maxRevenue ? (filters.maxRevenue / 1000000).toString() : ''}
            onChange={(e) => onFiltersChange({ ...filters, maxRevenue: e.target.value ? parseFloat(e.target.value) * 1000000 : undefined })}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => onFiltersChange({})}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
