import { IFileUploadService, FileUploadResult, FileValidationError } from './interfaces/IFileUploadService';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export class FileUploadService implements IFileUploadService {
  private storage = getStorage();
  
  // Image MIME types and extensions (comprehensive list)
  private allowedImageMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/x-icon',
    'image/tiff',
    'image/avif',
  ];
  private imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff', 'tif', 'avif'];
  
  // Disallowed file types for security
  private blockedExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar', 'zip', 'rar', '7z'];
  private blockedMimeTypes = ['application/x-msdownload', 'application/x-msdos-program', 'application/x-executable'];
  
  // File size limits
  private maxImageSize = 5 * 1024 * 1024; // 5MB for images
  private maxAttachmentSize = 25 * 1024 * 1024; // 25MB for attachments
  private maxTotalUploadSize = 100 * 1024 * 1024; // 100MB total per upload batch

  /**
   * Validates file type and checks against security restrictions
   */
  private validateFileType(file: File): FileValidationError | null {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop() || '';
    const mimeType = file.type.toLowerCase();

    // Check for blocked extensions
    if (this.blockedExtensions.includes(fileExtension)) {
      return {
        fileName: file.name,
        reason: `File type "${fileExtension}" is not allowed for security reasons`,
      };
    }

    // Check for blocked MIME types
    if (this.blockedMimeTypes.some(type => mimeType.includes(type))) {
      return {
        fileName: file.name,
        reason: `File MIME type "${mimeType}" is not allowed for security reasons`,
      };
    }

    // Warn about files without extensions
    if (!fileExtension) {
      return {
        fileName: file.name,
        reason: 'File must have a valid extension',
      };
    }

    return null;
  }

  /**
   * Determines if a file is an image based on its MIME type and extension
   */
  isImageFile(file: File): boolean {
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop() || '';

    // Check by MIME type (primary)
    if (this.allowedImageMimeTypes.includes(mimeType)) {
      return true;
    }

    // Check by file extension (fallback)
    return this.imageExtensions.includes(fileExtension);
  }

  /**
   * Determines the upload path based on file type
   */
  getUploadPath(file: File): 'images' | 'files' {
    return this.isImageFile(file) ? 'images' : 'files';
  }

  /**
   * Validates file for upload (size, type, etc.)
   */
  validateFile(file: File, isImage: boolean = false): FileValidationError | null {
    // Check file type security
    const typeError = this.validateFileType(file);
    if (typeError) {
      return typeError;
    }

    // Check file size based on type
    const maxSize = isImage ? this.maxImageSize : this.maxAttachmentSize;
    if (file.size === 0) {
      return {
        fileName: file.name,
        reason: 'File is empty',
      };
    }

    if (file.size > maxSize) {
      const maxSizeMB = isImage ? 5 : 25;
      return {
        fileName: file.name,
        reason: `File exceeds ${maxSizeMB}MB size limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
      };
    }

    return null;
  }

  /**
   * Validates a batch of files
   */
  validateFilesBatch(files: File[]): FileValidationError[] {
    const errors: FileValidationError[] = [];
    let totalSize = 0;

    for (const file of files) {
      // Determine if image for size limits
      const isImage = this.isImageFile(file);
      
      // Validate individual file
      const fileError = this.validateFile(file, isImage);
      if (fileError) {
        errors.push(fileError);
      }

      totalSize += file.size;
    }

    // Check total size
    if (totalSize > this.maxTotalUploadSize) {
      errors.push({
        fileName: 'Multiple files',
        reason: `Total upload size exceeds 100MB limit (${(totalSize / 1024 / 1024).toFixed(2)}MB)`,
      });
    }

    return errors;
  }

  /**
   * Generates a unique file name with timestamp to avoid conflicts
   */
  private generateUniqueFileName(file: File): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const fileExtension = file.name.split('.').pop() || '';
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    
    // Remove special characters from base name
    const sanitizedName = baseName
      .replace(/[^a-z0-9_-]/gi, '')
      .substring(0, 30); // Limit to 30 chars

    return `${sanitizedName}_${timestamp}_${random}.${fileExtension}`;
  }

  /**
   * Uploads a single file to Firebase Storage
   */
  async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      // Determine if image
      const isImage = this.isImageFile(file);
      console.log(`[FileUploadService] Uploading: ${file.name} (${isImage ? 'Image' : 'File'}) - Size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);

      // Validate file
      const validationError = this.validateFile(file, isImage);
      if (validationError) {
        console.error(`[FileUploadService] Validation failed for ${file.name}: ${validationError.reason}`);
        throw new Error(validationError.reason);
      }

      // Determine upload path and generate unique file name
      const uploadPath = this.getUploadPath(file);
      const uniqueFileName = this.generateUniqueFileName(file);
      const storagePath = `attachements/${uploadPath}/${uniqueFileName}`;
      console.log(`[FileUploadService] Storage path: ${storagePath}`);

      // Create reference and upload
      const fileRef = ref(this.storage, storagePath);
      console.log(`[FileUploadService] Starting upload to Firebase...`);
      await uploadBytes(fileRef, file);
      console.log(`[FileUploadService] Upload complete for ${file.name}`);

      // Get download URL
      console.log(`[FileUploadService] Getting download URL...`);
      const downloadURL = await getDownloadURL(fileRef);
      console.log(`[FileUploadService] Got download URL`);

      return {
        fileName: file.name,
        fileUrl: downloadURL,
        fileType: file.type,
        uploadPath: uploadPath,
        uploadedAt: new Date(),
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload ${file.name}: ${(error as Error).message}`);
    }
  }

  /**
   * Uploads multiple files to Firebase Storage with validation
   */
  async uploadMultipleFiles(files: File[]): Promise<FileUploadResult[]> {
    try {
      console.log(`[FileUploadService] Starting batch upload of ${files.length} file(s)`);
      
      // Validate all files first
      const validationErrors = this.validateFilesBatch(files);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map(e => `${e.fileName}: ${e.reason}`)
          .join('\n');
        console.error(`[FileUploadService] Validation errors: ${errorMessages}`);
        throw new Error(`File validation failed:\n${errorMessages}`);
      }

      const uploadResults: FileUploadResult[] = [];

      for (const file of files) {
        const result = await this.uploadFile(file);
        uploadResults.push(result);
      }

      console.log(`[FileUploadService] Batch upload complete: ${uploadResults.length} file(s) uploaded`);
      return uploadResults;
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  }

  /**
   * Deletes a file from Firebase Storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the file path from the download URL
      const urlParts = fileUrl.split('/o/')[1];
      if (!urlParts) {
        throw new Error('Invalid file URL');
      }

      const filePath = decodeURIComponent(urlParts.split('?')[0]);
      const fileRef = ref(this.storage, filePath);
      await deleteObject(fileRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }
}
