import { CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ImportResult } from '../../../services/importService';

interface ImportResultsStepProps {
  results: ImportResult;
  onClose: () => void;
}

export function ImportResultsStep({ results, onClose }: ImportResultsStepProps) {
  const downloadErrorReport = () => {
    // Create CSV header
    const headers = ['Row', 'Errors', 'Original Data'];

    // Create CSV rows
    const csvRows = results.errors.map((err) => {
      const originalData = Object.entries(err.data)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ');
      return [
        err.row.toString(),
        err.errors.join('; '),
        `"${originalData.replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csv = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-errors.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isFullSuccess = results.failed === 0;
  const isPartialSuccess = results.imported > 0 && results.failed > 0;
  const isFullFailure = results.imported === 0 && results.failed > 0;

  return (
    <div className="space-y-6">
      {/* Success/Partial header */}
      <div className="text-center">
        {isFullSuccess && (
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        )}
        {isPartialSuccess && (
          <AlertCircle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
        )}
        {isFullFailure && (
          <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        )}

        <h3 className="text-2xl font-bold text-gray-900">
          {isFullSuccess && 'Import Complete!'}
          {isPartialSuccess && 'Import Finished with Errors'}
          {isFullFailure && 'Import Failed'}
        </h3>
        <p className="text-gray-600 mt-2">
          {isFullSuccess && 'All records were imported successfully.'}
          {isPartialSuccess &&
            'Some records could not be imported. See details below.'}
          {isFullFailure && 'No records could be imported. Please check your data.'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-green-900">{results.imported}</p>
          <p className="text-sm text-green-700">Successfully imported</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-red-900">{results.failed}</p>
          <p className="text-sm text-red-700">Failed to import</p>
        </div>
      </div>

      {/* Error details */}
      {results.errors.length > 0 && (
        <div className="border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-red-900">Error Details</h4>
            <Button variant="secondary" size="sm" onClick={downloadErrorReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Error Report
            </Button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {results.errors.slice(0, 10).map((err, idx) => (
              <div key={idx} className="p-3 bg-red-50 rounded text-sm">
                <span className="font-medium text-red-900">Row {err.row}:</span>
                <ul className="list-disc list-inside mt-1 text-red-700">
                  {err.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            ))}
            {results.errors.length > 10 && (
              <p className="text-sm text-gray-600 text-center py-2">
                ... and {results.errors.length - 10} more errors. Download the error
                report to see all.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Close button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
