/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Worker Pool Manager
 * Manages a pool of Web Workers for parallel processing
 */

interface WorkerTask {
  id: number;
  data: any;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

interface WorkerInstance {
  worker: Worker;
  busy: boolean;
  currentTaskId?: number;
}

export class WorkerPool {
  private workers: WorkerInstance[] = [];
  private taskQueue: WorkerTask[] = [];
  private nextTaskId = 0;
  private workerCount: number;
  private workerUrl: string;

  constructor(workerUrl: string, workerCount?: number) {
    this.workerUrl = workerUrl;
    this.workerCount =
      workerCount || Math.max(1, navigator.hardwareConcurrency - 1);
    this.initializeWorkers();
  }

  /**
   * Initialize worker pool
   */
  private initializeWorkers(): void {
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker(this.workerUrl, { type: 'module' });
      this.workers.push({
        worker,
        busy: false,
      });
    }
  }

  /**
   * Execute a task on an available worker
   */
  public execute<T = any>(data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const taskId = this.nextTaskId++;
      const task: WorkerTask = {
        id: taskId,
        data,
        resolve,
        reject,
      };

      this.taskQueue.push(task);
      this.processQueue();
    });
  }

  /**
   * Process the task queue
   */
  private processQueue(): void {
    // Find available worker
    const availableWorker = this.workers.find(w => !w.busy);

    if (!availableWorker || this.taskQueue.length === 0) {
      return;
    }

    // Get next task
    const task = this.taskQueue.shift();
    if (!task) return;

    // Mark worker as busy
    availableWorker.busy = true;
    availableWorker.currentTaskId = task.id;

    // Set up message handler
    const messageHandler = (event: MessageEvent) => {
      const response = event.data;

      // Handle different response types
      if (response.type === 'CHUNK_PARSED') {
        // Clean up
        availableWorker.worker.removeEventListener('message', messageHandler);
        availableWorker.worker.removeEventListener('error', errorHandler);
        availableWorker.busy = false;
        availableWorker.currentTaskId = undefined;

        // Resolve or reject
        if (response.error) {
          task.reject(new Error(response.error));
        } else {
          task.resolve(response);
        }

        // Process next task
        this.processQueue();
      }
      // Progress updates are passed through but don't complete the task
      else if (response.type === 'PROGRESS') {
        // You can emit progress events here if needed
      }
    };

    const errorHandler = (error: ErrorEvent) => {
      availableWorker.worker.removeEventListener('message', messageHandler);
      availableWorker.worker.removeEventListener('error', errorHandler);
      availableWorker.busy = false;
      availableWorker.currentTaskId = undefined;

      task.reject(error);

      // Process next task
      this.processQueue();
    };

    availableWorker.worker.addEventListener('message', messageHandler);
    availableWorker.worker.addEventListener('error', errorHandler);

    // Send task to worker
    availableWorker.worker.postMessage(task.data);
  }

  /**
   * Terminate all workers
   */
  public terminate(): void {
    this.workers.forEach(({ worker }) => worker.terminate());
    this.workers = [];
    this.taskQueue = [];
  }

  /**
   * Get number of active workers
   */
  public getWorkerCount(): number {
    return this.workers.length;
  }

  /**
   * Get number of busy workers
   */
  public getBusyCount(): number {
    return this.workers.filter(w => w.busy).length;
  }

  /**
   * Get number of queued tasks
   */
  public getQueuedCount(): number {
    return this.taskQueue.length;
  }
}
