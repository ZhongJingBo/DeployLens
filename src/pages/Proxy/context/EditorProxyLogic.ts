import { EDITOR_PROXY } from '@/constants';
import { ProxyData } from '@/model/proxy';
// --- 编辑器逻辑相关的 State 部分 ---
export interface EditorStatePart {
  editorProxyData: ProxyData;
}

// --- 编辑器逻辑相关的 Action 类型 ---
export type EditorAction =
  | { type: 'INIT_EDITOR_DATA'; payload: ProxyData }
  | { type: 'SET_EDITOR_CONTENT'; payload: ProxyData };

// --- 编辑器逻辑的初始状态 ---
export const initialEditorStatePart: EditorStatePart = {
  editorProxyData: EDITOR_PROXY,
};

// --- 编辑器逻辑的 Reducer ---
// 这个 Reducer 只处理与编辑器数据相关的 Action
export const editorReducer = (state: EditorStatePart, action: EditorAction): EditorStatePart => {
  switch (action.type) {
    case 'INIT_EDITOR_DATA':
       if (typeof action.payload !== 'string') {
          console.error("[EditorLogic] INIT_EDITOR_DATA 接收到无效数据:", action.payload);
          return state;
      }
      return {
        ...state,
        editorProxyData: action.payload || EDITOR_PROXY,
      };
    case 'SET_EDITOR_CONTENT':
       if (typeof action.payload !== 'string') {
          console.error("[EditorLogic] SET_EDITOR_CONTENT 接收到无效内容:", action.payload);
          return state;
      }
      return {
        ...state,
        editorProxyData: action.payload,
      };
    // 注意：这个子 Reducer 不处理其他类型的 Action
    default:
      return state;
  }
}; 