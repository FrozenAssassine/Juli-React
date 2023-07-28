import React from "react";
import "./styles/app.css";
import { Interpreter } from "./juli/Interpreter";
import { OutputHandler } from "./juli/OutputHandler";

let outputHandler: OutputHandler;

function runCode() {
  if(outputHandler === undefined){
    outputHandler = new OutputHandler(document.getElementById("output") as HTMLElement);
  }
  else {
    outputHandler.output.innerText = "";
  }
    const input = document.getElementById("codeinput") as HTMLTextAreaElement;
    new Interpreter(input.value, outputHandler).interpret();
}

function App() {
    return (
        <div className="app">
          <div className="navigationBar">
            <div className="navigationBarItem runbtn"  onClick={runCode}>Run Code</div>
          </div>
          <div className="content">
            <textarea className="codeInput" id="codeinput"/>
            <div className="output" id="output"></div>
          </div>
        </div>
    );
}

export default App;
