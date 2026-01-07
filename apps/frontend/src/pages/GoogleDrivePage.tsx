import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Upload, Download, Trash2, Share2, RefreshCw, Search, Folder, File, Home, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { googleDriveService, DriveFile } from '../services/googleDriveService';

export function GoogleDrivePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFolderId = searchParams.get('folderId') || undefined;

  const [files, setFiles] = useState<DriveFile[]>([]);
  const [allFiles, setAllFiles] = useState<DriveFile[]>([]);
  const [currentFolder, setCurrentFolder] = useState<DriveFile | null>(null);
  const [rootFolderId, setRootFolderId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const data = await googleDriveService.listFiles(currentFolderId);
      setAllFiles(data.files || []);
      setFiles(data.files || []);
      setCurrentFolder(data.currentFolder || null);
      if (data.rootFolderId) {
        setRootFolderId(data.rootFolderId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch files from Google Drive');
      console.error('Error fetching files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [currentFolderId]);

  // Client-side search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFiles(allFiles);
    } else {
      const filtered = allFiles.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFiles(filtered);
    }
  }, [searchQuery, allFiles]);

  const handleFolderClick = (folderId: string) => {
    setSearchParams({ folderId });
    setSearchQuery('');
  };

  const handleNavigateToRoot = () => {
    setSearchParams({});
    setSearchQuery('');
  };

  const isFolder = (file: DriveFile) => {
    return file.mimeType === 'application/vnd.google-apps.folder';
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    try {
      await googleDriveService.uploadFile(uploadFile, currentFolderId);
      const folderName = currentFolder ? currentFolder.name : 'root folder';
      toast.success(`File uploaded successfully to ${folderName}!`);
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
      const blob = await googleDriveService.downloadFile(fileId);
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
      await googleDriveService.deleteFile(fileId);
      toast.success('File deleted successfully!');
      fetchFiles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete file');
      console.error('Error deleting file:', error);
    }
  };

  const handleShare = async (fileId: string) => {
    try {
      await googleDriveService.shareFile(fileId, 'reader');
      toast.success('File shared successfully! Anyone with the link can view it.');
      fetchFiles();
    } catch (error: any) {
      toast.error(error.message || 'Failed to share file');
      console.error('Error sharing file:', error);
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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Google Drive</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your files in Google Drive</p>
        </div>
        <Button onClick={fetchFiles} variant="secondary" disabled={isLoading} className="w-full sm:w-auto justify-center">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Breadcrumb Navigation */}
      {currentFolder && (
        <Card className="mb-4 p-3">
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={handleNavigateToRoot}
              className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Root</span>
            </button>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 font-medium">{currentFolder.name}</span>
          </div>
        </Card>
      )}

      {/* Upload Section */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Upload File</h2>
          {currentFolder && (
            <span className="text-sm text-gray-600">
              Uploading to: <span className="font-medium">{currentFolder.name}</span>
            </span>
          )}
        </div>
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
            Upload
          </Button>
        </div>
        {uploadFile && (
          <p className="text-sm text-gray-600 mt-2">
            Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </Card>

      {/* Search Bar */}
      <Card className="mb-4 p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Files List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          {currentFolder ? `Files in ${currentFolder.name}` : 'Your Files'} ({files.length})
        </h2>

        {isLoading && files.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : files.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery ? 'No files match your search' : 'No files found in this folder'}
            </p>
            {!searchQuery && <p className="text-sm text-gray-400 mt-2">Upload a file to get started</p>}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className={isFolder(file) ? 'cursor-pointer' : ''}
                onClick={() => isFolder(file) ? handleFolderClick(file.id) : undefined}
              >
                <Card className="hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Folder/File Icon */}
                    {isFolder(file) ? (
                      <Folder className="h-10 w-10 text-blue-500 flex-shrink-0" />
                    ) : (
                      <File className="h-10 w-10 text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                      {!isFolder(file) && (
                        <p className="text-xs text-gray-500 mt-1">
                          Size: {formatFileSize(file.size)}
                        </p>
                      )}
                      {file.modifiedTime && (
                        <p className="text-xs text-gray-400 mt-1">
                          Modified: {formatDate(file.modifiedTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Only for files, not folders */}
                {!isFolder(file) && (
                  <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownload(file.id, file.name)}
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </Button>

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
                )}
              </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
