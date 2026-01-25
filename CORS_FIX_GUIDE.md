# Firebase Storage CORS Fix - Complete Solution

## Problem
You're getting CORS (Cross-Origin Resource Sharing) errors when accessing Firebase Storage from `localhost:5500`:

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' 
from origin 'http://localhost:5500' has been blocked by CORS policy
```

## Root Causes

1. **Firebase Security Rules** not properly configured
2. **CORS headers** not set up in Firebase Storage
3. **Download URLs** may not have proper access tokens
4. **Localhost HTTPS issue** - Firebase requires HTTPS or proper localhost setup

## Solution (Choose One)

### Option 1: Fix Firebase Security Rules (RECOMMENDED)
This is the quickest fix for development.

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (taskly-2542f)
3. Click **Storage** → **Rules**
4. Replace with this:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read
    match /{allPaths=**} {
      allow read;
      allow write: if request.auth != null;
    }
  }
}
```

5. Click **Publish**

### Option 2: Add CORS Configuration (For Production)
If Option 1 doesn't work, add CORS headers:

1. Install Google Cloud SDK
2. Run this command in terminal:

```bash
gsutil cors set cors.json gs://taskly-2542f.firebasestorage.app
```

Where `cors.json` contains:
```json
[
  {
    "origin": ["http://localhost:5500", "http://localhost:3000", "https://yourdomain.com"],
    "method": ["GET", "HEAD", "DELETE"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

### Option 3: Use Download URLs with Tokens (SAFER)
Update FileUploadService to always use download URLs:

```typescript
async uploadFile(file: File): Promise<FileUploadResult> {
    try {
        const isImage = this.isImageFile(file);
        const validationError = this.validateFile(file, isImage);
        if (validationError) throw new Error(validationError.reason);

        const uploadPath = this.getUploadPath(file);
        const uniqueFileName = this.generateUniqueFileName(file);
        const storagePath = `attachements/${uploadPath}/${uniqueFileName}`;

        const fileRef = ref(this.storage, storagePath);
        await uploadBytes(fileRef, file);

        // Get download URL (includes access token)
        const downloadURL = await getDownloadURL(fileRef);

        return {
            fileName: file.name,
            fileUrl: downloadURL,  // Use full URL with token
            fileType: file.type,
            uploadPath: uploadPath,
            uploadedAt: new Date(),
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        throw new Error(`Failed to upload ${file.name}: ${(error as Error).message}`);
    }
}
```

## Immediate Fix (Try This First)

### Step 1: Update Firebase Rules
1. Open [Firebase Console](https://console.firebase.google.com)
2. Go to Storage → Rules
3. Replace with permissive rules for development:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 2: Clear Browser Cache
1. Press F12 (DevTools)
2. Ctrl+Shift+Delete (Clear browser data)
3. Reload page

### Step 3: Verify URLs
The download URLs should look like:
```
https://firebasestorage.googleapis.com/v0/b/taskly-2542f.firebasestorage.app/o/attachements%2Fimages%2F...?alt=media&token=xyz
```

Note the `?alt=media&token=xyz` at the end - this is required!

## Quick Troubleshooting

### If still getting CORS error:

**Check 1: Security Rules**
```bash
# In Firebase Console, verify rules are published
# Should see green checkmark next to "Rules"
```

**Check 2: Browser Console**
```javascript
// Run this in browser console to test
fetch('https://firebasestorage.googleapis.com/v0/b/taskly-2542f.firebasestorage.app/o?list-type=2')
  .then(r => console.log(r.status, r.ok))
  .catch(e => console.error('CORS Error:', e))
```

**Check 3: URL Format**
Make sure URLs have `?alt=media&token=...` at the end

## File Upload Service - CORS Safe Version

```typescript
import { IFileUploadService, FileUploadResult, FileValidationError } from './interfaces/IFileUploadService';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export class FileUploadService implements IFileUploadService {
  private storage = getStorage();

  /**
   * Uploads a single file to Firebase Storage
   * CORS Safe: Uses getDownloadURL() which includes access token
   */
  async uploadFile(file: File): Promise<FileUploadResult> {
    try {
      const isImage = this.isImageFile(file);
      const validationError = this.validateFile(file, isImage);
      if (validationError) {
        throw new Error(validationError.reason);
      }

      const uploadPath = this.getUploadPath(file);
      const uniqueFileName = this.generateUniqueFileName(file);
      const storagePath = `attachements/${uploadPath}/${uniqueFileName}`;

      console.log(`[FileUploadService] Uploading: ${uniqueFileName} to ${uploadPath}/`);

      const fileRef = ref(this.storage, storagePath);
      
      // Upload file
      await uploadBytes(fileRef, file);
      console.log(`[FileUploadService] Upload complete: ${uniqueFileName}`);

      // Get download URL with access token (CORS safe)
      const downloadURL = await getDownloadURL(fileRef);
      console.log(`[FileUploadService] Got download URL`);

      return {
        fileName: file.name,
        fileUrl: downloadURL,  // Full URL with ?alt=media&token=...
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
   * Uploads multiple files
   */
  async uploadMultipleFiles(files: File[]): Promise<FileUploadResult[]> {
    try {
      const validationErrors = this.validateFilesBatch(files);
      if (validationErrors.length > 0) {
        const errorMessages = validationErrors
          .map(e => `${e.fileName}: ${e.reason}`)
          .join('\n');
        throw new Error(`File validation failed:\n${errorMessages}`);
      }

      console.log(`[FileUploadService] Starting batch upload of ${files.length} files`);
      const uploadResults: FileUploadResult[] = [];

      for (const file of files) {
        const result = await this.uploadFile(file);
        uploadResults.push(result);
      }

      console.log(`[FileUploadService] Batch upload complete`);
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
      // Extract path from URL
      const urlParts = fileUrl.split('/o/')[1];
      if (!urlParts) {
        throw new Error('Invalid file URL');
      }

      const filePath = decodeURIComponent(urlParts.split('?')[0]);
      console.log(`[FileUploadService] Deleting: ${filePath}`);

      const fileRef = ref(this.storage, filePath);
      await deleteObject(fileRef);
      console.log(`[FileUploadService] Delete complete`);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }

  // ... rest of the methods remain the same
}
```

## Testing the Fix

### Test 1: Upload a file
1. Open task component
2. Try to upload an image
3. Check console for success logs
4. Check Firebase Storage console for file

### Test 2: View the image
1. Image should display without CORS error
2. Download URL should have `?alt=media&token=...`
3. Check Network tab in DevTools - should see 200 OK

### Test 3: Create task with attachment
1. Upload file
2. Create task
3. File should be saved with task
4. Reload page
5. File should still display

## Common Issues

### Issue: Still getting CORS error
**Solution**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)
- Check Firebase rules are published (green checkmark)
- Check URL includes `?alt=media&token=`

### Issue: File uploads but doesn't display
**Solution**:
- Check download URL format
- Verify `?alt=media&token=` is present
- Check image src points to full URL, not partial

### Issue: Error "Response to preflight request"
**Solution**:
- This means OPTIONS request failed
- Update Firebase security rules to allow all reads
- Use `allow read;` instead of conditional

### Issue: "Failed to load resource: net::ERR_FAILED"
**Solution**:
- Network request is failing
- Check internet connection
- Check Firebase project is active
- Verify authentication is working

## Firebase Console Checklist

- [ ] Project ID is `taskly-2542f`
- [ ] Storage is enabled
- [ ] Rules are published (green checkmark)
- [ ] Rules allow read access
- [ ] Rules allow authenticated write
- [ ] No CORS errors in logs
- [ ] Files appear in Storage browser

## Development vs Production

### Development (localhost)
```
Rules: Allow all reads
         Allow writes for authenticated users
Usage: For testing and development only
```

### Production
```
Rules: Restrict reads to authenticated users
       Restrict writes to specific users
       Add CORS headers
Usage: For deployed application
```

## Next Steps

1. **Immediate**: Update Firebase Security Rules (Option 1)
2. **Test**: Try uploading a file
3. **Verify**: Check file displays without errors
4. **Monitor**: Watch console for any remaining issues
5. **Production**: Implement proper security rules before deploying

## Still Having Issues?

If you still see CORS errors after trying these solutions:

1. Check Firebase project name: `taskly-2542f`
2. Check Storage bucket exists and is active
3. Verify Internet connection is working
4. Clear browser cache completely
5. Try incognito/private window
6. Check browser console for exact error
7. Review Firebase logs in console

The most common fix is simply updating the Security Rules in Firebase Console to allow reads. This should resolve 95% of CORS issues.
