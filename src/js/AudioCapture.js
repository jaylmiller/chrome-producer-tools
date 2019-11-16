import { guess, analyze } from "web-audio-beat-detector";
import { startAudioContext, bpmMessage, popupClose } from "./messages";
import Wav from "wavefile/dist/wavefile.umd";
// import Wav from "wavefile";

export class AudioCapture {
	channels = 2;
	bitDepth = 32;
	weight = 0.95;
	/** @type {AudioContext} */
	audioCtx;
	/** @type {AnalyserNode} */
	anal;
	/** @type {GainNode} */
	input;
	/** @type {AudioWorkletNode} */
	bypasser;
	/** @type {MediaStreamAudioSourceNode} */
	source;
	/** @type {MediaStream} */
	stream;

	lastBpm = 0;
	offset = 0;
	/**@type {Float32Array[]} */
	recordedBuffers = Array.from(Array(this.channels)).map(() => new Float32Array(0));
	/**@type {Float32Array[]} */
	bufferStore = [];
	// eslint-disable-next-line no-undef
	bufferCount = Number.parseInt(process.env.NUM_BUFFERS) || 5;

	active = true;

	disconnected = false;
	/**
	 * @param {MediaStreamAudioSourceNode} sourceIn
	 * @param {AudioContext} audioContext
	 * @param {MediaStream} stream
	 */
	constructor(sourceIn, audioContext, stream) {
		this.stream = stream;
		this.audioCtx = audioContext;
		this.source = sourceIn;
		// source.connect(bufferSource);
		this.input = this.audioCtx.createGain();
		//source.connect(input);
		//this.bypasser = new AudioWorkletNode(this.audioCtx, "bypass-processor");
		this.bypasser = new AudioWorkletNode(this.audioCtx, "onset-detect-processor");
		// console.log(bypasser.parameters);
		this.source.connect(this.bypasser);
		this.anal = this.audioCtx.createAnalyser();
		this.anal.fftSize = 8192;
		this.bypasser.connect(this.anal);
		this.anal.connect(this.audioCtx.destination);

		this.bypasser.port.onmessage = e => {
			this.receiveBuffer(e.data);
		};
		// });
	}

	/**
	 *
	 * @param {Float32Array[]} newBuffers
	 */
	async receiveBuffer(newBuffers) {
		if (!this.active) return;
		const zeroes = await Promise.all(newBuffers.map(buff => this.checkZeroes(buff)));
		// this.checkZeroes(newBuffers);
		if (zeroes.every(z => z)) {
			this.disconnectAll();
		}
		this.recordedBuffers = this.recordedBuffers.map((buff, i) => {
			const tempBuff = new Float32Array(buff.length + newBuffers[i].length);
			tempBuff.set(buff, 0);
			tempBuff.set(newBuffers[i], buff.length);
			// return Int32Array.from(tempBuff.map(b => b * Math.pow(2, this.bitDepth - 1)));
			return tempBuff;
		});

		// if (this.recordedBuffers[0].length >= 44100 * 5) {
		//   const wav = new Wav();
		//   wav.fromScratch(2, 44100, "32f", newBuffers.map(b => Array.from(b)));
		//   const uri = wav.toDataURI();
		//   const a = document.createElement("a");
		//   a.href = uri;
		//   a.setAttribute("download", "testfile.wav");
		//   a.click();
		//   debugger;
		// }
		// BPM DETECTOR STUFF BELOW

		/* const audioBuffer = this.audioCtx.createBuffer(1, newBuffer.length, 44100);
    audioBuffer.copyToChannel(newBuffer, 0);
    guess(audioBuffer)
      .then(res => {
        console.log("BPM:", res);
        window.chrome.runtime.sendMessage({ type: bpmMessage, payload: res.bpm });
      })
      .catch(e => {
        console.log(e);
        this.bufferStore = [];
      }); */
	}

	//

	async disconnectAll() {
		console.warn("silent tab detected.. shutting down");
		this.stream.getAudioTracks()[0].stop();
		this.anal.disconnect();
		this.bypasser.disconnect();
		this.source.disconnect();
		this.disconnected = true;
		await this.audioCtx.close();
	}
	/**
	 *
	 * @param {Float32Array} newBuffer
	 * @returns {boolean}
	 */
	async checkZeroes(newBuffer) {
		return newBuffer.every(e => e === 0);
	}
	/**
	 * @param {Float32Array} buffer
	 * @returns {Promise<boolean>}
	 */
	async checkSnippet(newBuffer) {
		return true;
	}
	async checkSnippet2(newBuffer) {
		const audioBuffer = this.audioCtx.createBuffer(1, newBuffer.length, 44100);
		audioBuffer.copyToChannel(newBuffer, 0);
		return analyze(audioBuffer)
			.then(() => true)
			.catch(() => false);
	}

	async recieveBuffer2(newBuffer) {
		debugger;
		if (!this.active) return;
		const zeroes = await this.checkZeroes(newBuffer);
		if (zeroes) {
			this.disconnectAll();
		}
		// const check = await this.checkSnippet(newBuffer);
		// if (!check) {
		//   this.bufferStore = [];
		// }
		if (this.bufferStore.length < this.bufferCount) {
			this.bufferStore.push(newBuffer);
		} else {
			this.bufferStore.shift();
			this.bufferStore.push(newBuffer);
		}
		const len = newBuffer.length;
		/** @type {Float32Array} */
		const buffer = new Float32Array(len * this.bufferStore.length);
		this.bufferStore.forEach((b, i) => {
			buffer.set(b, len * i);
		});
		const audioBuffer = this.audioCtx.createBuffer(1, buffer.length, 44100);
		audioBuffer.copyToChannel(buffer, 0);
		guess(audioBuffer)
			.then(res => {
				console.log("BPM:", res);
				window.chrome.runtime.sendMessage({ type: bpmMessage, payload: res.bpm });
			})
			.catch(e => {
				console.log(e);
				this.bufferStore = [];
			});
	}
}
