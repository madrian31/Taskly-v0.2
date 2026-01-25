import { IFileUploadService, FileUploadResult } from './interfaces/IFileUploadService';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export class FileUploadService implements IFileUploadService {
  private storage = getStorage();
  private imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  private maxFileSize = 10 * 1024 * 1024; // 10MB

  /**
   * Determines if a file is an image based on its MIME type and extension
   */
  isImageFile(file: File): boolean {
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop() || '';

    // Check by MIME type
    if (mimeType.startsWith('image/')) {
      return true;
    }

    // Check by file extension
    return this.imageExtensions.includes(fileExtension);
  }

  /**
   * Determines the upload path based on file type
   */
  getUploadPath(file: File): 'images' | 'files' {
    return this.isImageFile(file) ? 'images' : 'files';
  }

  /**
   * Validates file size
   */
  private validateFileSize(file: File): void {
    if (file.size > this.maxFileSize) {
      throw new Error(`File ${file.name} exceeds maximum size of 10MB`);
    }
  }

  /**
   * Generates a unique file name with timestamp
   */
  private generateUniqueFileName(file: File): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const fileExtension = file.name.split('.').pop() || '';
    return `${timestamp}_${random}.${fileExtension}`;
  }

  /**
   * Uploads a single file to Firebase Storage
   */
  async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      // Validate file size
      this.validateFileSize(file);

      // Determine upload path and generate unique file name
      const uploadPath = this.getUploadPath(file);
      const uniqueFileName = this.generateUniqueFileName(file);
      const storagePath = `attachements/${uploadPath}/${uniqueFileName}`;

      // Create reference and upload
      const fileRef = ref(this.storage, storagePath);
      await uploadBytes(fileRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(fileRef);

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
   * Uploads multiple files to Firebase Storage
   */
  async uploadMultipleFiles(files: File[]): Promise<FileUploadResult[]> {
    try {
      const uploadResults: FileUploadResult[] = [];

      for (const file of files) {
        const result = await this.uploadFile(file);
        uploadResults.push(result);
      }

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
