import { useCallback, useState } from 'react';
import { Upload, FileText, X, Download } from 'lucide-react';
import { Button } from '../../ui/Button';
import { importService, ParsedCSV, EntityType } from '../../../services/importService';
import toast from 'react-hot-toast';

interface FileUploadStepProps {
  entityType: EntityType;
  onFileUploaded: (data: ParsedCSV, rawData: Record<string, string>[]) => void;
}

export function FileUploadStep({ entityType, onFileUploaded }: FileUploadStepProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.name.endsWith('.csv')) {
      setFile(droppedFile);
    } else {
      toast.error('Please upload a CSV file');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a CSV file');
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await importService.previewCSV(file);

      // Read full file data for import
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

        const rawData: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          const row: Record<string, string> = {};
          headers.forEach((header, idx) => {
            row[header] = values[idx] || '';
          });
          rawData.push(row);
        }

        onFileUploaded(data, rawData);
      };
      reader.readAsText(file);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to parse CSV file');
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const url = importService.getTemplateUrl(entityType);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entityType}_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const entityLabel = entityType.charAt(0).toUpperCase() + entityType.slice(1);

  return (
    <div className="space-y-6">
      {/* Drag and drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-primary-600" />
            <span className="font-medium text-gray-900">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              Drag and drop your CSV file here
            </p>
            <p className="text-sm text-gray-500 mt-2">or click to browse</p>
            <p className="text-xs text-gray-400 mt-4">Maximum file size: 5MB</p>
          </>
        )}
        <input
          id="file-input"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Download template link */}
      <div className="text-center">
        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 hover:underline"
        >
          <Download className="h-4 w-4" />
          Download {entityLabel} CSV Template
        </button>
      </div>

      {/* Action button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          isLoading={isUploading}
        >
          Continue to Mapping
        </Button>
      </div>
    </div>
  );
}

// Helper function to parse CSV line handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
