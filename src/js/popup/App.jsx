import React, { useEffect, useState, useReducer } from "react";
import { useCanvas } from "./canvas-hook";
import { hot } from "react-hot-loader";
import { startAudioContext, bpmMessage, popupClose, frequencyInfo } from "../messages";
import debounce from "lodash.debounce";
import { Card } from "@material-ui/core";
import * as d3 from "d3";

const START_INDEX = 5;
function App() {
  const [state, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case "setMouse":
          return { ...state, xyMouse: { ...action.payload } };
        case "setBin":
          return { ...state, bin: action.payload };
        case "setStep":
          return { ...state, step: action.payload };
        case "setXScale":
          return { ...state, xScale: action.payload };
      }
    },
    { bpm: "N/A", xyMouse: { x: 0, y: 0 } }
  );
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(200);
  const [bpm, setBpm] = useState("N/A");
  /** @type {[Uint8Array, (val: Float32Array)=> void]} */
  const [fftBuffer, setFftBuffer] = useState(null);
  /** @type {[number, (val: number)=> void]} */
  const [sampleRate, setSampleRate] = useState(44100);
  /** @type {[number, (val: number)=> void]} */
  const [minDecibels, setMinDecibels] = useState(0);
  /** @type {[number, (val: number)=> void]} */
  const [maxDecibels, setMaxDecibels] = useState(0);

  const updateMouse = debounce(e => {
    // debugger;
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    dispatch({ type: "setMouse", payload: { x, y } });
    const freq = state.bin * (Math.pow(10, x / state.step) - 1 + START_INDEX);
    console.log(freq, state.bin, state.step);
  }, 50);
  function messageListener(m) {
    if (m.type === bpmMessage) {
      setBpm(m.payload);
    }
    if (m.type === frequencyInfo) {
      const { buffer, sampleRate, minDecibels, maxDecibels } = m.payload;
      setFftBuffer(Object.values(buffer));
      setSampleRate(sampleRate);
      setMinDecibels(minDecibels);
      setMaxDecibels(maxDecibels);
    }
  }
  useEffect(() => {
    window.chrome.runtime.sendMessage({ type: startAudioContext });
    window.chrome.runtime.onMessage.addListener(messageListener);
    canvasRef.current.addEventListener("mousemove", updateMouse);
    return function cleanup() {
      window.chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  function draw2(ctx) {
    if (!fftBuffer) return;
    // let buff = fftBuffer.map(v => v * (height / 255) * -1 + height);
    const buff = fftBuffer;
    const max = buff.reduce((a, b) => (b > a ? b : a));
    const min = buff.reduce((a, b) => (b < a ? b : a));
    // console.log(max, min);
    const binSize = sampleRate / 2 / buff.length;
    dispatch({ type: "setBin", payload: binSize });
    // const buff = fftBuffer.map(v => (v + -1 * min) * (height / (max - min)));
    const maxSample = 6 * (buff.length / 8);
    const maxX = Math.log10(maxSample);
    const step = width / maxX;
    dispatch({ type: "setStep", payload: step });
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    let init = true;
    const startIndex = START_INDEX;
    let lastX = -1;

    for (let i = startIndex; i < maxSample; i++) {
      const x = step * Math.log10(i - startIndex + 1);
      if (x - lastX < 1) continue;
      lastX = x;
      const y = height - buff[i] * (height / 255);
      if (init) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      init = false;
    }
    ctx.stroke();
  }

  let xScaler;
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   */
  function draw(ctx) {
    if (!fftBuffer) return;
    // let buff = fftBuffer.map(v => v * (height / 255) * -1 + height);
    const buff = fftBuffer;
    const binSize = sampleRate / 2 / buff.length;
    const xVals = d3.range(buff.length).map(i => i * binSize);
    const maxX = 7 * (buff.length / 8);
    const minX = 3;
    const xScale = d3
      .scaleLog()
      .domain([xVals[minX], xVals[maxX]])
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, 255])
      .range([0, height]);
    dispatch({ type: "setXScale", payload: xScale });
    xScaler = xScale;
    let lastX = -1;
    let lastY = -1;
    let init = true;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    d3.zip(xVals, buff)
      .slice(minX, maxX)
      .forEach(([x, y]) => {
        const xT = xScale(x);
        if (xT - lastX < 1) return;
        lastX = xT;
        const yT = height + 4 - yScale(y);
        lastY = yT;
        init ? ctx.moveTo(xT, yT) : ctx.lineTo(xT, yT);
        init = false;
      });
    ctx.lineTo(width + 5, lastY);
    ctx.lineTo(width + 5, height + 5);
    ctx.lineTo(-5, height + 5);
    ctx.lineTo(-5, height + 5);
    ctx.closePath();
    ctx.strokeStyle = "#fc036b";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  const canvasRef = useCanvas(draw);
  return (
    <div>
      <Card raised={true}>
        <canvas ref={canvasRef} width={width} height={height} />
      </Card>
      <p>{state.xScale && state.xScale.invert(state.xyMouse.x)}</p>
      {/* <p>{state.bin * (Math.pow(10, state.xyMouse.x / state.step) - 1 + START_INDEX)}</p> */}
    </div>
  );
}

// eslint-disable-next-line
export default hot(module)(App);
