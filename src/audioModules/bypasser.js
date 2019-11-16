// import { guess, analyze } from "web-audio-beat-detector";

/**
 * A simple bypass node demo.
 *
 * @class BypassProcessor
 * @extends AudioWorkletProcessor
 */
class BypassProcessor extends AudioWorkletProcessor {
	// When constructor() undefined, the default constructor will be
	// implicitly used.

	static get parameterDescriptors() {
		return [
			{
				name: "bufferSize",
				// defaultValue: 65536 * 2,
				defaultValue: 65536,
				minValue: 4096,
				maxValue: 262144
			}
		];
	}

	/** @type {Float32Array[]} */
	buffer;
	offset = 0;
	/**
	 *
	 * @param {Float32Array[]} inputs
	 * @param {Float32Array[]} outputs
	 * @param {any} parameters
	 */
	process(inputs, outputs, parameters) {
		if (!this.buffer) {
			console.log(inputs);
			console.log(outputs);
			this.buffer = [
				new Float32Array(parameters.bufferSize[0]),
				new Float32Array(parameters.bufferSize[0])
			];
		}
		for (let channel = 0; channel < outputs[0].length; ++channel) {
			outputs[0][channel].set(inputs[0][channel]);
		}
		this.buffer[0].set(inputs[0][0], this.offset);
		this.buffer[1].set(inputs[0][1], this.offset);
		this.offset += inputs[0][0].length;
		if (this.offset >= parameters.bufferSize[0]) {
			this.port.postMessage(this.buffer);
			this.buffer = null;
			this.offset = 0;
		}
		return true;
	}
}

registerProcessor("bypass-processor", BypassProcessor);
