import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';

class GoogleDriveService {
  private oauth2Client: OAuth2Client | null = null;
  private drive: any = null;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/google/callback';

    if (!clientId || !clientSecret) {
      console.warn('[GoogleDrive] OAuth credentials not configured. Google Drive integration disabled.');
      return;
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUri
    );

    // If we have a refresh token, set it
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
    }

    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
    console.log('[GoogleDrive] Service initialized successfully');
  }

  /**
   * Generate OAuth URL for user authorization
   */
  getAuthUrl(): string {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized');
    }

    const scopes = [
      'https://www.googleapis.com/auth/drive',
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string) {
    if (!this.oauth2Client) {
      throw new Error('OAuth client not initialized');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    return tokens;
  }

  /**
   * Upload a file to Google Drive
   */
  async uploadFile(
    fileName: string,
    mimeType: string,
    fileBuffer: Buffer,
    folderId?: string
  ): Promise<any> {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    const fileMetadata: any = {
      name: fileName,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
      console.log(`[GoogleDrive] Uploading to folder: ${folderId}`);
    } else {
      console.log(`[GoogleDrive] Uploading to My Drive root (no parent specified)`);
    }

    const media = {
      mimeType,
      body: Readable.from(fileBuffer),
    };

    try {
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink',
      });

      console.log(`[GoogleDrive] File uploaded: ${fileName} (ID: ${response.data.id})`);
      return response.data;
    } catch (error: any) {
      console.error(`[GoogleDrive] Upload failed:`, {
        error: error.message,
        code: error.code,
        errors: error.errors,
        folderId,
        fileName
      });

      // If permission denied and we tried to upload to a specific folder, try root instead
      if (error.code === 403 && folderId) {
        console.log(`[GoogleDrive] Retrying upload to My Drive root instead of folder ${folderId}`);
        delete fileMetadata.parents;

        const retryResponse = await this.drive.files.create({
          requestBody: fileMetadata,
          media: { mimeType, body: Readable.from(fileBuffer) },
          fields: 'id, name, webViewLink, webContentLink',
        });

        console.log(`[GoogleDrive] File uploaded to root: ${fileName} (ID: ${retryResponse.data.id})`);
        return retryResponse.data;
      }

      throw error;
    }
  }

  /**
   * Download a file from Google Drive
   */
  async downloadFile(fileId: string): Promise<Buffer> {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    const response = await this.drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    return Buffer.from(response.data);
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<any> {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    const response = await this.drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink',
    });

    return response.data;
  }

  /**
   * List files in a folder
   */
  async listFiles(folderId?: string, pageSize: number = 100): Promise<any[]> {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    const query = folderId ? `'${folderId}' in parents and trashed=false` : 'trashed=false';

    const response = await this.drive.files.list({
      q: query,
      pageSize,
      fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, parents)',
      orderBy: 'folder,modifiedTime desc',
    });

    return response.data.files || [];
  }

  /**
   * Read XLSX file from Google Drive
   */
  async readXlsxFile(fileId: string): Promise<any> {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    // Download the file
    const fileBuffer = await this.downloadFile(fileId);

    // Parse XLSX file
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    // Convert to JSON
    const result: any = {};
    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      result[sheetName] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    });

    console.log(`[GoogleDrive] XLSX file parsed: ${fileId}`);
    return result;
  }

  /**
   * Create XLSX file and upload to Google Drive
   */
  async uploadXlsxFile(
    fileName: string,
    data: any[][],
    sheetName: string = 'Sheet1',
    folderId?: string
  ): Promise<any> {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Convert to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Upload to Drive
    return await this.uploadFile(
      fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer,
      folderId
    );
  }

  /**
   * Delete a file from Google Drive
   */
  async deleteFile(fileId: string): Promise<void> {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    await this.drive.files.delete({ fileId });
    console.log(`[GoogleDrive] File deleted: ${fileId}`);
  }

  /**
   * Share a file (make it publicly accessible)
   */
  async shareFile(fileId: string, role: 'reader' | 'writer' = 'reader'): Promise<any> {
    if (!this.drive) {
      throw new Error('Google Drive not initialized');
    }

    const permission = {
      type: 'anyone',
      role: role,
    };

    const response = await this.drive.permissions.create({
      fileId,
      requestBody: permission,
    });

    console.log(`[GoogleDrive] File shared: ${fileId}`);
    return response.data;
  }

  /**
   * Check if service is configured and ready
   */
  isConfigured(): boolean {
    return this.oauth2Client !== null && this.drive !== null;
  }
}

export const googleDriveService = new GoogleDriveService();
