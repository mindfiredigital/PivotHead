/**
 * DataSampler - Efficient data sampling for large datasets
 * Implements multiple sampling algorithms optimized for different use cases
 */

import type { PerformanceConfig } from '../types/config-types';

/**
 * Supported sampling methods
 */
export type SamplingMethod = 'random' | 'stratified' | 'systematic' | 'lttb';

/**
 * Point interface for LTTB sampling
 */
interface DataPoint {
  x: number;
  y: number;
  originalIndex: number;
}

/**
 * DataSampler class for handling large datasets efficiently
 */
export class DataSampler {
  private config: Required<
    Pick<PerformanceConfig, 'maxDataPoints' | 'samplingMethod'>
  >;

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      maxDataPoints: config.maxDataPoints ?? 1000,
      samplingMethod: config.samplingMethod ?? 'lttb',
    };
  }

  /**
   * Check if sampling is needed based on data length
   */
  needsSampling(dataLength: number): boolean {
    return dataLength > this.config.maxDataPoints;
  }

  /**
   * Get the configured max data points
   */
  getMaxDataPoints(): number {
    return this.config.maxDataPoints;
  }

  /**
   * Get the configured sampling method
   */
  getSamplingMethod(): SamplingMethod {
    return this.config.samplingMethod;
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<PerformanceConfig>): void {
    if (config.maxDataPoints !== undefined) {
      this.config.maxDataPoints = config.maxDataPoints;
    }
    if (config.samplingMethod !== undefined) {
      this.config.samplingMethod = config.samplingMethod;
    }
  }

  /**
   * Sample data using configured method
   * @param data - Array of data to sample
   * @param targetSize - Optional override for target sample size
   * @returns Sampled data array
   */
  sample<T>(data: T[], targetSize?: number): T[] {
    const size = targetSize ?? this.config.maxDataPoints;

    if (data.length <= size) {
      return data;
    }

    switch (this.config.samplingMethod) {
      case 'random':
        return this.randomSample(data, size);
      case 'stratified':
        return this.stratifiedSample(data, size);
      case 'systematic':
        return this.systematicSample(data, size);
      case 'lttb':
      default:
        return this.lttbSample(data, size);
    }
  }

  /**
   * Sample numeric values for chart display
   * Optimized for time series data
   * @param values - Array of numeric values
   * @param targetSize - Target number of points
   * @returns Sampled values preserving visual shape
   */
  sampleValues(values: number[], targetSize?: number): number[] {
    const size = targetSize ?? this.config.maxDataPoints;

    if (values.length <= size) {
      return values;
    }

    // Convert to points for LTTB
    const points: DataPoint[] = values.map((y, x) => ({
      x,
      y,
      originalIndex: x,
    }));

    const sampledPoints = this.lttbPoints(points, size);
    return sampledPoints.map(p => p.y);
  }

  /**
   * Sample with index preservation
   * Returns both sampled data and original indices
   */
  sampleWithIndices<T>(
    data: T[],
    targetSize?: number
  ): { data: T[]; indices: number[] } {
    const size = targetSize ?? this.config.maxDataPoints;

    if (data.length <= size) {
      return {
        data,
        indices: data.map((_, i) => i),
      };
    }

    // Use systematic sampling for index preservation
    const step = data.length / size;
    const indices: number[] = [];
    const sampledData: T[] = [];

    for (let i = 0; i < size; i++) {
      const index = Math.min(Math.floor(i * step), data.length - 1);
      if (!indices.includes(index)) {
        indices.push(index);
        sampledData.push(data[index]);
      }
    }

    return { data: sampledData, indices };
  }

  /**
   * Random sampling - uniform distribution
   * Good for general use when order doesn't matter
   */
  private randomSample<T>(data: T[], size: number): T[] {
    const result: T[] = [];
    const indices = new Set<number>();

    // Fisher-Yates shuffle approach for efficiency
    const dataCopy = [...data];

    for (let i = dataCopy.length - 1; i > 0 && result.length < size; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dataCopy[i], dataCopy[j]] = [dataCopy[j], dataCopy[i]];
      if (!indices.has(i)) {
        result.push(dataCopy[i]);
        indices.add(i);
      }
    }

    // If we need more, take from the beginning
    for (let i = 0; i < dataCopy.length && result.length < size; i++) {
      if (!indices.has(i)) {
        result.push(dataCopy[i]);
        indices.add(i);
      }
    }

    return result;
  }

  /**
   * Stratified sampling - maintains distribution across buckets
   * Good for data with distinct groups/categories
   */
  private stratifiedSample<T>(data: T[], size: number): T[] {
    // Divide data into buckets
    const numBuckets = Math.min(10, Math.ceil(size / 10));
    const bucketSize = Math.ceil(data.length / numBuckets);
    const samplesPerBucket = Math.ceil(size / numBuckets);

    const result: T[] = [];

    for (let b = 0; b < numBuckets; b++) {
      const bucketStart = b * bucketSize;
      const bucketEnd = Math.min(bucketStart + bucketSize, data.length);
      const bucket = data.slice(bucketStart, bucketEnd);

      // Random sample from this bucket
      const bucketSamples = this.randomSample(
        bucket,
        Math.min(samplesPerBucket, bucket.length)
      );
      result.push(...bucketSamples);

      if (result.length >= size) break;
    }

    return result.slice(0, size);
  }

  /**
   * Systematic sampling - every nth item
   * Good for ordered data where you want even distribution
   */
  private systematicSample<T>(data: T[], size: number): T[] {
    const step = data.length / size;
    const result: T[] = [];

    // Random start point within first interval
    const start = Math.random() * step;

    for (let i = 0; i < size; i++) {
      const index = Math.min(Math.floor(start + i * step), data.length - 1);
      result.push(data[index]);
    }

    return result;
  }

  /**
   * LTTB (Largest Triangle Three Buckets) sampling
   * Best for time series - preserves visual shape while downsampling
   * Reference: https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf
   */
  private lttbSample<T>(data: T[], size: number): T[] {
    if (size >= data.length) {
      return data;
    }

    // If data items have numeric values, use proper LTTB
    // Otherwise fall back to systematic sampling
    const firstItem = data[0];
    if (typeof firstItem === 'number') {
      const points: DataPoint[] = (data as unknown as number[]).map((y, x) => ({
        x,
        y,
        originalIndex: x,
      }));
      const sampledPoints = this.lttbPoints(points, size);
      return sampledPoints.map(p => data[p.originalIndex]);
    }

    // For non-numeric data, use systematic sampling
    return this.systematicSample(data, size);
  }

  /**
   * Core LTTB algorithm for point data
   */
  private lttbPoints(data: DataPoint[], targetSize: number): DataPoint[] {
    if (targetSize >= data.length || targetSize < 3) {
      return data;
    }

    const result: DataPoint[] = [];

    // Always keep first point
    result.push(data[0]);

    // Bucket size (excluding first and last points)
    const bucketSize = (data.length - 2) / (targetSize - 2);

    let lastSelectedIndex = 0;

    for (let i = 0; i < targetSize - 2; i++) {
      // Calculate bucket boundaries
      const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
      const bucketEnd = Math.min(
        Math.floor((i + 2) * bucketSize) + 1,
        data.length - 1
      );

      // Calculate average point of next bucket for area calculation
      const nextBucketStart = bucketEnd;
      const nextBucketEnd = Math.min(
        Math.floor((i + 3) * bucketSize) + 1,
        data.length
      );

      let avgX = 0;
      let avgY = 0;
      const nextBucketLength = nextBucketEnd - nextBucketStart;

      if (nextBucketLength > 0) {
        for (let j = nextBucketStart; j < nextBucketEnd; j++) {
          avgX += data[j].x;
          avgY += data[j].y;
        }
        avgX /= nextBucketLength;
        avgY /= nextBucketLength;
      } else {
        // Use last point if no next bucket
        avgX = data[data.length - 1].x;
        avgY = data[data.length - 1].y;
      }

      // Find point in current bucket with largest triangle area
      let maxArea = -1;
      let maxAreaIndex = bucketStart;

      const pointA = data[lastSelectedIndex];

      for (let j = bucketStart; j < bucketEnd; j++) {
        // Calculate triangle area using cross product
        const area = Math.abs(
          (pointA.x - avgX) * (data[j].y - pointA.y) -
            (pointA.x - data[j].x) * (avgY - pointA.y)
        );

        if (area > maxArea) {
          maxArea = area;
          maxAreaIndex = j;
        }
      }

      result.push(data[maxAreaIndex]);
      lastSelectedIndex = maxAreaIndex;
    }

    // Always keep last point
    result.push(data[data.length - 1]);

    return result;
  }
}

/**
 * Factory function to create a DataSampler with default config
 */
export function createDataSampler(
  config?: Partial<PerformanceConfig>
): DataSampler {
  return new DataSampler(config);
}

/**
 * Convenience function to sample data without creating an instance
 */
export function sampleData<T>(
  data: T[],
  targetSize: number,
  method: SamplingMethod = 'lttb'
): T[] {
  const sampler = new DataSampler({
    maxDataPoints: targetSize,
    samplingMethod: method,
  });
  return sampler.sample(data, targetSize);
}
