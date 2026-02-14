import React from 'react';
import './TaskModal.css';
import {
    FileUp,
    File,
    Download,
    Trash2
} from 'lucide-react';
import { Attachment, DifficultyEmoji, CompletionMoodEmoji } from '../../../../../model/Task';
import { FileUploadService } from '../../../../../services/FileUploadService';

type TaskForm = {
    task_name: string;
    description: string;
    priority: number | string;
    status: string;
    due_date: string;
};

interface Props {
    isOpen: boolean;
    showSuccess: boolean;
    onClose: () => void;
    onCloseSuccess: () => void;
    onSubmit: (e?: React.FormEvent) => Promise<void> | void;
    form: TaskForm;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeFile: (index: number) => void;
    removeAttachment: (attachmentId: string) => Promise<void> | void;
    isImageAttachment: (attachment: Attachment) => boolean;
    uploadedFiles: File[];
    attachments: Attachment[];
    uploading: boolean;
    editingTaskId: string | null;
    isSubtaskMode: boolean;
    showValidationErrors: boolean;
    fileUploadService: FileUploadService;
    difficultyEmoji: DifficultyEmoji | null;
    completionMood: CompletionMoodEmoji | null;
    onDifficultyChange: React.Dispatch<React.SetStateAction<DifficultyEmoji | null>>;
    onMoodChange: React.Dispatch<React.SetStateAction<CompletionMoodEmoji | null>>;
}

export default function TaskModal({
    isOpen,
    showSuccess,
    onClose,
    onCloseSuccess,
    onSubmit,
    form,
    handleFormChange,
    handleFileSelect,
    removeFile,
    removeAttachment,
    isImageAttachment,
    uploadedFiles,
    attachments,
    uploading,
    editingTaskId,
    isSubtaskMode,
    showValidationErrors,
    fileUploadService,
    difficultyEmoji,
    completionMood,
    onDifficultyChange,
    onMoodChange
}: Props) {
    if (!isOpen && !showSuccess) return null;

    return (
        <>
            {isOpen && (
                <div className="task-modal-overlay" onClick={onClose}>
                    <div className="task-modal" onClick={e => e.stopPropagation()}>
                        <div className="task-modal-header">
                            <h2 className="task-modal-title">
                                {editingTaskId ? (isSubtaskMode ? 'Edit Subtask' : 'Edit Task') : (isSubtaskMode ? 'Add New Subtask' : 'Add New Task')}
                            </h2>
                            <button
                                className="task-modal-close-btn"
                                type="button"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>

                        <div className="task-modal-body">
                            <form id="taskForm" onSubmit={onSubmit}>
                                <div className="task-form-group">
                                    <label className="task-form-label">
                                        {isSubtaskMode ? 'Subtask Name' : 'Task Name'}
                                        <span className="required-star">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="task-input-field"
                                        name="task_name"
                                        id="taskName"
                                        placeholder={isSubtaskMode ? "Enter subtask name" : "Enter task name"}
                                        value={form.task_name}
                                        onChange={handleFormChange}
                                        required
                                    />
                                    <div 
                                        className={`task-error-message ${showValidationErrors && !form.task_name ? 'task-error-visible' : ''}`} 
                                        id="taskNameError"
                                    >
                                        {isSubtaskMode ? 'Subtask name is required' : 'Task name is required'}
                                    </div>
                                </div>

                                <div className="task-form-group">
                                    <label className="task-form-label">Description</label>
                                    <textarea
                                        className="task-input-field"
                                        id="taskDescription"
                                        name="description"
                                        placeholder="Add a description (optional)"
                                        value={form.description}
                                        onChange={handleFormChange}
                                    ></textarea>
                                </div>

                                <div className="task-form-row">
                                    <div className="task-form-group">
                                        <label className="task-form-label">Status</label>
                                        <select 
                                            className="task-input-field" 
                                            id="taskStatus" 
                                            name="status" 
                                            value={form.status} 
                                            onChange={handleFormChange}
                                        >
                                            <option value="todo">Todo</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </div>

                                    <div className="task-form-group">
                                        <label className="task-form-label task-priority-label-header">
                                            Priority
                                            <span className="task-info-icon">i</span>
                                        </label>
                                        <select 
                                            className="task-input-field" 
                                            id="taskPriority" 
                                            name="priority" 
                                            value={form.priority} 
                                            onChange={handleFormChange}
                                        >
                                            <option value={1}>Low</option>
                                            <option value={2}>Medium</option>
                                            <option value={3}>High</option>
                                            <option value={4}>Urgent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="task-form-group">
                                    <label className="task-form-label">Due Date</label>
                                    <input
                                        type="date"
                                        className="task-input-field"
                                        id="taskDueDate"
                                        name="due_date"
                                        value={form.due_date}
                                        onChange={handleFormChange}
                                    />
                                </div>

                                <div className="task-form-group">
                                    <label className="task-form-label">Attachments</label>
                                    <div className={`file-upload-box ${uploading ? 'uploading' : ''}`}>
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileSelect}
                                            className="file-input-hidden"
                                            id="fileInput"
                                            accept="image/*,.pdf,.doc,.docx,.txt"
                                            disabled={uploading}
                                        />
                                        <label htmlFor="fileInput" className={`file-upload-label ${uploading ? 'uploading' : ''}`}>
                                            <FileUp size={24} className="fileup-icon" />
                                            <p className="file-upload-title">Click to upload or drag files</p>
                                            <p className="file-upload-note">Images, PDF, DOC, TXT (Max 10MB each)</p>
                                        </label>
                                    </div>

                                    {attachments.length > 0 && (
                                        <div className="attachments-section">
                                            <p className="attachments-heading">Current Attachments: {attachments.length}</p>
                                            {attachments.some(att => isImageAttachment(att)) && (
                                                <div className="images-grid">
                                                    <p className="images-heading-small">Images:</p>
                                                    <div className="images-grid-grid">
                                                        {attachments.filter(att => isImageAttachment(att)).map((attachment) => (
                                                            <div key={attachment.id} className="attachment-item">
                                                                <img 
                                                                    src={attachment.fileUrl} 
                                                                    alt={attachment.fileName}
                                                                    className="attachment-img"
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeAttachment(attachment.id)}
                                                                    className="attachment-remove-btn"
                                                                    title={`Remove ${attachment.fileName}`}
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {attachments.some(att => !isImageAttachment(att)) && (
                                                <div>
                                                    <p className="attachment-files-heading">Files:</p>
                                                    <div className="attachment-files-list">
                                                        {attachments.filter(att => !isImageAttachment(att)).map((attachment) => (
                                                            <div key={attachment.id} className="attachment-file-row">
                                                                <div className="attachment-file-meta">
                                                                        <File size={18} className="file-icon-purple" />
                                                                        <span className="attachment-file-name">{attachment.fileName}</span>
                                                                    </div>
                                                                <div className="flex-gap-4">
                                                                    <a 
                                                                        href={attachment.fileUrl} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        title="Download file"
                                                                    >
                                                                        <Download size={16} />
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeAttachment(attachment.id)}
                                                                        title="Remove file"
                                                                        className="icon-button-danger"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {uploadedFiles.length > 0 && (
                                        <div className="new-files-section">
                                            <p className="new-files-heading">New Files to Upload: {uploadedFiles.length}</p>
                                            {uploadedFiles.some(f => fileUploadService.isImageFile(f)) && (
                                                <div className="images-grid-wrapper">
                                                    <p className="attachment-files-heading">Images:</p>
                                                    <div className="images-grid-grid">
                                                        {uploadedFiles.filter(f => fileUploadService.isImageFile(f)).map((file, index) => (
                                                            <div key={index} className="attachment-item">
                                                                <img 
                                                                    src={URL.createObjectURL(file)} 
                                                                    alt={file.name}
                                                                    className="attachment-img"
                                                                    title={file.name}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeFile(uploadedFiles.indexOf(file))}
                                                                    className="attachment-remove-btn"
                                                                    title={`Remove ${file.name}`}
                                                                >
                                                                    ×
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {uploadedFiles.some(f => !fileUploadService.isImageFile(f)) && (
                                                <div>
                                                    <p className="attachment-files-heading">Files:</p>
                                                    <div className="attachment-files-list">
                                                        {uploadedFiles.filter(f => !fileUploadService.isImageFile(f)).map((file, index) => (
                                                            <div key={index} className="attachment-file-row">
                                                                <div className="attachment-file-meta">
                                                                    <File size={18} className="file-icon-purple" />
                                                                    <span className="attachment-file-name">{file.name}</span>
                                                                </div>
                                                                <div className="flex-gap-4">
                                                                    <a
                                                                        href={URL.createObjectURL(file)}
                                                                        download={file.name}
                                                                        title="Download file"
                                                                    >
                                                                        <Download size={16} />
                                                                    </a>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => removeFile(index)}
                                                                        title="Remove file"
                                                                        className="icon-button-danger"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>

                        <div className="task-modal-footer">
                            <button type="button" className="task-btn task-btn-cancel" onClick={onClose} disabled={uploading}>
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                className="task-btn task-btn-primary" 
                                onClick={onSubmit}
                                disabled={uploading}
                            >
                                {uploading ? 'Uploading...' : (editingTaskId ? (isSubtaskMode ? 'Save Subtask' : 'Save Task') : (isSubtaskMode ? 'Add Subtask' : 'Add Task'))}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSuccess && (
                <div className="task-modal-overlay" onClick={onCloseSuccess}>
                    <div 
                        className="task-modal task-modal--small" 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="task-modal-header task-modal-header--compact">
                            <button
                                className="task-modal-close-btn"
                                type="button"
                                onClick={onCloseSuccess}
                                aria-label="Close modal"
                            >
                                ×
                            </button>
                        </div>

                        <div className="task-modal-body task-modal-body--success">
                            <div className="success-icon-circle">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>

                            <h2 className="success-title">Awesome!</h2>
                            
                            <p className="success-message">{isSubtaskMode ? 'Subtask' : 'Task'} successfully added to your list</p>

                            <button 
                                type="button" 
                                className="task-btn task-btn-primary task-btn-full"
                                onClick={onCloseSuccess}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
