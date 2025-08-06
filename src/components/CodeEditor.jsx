//Embedding Monaco Editor inside React component
import React, { useRef, useEffect } from "react";
import * as monaco from "monaco-editor"; //monaco code editor engine

//React component that accepts the code appearing in the editor,  func
// to run when code changes, and monaco instance
const CodeEditor = ({value, onChange, editorRef}) => {
    const containerRef = useRef(null); //reference to div where monaco renders 

    //Creating the actual monaco editor

    useEffect(() => { //useEffect runs after component renders
    if (!containerRef.current) return; 
        //if container div present, create editor in it
        const editor = monaco.editor.create(containerRef.current, {
            value,
            language: "javascript",
            theme: "vs-dark",
            automaticLayout: true,
          }); //editor now configured

        editorRef.current = editor;

        //listen for when code changes
        //call on change to let parent component catch the new code
        editor.onDidChangeModelContent(() => {
            onChange(editor.getValue());
        });

        //runs when component removed to clean up editor
        return () => editor.dispose();
    
}, []);


  //return editor container aka plain <div> and give it a ref so Monaco can render the editor inside it
return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
};

export default CodeEditor;