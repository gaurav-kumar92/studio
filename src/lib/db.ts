// src/lib/db.ts
import { openDB } from 'idb';

export const dbPromise = openDB('canvas-editor-db', 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('projects')) {
      db.createObjectStore('projects', { keyPath: 'id' });
    }
  },
});

// Save canvas locally
export async function saveProjectLocal(
  projectId: string,
  canvasState: any
) {
  const db = await dbPromise;
  await db.put('projects', {
    id: projectId,
    state: canvasState,
    updatedAt: Date.now(),
  });
}

// Load canvas locally
export async function loadProjectLocal(projectId: string) {
  const db = await dbPromise;
  return db.get('projects', projectId);
}

// Optional cleanup
export async function deleteProjectLocal(projectId: string) {
  const db = await dbPromise;
  await db.delete('projects', projectId);
}
