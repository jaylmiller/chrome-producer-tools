const {
	range,
	norm,
	sub,
	tensor1d,
	Scalar,
	spectral,
	real,
	getBackend
} = require("@tensorflow/tfjs");

/**
 *
 * @param {Float32Array} buffer
 * @param {number} frameSize
 * @param {number} hopSize
 * @returns {Scalar[]}
 */
function odf(inputBuffer, frameSize = 512, hopSize = 128) {
	const buffer = tensor1d(inputBuffer, "float32");
	const powerOf2 = n => Number.isInteger(Math.log2(n));
	if (!powerOf2(frameSize) || !powerOf2(hopSize)) {
		throw new Error("Invalid args: frameSize and hopSize both must be powers of 2");
	}
	const numFrames = (buffer.size - frameSize) / hopSize;
	if (!Number.isInteger(numFrames)) {
		throw new Error("Length of buffer is not divisible by hopSize.");
	}
	const stft = range(0, numFrames)
		.arraySync()
		.map(i => {
			return buffer.slice(i * hopSize, frameSize);
		})
		.map(frame => {
			return real(spectral.rfft(frame)).flatten();
		});
	return stft
		.reduce((acc, cur, idx, arr) => {
			if (idx === 0) return acc;
			const normVal = norm(sub(cur, arr[idx - 1]), "euclidean").asScalar();
			acc.push(normVal);
			return acc;
		}, [])
		.map(a => a.arraySync());
}

module.exports = odf;
