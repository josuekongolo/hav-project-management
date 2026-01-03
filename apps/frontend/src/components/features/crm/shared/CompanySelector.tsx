import { useState, useEffect, useRef } from 'react';
import { useCompanyStore } from '../../../../store/companyStore';
import { Search, Building2, X } from 'lucide-react';

interface CompanySelectorProps {
  value: string | null;
  onChange: (companyId: string | null, companyName?: string) => void;
  placeholder?: string;
  className?: string;
}

export function CompanySelector({ value, onChange, placeholder = 'Search companies...', className = '' }: CompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; industry: string | null; logo: string | null }>>([]);
  const [selectedCompanyName, setSelectedCompanyName] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { searchCompanies } = useCompanyStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchCompanies(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchCompanies]);

  const handleSelect = (company: { id: string; name: string; industry: string | null; logo: string | null }) => {
    onChange(company.id, company.name);
    setSelectedCompanyName(company.name);
    setSearchQuery('');
    setSearchResults([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setSelectedCompanyName('');
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="relative">
        <div
          className={`flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-text ${
            isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
          onClick={() => setIsOpen(true)}
        >
          <Building2 className="h-4 w-4 text-gray-400" />
          {value && selectedCompanyName ? (
            <div className="flex items-center justify-between flex-1">
              <span className="text-sm">{selectedCompanyName}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">{placeholder}</span>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {isSearching ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Searching...
              </div>
            ) : searchQuery.length < 2 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                Type at least 2 characters to search
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500 text-sm">
                No companies found
              </div>
            ) : (
              <div className="py-1">
                {searchResults.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleSelect(company)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors"
                  >
                    <Building2 className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{company.name}</div>
                      {company.industry && (
                        <div className="text-xs text-gray-500 truncate">{company.industry}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
