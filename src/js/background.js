import "../img/icon-128.png";
import "../img/icon-34.png";
import { guess, analyze } from "web-audio-beat-detector";
import { startAudioContext, frequencyInfo, popupClose } from "./messages";
import { AudioCapture } from "./AudioCapture";
import { setTimeout } from "timers";

/** @type {number} */
let currentTabId;

/** @type {{[id: number]: AudioCapture}} */
const audioCaptures = {};
const FRAME_INTERVAL_MS = 20;
const SAMPLE_RATE = 44100;
window.chrome.runtime.onMessage.addListener(async m => {
  if (m.type === startAudioContext) {
    loop();
    currentTabId = await getCurrentTabId();
    console.log(currentTabId);
    createAudioCapture(currentTabId)
      .then(ac => {
        audioCaptures[currentTabId] = ac;
        Object.keys(audioCaptures).forEach(tabId => {
          console.log(tabId, currentTabId);
          audioCaptures[Number.parseInt(tabId)].active = tabId == currentTabId;
        });
      })
      .catch(e => console.warn(e));
  }

  if (m.type === popupClose) {
    console.log("popup closed");
  }
});

function loop() {
  const res = requestData();
  if (res) {
    const { buffer, minDecibels, maxDecibels } = res;
    window.chrome.runtime.sendMessage({
      type: frequencyInfo,
      payload: { buffer, sampleRate: SAMPLE_RATE, minDecibels, maxDecibels }
    });
  } else {
    console.log("no data recieved");
  }
  setTimeout(loop, FRAME_INTERVAL_MS);
}

function requestData() {
  const currentAc = audioCaptures[currentTabId];
  if (!currentAc || !currentAc.active) return;
  const buffSize = currentAc.anal.frequencyBinCount;
  const buffer = new Uint8Array(buffSize);
  currentAc.anal.getByteFrequencyData(buffer);
  return {
    buffer,
    minDecibels: currentAc.anal.minDecibels,
    maxDecibels: currentAc.anal.maxDecibels
  };
}

/**
 * @param {number} tabId
 * @returns {Promise<AudioCapture>}
 */
async function createAudioCapture(tabId) {
  const currentAc = audioCaptures[tabId];
  if (currentAc && !currentAc.disconnected) {
    currentAc.active = true;
    return currentAc;
  }
  return new Promise((resolve, reject) => {
    window.chrome.tabCapture.capture({ audio: true }, async stream => {
      try {
        const audioCtx = new AudioContext({
          sampleRate: SAMPLE_RATE,
          latencyHint: "balanced"
        });
        const source = audioCtx.createMediaStreamSource(stream);
        await audioCtx.audioWorklet.addModule("./bypasser.js");
        return resolve(new AudioCapture(source, audioCtx, stream));
      } catch (e) {
        return reject(e);
      }
    });
  });
}

async function getCurrentTabId() {
  return new Promise((resolve, reject) => {
    window.chrome.tabs.query(
      {
        currentWindow: true,
        active: true
      },
      tabs => {
        resolve(tabs[0].id);
      }
    );
  });
}
