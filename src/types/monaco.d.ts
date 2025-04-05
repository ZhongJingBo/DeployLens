declare global {
  interface Window {
    require: any;
    monaco: {
      editor: {
        create: (element: HTMLElement, options: any) => any;
      };
    };
  }
}

export {}; 