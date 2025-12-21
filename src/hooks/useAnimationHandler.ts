
'use client';

import { useCallback, useRef } from 'react';

type UseAnimationHandlerProps = {
  canvasRef: React.RefObject<{ stage: any; layer: any }>;
  selectedNodes: any[];
  forceRecord?: () => void;
};

export const useAnimationHandler = ({
  canvasRef,
  selectedNodes,
  forceRecord,
}: UseAnimationHandlerProps) => {
  const activeTweens = useRef<any[]>([]);
  const animatedNodesRef = useRef<any[]>([]);
  const animationMetaRef = useRef<Map<any, { type: string; duration: number }>>(
    new Map()
  );


    const playAnimationForNodes = useCallback((nodes: any[]) => {
    if (!canvasRef.current?.layer) return;
    const layer = canvasRef.current.layer;

    // Stop any tweens for the nodes that are about to be animated
    activeTweens.current = activeTweens.current.filter(tween => {
      const isNodeInSelection = nodes.some(n => n === tween.node);
      if (isNodeInSelection) {
        tween.destroy();
        return false; // remove from active tweens
      }
      return true; // keep in active tweens
    });
    nodes.forEach(resetNodeState);


    nodes.forEach((node: any) => {
      const animationType = node.getAttr('data-animation-type');
      if (!animationType || animationType === 'none') {
        resetNodeState(node);
        return;
      }

      // Save original state before animating
      node.setAttr('data-original-state', {
          opacity: node.opacity(),
          scaleX: node.scaleX(),
          scaleY: node.scaleY(),
          rotation: node.rotation(),
      });
      node.addName('animating');


      const duration = node.getAttr('data-animation-duration') || 1;
      let tween: any;

      switch (animationType) {
        case 'fade':
          node.opacity(0);
          tween = new window.Konva.Tween({
            node: node,
            duration: duration,
            opacity: 1,
          });
          break;
        case 'pulse':
          tween = new window.Konva.Tween({
            node: node,
            duration: duration,
            scaleX: node.scaleX() * 1.2,
            scaleY: node.scaleY() * 1.2,
            easing: window.Konva.Easings.EaseInOut,
            yoyo: true,
            onFinish: () => {
                node.scaleX(node.getAttr('data-original-state').scaleX);
                node.scaleY(node.getAttr('data-original-state').scaleY);
            }
          });
          break;
        case 'shake':
          const originalRotation = node.rotation();
          tween = new window.Konva.Tween({
            node: node,
            duration: duration / 5, 
            rotation: originalRotation + 10,
            easing: window.Konva.Easings.EaseInOut,
            yoyo: true,
            onFinish: () => {
                const shakeCount = node.getAttr('shakeCount') || 0;
                if(shakeCount < 4) {
                    node.setAttr('shakeCount', shakeCount + 1);
                    const newRotation = shakeCount % 2 === 0 ? originalRotation - 10 : originalRotation + 10;
                    tween.node.rotation(newRotation);
                    tween.reset();
                    tween.play();
                } else {
                    node.rotation(originalRotation);
                    node.setAttr('shakeCount', 0);
                }
            }
          });
           node.setAttr('shakeCount', 0);
          break;
        default:
          return;
      }
      
      if (tween) {
        tween.play();
        activeTweens.current.push(tween);
      }
    });
    }, [canvasRef]);


    const handleAnimationChange = useCallback((config: any) => {
      if (selectedNodes.length === 0) return;
    
      selectedNodes.forEach(node => {
        node.setAttr('data-animation-type', config.type);
        node.setAttr('data-animation-duration', config.duration);
    
        animationMetaRef.current.set(node, {
          type: config.type,
          duration: config.duration,
        });
      });
    
      animatedNodesRef.current = [...selectedNodes];
    
      playAnimationForNodes(selectedNodes);
      forceRecord?.();
    }, [selectedNodes, forceRecord, playAnimationForNodes]);
    
  const resetNodeState = (node: any) => {
    const originalState = node.getAttr('data-original-state');
    if (originalState) {
        node.setAttrs(originalState);
    } else {
        // Fallback if no state saved
        node.opacity(1);
        node.scale({x: node.scaleX(), y: node.scaleY()});
        // Do not reset rotation to 0, use its current rotation
    }
  }
  const timelineState = {
    getDuration: () => {
      const durations = Array.from(animationMetaRef.current.values()).map(
        meta => (meta.duration || 1) * 1000
      );
      return durations.length > 0 ? Math.max(...durations) : 1000;
    },
  
    seek: (timeMs: number) => {
      // existing seek logic
    },
  
    bindStage: (_stage: any) => {},
  };
  
  return {
    handleAnimationChange,
    timelineState,
  };
  
  

  return {
    handleAnimationChange,
    timelineState,
  };
};
