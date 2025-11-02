
'use client';

import { useEffect, useRef, Dispatch, SetStateAction } from 'react';

type UseSelectionProps = {
  isCanvasReady: boolean;
  canvasRef: React.RefObject<{ stage: any; layer: any }>;
  isMultiSelectMode: boolean;
  selectedNodes: any[];
  setSelectedNodes: Dispatch<SetStateAction<any[]>>;
};

export const useSelection = ({
  isCanvasReady,
  canvasRef,
  isMultiSelectMode,
  selectedNodes,
  setSelectedNodes,
}: UseSelectionProps) => {
  const selectionRectRef = useRef<any>(null);
  const selectionStartRef = useRef<{ x: number; y: number } | null>(null);

  // Pool of per-node Transformers (one per selected top-level node)
  const transformersRef = useRef<Map<number, any>>(new Map());

  useEffect(() => {
    if (!isCanvasReady || !canvasRef.current?.stage || !canvasRef.current?.layer) return;

    const stage = canvasRef.current.stage;
    const layer = canvasRef.current.layer;

    // ---------- one-time marquee rectangle ----------
    if (!selectionRectRef.current) {
      const rect = new window.Konva.Rect({
        name: 'selection-rect',
        visible: false,
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fill: 'rgba(168, 85, 247, 0.15)',
        stroke: '#a855f7',
        dash: [4, 3],
        listening: false,
        hitGraphEnabled: false,
      });
      layer.add(rect);
      selectionRectRef.current = rect;
      layer.draw();
    }
    const rect = selectionRectRef.current;

    // ---------- helpers ----------
    const isTransformer = (node: any) => {
      const cn = node?.getClassName?.() ?? '';
      return cn === 'Transformer' || node?.hasName?.('Transformer');
    };
    const isBackgroundTarget = (t: any) => t === stage || t?.name?.() === 'background';

    const getSelectableRoot = (node: any): any | null => {
        if (!node || node === stage || node === layer) return null;
        
        // If the node is a direct child of the layer and is selectable, return it.
        if (node.parent === layer && (node.name() === 'shape' || node.name() === 'image' || node.name() === 'frame' || node.name() === 'icon' || node.hasName('group') || node.hasName('textGroup') || node.hasName('circularText') || node.hasName('mask') || node.hasName('clipart'))) {
          return node;
        }

        // If it has a parent that isn't the layer, recurse up.
        if (node.parent && node.parent !== layer) {
          return getSelectableRoot(node.parent);
        }
        
        return null;
    };
    
    // Coalesce a list of nodes to canonical selection:
    // 1) Replace any node that is inside a group by the group root.
    // 2) Replace child primitives by their selectable root.
    // 3) Deduplicate by internal _id.
    const canonicalizeSelection = (nodes: any[]): any[] => {
      const byId = new Map<number, any>();
      nodes.forEach((node) => {
        const root = getSelectableRoot(node);
        if (root) byId.set(root._id, root);
      });
      return Array.from(byId.values());
    };

    // ---------- marquee handlers ----------
    const begin = (e: any) => {
      if (!isMultiSelectMode) return;
      if (!isBackgroundTarget(e.target)) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      selectionStartRef.current = pos;
      rect.setAttrs({ visible: true, x: pos.x, y: pos.y, width: 0, height: 0 });
      layer.batchDraw();
    };

    const update = () => {
      if (!isMultiSelectMode) return;
      const start = selectionStartRef.current;
      if (!start) return;

      const pos = stage.getPointerPosition();
      if (!pos) return;

      const x = Math.min(start.x, pos.x);
      const y = Math.min(start.y, pos.y);
      const w = Math.abs(pos.x - start.x);
      const h = Math.abs(pos.y - start.y);

      rect.setAttrs({ x, y, width: w, height: h, visible: true });
      layer.batchDraw();
    };

    const finish = () => {
      // Always hide marquee
      selectionStartRef.current = null;
      rect.visible(false);
      layer.batchDraw();

      if (!isMultiSelectMode) return;

      const box = rect.getClientRect();

      // Raw candidates from hit graph
      const raw = layer
        .find((node: any) => {
          if (node === rect) return false;
          if (!node.visible?.()) return false;
          if (isTransformer(node)) return false;
          if (node?.name?.() === 'background') return false;
          if (!node?.id?.()) return false;
          return true;
        })
        .filter((node: any) => {
          const r = node.getClientRect();
          return (
            r.x >= box.x &&
            r.y >= box.y &&
            r.x + r.width <= box.x + box.width &&
            r.y + r.height <= box.y + box.height
          );
        });

      // Canonicalize to group roots / selectable roots and dedupe
      const canonical = canonicalizeSelection(raw);
      setSelectedNodes(canonical);
    };

    const cancel = () => {
      selectionStartRef.current = null;
      if (rect.visible()) {
        rect.visible(false);
        layer.batchDraw();
      }
    };

    // ---------- single click/tap selection ----------
    const handleClick = (e: any) => {
      const t = e?.target;

      if (isBackgroundTarget(t)) {
        // Click on blank canvas: clear selection
        setSelectedNodes([]);
        return;
      }

      const root = getSelectableRoot(t);
      if (!root) return;

      if (isMultiSelectMode) {
        // Dedup across selections; clicking another member of the same group still resolves to the group.
        const exists = selectedNodes.some((n) => n?._id === root._id);
        if (!exists) setSelectedNodes([...selectedNodes, root]);
        // (Optional toggle off) else setSelectedNodes(selectedNodes.filter(n => n._id !== root._id));
      } else {
        setSelectedNodes([root]);
      }
    };

    // ---------- wire events ----------
    stage.on('mousedown touchstart', begin);
    stage.on('mousemove touchmove', update);
    stage.on('mouseup touchend', finish);
    stage.on('contentMouseup contentTouchend', finish);
    stage.on('dragstart', cancel);
    stage.on('click tap', handleClick);

    const contentEl = stage.getContent();
    const onLeave = () => cancel();
    contentEl.addEventListener('mouseleave', onLeave);

    
const onHistoryApplied = () => {
  // 1) Drop transformers whose node is gone
  const pool = transformersRef.current;
  pool.forEach((tr, key) => {
    const node = tr.nodes()?.[0];
    if (!node || !node.getStage || !node.getStage()) {
      tr.destroy();
      pool.delete(key);
    }
    });
    
  setSelectedNodes(prev =>(
    prev || []).filter(n => n && typeof n.getStage === 'function' && !!n.getStage()));
  layer.batchDraw();
};
stage.on('history:applied', onHistoryApplied);



    return () => {
      stage.off('mousedown touchstart', begin);
      stage.off('mousemove touchmove', update);
      stage.off('mouseup touchend', finish);
      stage.off('contentMouseup contentTouchend', finish);
      stage.off('dragstart', cancel);
      stage.off('click tap', handleClick);
      stage.off('history:applied', onHistoryApplied);
      contentEl.removeEventListener('mouseleave', onLeave);
    };
  }, [
    isCanvasReady,
    canvasRef,
    isMultiSelectMode,
    selectedNodes,
    setSelectedNodes,
  ]);

  // ---------- maintain per-root Transformers (one per selected top-level node) ----------
  useEffect(() => {
    if (!canvasRef.current?.layer) return;

    const layer = canvasRef.current.layer;
    const pool = transformersRef.current;

    // Helper: ensure the list contains only top-level canonical roots (e.g., groups, not members)
    const onlyTopLevel = (nodes: any[]): any[] => {
      const byId = new Map<number, any>();
      nodes.forEach((n) => {
        if (!n || !n.getStage || !n.getStage()) return;
        // If a node has an ancestor group, assume selection already holds the group root (from click/marquee canonicalization)
        byId.set(n._id, n);
      });
      return Array.from(byId.values());
    };

    const targets = onlyTopLevel(selectedNodes || []).filter(node => !node.getAttr('isLocked'));

    if (targets.length === 0) {
      // Clear all transformers
      pool.forEach((tr) => tr.destroy());
      pool.clear();
      layer.batchDraw();
      return;
    }

    // Remove transformers for nodes no longer selected/attached
    pool.forEach((tr, key) => {
      const still = targets.find((n) => n && n._id === key && n.getStage && n.getStage());
      if (!still) {
        tr.destroy();
        pool.delete(key);
      }
    });

    // Ensure one transformer per selected top-level node
    targets.forEach((node) => {
      const key = node._id as number;
      let tr = pool.get(key);
      if (!tr) {
        tr = new window.Konva.Transformer({
          name: 'Transformer',  // excluded from history
          rotateEnabled: true,
          keepRatio: false,
          ignoreStroke: true,
          anchorSize: 8,
          borderStroke: '#7c3aed',
          borderStrokeWidth: 1.5,
          anchorFill: '#a855f7',
          anchorStroke: '#a855f7',

          resizeEnabled: true, // This enables pinch-to-scale on mobile
          anchorStrokeWidth: 1,
          enabledAnchors: [
            'top-left', 'top-center', 'top-right',
            'middle-left', 'middle-right',
            'bottom-left', 'bottom-center', 'bottom-right',
          ],
        });
        layer.add(tr);
        pool.set(key, tr);
      }

      if (tr.nodes()[0] !== node || tr.nodes().length !== 1) {
        tr.nodes([node]);
      }
      tr.visible(true);
    });

    layer.batchDraw();
  }, [selectedNodes, canvasRef]);
};
