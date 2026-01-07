import { api } from './api';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  parents?: string[];
}

export interface ListFilesResponse {
  files: DriveFile[];
  currentFolder?: DriveFile | null;
  rootFolderId?: string;
}

export interface UploadFileResponse {
  file: DriveFile;
}

export interface XlsxData {
  data: any[][];
}

export const googleDriveService = {
  async listFiles(folderId?: string): Promise<ListFilesResponse> {
    const params = folderId ? { folderId } : {};
    const response = await api.get<ListFilesResponse>('/google/files', { params });
    return response.data;
  },

  async uploadFile(file: File): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<UploadFileResponse>('/google/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await api.get(`/google/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async deleteFile(fileId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/google/files/${fileId}`);
    return response.data;
  },

  async shareFile(fileId: string, role: string = 'reader'): Promise<any> {
    const response = await api.post(`/google/files/${fileId}/share`, { role });
    return response.data;
  },

  async readXlsxFile(fileId: string): Promise<XlsxData> {
    const response = await api.get<XlsxData>(`/google/xlsx/${fileId}`);
    return response.data;
  },
};
