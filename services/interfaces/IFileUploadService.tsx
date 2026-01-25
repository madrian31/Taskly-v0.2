export interface FileValidationError {
  fileName: string;
  reason: string;
}

export interface FileUploadResult {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadPath: 'images' | 'files';
  uploadedAt: Date;
}

export interface IFileUploadService {
  uploadFile(file: File): Promise<FileUploadResult>;
  isImageFile(file: File): boolean;
  getUploadPath(file: File): 'images' | 'files';
  deleteFile(fileUrl: string): Promise<void>;
  uploadMultipleFiles(files: File[]): Promise<FileUploadResult[]>;
  validateFile(file: File, isImage?: boolean): FileValidationError | null;
  validateFilesBatch(files: File[]): FileValidationError[];
}
