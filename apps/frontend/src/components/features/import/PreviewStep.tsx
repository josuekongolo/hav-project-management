import { useState, useMemo } from 'react';
import { CheckCircle, XCircle, FileSpreadsheet } from 'lucide-react';
import { Button } from '../../ui/Button';
import { EntityType, ColumnMapping } from '../../../services/importService';

interface PreviewStepProps {
  entityType: EntityType;
  data: Record<string, string>[];
  mapping: ColumnMapping;
  onConfirm: () => void;
  onBack: () => void;
  isImporting: boolean;
}

export function PreviewStep({
  entityType,
  data,
  mapping,
  onConfirm,
  onBack,
  isImporting,
}: PreviewStepProps) {
  // Transform data using mapping for preview
  const transformedData = useMemo(() => {
    return data.slice(0, 5).map((row) => {
      const transformed: Record<string, string> = {};
      for (const [dbField, csvColumn] of Object.entries(mapping)) {
        transformed[dbField] = row[csvColumn] || '';
      }
      return transformed;
    });
  }, [data, mapping]);

  // Get mapped field keys for table headers
  const mappedFields = Object.keys(mapping);

  // Basic validation preview
  const validationPreview = useMemo(() => {
    let valid = 0;
    let invalid = 0;

    const requiredFields =
      entityType === 'contacts'
        ? ['firstName', 'lastName', 'email']
        : entityType === 'companies'
        ? ['name']
        : ['title', 'value', 'contactEmail'];

    data.forEach((row) => {
      const hasRequired = requiredFields.every((f) => {
        const csvColumn = mapping[f];
        return csvColumn && row[csvColumn]?.trim();
      });

      if (hasRequired) valid++;
      else invalid++;
    });

    return { valid, invalid, total: data.length };
  }, [data, mapping, entityType]);

  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-900">{validationPreview.valid}</p>
          <p className="text-sm text-green-700">Ready to import</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-900">{validationPreview.invalid}</p>
          <p className="text-sm text-red-700">Missing required fields</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <FileSpreadsheet className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-900">{validationPreview.total}</p>
          <p className="text-sm text-blue-700">Total rows</p>
        </div>
      </div>

      {/* Preview Table */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Data Preview (First 5 rows)</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {mappedFields.map((field) => (
                  <th
                    key={field}
                    className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {field}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transformedData.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {mappedFields.map((field) => (
                    <td
                      key={field}
                      className="px-4 py-2 text-sm text-gray-900 truncate max-w-[200px]"
                      title={row[field] || ''}
                    >
                      {row[field] || <span className="text-gray-400">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info notes */}
      {entityType === 'contacts' && (
        <div className="p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
          <strong>Note:</strong> Contacts with duplicate email addresses will be skipped.
        </div>
      )}

      {entityType === 'deals' && (
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>Note:</strong> Deals will be linked to existing contacts by email. Make sure
          the contacts exist before importing deals.
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="secondary" onClick={onBack} disabled={isImporting}>
          Back to Mapping
        </Button>
        <Button
          onClick={onConfirm}
          disabled={validationPreview.valid === 0 || isImporting}
          isLoading={isImporting}
        >
          Import {validationPreview.valid} {entityLabel}
        </Button>
      </div>
    </div>
  );
}
