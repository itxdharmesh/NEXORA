export class IndexedDBAdapter {
  private dbName = 'NEXORA_WORKSPACE_DB';
  private version = 1;
  private db: IDBDatabase | null = null;

  public async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('filesystem')) {
          db.createObjectStore('filesystem', { keyPath: 'projectId' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
    });
  }

  public async saveFilesystem(projectId: string, filesJson: string): Promise<void> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('filesystem', 'readwrite');
      const store = tx.objectStore('filesystem');
      const request = store.put({ projectId, data: filesJson, updatedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  public async loadFilesystem(projectId: string): Promise<string | null> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction('filesystem', 'readonly');
      const store = tx.objectStore('filesystem');
      const request = store.get(projectId);
      request.onsuccess = () => {
        const res = request.result;
        resolve(res ? res.data : null);
      };
      request.onerror = () => reject(request.error);
    });
  }
}
