# 📋 Testing File Upload Feature

## Added Logging
Just updated the code to add detailed console logging so you can see what's happening when files upload.

## Step 1: Reload Your App
1. Go to your app: `localhost:5500`
2. Hard refresh: `Ctrl+F5` (or `Cmd+Shift+R` on Mac)
3. Open Developer Tools: `F12`
4. Go to **Console** tab

## Step 2: Create a New Task with Files

1. Click **Add Task** button
2. Fill in task name (e.g., "Test Task")
3. **Upload a file:**
   - Click the "Click to upload" area
   - Select an image (jpg, png, gif, etc.)
   - You should see it listed under "New Files to Upload" ✅

4. Click **Save Task**

## Step 3: Check Console Logs

Look for these logs in the Console tab (in order):

```
[TaskService] Starting file upload for 1 file(s)
[FileUploadService] Starting batch upload of 1 file(s)
[FileUploadService] Uploading: [filename] (Image) - Size: 0.XX MB
[FileUploadService] Storage path: attachements/images/[unique_filename]
[FileUploadService] Starting upload to Firebase...
[FileUploadService] Upload complete for [filename]
[FileUploadService] Getting download URL...
[FileUploadService] Got download URL
[TaskService] File upload successful, got 1 results
Task created successfully!
```

### If You See Errors:
```
❌ [FileUploadService] Validation failed for [filename]: File exceeds 5MB size limit
❌ Error uploading file: [error message]
❌ CORS policy blocked error
```

## Step 4: Check Firestore
1. Open Firebase Console
2. Go to **Firestore Database**
3. Click on **tasks** collection
4. Find your new task
5. **Check the "attachments" field:**
   - Should contain an array with file info
   - Should have `fileUrl`, `fileName`, `fileType`

```json
{
  "attachments": [
    {
      "fileName": "photo.jpg",
      "fileType": "image/jpeg",
      "fileUrl": "https://firebasestorage.googleapis.com/v0/b/...",
      "id": "attachment_...",
      "uploadedAt": {...}
    }
  ]
}
```

## Step 5: Edit the Task to See Preview

1. Click **Edit** on the task you just created
2. Scroll down to "Current Attachments"
3. You should see:
   - **For images:** A thumbnail preview ✅
   - **For files:** A file icon and download button ✅

### If Image Not Showing:
- Check if `fileUrl` in Firestore is valid (clickable)
- Check Network tab in DevTools for CORS errors
- Try hard refresh: `Ctrl+F5`
- Check if Firebase Storage rules were published

## Step 6: Verify File in Storage

1. Firebase Console
2. **Storage** → **Files** tab
3. Look for folders:
   - `attachements/images/` - should have your images
   - `attachements/files/` - should have other files

## Complete Workflow Test

```
✅ Upload file
   → Check console logs (should see upload progress)
   ↓
✅ Task created with attachment
   → Check Firestore (attachments field has data)
   ↓
✅ Edit task
   → Check preview (image thumbnail shows)
   ↓
✅ Download file
   → Click download button (opens file in new tab)
```

## Common Issues & Fixes

### Issue: No console logs appear
- Files might not be included in form
- Check if `handleFileSelect` is being called
- **Fix:** Click the upload area and select a file
- Check console for validation errors

### Issue: "File exceeds 5MB size limit"
- Image is too large
- **Fix:** Use an image smaller than 5MB
- For larger files, use PDF/DOC (25MB max)

### Issue: "CORS policy blocked"
- Firebase Storage rules not published correctly
- **Fix:** 
  1. Go to Firebase Console → Storage → Rules
  2. Check if rules are published (green checkmark)
  3. Rules should allow `read` for everyone
  4. Publish if not yet published

### Issue: Image not showing in preview
- Download URL might be invalid
- **Fix:**
  1. Check Network tab (look for image URL request)
  2. Copy the download URL from Firestore
  3. Try opening it in new tab
  4. Should show the image (not CORS error)

### Issue: File appeared, then disappeared
- Session expired or network error
- **Fix:**
  1. Hard refresh: `Ctrl+F5`
  2. Upload again
  3. Check console for errors

## What Each Log Means

| Log | Meaning |
|-----|---------|
| `[TaskService] Starting file upload for X file(s)` | Task service started handling uploads |
| `[FileUploadService] Starting batch upload of X file(s)` | File service validation started |
| `[FileUploadService] Uploading: [name]...` | Individual file upload started |
| `[FileUploadService] Storage path: attachements/...` | File destination path |
| `[FileUploadService] Starting upload to Firebase...` | Uploading to Firebase Storage |
| `[FileUploadService] Upload complete for [name]` | File upload finished |
| `[FileUploadService] Getting download URL...` | Getting the file access URL |
| `[FileUploadService] Got download URL` | URL obtained successfully ✅ |
| `[TaskService] File upload successful, got X results` | All uploads complete ✅ |

## Success Indicators ✅

1. **Console:** See upload progress logs
2. **Firestore:** Task has `attachments` array with data
3. **Storage:** Files appear in `attachements/images/` or `attachements/files/`
4. **Edit Preview:** Can see image thumbnail or file link
5. **Download:** Can download files from the preview

---

## Next Steps if Something Doesn't Work

1. **Check console logs** - See exact error message
2. **Check Firestore** - Verify task saved correctly
3. **Check Storage** - Verify file exists in Firebase
4. **Check Network tab** - Look for CORS or 403 errors
5. **Hard refresh** - Clear cache and reload

Let me know what console logs you see! 🚀
