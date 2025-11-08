# Memory Optimization Guide

## Overview
This document describes the memory optimizations implemented in the Fluro Sheet Music Viewer to reduce memory usage, particularly for iPad devices.

## Memory Issues Identified

### 1. PDF Document Memory Leaks
**Problem**: PDF.js documents were not being properly destroyed when components unmounted, causing memory to accumulate.

**Solution**: Added `onBeforeUnmount` lifecycle hook in `PdfRender.vue` to properly destroy PDF documents:
```typescript
onBeforeUnmount(() => {
  if (pdf.value) {
    pdf.value.destroy();
  }
});
```

### 2. LocalStorage Cache Accumulation
**Problem**: Data was being cached to localStorage without size limits or cleanup of expired entries.

**Solution**: 
- Added utility functions to monitor localStorage size
- Implemented automatic cleanup of expired cache on app startup
- Added size limits before caching (1000 songs, 2000 sheets)
- Display storage usage in settings dialog

### 3. Cache Expiry Bug
**Problem**: Cache expiry was incorrectly calculated using seconds instead of milliseconds, causing cache to expire in ~24 seconds instead of 24 hours.

**Solution**: Fixed the calculation in stores:
```typescript
// Before: Date.now() + 24 * 60 * 60 (86,400 seconds)
// After:  Date.now() + 24 * 60 * 60 * 1000 (86,400,000 milliseconds)
```

### 4. Component Cleanup
**Problem**: Populated songs and temporary data weren't being cleaned up when navigating away from pages.

**Solution**: Enhanced cleanup in `PdfWrapper.vue`:
```typescript
onBeforeUnmount(() => {
  songStore.setPopulatedSongs([]);
  songStore.setPlanSongs([]);
  songPages.value = {};
  songLoaded.value = {};
});
```

### 5. PDF Rendering Performance
**Problem**: All PDF slides were being rendered at once in the swiper, consuming significant memory.

**Solution**: Added lazy loading attributes to the swiper component:
```vue
<swiper-container
  :lazy="true"
  :preload-images="false"
  :slides-per-view="1"
>
```

## Best Practices

### For Users

1. **Clear Cache Regularly**: Use the "Clear Cache" button in Settings if the app feels slow
2. **Monitor Storage**: Check storage size in Settings to see cache usage
3. **Close Unused Tabs**: When done viewing sheet music, navigate away or close the tab
4. **Update Regularly**: Keep the app updated to get the latest memory optimizations

### For Developers

1. **Always Clean Up**: Use `onBeforeUnmount` to clean up resources
2. **Destroy PDF Documents**: Always call `.destroy()` on PDF.js documents
3. **Clear Reactive State**: Reset refs and reactive objects when components unmount
4. **Monitor localStorage**: Use the provided utilities to check storage size
5. **Set Size Limits**: Don't cache unbounded amounts of data to localStorage
6. **Use Lazy Loading**: Enable lazy loading for images, PDFs, and components where possible

## Utility Functions

### `getLocalStorageSize()`
Returns the estimated size of localStorage in bytes.

### `clearExpiredCache()`
Removes all expired cache entries from localStorage.

### `checkLocalStorageCapacity()`
Checks if localStorage is approaching capacity (80% of 5MB limit) and returns true if a warning should be shown.

## Performance Monitoring

To monitor memory usage during development:

1. Open Chrome DevTools
2. Go to Memory tab
3. Take heap snapshots before and after navigating through the app
4. Look for detached PDF documents or large objects not being garbage collected

## Future Optimizations

Potential future improvements:

1. **Virtual Slides**: Implement virtual scrolling for very long setlists (>50 songs)
2. **Incremental Loading**: Load songs/sheets on-demand instead of all at startup
3. **Service Worker Caching**: Use Service Worker API for more efficient caching
4. **Image Optimization**: Compress or resize PDF pages for display
5. **Web Workers**: Offload PDF rendering to web workers to prevent UI blocking

## Testing

To verify memory optimizations:

1. Load a large service plan with many songs
2. Monitor memory usage in DevTools
3. Navigate through all slides
4. Navigate away from the page
5. Force garbage collection (DevTools > Performance > Collect garbage)
6. Verify memory returns to baseline

## Troubleshooting

### App is slow or crashes
- Clear cache in Settings
- Check localStorage size
- Close and reopen the app
- Try a different browser

### "Storage Warning" message
- Clear cache to free up space
- This warning appears when localStorage is >80% full

### PDFs not loading
- Check network connection
- Verify authentication token is valid
- Clear cache and refresh

## Technical Details

### PDF.js Memory Management
PDF.js keeps rendered pages in memory for performance. We manage this by:
- Destroying documents when components unmount
- Using lazy loading to render only visible slides
- Clearing page caches when navigating away

### LocalStorage Limits
- Most browsers limit localStorage to 5-10MB
- We use a conservative 5MB limit for warnings
- Cached data includes: songs, sheets, user preferences, setlists
- Large datasets (>1000 songs or >2000 sheets) are not cached

### Vue 3 Reactivity
Vue 3's reactivity system can hold references to objects. We ensure proper cleanup by:
- Resetting refs to empty arrays/objects
- Using `onBeforeUnmount` consistently
- Avoiding circular references in reactive objects
