import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/components/theme-provider';

declare global {
  interface Window {
    monaco: {
      editor: {
        create: (element: HTMLElement, options: any) => any;
        setTheme: (theme: string) => void;
      };
      KeyMod: {
        CtrlCmd: number;
      };
      KeyCode: {
        KeyS: number;
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
  const lastValueRef = useRef(value);
  const { theme } = useTheme();

  // 初始化编辑器
  const initializeEditor = () => {
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
          formatOnPaste: true,
          formatOnType: true,
        });

        isInitializedRef.current = true;
        lastValueRef.current = value;

        if (onChange) {
          let isInternalChange = false;
          editorInstanceRef.current.onDidChangeModelContent(() => {
            if (!isInternalChange) {
              const newValue = editorInstanceRef.current.getValue();
              lastValueRef.current = newValue;
              onChange(newValue);
            }
          });

          // 添加保存快捷键
          editorInstanceRef.current.addCommand(
            window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS,
            () => {
              const newValue = editorInstanceRef.current.getValue();
              try {
                // 尝试格式化 JSON
                const formatted = JSON.stringify(JSON.parse(newValue), null, 2);
                isInternalChange = true;
                editorInstanceRef.current.setValue(formatted);
                lastValueRef.current = formatted;
                onChange(formatted);
              } catch (e) {
                console.warn('Failed to format JSON:', e);
                onChange(newValue);
              } finally {
                isInternalChange = false;
              }
            }
          );
        }
      } catch (error) {
        console.error('Editor creation failed:', error);
      }
    });
  };

  // 组件挂载时初始化编辑器
  useEffect(() => {
    initializeEditor();
    // 组件卸载时清理编辑器实例
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose();
        editorInstanceRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []); // 只在组件挂载时创建编辑器

  // 监听value变化，更新编辑器内容
  useEffect(() => {
    const updateEditorContent = () => {
      if (!editorInstanceRef.current) {
        // 如果编辑器还没初始化，等待下一帧再试
        requestAnimationFrame(updateEditorContent);
        return;
      }

      if (value !== lastValueRef.current) {
        const currentValue = editorInstanceRef.current.getValue();
        if (value !== currentValue) {
          editorInstanceRef.current.setValue(value);
          lastValueRef.current = value;
        }
      }
    };

    updateEditorContent();
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
