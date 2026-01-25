# Firebase CORS Diagnostic - Run in Browser Console

## Instructions
1. Open your app in browser
2. Press F12 (DevTools)
3. Click **Console** tab
4. Copy and paste this entire script
5. Run it and check results

---

## Diagnostic Script

```javascript
console.log('=== FIREBASE CORS DIAGNOSTIC ===\n');

// Test 1: Check if Firebase is initialized
console.log('1. Firebase Check:');
try {
  if (window.firebase) {
    console.log('✅ Firebase loaded');
  } else {
    console.error('❌ Firebase NOT loaded');
  }
} catch (e) {
  console.error('❌ Error checking Firebase:', e.message);
}

// Test 2: Check localStorage
console.log('\n2. Storage Check:');
const authData = localStorage.getItem('firebase:authUser:AIzaSyDfK0F9mf8S3FfvYzAdlOVYBNv1Lc-TYNc:taskly-2542f');
if (authData) {
  console.log('✅ User authenticated');
} else {
  console.warn('⚠️  User not authenticated (files may not upload)');
}

// Test 3: Check if FileUploadService exists
console.log('\n3. FileUploadService Check:');
try {
  // This assumes the service is imported in your component
  console.log('ℹ️  FileUploadService should be imported in task.tsx');
} catch (e) {
  console.error('❌ Error:', e.message);
}

// Test 4: Simple fetch test
console.log('\n4. Network Connectivity:');
fetch('https://firebasestorage.googleapis.com/v0/b', {
  method: 'OPTIONS',
  headers: {
    'Access-Control-Request-Method': 'GET',
  }
})
  .then(response => {
    if (response.ok) {
      console.log('✅ Firebase Storage reachable');
    } else {
      console.warn('⚠️  Status:', response.status);
    }
  })
  .catch(error => {
    console.error('❌ Cannot reach Firebase Storage:', error.message);
  });

// Test 5: Check console for upload logs
console.log('\n5. Upload Logs:');
console.log('When you upload a file, look for:');
console.log('  ✅ "[FileUploadService] Uploading: ..."');
console.log('  ✅ "[FileUploadService] Got download URL"');
console.log('  ❌ CORS errors should NOT appear');

// Test 6: Check image loading
console.log('\n6. Image Loading Test:');
const testImg = new Image();
testImg.onerror = () => console.error('❌ Cannot load images from Firebase');
testImg.onload = () => console.log('✅ Images load from Firebase successfully');
testImg.src = 'https://firebasestorage.googleapis.com/v0/b/taskly-2542f.firebasestorage.app/o/attachements%2Ftest.png?alt=media';

console.log('\n=== DIAGNOSTIC COMPLETE ===');
console.log('\nIf you see mostly ✅ : Your setup is correct');
console.log('If you see ❌ or ⚠️ : See CORS_FIX_GUIDE.md for solutions\n');
```

---

## What to Look For

### ✅ SUCCESS Signs
- `✅ Firebase loaded`
- `✅ User authenticated`
- `✅ Firebase Storage reachable`
- No CORS errors after uploads
- Images display without console errors

### ❌ PROBLEM Signs
- `❌ Firebase NOT loaded`
- `⚠️  User not authenticated`
- `❌ Cannot reach Firebase Storage`
- CORS error messages
- Images fail to load with net::ERR_FAILED

---

## If You See Problems

### Problem: Firebase NOT loaded
**Fix**: Check `firebaseConfig.ts` exists and imports are correct

### Problem: User not authenticated
**Fix**: Make sure you're logged in before uploading

### Problem: Cannot reach Firebase Storage
**Fix**: 
1. Check internet connection
2. Update Firebase Security Rules
3. See CORS_FIX_GUIDE.md

### Problem: CORS errors persist
**Fix**:
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+F5)
3. Update Firebase Rules
4. See CORS_FIX_GUIDE.md

---

## Alternative Diagnostic (without copy-paste)

Run these one at a time in console:

```javascript
// Check 1: Firebase
console.log('Firebase:', !!window.firebase);

// Check 2: Auth
console.log('Auth:', !!localStorage.getItem('firebase:authUser:AIzaSyDfK0F9mf8S3FfvYzAdlOVYBNv1Lc-TYNc:taskly-2542f'));

// Check 3: Network
navigator.onLine ? console.log('✅ Online') : console.log('❌ Offline');

// Check 4: Check upload in progress
// (Upload a file and watch console for logs)
```

---

## Expected Console Output During Upload

```
[FileUploadService] Uploading: myfile_1704067200_abc123.jpg to images/
[FileUploadService] Upload complete: myfile_1704067200_abc123.jpg
[FileUploadService] Got download URL
```

If you see these logs and NO CORS errors = Upload successful ✅

---

## Save for Later

If you want to run this again:
1. Copy this entire script
2. Paste in browser Console anytime
3. It won't modify anything, just reports status

---

## Quick Summary

| Scenario | Solution |
|----------|----------|
| Diagnostic shows all ✅ | You're good! Upload should work |
| Shows ❌ Firebase or Auth | Check login and Firebase config |
| Shows ❌ Storage unreachable | Update Firebase Security Rules |
| Shows CORS error | Hard refresh + Update Rules |
| Still broken after all this | Contact Firebase support or see detailed guide |

---

Good luck! 🚀
