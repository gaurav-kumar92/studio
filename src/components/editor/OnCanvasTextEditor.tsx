
'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });


type OnCanvasTextEditorProps = {
  node: any;
  onClose: () => void;
  onUpdate: (config: any) => void;
};

const OnCanvasTextEditor: React.FC<OnCanvasTextEditorProps> = ({ node, onClose, onUpdate }) => {
  const [text, setText] = useState(node.getAttr('data-text') || '');
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(event.target as Node)) {
        const fullConfig = {
            ...node.attrs,
            'data-text': text,
            text: text,
        };
        onUpdate(fullConfig);
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [text, node, onUpdate, onClose]);

  if (!node) return null;

  const stage = node.getStage();
  const box = node.getClientRect();
  const position = {
    x: box.x,
    y: box.y,
  };

  const isCircular = node.name() === 'circularText';
  if(isCircular) {
      // Cannot edit circular text in place yet
        onClose();
        return null;
  }

  const editorStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${position.y}px`,
    left: `${position.x}px`,
    width: `${box.width}px`,
    minHeight: `${box.height}px`,
    background: 'transparent',
    border: '1px dashed #7c3aed',
    zIndex: 100,
    fontSize: `${node.getAttr('data-font-size')}px`,
    fontFamily: node.getAttr('data-font-family'),
    lineHeight: node.getAttr('data-line-height'),
    letterSpacing: `${node.getAttr('data-letter-spacing')}px`,
    fontWeight: node.getAttr('data-is-bold') ? 'bold' : 'normal',
    fontStyle: node.getAttr('data-is-italic') ? 'italic' : 'normal',
    textDecoration: `${node.getAttr('data-is-underline') ? 'underline ' : ''}${node.getAttr('data-is-strikethrough') ? 'line-through' : ''}`.trim(),
    textAlign: node.getAttr('data-align'),
    color: node.findOne('.text')?.fill(),
  };

  return (
    <div ref={editorRef} style={editorStyle}>
      <ReactQuill
        theme="snow"
        value={text}
        onChange={setText}
        modules={{ toolbar: false }}
        formats={[]}
        className="h-full"
      />
    </div>
  );
};

export default OnCanvasTextEditor;
