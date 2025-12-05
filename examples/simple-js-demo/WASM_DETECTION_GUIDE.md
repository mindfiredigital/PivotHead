# How to Detect if WebAssembly is Being Used

## 🔍 Quick Detection Methods

### Method 1: Console Logs (Easiest)

Open browser console (F12 → Console) and upload a CSV file. Look for:

#### ✅ WASM is Being Used:

```
🚀 Very large file detected (22.00 MB). Attempting WebAssembly processing...
🚀 Loading WebAssembly CSV parser...
Trying to load WASM from: /wasm/csvParser.wasm
✅ WASM file loaded from: /wasm/csvParser.wasm
✅ WebAssembly CSV parser loaded successfully (v1.0.0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FILE PROCESSING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Processing Mode: WASM
📁 File Size: 22.00 MB
📊 Records: 100,000
⏱️  Parse Time: 1.23s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### ✅ Web Workers Being Used:

```
Large file detected (22.00 MB). Using Web Workers for processing.
Processing with 7 workers, chunk size: 2.00 MB
Chunk 1 processed: 8234 rows (total: 8234)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FILE PROCESSING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Processing Mode: WORKERS
📁 File Size: 22.00 MB
📊 Records: 100,000
⏱️  Parse Time: 2.45s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Standard JavaScript:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FILE PROCESSING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Processing Mode: STANDARD
📁 File Size: 1.50 MB
📊 Records: 1,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### Method 2: Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Upload CSV file
4. Look for `csvParser.wasm` in the list

**WASM Active**: You'll see:

```
Name              Status    Type            Size
csvParser.wasm    200       wasm            3.5 KB
```

**WASM Not Active**: File won't appear

---

### Method 3: Browser Console Command

After uploading a file, type in console:

```javascript
window.lastPerformanceMode;
```

**Returns:**

- `"wasm"` - WebAssembly was used
- `"workers"` - Web Workers were used
- `"standard"` - Standard JavaScript
- `undefined` - No file uploaded yet

---

### Method 4: Performance Comparison

Compare processing times for the same 22MB file:

| Mode     | Typical Time | Indication |
| -------- | ------------ | ---------- |
| WASM     | 0.5-1.5s     | ⚡ Fastest |
| Workers  | 2-4s         | 🚀 Fast    |
| Standard | 8-15s        | 🐌 Slower  |

---

## 🎯 Current Configuration

Based on your setup:

### File Size Thresholds:

- **< 5MB**: Standard JavaScript
- **5MB - 100MB**: Web Workers (streaming)
- **> 100MB**: Web Workers (WASM disabled)

### Why WASM is Currently Disabled:

WASM is temporarily disabled for files > 8MB because:

1. Current implementation loads entire file into memory
2. No streaming support yet
3. Can cause browser crashes for large files
4. Web Workers have better streaming support

### Your 22MB File:

✅ Uses: **Web Workers**  
❌ WASM is skipped (file > 8MB threshold)

---

## 🔧 How to Enable WASM for Testing

If you want to test WASM with a smaller file:

1. **Create a small CSV file** (< 8MB)
2. **Or temporarily change thresholds** in:
   ```
   packages/core/src/engine/PerformanceConfig.ts
   ```
   Change:
   ```typescript
   useWasmAboveSize: 100 * 1024 * 1024, // 100MB
   ```
   To:
   ```typescript
   useWasmAboveSize: 1 * 1024 * 1024, // 1MB (for testing)
   ```
3. **Rebuild**: `pnpm run build`
4. **Test with any file > 1MB**

---

## 🧪 Testing Checklist

- [ ] Open browser console (F12)
- [ ] Upload CSV file
- [ ] Check for "FILE PROCESSING SUMMARY" box
- [ ] Verify "Processing Mode" shows WASM/WORKERS/STANDARD
- [ ] Check Network tab for csvParser.wasm (if WASM)
- [ ] Type `window.lastPerformanceMode` in console
- [ ] Compare processing time

---

## 📊 Example Console Output

For your 22MB file, you should see:

```
Large file detected (22.00 MB). Using Web Workers for processing.
Processing with 7 workers, chunk size: 2.00 MB
Chunk 1 processed: 8234 rows (total: 8234)
Chunk 2 processed: 8456 rows (total: 16690)
Chunk 3 processed: 8123 rows (total: 24813)
...
Streaming complete. Processed 11 chunks, 100000 total rows.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 FILE PROCESSING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 Processing Mode: WORKERS
📁 File Size: 22.00 MB
📊 Records: 100,000
⏱️  Parse Time: 2.45s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

This clearly shows **Web Workers** are being used, not WASM.
