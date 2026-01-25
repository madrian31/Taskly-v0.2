import React, { useState } from 'react';
import { FileUploadService } from '../../../../services/FileUploadService';
import { FileValidationError } from '../../../../services/interfaces/IFileUploadService';
import { AlertCircle, CheckCircle2, Image as ImageIcon, FileText, Trash2, X } from 'lucide-react';
import './FileUploadHandler.css';

interface FilePreview {
  file: File;
  isImage: boolean;
  preview?: string;
  error?: string;
}

interface FileUploadHandlerProps {
  onFilesSelected: (files: File[]) => void;
  uploadedFiles: File[];
  onRemoveFile: (index: number) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

export const FileUploadHandler: React.FC<FileUploadHandlerProps> = ({
  onFilesSelected,
  uploadedFiles,
  onRemoveFile,
  maxFiles = 10,
  acceptedTypes = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [validationErrors, setValidationErrors] = useState<FileValidationError[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const fileUploadService = new FileUploadService();

  /**
   * Handle drag events
   */
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handle drop events
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  /**
   * Handle file selection from input
   */
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  /**
   * Process selected files
   */
  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList);

    // Check file count limit
    const totalFiles = uploadedFiles.length + newFiles.length;
    if (totalFiles > maxFiles) {
      setValidationErrors([{
        fileName: 'Multiple files',
        reason: `Cannot upload more than ${maxFiles} files (trying to upload ${totalFiles} total)`
      }]);
      return;
    }

    // Validate all files
    const errors = fileUploadService.validateFilesBatch(newFiles);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Clear errors if validation passed
    setValidationErrors([]);

    // Create previews for images
    const previews: FilePreview[] = newFiles.map(file => {
      const isImage = fileUploadService.isImageFile(file);
      const preview: FilePreview = { file, isImage };

      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          preview.preview = reader.result as string;
          setFilePreviews(prev => [...prev, preview]);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviews(prev => [...prev, preview]);
      }

      return preview;
    });

    // Update parent with new files
    onFilesSelected(newFiles);
  };

  /**
   * Remove file from upload
   */
  const removeFile = (index: number) => {
    onRemoveFile(index);
  };

  /**
   * Dismiss error messages
   */
  const dismissErrors = () => {
    setValidationErrors([]);
  };

  const renderFileIcon = (isImage: boolean) => {
    return isImage ? (
      <ImageIcon size={20} className="text-blue-500" />
    ) : (
      <FileText size={20} className="text-amber-500" />
    );
  };

  return (
    <div className="file-upload-handler">
      {/* Drag and drop area */}
      <div
        className={`upload-zone ${dragActive ? 'active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          multiple
          accept={acceptedTypes}
          onChange={handleFileInput}
          className="file-input"
        />
        <label htmlFor="file-input" className="upload-label">
          <div className="upload-icon">📁</div>
          <h3>Drag and drop files here</h3>
          <p>or click to select files</p>
          <span className="file-types">
            Supported: Images, Documents, Spreadsheets, Presentations
          </span>
        </label>
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <div className="error-header">
            <AlertCircle size={20} className="error-icon" />
            <span className="error-title">File Validation Failed</span>
            <button
              className="error-dismiss"
              onClick={dismissErrors}
              aria-label="Dismiss errors"
            >
              <X size={16} />
            </button>
          </div>
          <ul className="error-list">
            {validationErrors.map((error, idx) => (
              <li key={idx}>
                <strong>{error.fileName}:</strong> {error.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4 className="files-title">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>

          <div className="files-grid">
            {uploadedFiles.map((file, index) => {
              const isImage = fileUploadService.isImageFile(file);
              const preview = filePreviews.find(p => p.file === file)?.preview;

              return (
                <div key={index} className="file-item">
                  {isImage && preview ? (
                    <img src={preview} alt={file.name} className="file-preview-image" />
                  ) : (
                    <div className="file-preview-placeholder">
                      {renderFileIcon(isImage)}
                    </div>
                  )}

                  <div className="file-info">
                    <div className="file-name" title={file.name}>
                      {file.name}
                    </div>
                    <div className="file-meta">
                      <span className="file-type">
                        {isImage ? 'Image' : 'File'} • {(file.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>

                  <button
                    className="remove-button"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                    title="Remove file"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>

          {uploadedFiles.length < maxFiles && (
            <p className="file-limit-info">
              You can upload up to {maxFiles - uploadedFiles.length} more file(s)
            </p>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="upload-info">
        <div className="info-section">
          <h5>📷 Images</h5>
          <p>Stored in <code>src/images</code></p>
          <p className="info-limit">Max 5MB per image</p>
        </div>
        <div className="info-section">
          <h5>📄 Attachments</h5>
          <p>Stored in <code>src/attachment</code></p>
          <p className="info-limit">Max 25MB per file</p>
        </div>
        <div className="info-section">
          <h5>⚠️ Restrictions</h5>
          <p>Executable files are blocked for security</p>
          <p className="info-limit">Max 100MB per upload batch</p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadHandler;
