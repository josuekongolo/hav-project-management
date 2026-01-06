import { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Upload, Download, Trash2, Share2, FileSpreadsheet, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export function GoogleDrivePage() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:3001/api/google/files', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      setFiles(data.files || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch files from Google Drive');
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    setIsLoading(true);
    try {
      const token = authService.getToken();
      const response = await fetch('http://localhost:3001/api/google/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      toast.success('File uploaded successfully!');
      setUploadFile(null);
      fetchFiles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload file');
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`http://localhost:3001/api/google/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('File downloaded successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to download file');
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file from Google Drive?')) {
      return;
    }

    try {
      const token = authService.getToken();
      const response = await fetch(`http://localhost:3001/api/google/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      toast.success('File deleted successfully!');
      fetchFiles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete file');
      console.error('Error deleting file:', error);
    }
  };

  const handleShare = async (fileId: string) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`http://localhost:3001/api/google/files/${fileId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: 'reader' }),
      });

      if (!response.ok) {
        throw new Error('Failed to share file');
      }

      toast.success('File shared successfully! Anyone with the link can view it.');
      fetchFiles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to share file');
      console.error('Error sharing file:', error);
    }
  };

  const handleReadExcel = async (fileId: string, fileName: string) => {
    try {
      const token = authService.getToken();
      const response = await fetch(`http://localhost:3001/api/google/xlsx/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to read Excel file');
      }

      const data = await response.json();
      console.log('Excel data:', data);
      toast.success(`Excel file "${fileName}" read successfully! Check console for data.`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to read Excel file');
      console.error('Error reading Excel file:', error);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return 'Unknown';
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  const isExcelFile = (mimeType: string) => {
    return mimeType.includes('spreadsheet') || mimeType.includes('excel');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Google Drive</h1>
          <p className="text-gray-600 mt-1">Manage your files in Google Drive</p>
        </div>
        <Button onClick={fetchFiles} variant="secondary" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Upload Section */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload File</h2>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="flex-1"
          />
          <Button
            onClick={handleFileUpload}
            disabled={!uploadFile || isLoading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload to Drive
          </Button>
        </div>
        {uploadFile && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </Card>

      {/* Files List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Your Files ({files.length})
        </h2>

        {isLoading && files.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : files.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">No files found in your Google Drive</p>
            <p className="text-sm text-gray-400 mt-2">Upload a file to get started</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: {formatFileSize(file.size)}
                    </p>
                    {file.modifiedTime && (
                      <p className="text-xs text-gray-400 mt-1">
                        Modified: {formatDate(file.modifiedTime)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDownload(file.id, file.name)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {isExcelFile(file.mimeType) && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleReadExcel(file.id, file.name)}
                      title="Read Excel Data"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleShare(file.id)}
                    title="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>

                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      View
                    </a>
                  )}

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDelete(file.id)}
                    title="Delete"
                    className="ml-auto text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
