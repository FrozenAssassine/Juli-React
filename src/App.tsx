import React from 'react';
import './styles/app.css';
import { Interpreter } from './juli/Interpreter';

function runCode(){
  const input = document.getElementById("codeinput") as HTMLTextAreaElement;
  console.log("CODE: " + input.value);
  const result = new Interpreter(input.value).interpret();

  const output = document.getElementById("output") as HTMLElement;
}

function App() {
  return (
    <div className='app'>
<textarea className='textInput' id='codeinput' ></textarea>
<div className='runbtn' onClick={runCode}>Run</div>
<div className='output' id='output'></div>
    </div>
  );
}

export default App;
