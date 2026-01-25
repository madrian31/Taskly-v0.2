# File Upload - Developer Quick Reference

## 🚀 One-Minute Setup

```tsx
// 1. Import
import { FileUploadHandler } from '../../components/shared/FileUploadHandler/FileUploadHandler';

// 2. Add to JSX
<FileUploadHandler
    onFilesSelected={handleFilesSelected}
    uploadedFiles={uploadedFiles}
    onRemoveFile={handleRemoveUploadedFile}
/>

// 3. Done! ✅
```

---

## 📋 API Reference

### FileUploadHandler Props
```typescript
interface FileUploadHandlerProps {
    onFilesSelected: (files: File[]) => void;
    uploadedFiles: File[];
    onRemoveFile: (index: number) => void;
    maxFiles?: number;        // Default: 10
    acceptedTypes?: string;   // Default: common types
}
```

### FileUploadService Methods

#### `isImageFile(file: File): boolean`
Checks if file is an image
```tsx
if (fileUploadService.isImageFile(file)) {
    // Goes to images folder
}
```

#### `getUploadPath(file: File): 'images' | 'files'`
Returns destination folder
```tsx
const path = fileUploadService.getUploadPath(file);
// Returns: 'images' or 'files'
```

#### `validateFile(file: File, isImage?: boolean): FileValidationError | null`
Validates single file
```tsx
const error = fileUploadService.validateFile(file);
if (error) {
    console.error(`${error.fileName}: ${error.reason}`);
}
```

#### `validateFilesBatch(files: File[]): FileValidationError[]`
Validates multiple files
```tsx
const errors = fileUploadService.validateFilesBatch(files);
if (errors.length > 0) {
    // Show errors to user
}
```

#### `uploadFile(file: File): Promise<FileUploadResult>`
Uploads single file
```tsx
const result = await fileUploadService.uploadFile(file);
// result: { fileName, fileUrl, fileType, uploadPath, uploadedAt }
```

#### `uploadMultipleFiles(files: File[]): Promise<FileUploadResult[]>`
Uploads multiple files
```tsx
const results = await fileUploadService.uploadMultipleFiles(files);
```

#### `deleteFile(fileUrl: string): Promise<void>`
Deletes file from storage
```tsx
await fileUploadService.deleteFile(fileUrl);
```

---

## 🎯 Common Patterns

### Pattern 1: File Selection Handler
```tsx
function handleFilesSelected(files: File[]) {
    setUploadedFiles(prev => [...prev, ...files]);
}
```

### Pattern 2: File Removal Handler
```tsx
function handleRemoveFile(index: number) {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
}
```

### Pattern 3: Check File Type
```tsx
const fileUploadService = new FileUploadService();
const path = fileUploadService.getUploadPath(file);
// 'images' or 'files'
```

### Pattern 4: Validate Before Upload
```tsx
const errors = fileUploadService.validateFilesBatch(files);
if (errors.length === 0) {
    // Safe to upload
    await fileUploadService.uploadMultipleFiles(files);
}
```

### Pattern 5: Display Image/File Differently
```tsx
{uploadedFiles.map((file, idx) => (
    <div key={idx}>
        {fileUploadService.isImageFile(file) ? (
            <img src={URL.createObjectURL(file)} />
        ) : (
            <div>📄 {file.name}</div>
        )}
    </div>
))}
```

---

## 📊 Limits Reference

```
Images:       5 MB max
Files:        25 MB max
Batch:        100 MB max
Count:        10 files max
```

---

## 🎨 Component Styling

The component uses CSS classes:
- `.file-upload-handler` - Main container
- `.upload-zone` - Drag-drop area
- `.uploaded-files` - Files list
- `.file-item` - Individual file
- `.validation-errors` - Error display
- `.upload-info` - Info box

Customize in `FileUploadHandler.css`

---

## ⚠️ Error Codes

| Message | Cause | Solution |
|---------|-------|----------|
| "File is empty" | 0 byte file | Select valid file |
| "File exceeds 5MB" | Large image | Compress image |
| "File exceeds 25MB" | Large file | Use smaller file |
| "File type '.exe' not allowed" | Blocked type | Choose different file |
| "Total size exceeds 100MB" | Batch too large | Upload separately |
| "Cannot upload more than 10" | Too many files | Upload in batches |

---

## 🔍 File Detection Logic

```
1. Check MIME type
   ↓
   Is it image/* ?
   ├─ Yes → Image
   └─ No → Check extension
   
2. Check extension
   ├─ In imageExtensions[]? → Image
   └─ Otherwise → File
```

---

## 📁 Storage Structure

```
Firebase Storage:
attachements/
├── images/
│   └── {fileName}_{timestamp}_{random}.ext
└── files/
    └── {fileName}_{timestamp}_{random}.ext

Local Reference:
src/
├── images/     (Reference folder)
└── attachment/ (Reference folder)
```

---

## 🔒 Security Checks

```
1. Check for empty file ✓
2. Check file size ✓
3. Check file type (MIME) ✓
4. Check file extension ✓
5. Block executables ✓
6. Validate batch size ✓
7. Sanitize filename ✓
8. Generate unique name ✓
```

---

## 💡 Tips & Tricks

### Tip 1: Pre-load Existing Attachments
```tsx
useEffect(() => {
    if (editingTask?.attachments) {
        setAttachments(editingTask.attachments);
    }
}, [editingTask]);
```

### Tip 2: Show Upload Progress
```tsx
<button disabled={uploading}>
    {uploading ? '⏳ Uploading...' : 'Create Task'}
</button>
```

### Tip 3: Image Preview
```tsx
{uploadedFiles.map(file => (
    fileUploadService.isImageFile(file) && (
        <img src={URL.createObjectURL(file)} />
    )
))}
```

### Tip 4: File Size Display
```tsx
const sizeMB = (file.size / 1024 / 1024).toFixed(2);
console.log(`${file.name}: ${sizeMB}MB`);
```

### Tip 5: Error Handling
```tsx
try {
    await fileUploadService.uploadMultipleFiles(files);
} catch (error) {
    alert(`Upload failed: ${error.message}`);
}
```

---

## 🧪 Quick Test Cases

```
✅ Upload JPG → goes to images
✅ Upload PDF → goes to files
✅ Upload both → both handled
✅ Upload .exe → blocked
✅ Drag & drop → works
✅ Click select → works
✅ Remove file → works
✅ Submit task → files uploaded
```

---

## 📱 Responsive Breakpoints

```
Desktop (1024px+):   4-column grid
Tablet (768px):      2-column grid
Mobile (480px):      1-column grid
```

---

## 🎯 Use Cases

### Use Case 1: Task with Photo
```tsx
// User selects photo.jpg (3MB)
→ Validated as image (✓ 3MB < 5MB)
→ Uploaded to attachments/images/
→ Stored in task.attachments
```

### Use Case 2: Task with Document
```tsx
// User selects report.pdf (2MB)
→ Validated as file (✓ 2MB < 25MB)
→ Uploaded to attachments/files/
→ Stored in task.attachments
```

### Use Case 3: Mixed Upload
```tsx
// User selects: photo.jpg, document.pdf, notes.txt
→ All validated
→ photo.jpg → images/
→ document.pdf → files/
→ notes.txt → files/
→ All stored in task.attachments
```

---

## 🚨 Troubleshooting

**Files not showing?**
- Check browser console
- Verify Firebase rules
- Confirm URL is correct

**Wrong folder?**
- Check file MIME type
- Check file extension
- Review detection logic

**Validation failing?**
- Check file size
- Check file type
- Check file not empty

**Upload slow?**
- Check file size
- Check network
- Reduce batch

---

## 📚 Related Files

- `FileUploadHandler.tsx` - Component
- `FileUploadHandler.css` - Styles
- `FileUploadService.ts` - Logic
- `IFileUploadService.tsx` - Interface
- `FILE_UPLOAD_SUMMARY.md` - Overview
- `INTEGRATION_GUIDE.md` - How to integrate
- `FILE_UPLOAD_REFERENCE.md` - Full guide

---

## ✨ Key Features Summary

- ✅ Drag & drop
- ✅ Image preview
- ✅ File validation
- ✅ Auto-separation (images/files)
- ✅ Error messages
- ✅ Responsive design
- ✅ Security checks
- ✅ Firebase integration

---

## 🎉 You're All Set!

Everything is ready. Just import and use!

```tsx
<FileUploadHandler
    onFilesSelected={handleFilesSelected}
    uploadedFiles={uploadedFiles}
    onRemoveFile={handleRemoveUploadedFile}
/>
```

Questions? Check the docs or review the code comments.
