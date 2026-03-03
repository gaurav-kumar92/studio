import { openDB, type IDBPDatabase } from 'idb';

/**
 * SSR-safe wrapper for IndexedDB using 'idb' library.
 */
export const dbPromise: Promise<IDBPDatabase<any> | null> = 
  typeof window !== 'undefined' 
    ? openDB('canvas-editor-db', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('projects')) {
            db.createObjectStore('projects', { keyPath: 'id' });
          }
        },
      })
    : Promise.resolve(null);

export async function saveProjectLocal(projectId: string, canvasState: any) {
  const db = await dbPromise;
  if (!db) return;
  await db.put('projects', {
    id: projectId,
    state: canvasState,
    updatedAt: Date.now(),
  });
}

export async function loadProjectLocal(projectId: string) {
  const db = await dbPromise;
  if (!db) return null;
  return db.get('projects', projectId);
}

export async function deleteProjectLocal(projectId: string) {
  const db = await dbPromise;
  if (!db) return;
  await db.delete('projects', projectId);
}
