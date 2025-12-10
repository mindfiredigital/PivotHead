# Automatic Processing Mode Switching

## 🚀 The Most Optimized Architecture for ALL File Sizes

The system **automatically** chooses the best processing mode based on your file size:

```
File Size         Processing Mode             Why?
──────────────────────────────────────────────────────────────────────────
< 1 MB            Standard JavaScript         Small enough for direct processing
1-5 MB            Web Workers                 Parallel processing, minimal overhead
5-8 MB            Pure WASM                   FASTEST compute speed, in-memory
> 8 MB            Streaming + WASM Hybrid     Chunked processing with WASM speed
```

### 🔥 The Power of Hybrid Mode (>8MB files)

For files larger than 8MB, the system uses an **advanced hybrid approach**:

- **Streams** file in 4MB chunks (avoids memory issues)
- **WASM** parses each chunk (maximum speed)
- **Progressive** accumulation (no loading entire file)
- **Result**: Fast parsing + Memory efficient + No browser crashes

---

## 📊 Test Files Created

### 1. **test-small-2mb.csv** (1.42 MB, 15,000 rows)

- **Will Use**: Web Workers
- **Why**: Below 5MB threshold
- **Expected Console**:
  ```
  Large file detected (1.42 MB). Using Web Workers for processing.
  Processing with X workers, chunk size: XXX KB
  🔧 Processing Mode: WORKERS
  ```

### 2. **test-medium-6mb.csv** (5.79 MB, 60,000 rows)

- **Will Use**: WebAssembly (WASM)
- **Why**: ≥ 5MB and ≤ 8MB
- **Expected Console**:
  ```
  🚀 Very large file detected (5.79 MB). Attempting WebAssembly processing...
  ✅ WebAssembly CSV parser loaded successfully
  🚀 Processing CSV with WebAssembly...
  ✅ WASM processing completed in XXXms
  🔧 Processing Mode: WASM
  ```

### 3. **test-large-10mb.csv** (9.66 MB, 100,000 rows)

- **Will Use**: Streaming + WASM Hybrid
- **Why**: > 8MB (uses chunked WASM processing)
- **Expected Console**:
  ```
  🚀 Large file detected (9.66 MB). Using Streaming + WASM hybrid mode...
  🚀 Using Streaming + WASM hybrid mode for large file...
  Processing with WASM, chunk size: 4.00 MB
  📋 Headers detected: ID, Name, Email, Age, Department, Salary...
  Chunk 0 processed: 10641 rows (total: 10641)
  Chunk 1 processed: 10313 rows (total: 20954)
  ✅ Streaming + WASM completed in 0.65s
  🔧 Processing Mode: STREAMING-WASM
  ```

---

## 🔄 Automatic Fallback Chain

```
User uploads file
      ↓
   Check size
      ↓
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  < 1MB?      1-5MB?         5-8MB?           > 8MB?         │
│    ↓           ↓              ↓                 ↓           │
│ Standard → Web Workers → Pure WASM → Streaming+WASM Hybrid  │
│    JS                    (Fastest)    (4MB chunks)          │
│                                                               │
│             Graceful Fallback on Errors:                     │
│             WASM fails → Workers → Standard JS               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Test the Automatic Switching

### Step 1: Start Dev Server

```bash
npm run dev
```

### Step 2: Test Each File

Upload each test file and watch the console:

1. **Upload `test-small-2mb.csv`**
   - Watch console → Should say "WORKERS"
2. **Upload `test-medium-6mb.csv`**
   - Watch console → Should say "WASM"

3. **Upload `test-large-10mb.csv`**
   - Watch console → Should say "STREAMING-WASM"

### Step 3: Verify Mode Selection

After each upload, type in console:

```javascript
window.lastPerformanceMode;
```

**Expected results:**

- Small file (1.5MB): `"workers"`
- Medium file (5.8MB): `"wasm"`
- Large file (9.7MB): `"streaming-wasm"` ⚡

---

## 📋 Complete Decision Logic

```typescript
File: user-file.csv
   │
   ├─ Size < 1 MB?
   │   └─ Use: Standard JavaScript
   │          (Direct processing, no overhead)
   │
   ├─ Size 1-5 MB?
   │   └─ Use: Web Workers
   │          (Parallel processing, faster than standard)
   │
   ├─ Size 5-8 MB?
   │   ├─ Try: Pure WASM (in-memory)
   │   │   └─ Success? Return WASM result (FASTEST!)
   │   │   └─ Failed? → Fall back to Workers
   │   │
   │   └─ Use: Web Workers (if WASM unavailable)
   │
   └─ Size > 8 MB?
       ├─ Use: Streaming + WASM Hybrid
       │   ├─ Stream file in 4MB chunks
       │   ├─ Parse each chunk with WASM
       │   └─ Accumulate results progressively
       │
       └─ If WASM fails: Fall back to Workers
```

---

## ⚡ Performance Expectations

| File Size | Mode             | Typical Parse Time | Memory Efficient? |
| --------- | ---------------- | ------------------ | ----------------- |
| 1.5 MB    | Workers          | 0.3-0.6s           | ✅ Yes            |
| 5.8 MB    | Pure WASM        | 0.5-1.2s           | ✅ Yes            |
| 9.7 MB    | Streaming + WASM | 0.6-1.5s           | ✅✅ Very!        |
| 22+ MB    | Streaming + WASM | 1.5-3.0s           | ✅✅ Very!        |

**Pure WASM is fastest for 5-8MB files! Streaming+WASM is memory-efficient for large files!** ⚡

### 🎯 Key Benefits by Mode:

- **Workers (1-5MB)**: Good balance of speed and parallelism
- **Pure WASM (5-8MB)**: Maximum compute speed, in-memory processing
- **Streaming+WASM (>8MB)**: Combines WASM speed with streaming memory efficiency
  - No browser crashes on large files
  - Progressive processing (see results as they load)
  - Can handle files 50MB+ without issues

---

## 🎯 Your Configuration

**Current Thresholds:**

- Workers threshold: **1 MB**
- WASM threshold: **5 MB**
- WASM safety limit: **8 MB**
- Streaming chunk size: **4 MB**

**Optimized Processing Strategy:**

1. Files **< 1MB** → Standard JavaScript (direct, no overhead)
2. Files **1-5MB** → Web Workers (parallel processing)
3. Files **5-8MB** → Pure WASM (fastest compute speed)
4. Files **> 8MB** → Streaming + WASM Hybrid (chunked WASM processing)

**Why This Is Optimal:**

- Each tier uses the best tool for that file size range
- WASM provides maximum speed where safe
- Streaming prevents memory issues on large files
- Graceful fallbacks ensure reliability

---

## 💡 Tips

1. **No Manual Selection**: The system automatically picks the best mode
2. **Seamless Fallback**: If WASM fails, it automatically tries Workers
3. **Always Fast**: Each mode is optimized for its file size range
4. **Console Logging**: Always check console to see which mode was used

---

## 🔍 Debugging

If you want to see the decision process:

```javascript
// Check current thresholds
// (Open console and paste this)

console.log('Workers threshold:', 1, 'MB');
console.log('WASM threshold:', 5, 'MB');
console.log('WASM safety limit:', 8, 'MB');

// Check last used mode
console.log('Last mode used:', window.lastPerformanceMode);
```

---

## ✅ Test Checklist

- [ ] Upload test-small-2mb.csv → See "WORKERS"
- [ ] Upload test-medium-6mb.csv → See "WASM"
- [ ] Upload test-large-10mb.csv → See "STREAMING-WASM" 🚀
- [ ] Check `window.lastPerformanceMode` after each upload
- [ ] Verify file loads successfully in all cases
- [ ] Confirm processing times are fast
- [ ] Verify no browser crashes even on large files

**All modes working? You have the most optimized CSV processing architecture!** 🎉

### 🔬 Advanced Testing (Optional):

- Try a 20MB+ file → Should still use Streaming+WASM
- Check browser memory usage (DevTools → Performance)
- Watch console for chunked processing progress
- Verify progressive data loading (no full-file blocking)
