/// <reference types="chrome"/>

declare namespace chrome {
  export namespace tabs {
    export interface Tab {
      id?: number;
      url?: string;
      // 添加其他需要的 Tab 属性
    }

    export interface TabChangeInfo {
      url?: string;
      // 添加其他需要的 TabChangeInfo 属性
    }

    export interface TabActiveInfo {
      tabId: number;
      // 添加其他需要的 TabActiveInfo 属性
    }
  }
} 