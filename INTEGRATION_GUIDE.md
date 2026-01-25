// Quick Integration Guide for FileUploadHandler Component
// Add this to your task.tsx file

// ============================================
// 1. ADD IMPORT AT THE TOP
// ============================================

import { FileUploadHandler } from '../../components/shared/FileUploadHandler/FileUploadHandler';

// ============================================
// 2. STATE IS ALREADY THERE (in task.tsx)
// ============================================

// You already have these:
const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
const [attachments, setAttachments] = useState<Attachment[]>([]);
const [uploading, setUploading] = useState<boolean>(false);

// ============================================
// 3. ADD THESE HANDLER FUNCTIONS
// ============================================

function handleFilesSelected(files: File[]) {
    setUploadedFiles(prev => [...prev, ...files]);
}

function handleRemoveUploadedFile(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
}

// ============================================
// 4. IN YOUR MODAL, ADD THIS COMPONENT
// ============================================

// Inside the task creation modal, add:

{showModal && (
    <div className="modal">
        <div className="modal-content">
            {/* Your existing form fields */}
            <input
                type="text"
                name="task_name"
                placeholder="Task name"
                value={form.task_name}
                onChange={handleFormChange}
            />
            {/* ... other fields ... */}

            {/* ADD FILE UPLOAD HANDLER HERE */}
            <div className="modal-section">
                <h3>Attachments</h3>
                <FileUploadHandler
                    onFilesSelected={handleFilesSelected}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={handleRemoveUploadedFile}
                    maxFiles={10}
                />
            </div>

            {/* Your existing submit button */}
            <button 
                onClick={submitNewTask}
                disabled={uploading}
            >
                {uploading ? 'Uploading...' : 'Create Task'}
            </button>
        </div>
    </div>
)}

// ============================================
// 5. YOUR SUBMIT FUNCTION ALREADY WORKS
// ============================================

// The submitNewTask function you have already:
// 1. Validates form
// 2. Uploads files (taskService.uploadTaskFiles)
// 3. Creates task with attachments
// 4. Resets state

// No changes needed! It's ready to go.

// ============================================
// 6. EXAMPLE CSS FOR MODAL SECTION
// ============================================

const modalSectionStyle = `
.modal-section {
    margin: 1.5rem 0;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
}

.modal-section h3 {
    margin-top: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
}
`;

// ============================================
// 7. EXAMPLE: DISPLAY EXISTING ATTACHMENTS
// ============================================

// Add this near your file upload handler to show
// existing attachments when editing a task

function renderAttachments() {
    if (attachments.length === 0) {
        return null;
    }

    const imageAttachments = attachments.filter(a => 
        a.fileType.toLowerCase().startsWith('image/')
    );
    const fileAttachments = attachments.filter(a => 
        !a.fileType.toLowerCase().startsWith('image/')
    );

    return (
        <div className="existing-attachments">
            <h4>Current Attachments</h4>
            
            {imageAttachments.length > 0 && (
                <div className="images-section">
                    <h5>Images</h5>
                    <div className="image-gallery">
                        {imageAttachments.map(att => (
                            <div key={att.id} className="image-item">
                                <img src={att.fileUrl} alt={att.fileName} />
                                <button 
                                    onClick={() => removeAttachment(att.id)}
                                    className="delete-btn"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {fileAttachments.length > 0 && (
                <div className="files-section">
                    <h5>Files</h5>
                    <ul className="file-list">
                        {fileAttachments.map(att => (
                            <li key={att.id} className="file-item">
                                <a href={att.fileUrl} target="_blank">
                                    📄 {att.fileName}
                                </a>
                                <button 
                                    onClick={() => removeAttachment(att.id)}
                                    className="delete-btn"
                                >
                                    🗑️
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// ============================================
// 8. IN MODAL JSX, ADD:
// ============================================

{showModal && (
    <div className="modal">
        <div className="modal-content">
            {/* Form fields... */}

            <div className="modal-section">
                <h3>Attachments</h3>
                
                {/* Show existing attachments when editing */}
                {editingTaskId && renderAttachments()}
                
                {/* File upload handler for new files */}
                <FileUploadHandler
                    onFilesSelected={handleFilesSelected}
                    uploadedFiles={uploadedFiles}
                    onRemoveFile={handleRemoveUploadedFile}
                    maxFiles={10}
                />
            </div>

            {/* Submit button... */}
        </div>
    </div>
)}

// ============================================
// THAT'S IT!
// ============================================

// The component handles:
// ✅ Drag and drop
// ✅ File selection
// ✅ Validation
// ✅ Error display
// ✅ File removal
// ✅ Image preview

// Your task.tsx handles:
// ✅ File upload to Firebase
// ✅ Task creation
// ✅ Attachment storage
// ✅ Attachment display

// Total integration: ~20 lines of code!
