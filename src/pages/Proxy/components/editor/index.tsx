import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';

declare global {
  interface Window {
    monaco: {
      editor: {
        create: (element: HTMLElement, options: any) => any;
        setTheme: (theme: string) => void;
      };
    };
  }
}

interface EditorProps {
  value: string;
  onChange?: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const isInitializedRef = useRef(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (!editorRef.current || isInitializedRef.current) return;

    window.require.config({
      paths: {
        vs: "../../lib/monaco-editor/min/vs",
      },
    });

    // 加载 Monaco
    window.require(["vs/language/json/monaco.contribution"], function () {
      if (!window.monaco) {
        console.error('Monaco not loaded');
        return;
      }

      try {
        // 如果已经存在编辑器实例，先销毁它
        if (editorInstanceRef.current) {
          editorInstanceRef.current.dispose();
        }

        // 创建新的编辑器实例
        editorInstanceRef.current = window.monaco.editor.create(editorRef.current!, {
          value,
          language: 'json',
          theme: theme === 'dark' ? 'vs-dark' : 'vs',
          automaticLayout: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
          },
          padding: {
            top: 10,
            bottom: 10,
          },
        });

        isInitializedRef.current = true;

        if (onChange) {
          editorInstanceRef.current.onDidChangeModelContent(() => {
            onChange(editorInstanceRef.current.getValue());
          });
        }

        // 组件卸载时清理编辑器实例
        return () => {
          if (editorInstanceRef.current) {
            editorInstanceRef.current.dispose();
            editorInstanceRef.current = null;
            isInitializedRef.current = false;
          }
        };
      } catch (error) {
        console.error('Editor creation failed:', error);
      }
    });
  }, []); // 只在组件挂载时创建编辑器

  // 监听value变化，更新编辑器内容
  useEffect(() => {
    if (editorInstanceRef.current && value !== editorInstanceRef.current.getValue()) {
      editorInstanceRef.current.setValue(value);
    }
  }, [value]);

  // 监听主题变化，更新编辑器主题
  useEffect(() => {
    if (editorInstanceRef.current) {
      window.monaco.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs');
    }
  }, [theme]);

  return <div ref={editorRef} className="w-full h-[75vh]" />;
};

export default Editor;
