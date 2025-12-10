/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Streaming File Reader
 * Reads large files in chunks for efficient processing
 */

export interface ChunkInfo {
  chunkId: number;
  text: string;
  isFirstChunk: boolean;
  isLastChunk: boolean;
  progress: number;
}

export interface StreamingOptions {
  chunkSizeBytes?: number;
  onChunk?: (chunk: ChunkInfo) => void | Promise<void>;
  onProgress?: (progress: number) => void;
  encoding?: string;
}

export class StreamingFileReader {
  private static readonly DEFAULT_CHUNK_SIZE = 1024 * 1024; // 1 MB

  /**
   * Read file in chunks using Streams API
   */
  public static async readFileInChunks(
    file: File,
    options: StreamingOptions = {}
  ): Promise<void> {
    const chunkSize = options.chunkSizeBytes || this.DEFAULT_CHUNK_SIZE;
    const totalSize = file.size;
    let bytesRead = 0;
    let chunkId = 0;

    // Use FileReader for browsers that don't support stream()
    if (!file.stream) {
      return this.readFileInChunksLegacy(file, options);
    }

    try {
      const stream = file.stream();
      const reader = stream.getReader();
      const decoder = new TextDecoder(options.encoding || 'utf-8');

      let buffer = '';
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          bytesRead += value.length;
          buffer += decoder.decode(value, { stream: !done });

          // Process complete chunks
          while (buffer.length >= chunkSize || (done && buffer.length > 0)) {
            const chunk = buffer.slice(0, chunkSize);
            buffer = buffer.slice(chunkSize);

            const progress = Math.min(100, (bytesRead / totalSize) * 100);

            const chunkInfo: ChunkInfo = {
              chunkId: chunkId++,
              text: chunk,
              isFirstChunk: chunkId === 1,
              isLastChunk: done && buffer.length === 0,
              progress,
            };

            if (options.onChunk) {
              await options.onChunk(chunkInfo);
            }

            if (options.onProgress) {
              options.onProgress(progress);
            }

            // If done and no more buffer, break
            if (done && buffer.length === 0) {
              break;
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.length > 0) {
        const chunkInfo: ChunkInfo = {
          chunkId: chunkId++,
          text: buffer,
          isFirstChunk: chunkId === 1,
          isLastChunk: true,
          progress: 100,
        };

        if (options.onChunk) {
          await options.onChunk(chunkInfo);
        }

        if (options.onProgress) {
          options.onProgress(100);
        }
      }
    } catch (error) {
      console.error('Error reading file stream:', error);
      throw error;
    }
  }

  /**
   * Legacy fallback for browsers without stream() support
   */
  private static async readFileInChunksLegacy(
    file: File,
    options: StreamingOptions = {}
  ): Promise<void> {
    const chunkSize = options.chunkSizeBytes || this.DEFAULT_CHUNK_SIZE;
    const totalSize = file.size;
    let offset = 0;
    let chunkId = 0;

    while (offset < totalSize) {
      const end = Math.min(offset + chunkSize, totalSize);
      const blob = file.slice(offset, end);

      const text = await this.readBlobAsText(blob, options.encoding);

      const progress = Math.min(100, (end / totalSize) * 100);

      const chunkInfo: ChunkInfo = {
        chunkId: chunkId++,
        text,
        isFirstChunk: offset === 0,
        isLastChunk: end >= totalSize,
        progress,
      };

      if (options.onChunk) {
        await options.onChunk(chunkInfo);
      }

      if (options.onProgress) {
        options.onProgress(progress);
      }

      offset = end;
    }
  }

  /**
   * Read blob as text using FileReader
   */
  private static readBlobAsText(
    blob: Blob,
    encoding?: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read blob'));
      };

      reader.readAsText(blob, encoding || 'utf-8');
    });
  }

  /**
   * Get optimal chunk size based on file size
   */
  public static getOptimalChunkSize(fileSize: number): number {
    if (fileSize < 1024 * 1024) {
      // < 1 MB: use 256 KB chunks
      return 256 * 1024;
    } else if (fileSize < 10 * 1024 * 1024) {
      // < 10 MB: use 1 MB chunks
      return 1024 * 1024;
    } else if (fileSize < 100 * 1024 * 1024) {
      // < 100 MB: use 2 MB chunks
      return 2 * 1024 * 1024;
    } else {
      // >= 100 MB: use 5 MB chunks
      return 5 * 1024 * 1024;
    }
  }
}
