import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { googleDriveService } from '../services/googleDriveService.js';
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export { upload };

/**
 * Get OAuth authorization URL
 */
export async function getAuthUrl(_req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!googleDriveService.isConfigured()) {
      res.status(503).json({ error: 'Google Drive not configured' });
      return;
    }

    const authUrl = googleDriveService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error getting auth URL:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get auth URL' });
  }
}

/**
 * OAuth callback - exchange code for tokens
 */
export async function handleOAuthCallback(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { code } = req.query;

    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Authorization code required' });
      return;
    }

    const tokens = await googleDriveService.getTokensFromCode(code);

    res.json({
      message: 'Authorization successful',
      refreshToken: tokens.refresh_token,
      note: 'Save the refresh_token to GOOGLE_REFRESH_TOKEN environment variable',
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'OAuth failed' });
  }
}

/**
 * Upload file to Google Drive
 */
export async function uploadFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    // Use folderId from request body if provided, otherwise use env var
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const folderId = req.body.folderId || rootFolderId;

    const result = await googleDriveService.uploadFile(
      req.file.originalname,
      req.file.mimetype,
      req.file.buffer,
      folderId
    );

    res.json({ file: result });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload file' });
  }
}

/**
 * Download file from Google Drive
 */
export async function downloadFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;

    const fileBuffer = await googleDriveService.downloadFile(fileId);
    const metadata = await googleDriveService.getFileMetadata(fileId);

    res.setHeader('Content-Type', metadata.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to download file' });
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;
    const metadata = await googleDriveService.getFileMetadata(fileId);
    res.json({ file: metadata });
  } catch (error) {
    console.error('Error getting file metadata:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get file metadata' });
  }
}

/**
 * List files in Google Drive
 */
export async function listFiles(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { pageSize, folderId: queryFolderId } = req.query;

    // Use folderId from query param, fallback to env var root folder
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const folderIdToUse = (queryFolderId as string) || rootFolderId;

    const files = await googleDriveService.listFiles(
      folderIdToUse,
      pageSize ? parseInt(String(pageSize)) : undefined
    );

    // If navigating into a subfolder, get folder metadata for breadcrumb
    let currentFolder = null;
    if (folderIdToUse && folderIdToUse !== rootFolderId) {
      currentFolder = await googleDriveService.getFileMetadata(folderIdToUse);
    }

    res.json({
      files,
      currentFolder,
      rootFolderId
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to list files' });
  }
}

/**
 * Read XLSX file from Google Drive
 */
export async function readXlsxFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;
    const data = await googleDriveService.readXlsxFile(fileId);
    res.json({ data });
  } catch (error) {
    console.error('Error reading XLSX file:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to read XLSX file' });
  }
}

/**
 * Upload XLSX file to Google Drive
 */
export async function uploadXlsxFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fileName, data, sheetName } = req.body;

    if (!fileName || !data) {
      res.status(400).json({ error: 'fileName and data are required' });
      return;
    }

    // Use the configured folder ID from environment
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const result = await googleDriveService.uploadXlsxFile(
      fileName,
      data,
      sheetName,
      folderId
    );

    res.json({ file: result });
  } catch (error) {
    console.error('Error uploading XLSX file:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to upload XLSX file' });
  }
}

/**
 * Delete file from Google Drive
 */
export async function deleteFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;
    await googleDriveService.deleteFile(fileId);
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete file' });
  }
}

/**
 * Share file (make publicly accessible)
 */
export async function shareFile(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { fileId } = req.params;
    const { role } = req.body;

    const result = await googleDriveService.shareFile(fileId, role || 'reader');
    res.json({ permission: result });
  } catch (error) {
    console.error('Error sharing file:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to share file' });
  }
}
