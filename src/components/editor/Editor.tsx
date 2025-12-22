
'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import dynamic from 'next/dynamic';
import {
  CanvasProvider,
  useCanvas,
} from '@/contexts/CanvasContext';
import { Skeleton } from '@/components/ui/skeleton';

const Canvas = dynamic(() => import('@/components/editor/Canvas'), { ssr: false });
const Toolbar = dynamic(() => import('@/components/editor/Toolbar'), {
  ssr: false,
  loading: () => <Skeleton className="h-24 w-24" />
});
const LayersPanel = dynamic(() => import('@/components/editor/LayersPanel'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-64 lg:w-80 lg:h-full" />
});
const PropertiesToolbar = dynamic(() => import('@/components/editor/PropertiesToolbar'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-12" />
});
const AddItemDialog = dynamic(() => import('@/components/editor/AddItemDialog'), { ssr: false });
const ShapeDialog = dynamic(() => import('@/components/editor/ShapeDialog'), { ssr: false });
const FrameDialog = dynamic(() => import('@/components/editor/FrameDialog'), { ssr: false });
const MaskDialog = dynamic(() => import('@/components/editor/MaskDialog'), { ssr: false });
const ClipartDialog = dynamic(() => import('@/components/editor/ClipartDialog'), { ssr: false });
const IconDialog = dynamic(() => import('@/components/editor/IconDialog'), { ssr: false });
const OnCanvasTextEditor = dynamic(() => import('@/components/editor/OnCanvasTextEditor'), { ssr: false });
const CropImageModal = dynamic(() => import('@/components/editor/CropImageModal'), { ssr: false });
const CurrencyDialog = dynamic(() => import('@/components/editor/CurrencyDialog'), { ssr: false });
const ArrowDialog = dynamic(() => import('@/components/editor/ArrowDialog'), { ssr: false });
const WeatherDialog = dynamic(() => import('@/components/editor/WeatherDialog'), { ssr: false });
const AstrologyDialog = dynamic(() => import('@/components/editor/AstrologyDialog'), { ssr: false });
const MusicDialog = dynamic(() => import('@/components/editor/MusicDialog'), { ssr: false });
const DicesAndTilesDialog = dynamic(() => import('@/components/editor/DicesAndTilesDialog'), { ssr: false });

declare global {
  interface Window {
    Konva: any;
  }
}

function EditorUI() {
  const {
    canvasRef,
    setKonvaReady,
    konvaObjects,
    selectedNodes,
    setSelectedNodes,
    isMultiSelectMode,
    isAddItemDialogOpen,
    setAddItemDialogOpen,
    isShapeDialogOpen,
    setShapeDialogOpen,
    isFrameDialogOpen,
    setFrameDialogOpen,
    isMaskDialogOpen,
    setMaskDialogOpen,
    isClipartDialogOpen,
    setClipartDialogOpen,
    isIconDialogOpen,
    setIconDialogOpen,
    isCurrencyDialogOpen,
    setCurrencyDialogOpen,
    isArrowDialogOpen,
    setArrowDialogOpen,
    isWeatherDialogOpen,
    setWeatherDialogOpen,
    isAstrologyDialogOpen,
    setAstrologyDialogOpen,
    isMusicDialogOpen,
    setMusicDialogOpen,
    isDicesAndTilesDialogOpen,
    setDicesAndTilesDialogOpen,
    editingShapeNode,
    editingFrameNode,
    editingMaskNode,
    editingTextNode,
    setEditingTextNode,
    handleAddShape,
    handleUpdateShape,
    handleAddOrUpdateText,
    handleAddFrame,
    handleUpdateFrame,
    handleAddMask,
    handleUpdateMask,
    handleAddClipart,
    handleAddIcon,
    handleAddCurrency,
    handleAddArrow,
    handleAddWeather,
    handleAddAstrology,
    handleAddMusic,
    handleAddDicesAndTiles,
    handleSelectItem,
    handleMoveNode,
    canvasSize,
    backgroundImage,
    isCropModalOpen,
    nodeToCrop,
    setCropModalOpen,
    handleApplyCrop,
  } = useCanvas();

  const isCircular = canvasSize.endsWith('-circle');
  const sizeString = canvasSize.split('-')[0];

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/konva@9.3.6/konva.min.js"
        strategy="lazyOnload"
        onLoad={() => setKonvaReady(true)}
      />
      <div id="editor-ui">
        <div className="editor-main-column">
          <h1 className="text-4xl text-center my-4 font-headline" style={{ fontWeight: 400 }}>
            <span style={{ color: '#F25912' }}>c</span>
            <span style={{ color: '#FFC400' }}>h</span>
            <span style={{ color: '#16C47F' }}>i</span>
            <span style={{ color: '#7C00FE' }}>t</span>
            <span style={{ color: '#D91656' }}>r</span>
            <span style={{ color: '#640D5F' }}>a</span>
          </h1>
          <Toolbar />
          <Canvas
            ref={canvasRef}
            canvasSize={sizeString!}
            isCircular={isCircular!}
            backgroundImage={backgroundImage}
          />
          {editingTextNode && (
            <OnCanvasTextEditor
              node={editingTextNode}
              onClose={() => setEditingTextNode(null)}
              onUpdate={handleAddOrUpdateText}
            />
          )}
          <PropertiesToolbar />
        </div>

        <LayersPanel
          layers={konvaObjects}
          selectedNodes={selectedNodes}
          onSelectNode={(id) => {
            const node = canvasRef.current?.layer.findOne(`#${id}`);
            if (node) {
              if (isMultiSelectMode) {
                const isSelected = selectedNodes.some((n) => n.id() === node.id());
                if (isSelected) {
                  setSelectedNodes(selectedNodes.filter((n) => n.id() !== node.id()));
                } else {
                  setSelectedNodes([...selectedNodes, node]);
                }
              } else {
                setSelectedNodes([node]);
              }
            }
          }}
          onMoveNode={handleMoveNode}
        />

        <AddItemDialog
          isOpen={isAddItemDialogOpen}
          onClose={() => setAddItemDialogOpen(false)}
          onSelectItem={handleSelectItem}
        />

        <ShapeDialog
          isOpen={isShapeDialogOpen}
          onClose={() => setShapeDialogOpen(false)}
          onAddShape={handleAddShape}
          onUpdateShape={handleUpdateShape}
          editingNode={editingShapeNode}
        />

        <FrameDialog
          isOpen={isFrameDialogOpen}
          onClose={() => setFrameDialogOpen(false)}
          onAddFrame={handleAddFrame}
          onUpdateFrame={handleUpdateFrame}
          editingNode={editingFrameNode}
        />

        <MaskDialog
          isOpen={isMaskDialogOpen}
          onClose={() => setMaskDialogOpen(false)}
          onAddMask={handleAddMask}
          onUpdateMask={handleUpdateMask}
          editingNode={editingMaskNode}
        />

        <ClipartDialog
          isOpen={isClipartDialogOpen}
          onClose={() => setClipartDialogOpen(false)}
          onAddClipart={handleAddClipart}
        />

        <IconDialog
          isOpen={isIconDialogOpen}
          onClose={() => setIconDialogOpen(false)}
          onAddIcon={handleAddIcon}
        />

        <CurrencyDialog
          isOpen={isCurrencyDialogOpen}
          onClose={() => setCurrencyDialogOpen(false)}
          onSelectCurrency={(currency) => {
            handleAddCurrency(currency);
            setCurrencyDialogOpen(false);
          }}
        />

        <ArrowDialog
          isOpen={isArrowDialogOpen}
          onClose={() => setArrowDialogOpen(false)}
          onSelectArrow={(arrow) => {
            handleAddArrow(arrow);
            setArrowDialogOpen(false);
          }}
        />
        
        <WeatherDialog
          isOpen={isWeatherDialogOpen}
          onClose={() => setWeatherDialogOpen(false)}
          onSelectWeather={(weather) => {
            handleAddWeather(weather);
            setWeatherDialogOpen(false);
          }}
        />

        <AstrologyDialog
          isOpen={isAstrologyDialogOpen}
          onClose={() => setAstrologyDialogOpen(false)}
          onSelectAstrology={(astrology) => {
            handleAddAstrology(astrology);
            setAstrologyDialogOpen(false);
          }}
        />

        <MusicDialog
          isOpen={isMusicDialogOpen}
          onClose={() => setMusicDialogOpen(false)}
          onSelectMusic={(music) => {
            handleAddMusic(music);
            setMusicDialogOpen(false);
          }}
        />

        <DicesAndTilesDialog
          isOpen={isDicesAndTilesDialogOpen}
          onClose={() => setDicesAndTilesDialogOpen(false)}
          onSelectDicesAndTiles={(symbol) => {
            handleAddDicesAndTiles(symbol);
            setDicesAndTilesDialogOpen(false);
          }}
        />

        <CropImageModal
          isOpen={isCropModalOpen}
          imageNode={nodeToCrop}
          onClose={() => setCropModalOpen(false)}
          onApply={handleApplyCrop}
        />
      </div>
    </>
  );
}

export default function Editor() {
  return (
    <CanvasProvider>
      <EditorUI />
    </CanvasProvider>
  );
}
