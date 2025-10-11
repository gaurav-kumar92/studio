// NEW FILE: src/hooks/useCanvasChangeTracker.ts
// This automatically tracks ALL canvas changes globally

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useHistory } from './useHistory';

export const useCanvasChangeTracker = (
  canvasRef: React.RefObject<{ stage: any; layer: any }>,
  isCanvasReady: boolean
) => {
  const { record, undo: historyUndo, redo: historyRedo, canUndo, canRedo } = useHistory(30);
  const isRestoringRef = useRef(false);
  const snapshotRef = useRef<Map<string, any>>(new Map());
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Take a snapshot of current canvas state
  const takeSnapshot = useCallback(() => {
    if (!canvasRef.current?.layer) return new Map();
    
    const layer = canvasRef.current.layer;
    const snapshot = new Map<string, any>();
    
    layer.getChildren((node: any) => {
      if (node.name() === 'background' || node.hasName('Transformer')) return false;
      return true;
    }).forEach((node: any) => {
      snapshot.set(node.id(), {
        id: node.id(),
        config: node.toObject(),
      });
    });
    
    return snapshot;
  }, [canvasRef]);

  // Detect changes between two snapshots
  const detectChanges = useCallback((oldSnapshot: Map<string, any>, newSnapshot: Map<string, any>) => {
    const added: any[] = [];
    const deleted: any[] = [];
    const updated: any[] = [];

    // Find added and updated nodes
    newSnapshot.forEach((newNode, id) => {
      const oldNode = oldSnapshot.get(id);
      if (!oldNode) {
        // Node was added
        added.push(newNode);
      } else {
        // Check if node was updated
        const oldConfig = JSON.stringify(oldNode.config);
        const newConfig = JSON.stringify(newNode.config);
        if (oldConfig !== newConfig) {
          updated.push({
            before: oldNode,
            after: newNode,
          });
        }
      }
    });

    // Find deleted nodes
    oldSnapshot.forEach((oldNode, id) => {
      if (!newSnapshot.has(id)) {
        deleted.push(oldNode);
      }
    });

    return { added, deleted, updated };
  }, []);

  // Record changes after canvas modifications
  const recordChanges = useCallback(() => {
    if (isRestoringRef.current) return;
    
    const currentSnapshot = takeSnapshot();
    const changes = detectChanges(snapshotRef.current, currentSnapshot);

    // Record ADD commands
    if (changes.added.length > 0) {
      record({
        type: 'ADD',
        after: changes.added,
      });
      console.log('📝 Recorded ADD:', changes.added.length, 'nodes');
    }

    // Record DELETE commands
    if (changes.deleted.length > 0) {
      record({
        type: 'DELETE',
        before: changes.deleted,
      });
      console.log('📝 Recorded DELETE:', changes.deleted.length, 'nodes');
    }

    // Record UPDATE commands
    if (changes.updated.length > 0) {
      record({
        type: 'UPDATE',
        before: changes.updated.map(u => u.before),
        after: changes.updated.map(u => u.after),
      });
      console.log('📝 Recorded UPDATE:', changes.updated.length, 'nodes');
    }

    // Update snapshot for next comparison
    snapshotRef.current = currentSnapshot;
  }, [takeSnapshot, detectChanges, record]);

  // Debounced change detection
  const scheduleChangeDetection = useCallback(() => {
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
    
    changeTimeoutRef.current = setTimeout(() => {
      recordChanges();
    }, 300); // Wait 300ms after last change
  }, [recordChanges]);

  // Undo implementation
  const undo = useCallback(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;
    const command = historyUndo();
    if (!command) return;

    console.log('⏮️ UNDO:', command.type);
    isRestoringRef.current = true;

    try {
      if (command.type === 'ADD') {
        // Remove added nodes
        command.after?.forEach(nodeData => {
          const node = layer.findOne(`#${nodeData.id}`);
          node?.destroy();
        });
      } else if (command.type === 'DELETE') {
        // Restore deleted nodes
        command.before?.forEach(nodeData => {
          const node = window.Konva.Node.create(nodeData.config);
          layer.add(node);
        });
      } else if (command.type === 'UPDATE') {
        // Restore previous state
        command.before?.forEach(nodeData => {
          const node = layer.findOne(`#${nodeData.id}`);
          if (node) {
            node.setAttrs(nodeData.config);
          }
        });
      }

      layer.batchDraw();
      
      // Update snapshot after undo
      setTimeout(() => {
        snapshotRef.current = takeSnapshot();
        isRestoringRef.current = false;
      }, 100);
    } catch (error) {
      console.error('Undo error:', error);
      isRestoringRef.current = false;
    }
  }, [historyUndo, canvasRef, takeSnapshot]);

  // Redo implementation
  const redo = useCallback(() => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;
    const command = historyRedo();
    if (!command) return;

    console.log('⏭️ REDO:', command.type);
    isRestoringRef.current = true;

    try {
      if (command.type === 'ADD') {
        // Re-add nodes
        command.after?.forEach(nodeData => {
          const node = window.Konva.Node.create(nodeData.config);
          layer.add(node);
        });
      } else if (command.type === 'DELETE') {
        // Re-delete nodes
        command.before?.forEach(nodeData => {
          const node = layer.findOne(`#${nodeData.id}`);
          node?.destroy();
        });
      } else if (command.type === 'UPDATE') {
        // Apply new state
        command.after?.forEach(nodeData => {
          const node = layer.findOne(`#${nodeData.id}`);
          if (node) {
            node.setAttrs(nodeData.config);
          }
        });
      }

      layer.batchDraw();
      
      // Update snapshot after redo
      setTimeout(() => {
        snapshotRef.current = takeSnapshot();
        isRestoringRef.current = false;
      }, 100);
    } catch (error) {
      console.error('Redo error:', error);
      isRestoringRef.current = false;
    }
  }, [historyRedo, canvasRef, takeSnapshot]);

  // Setup global event listeners
  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.stage) return;

    const stage = canvasRef.current.stage;
    const layer = canvasRef.current.layer;

    // Take initial snapshot
    snapshotRef.current = takeSnapshot();

    // Listen to ALL events that modify the canvas
    const events = [
      'dragend',           // Drag objects
      'transformend',      // Scale/rotate
      'contentChange',     // Content modified
    ];

    const handleChange = () => {
      scheduleChangeDetection();
    };

    // Attach to stage (catches all events)
    events.forEach(event => {
      stage.on(event, handleChange);
    });

    // Also listen to layer node changes
    const observer = new MutationObserver(() => {
      scheduleChangeDetection();
    });

    // Monitor layer for child additions/removals
    const checkForChanges = setInterval(() => {
      const currentCount = layer.getChildren().length;
      const snapshotCount = snapshotRef.current.size;
      
      if (currentCount !== snapshotCount) {
        scheduleChangeDetection();
      }
    }, 500);

    return () => {
      events.forEach(event => {
        stage.off(event, handleChange);
      });
      clearInterval(checkForChanges);
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, [isCanvasReady, canvasRef, takeSnapshot, scheduleChangeDetection]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    forceRecord: recordChanges, // Manual trigger if needed
  };
};