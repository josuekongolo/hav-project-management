import { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { FileUploadStep } from './FileUploadStep';
import { ColumnMappingStep } from './ColumnMappingStep';
import { PreviewStep } from './PreviewStep';
import { ImportResultsStep } from './ImportResultsStep';
import {
  EntityType,
  ParsedCSV,
  ColumnMapping,
  ImportResult,
  importService,
} from '../../../services/importService';
import toast from 'react-hot-toast';

type ImportStep = 'upload' | 'mapping' | 'preview' | 'results';

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  onImportComplete: () => void;
}

const STEP_TITLES: Record<ImportStep, string> = {
  upload: 'Upload CSV File',
  mapping: 'Map Columns',
  preview: 'Preview & Import',
  results: 'Import Results',
};

export function BulkImportDialog({
  isOpen,
  onClose,
  entityType,
  onImportComplete,
}: BulkImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvData, setCsvData] = useState<ParsedCSV | null>(null);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [results, setResults] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleClose = () => {
    // Reset state
    setStep('upload');
    setCsvData(null);
    setRawData([]);
    setMapping({});
    setResults(null);
    setIsImporting(false);
    onClose();
  };

  const handleFileUploaded = (data: ParsedCSV, raw: Record<string, string>[]) => {
    setCsvData(data);
    setRawData(raw);
    setStep('mapping');
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await importService.importEntity(entityType, rawData, mapping);
      setResults(result);
      setStep('results');

      if (result.imported > 0) {
        toast.success(`Successfully imported ${result.imported} ${entityType}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  const handleResultsClose = () => {
    if (results && results.imported > 0) {
      onImportComplete();
    }
    handleClose();
  };

  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);
  const currentTitle = `Import ${entityLabel} - ${STEP_TITLES[step]}`;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={currentTitle} size="xl">
      {/* Step indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {(['upload', 'mapping', 'preview', 'results'] as ImportStep[]).map(
            (s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step === s
                      ? 'bg-primary-600 text-white'
                      : getStepIndex(step) > idx
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {getStepIndex(step) > idx ? '✓' : idx + 1}
                </div>
                {idx < 3 && (
                  <div
                    className={`hidden sm:block w-12 md:w-20 h-1 mx-2 ${
                      getStepIndex(step) > idx ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>
        <div className="hidden sm:flex justify-between mt-2">
          <span className="text-xs text-gray-500 w-8 text-center">Upload</span>
          <span className="text-xs text-gray-500 w-8 text-center">Map</span>
          <span className="text-xs text-gray-500 w-8 text-center">Preview</span>
          <span className="text-xs text-gray-500 w-8 text-center">Done</span>
        </div>
      </div>

      {/* Step content */}
      {step === 'upload' && (
        <FileUploadStep entityType={entityType} onFileUploaded={handleFileUploaded} />
      )}

      {step === 'mapping' && csvData && (
        <ColumnMappingStep
          entityType={entityType}
          csvHeaders={csvData.headers}
          mapping={mapping}
          onMappingChange={setMapping}
          onNext={() => setStep('preview')}
          onBack={() => setStep('upload')}
        />
      )}

      {step === 'preview' && csvData && (
        <PreviewStep
          entityType={entityType}
          data={rawData}
          mapping={mapping}
          onConfirm={handleImport}
          onBack={() => setStep('mapping')}
          isImporting={isImporting}
        />
      )}

      {step === 'results' && results && (
        <ImportResultsStep results={results} onClose={handleResultsClose} />
      )}
    </Modal>
  );
}

function getStepIndex(step: ImportStep): number {
  const steps: ImportStep[] = ['upload', 'mapping', 'preview', 'results'];
  return steps.indexOf(step);
}
