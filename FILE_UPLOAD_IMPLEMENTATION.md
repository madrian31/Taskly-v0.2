# File Upload at Attachment System - Implementation Guide

## Overview
The implementation now supports automatic file organization where:
- **Images** (jpg, jpeg, png, gif, webp, svg, bmp, ico) → `attachments/images/` folder
- **Other files** (pdf, doc, docx, txt, etc.) → `attachments/files/` folder
- **Image preview** shows when editing tasks

## Files Created/Modified

### 1. **IFileUploadService.tsx** (New Interface)
Location: `services/interfaces/IFileUploadService.tsx`

```typescript
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
}
```

**Purpose**: Defines the contract for file upload services

---

### 2. **FileUploadService.ts** (New Implementation)
Location: `services/FileUploadService.ts`

**Key Features**:
- ✅ Detects file type by MIME type and extension
- ✅ Routes images to `attachments/images/` and files to `attachments/files/`
- ✅ Validates file size (max 10MB)
- ✅ Generates unique filenames with timestamps
- ✅ Uploads to Firebase Storage
- ✅ Supports batch file uploads
- ✅ File deletion capability

**Methods**:
```typescript
isImageFile(file: File): boolean
  - Checks if file is an image based on MIME type and extension

getUploadPath(file: File): 'images' | 'files'
  - Returns the appropriate folder path for the file

uploadFile(file: File): Promise<FileUploadResult>
  - Uploads a single file and returns metadata

uploadMultipleFiles(files: File[]): Promise<FileUploadResult[]>
  - Uploads multiple files and returns array of metadata

deleteFile(fileUrl: string): Promise<void>
  - Deletes a file from Firebase Storage
```

---

### 3. **TaskService.ts** (Updated)
Location: `services/TaskService.ts`

**New Methods**:
```typescript
uploadTaskFiles(files: File[]): Promise<Attachment[]>
  - Uploads files and returns Attachment objects for storing in tasks

removeTaskAttachment(taskId: string, attachmentId: string, attachment: Attachment): Promise<void>
  - Removes attachment from task and deletes from Firebase

isImageFile(file: File): boolean
  - Helper to check if a file is an image
```

**Constructor Update**:
```typescript
constructor(
    private taskRepository: ITaskRepository,
    private fileUploadService?: IFileUploadService
)
```

---

### 4. **task.tsx** (Updated)
Location: `src/pages/task/task.tsx`

**New State Variables**:
```typescript
const [attachments, setAttachments] = useState<Attachment[]>([]);  // Existing attachments
const [uploading, setUploading] = useState<boolean>(false);        // Upload status
```

**New Functions**:
```typescript
removeAttachment(attachmentId: string): void
  - Remove existing attachment from task

isImageAttachment(attachment: Attachment): boolean
  - Check if attachment is an image for preview rendering
```

**Updated Functions**:
```typescript
openModal(parentId?: string)
  - Now resets attachments state

openEditModal(task: Task)
  - Now loads existing attachments from task

submitNewTask(e?: React.FormEvent)
  - Handles file uploads before creating/updating task
  - Combines existing attachments with newly uploaded files
```

**UI Enhancements**:
- 📸 **Image Preview Grid**: Shows thumbnail grid for image attachments
- 📄 **File List**: Shows non-image files with download and delete options
- 📤 **New Files Indicator**: Shows files ready to upload with folder destination
- 🔄 **Upload Status**: Button shows "Uploading..." during file uploads
- 🎯 **File Type Detection**: Shows which folder each file will go to (Image → images folder / File → files folder)

---

## How It Works

### Adding Files to a New Task

1. User clicks "Add Task" button
2. Modal opens with attachment section
3. User selects files from file input
4. For each selected file:
   - FileUploadService checks if it's an image
   - If image: marked for `attachments/images/`
   - If not: marked for `attachments/files/`
5. User submits the form
6. Files are uploaded to Firebase Storage
7. Task is created with attachment metadata

### Editing a Task with Attachments

1. User clicks edit on existing task
2. Modal loads with:
   - ✅ Existing attachments displayed
   - 📸 Images shown as thumbnail grid
   - 📄 Other files shown as list with download links
3. User can:
   - Remove existing attachments
   - Add new files
4. On save, new files are uploaded and combined with existing attachments

### File Organization in Firebase

```
Firebase Storage Structure:
┌── attachements/
│   ├── images/
│   │   ├── 1705000123_abc123.jpg
│   │   ├── 1705000124_def456.png
│   │   └── ...
│   └── files/
│       ├── 1705000125_ghi789.pdf
│       ├── 1705000126_jkl012.docx
│       └── ...
```

---

## Image File Extensions Supported

```
.jpg, .jpeg, .png, .gif, .webp, .svg, .bmp, .ico
```

---

## Features in Detail

### 1. **Smart File Routing**
```typescript
// Automatically routes based on file type
Image (JPG, PNG, GIF) → attachments/images/
Document (PDF, DOC) → attachments/files/
Text (TXT) → attachments/files/
```

### 2. **Image Preview in Modal**
```
┌─────────────────────────────────────┐
│ Current Attachments:                │
│ Images:                             │
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ IMG1 │ │ IMG2 │ │ IMG3 │        │
│ └──────┘ └──────┘ └──────┘        │
│                                     │
│ Files:                              │
│ 📄 document.pdf    [⬇] [🗑]        │
│ 📄 report.docx     [⬇] [🗑]        │
│                                     │
│ New Files to Upload:                │
│ 🖼️ photo.jpg (Image → images)      │
│ 📄 notes.pdf (File → files)        │
└─────────────────────────────────────┘
```

### 3. **File Size Validation**
- Maximum 10MB per file
- Validated before upload
- Clear error messages

### 4. **Unique Filenames**
- Generated as: `{timestamp}_{random}.{extension}`
- Prevents filename collisions
- Example: `1705000123_abc123.jpg`

### 5. **Download Existing Files**
- Non-image attachments have download button
- Images are displayed as previews
- Click to view full size in new tab

---

## Workflow Diagram

```
┌─────────────────┐
│ User Click Task │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Select Files                    │
│ (Images & Non-Images Mixed)     │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│ FileUploadService.isImageFile()             │
│ Separates: Images vs Others                 │
└────────┬───────────────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
┌────────┐  ┌──────────┐
│ Images │  │ Other    │
│ → img/ │  │ → files/ │
└────┬───┘  └─────┬────┘
     │            │
     └──────┬─────┘
            ▼
┌─────────────────────────────────┐
│ Upload to Firebase Storage      │
│ (with unique filenames)         │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Create/Update Task              │
│ (with attachment metadata)      │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Task Saved with Attachments     │
│ Ready for Preview on Edit       │
└─────────────────────────────────┘
```

---

## Testing Checklist

- [ ] Upload image → goes to `attachments/images/`
- [ ] Upload PDF → goes to `attachments/files/`
- [ ] Upload mixed files → correctly separated
- [ ] Edit task → see existing attachments
- [ ] Remove attachment → deleted from Firebase
- [ ] Add attachment to existing task → combined with existing
- [ ] View image preview → thumbnail displays
- [ ] Download file → download button works
- [ ] File size validation → rejects > 10MB
- [ ] Uploading status → shows "Uploading..." message
- [ ] Cancel upload → closes modal without saving

---

## Error Handling

The implementation includes error handling for:
- ✅ File size exceeds limit
- ✅ Invalid file types
- ✅ Firebase upload failures
- ✅ Network errors
- ✅ Storage permission issues

All errors are logged to console and displayed to user via alert.

---

## Future Enhancements

1. **Drag & Drop**: Add drag-and-drop file upload
2. **File Preview Types**: Support PDF preview, video thumbnails
3. **Bulk Actions**: Delete multiple attachments at once
4. **File Comments**: Add comments/notes to attachments
5. **Sharing**: Share attachments with team members
6. **Versioning**: Keep attachment version history
7. **Integration**: Link attachments to subtasks

---

## Summary

✅ **Fully implemented file upload system** with automatic image/file separation  
✅ **Image preview** in task editor  
✅ **Firebase Storage** integration  
✅ **Error handling** and validation  
✅ **User-friendly UI** with clear visual feedback
