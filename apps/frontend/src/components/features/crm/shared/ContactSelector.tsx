import { useState, useEffect, useRef } from 'react';
import { useContactStore } from '../../../../store/contactStore';
import { Search, User, X, Plus } from 'lucide-react';

interface ContactSelectorProps {
  value: string[] | null;
  onChange: (contactIds: string[]) => void;
  placeholder?: string;
  className?: string;
  onCreateNew?: () => void;
}

export function ContactSelector({
  value = [],
  onChange,
  placeholder = 'Search contacts...',
  className = '',
  onCreateNew
}: ContactSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    companyRel: { id: string; name: string } | null;
  }>>([]);
  const [selectedContacts, setSelectedContacts] = useState<Array<{ id: string; name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { searchContacts } = useContactStore();

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
        const results = await searchContacts(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchContacts]);

  const handleSelect = (contact: typeof searchResults[0]) => {
    const contactName = `${contact.firstName} ${contact.lastName}`;
    const newSelected = [...selectedContacts, { id: contact.id, name: contactName }];
    setSelectedContacts(newSelected);
    onChange(newSelected.map(c => c.id));
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemove = (contactId: string) => {
    const newSelected = selectedContacts.filter(c => c.id !== contactId);
    setSelectedContacts(newSelected);
    onChange(newSelected.map(c => c.id));
  };

  const isContactSelected = (contactId: string) => {
    return selectedContacts.some(c => c.id === contactId);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div className="relative">
        <div
          className={`flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-text min-h-[42px] ${
            isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
          onClick={() => setIsOpen(true)}
        >
          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
          {selectedContacts.length > 0 ? (
            selectedContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
              >
                <span>{contact.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(contact.id);
                  }}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
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
                No contacts found
              </div>
            ) : (
              <div className="py-1">
                {searchResults.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => !isContactSelected(contact.id) && handleSelect(contact)}
                    disabled={isContactSelected(contact.id)}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                      isContactSelected(contact.id)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {contact.firstName} {contact.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{contact.email}</div>
                      {contact.companyRel && (
                        <div className="text-xs text-gray-400 truncate">{contact.companyRel.name}</div>
                      )}
                    </div>
                    {isContactSelected(contact.id) && (
                      <span className="text-xs text-gray-400">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {onCreateNew && (
            <div className="border-t">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCreateNew();
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 transition-colors text-primary-600"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Create new contact</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
