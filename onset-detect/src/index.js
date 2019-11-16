import odf from "./odf";
//import { setBackend } from "@tensorflow/tfjs";

class OnsetDetectProcessor extends AudioWorkletProcessor {
	static get parameterDescriptors() {
		return [
			{
				name: "bufferSize",
				// defaultValue: 65536 * 2,
				defaultValue: 128,
				minValue: 128,
				maxValue: 128
			}
		];
	}

	frameSize = 512;
	totalBufferSize = this.frameSize * 4;
	/** @type {Float32Array} */
	buffer = new Float32Array(8192);
	offset = 0;
	count = 1;
	/**
	 *
	 * @param {Float32Array[]} inputs
	 * @param {Float32Array[]} outputs
	 * @param {any} parameters
	 */
	process(inputs, outputs) {
		// this.port.postMessage(inputs);
		const sliced = this.buffer.slice(128);
		this.buffer.set(sliced, 128);
		this.buffer.set(inputs[0]);
		if (this.count % 8 === 0) {
			const odfvals = odf(this.buffer, 2048, 1024);
			this.port.postMessage(odfvals);
		}
		this.count = (this.count + 1) % 4;
		// for (let channel = 0; channel < outputs[0].length; ++channel) {
		// 	outputs[0][channel].set(inputs[0][channel]);
		// }
		return true;
	}
}

registerProcessor("onset-detect-processor", OnsetDetectProcessor);
