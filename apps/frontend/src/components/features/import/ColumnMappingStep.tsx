import { useMemo, useEffect, useState } from 'react';
import { ArrowRight, Check, AlertCircle, Wand2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { EntityType, EntityField, importService, ColumnMapping } from '../../../services/importService';

const ENTITY_FIELDS: Record<EntityType, EntityField[]> = {
  contacts: [
    { key: 'firstName', label: 'First Name', required: true },
    { key: 'lastName', label: 'Last Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'company', label: 'Company Name', required: false },
    { key: 'website', label: 'Website', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'source', label: 'Source', required: false },
    { key: 'notes', label: 'Notes', required: false },
  ],
  companies: [
    { key: 'name', label: 'Company Name', required: true },
    { key: 'industry', label: 'Industry', required: false },
    { key: 'website', label: 'Website', required: false },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'employees', label: 'Employees', required: false },
    { key: 'revenue', label: 'Revenue', required: false },
    { key: 'description', label: 'Description', required: false },
  ],
  deals: [
    { key: 'title', label: 'Deal Title', required: true },
    { key: 'value', label: 'Value', required: true },
    { key: 'stage', label: 'Stage', required: false },
    { key: 'probability', label: 'Probability (%)', required: false },
    { key: 'contactEmail', label: 'Contact Email', required: true },
    { key: 'companyName', label: 'Company Name', required: false },
    { key: 'expectedCloseDate', label: 'Expected Close Date', required: false },
    { key: 'description', label: 'Description', required: false },
  ],
  tasks: [
    { key: 'title', label: 'Task Title', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'status', label: 'Status (TODO, IN_PROGRESS, IN_REVIEW, DONE)', required: false },
    { key: 'priority', label: 'Priority (LOW, MEDIUM, HIGH, URGENT)', required: false },
    { key: 'estimatedHours', label: 'Estimated Hours', required: false },
    { key: 'dueDate', label: 'Due Date', required: false },
    { key: 'milestoneName', label: 'Milestone Name', required: false },
    { key: 'assigneeEmail', label: 'Assignee Email', required: false },
    { key: 'labels', label: 'Labels (comma-separated)', required: false },
  ],
};

interface ColumnMappingStepProps {
  entityType: EntityType;
  csvHeaders: string[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ColumnMappingStep({
  entityType,
  csvHeaders,
  mapping,
  onMappingChange,
  onNext,
  onBack,
}: ColumnMappingStepProps) {
  const [fields, setFields] = useState<EntityField[]>(ENTITY_FIELDS[entityType] || []);

  useEffect(() => {
    // Try to load fields from API, fallback to static
    importService.getEntityFields(entityType)
      .then(({ fields }) => setFields(fields))
      .catch(() => setFields(ENTITY_FIELDS[entityType] || []));
  }, [entityType]);

  const autoDetect = () => {
    const newMapping: ColumnMapping = {};

    for (const field of fields) {
      const normalizedFieldKey = field.key.toLowerCase();
      const normalizedFieldLabel = field.label.toLowerCase().replace(/[^a-z]/g, '');

      const matchingHeader = csvHeaders.find(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '');
        return (
          normalizedHeader === normalizedFieldKey ||
          normalizedHeader === normalizedFieldLabel ||
          normalizedHeader.includes(normalizedFieldKey) ||
          normalizedFieldKey.includes(normalizedHeader) ||
          header.toLowerCase().includes(field.label.toLowerCase())
        );
      });

      if (matchingHeader) {
        newMapping[field.key] = matchingHeader;
      }
    }

    onMappingChange(newMapping);
  };

  const requiredFieldsMapped = useMemo(() => {
    const requiredFields = fields.filter(f => f.required);
    return requiredFields.every(f => mapping[f.key]);
  }, [mapping, fields]);

  const handleMappingChange = (fieldKey: string, csvColumn: string) => {
    const newMapping = { ...mapping };
    if (csvColumn) {
      newMapping[fieldKey] = csvColumn;
    } else {
      delete newMapping[fieldKey];
    }
    onMappingChange(newMapping);
  };

  return (
    <div className="space-y-6">
      {/* Header with auto-detect */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <p className="text-sm text-gray-600">
          Map your CSV columns to database fields
        </p>
        <Button variant="secondary" size="sm" onClick={autoDetect}>
          <Wand2 className="h-4 w-4 mr-2" />
          Auto-detect Columns
        </Button>
      </div>

      {/* Mapping grid */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {fields.map((field) => (
          <div
            key={field.key}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-3 bg-gray-50 rounded-lg"
          >
            <div className="sm:w-1/3">
              <span className={field.required ? 'font-medium text-gray-900' : 'text-gray-700'}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </div>
            <ArrowRight className="hidden sm:block h-4 w-4 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <select
                value={mapping[field.key] || ''}
                onChange={(e) => handleMappingChange(field.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
              >
                <option value="">-- Select column --</option>
                {csvHeaders.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block w-6 flex-shrink-0">
              {mapping[field.key] && (
                <Check className="h-5 w-5 text-green-500" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Validation warning */}
      {!requiredFieldsMapped && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-800">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">Please map all required fields to continue</span>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!requiredFieldsMapped}>
          Preview Import
        </Button>
      </div>
    </div>
  );
}
