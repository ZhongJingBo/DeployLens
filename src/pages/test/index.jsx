// import React, { useEffect, useRef } from "react";


// const Editor = () => {
//   const editorRef = useRef(null);

//   useEffect(() => {
//     if (!editorRef.current) return;


//     // 配置 Monaco 加载器
//     window.require.config({
//       paths: { 
//         vs: "../../lib/monaco-editor/min/vs",
//       },
//     });

//     // 加载 Monaco
//     window.require(["vs/language/json/monaco.contribution"], function () {
//       if (!window.monaco) {
//         console.error("Monaco not loaded");
//         return;
//       }

//       try {
//         const editor = window.monaco.editor.create(editorRef.current, {
//           value: "// code here",
//           language: "json",
//           theme: "vs",
//           automaticLayout: true,
//         });

//         // 打印成功信息
//         console.log("Editor created successfully");

//         return () => {
//           if (editor) {
//             editor.dispose();
//           }
//         };
//       } catch (error) {
//         console.error("Editor creation failed:", error);
//       }
//     });
//   }, [editorRef.current]);

//   // 添加一些基础样式确保编辑器容器正确显示
//   return (
//     <div
//       ref={editorRef}
//       style={{
//         height: "500px",
//         width: "100%",
//         border: "1px solid #ccc",
//         overflow: "hidden",
//       }}
//     />
//   );
// };

// export default Editor;
