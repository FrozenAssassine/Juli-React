import React from 'react';
import './styles/app.css';
import { interpret } from './juli/interpreter';


function runCode(){
  const input = document.getElementById("codeinput") as HTMLTextAreaElement;
  console.log("CODE: " + input.value);
  const result = interpret(input.value);
  console.log(result);

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
