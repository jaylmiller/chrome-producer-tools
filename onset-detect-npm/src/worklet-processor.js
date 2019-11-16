import * as tf from "@tensorflow/tfjs";

/**
 *
 * @param {Float32Array} buffer
 * @param {number} frameSize
 * @param {number} hopSize
 * @returns {tf.Scalar[]}
 */
export default function(buffer, frameSize = 512, hopSize = 128) {
  const powerOf2 = n => Number.isInteger(Math.log2(n));
  if (!powerOf2(frameSize) || !powerOf2(hopSize)) {
    throw new Error("Invalid args: frameSize and hopSize both must be powers of 2");
  }
  const numFrames = buffer.length / hopSize;
  if (!Number.isInteger(numFrames)) {
    throw new Error("Length of buffer is not divisible by hopSize.");
  }
  const stft = tf
    .range(0, numFrames)
    .arraySync()
    .map(i => tf.tensor1d(buffer.slice(i * hopSize, i * hopSize + frameSize)))
    .map(frame => tf.spectral.rfft(frame));
  return stft.reduce((acc, cur, idx, arr) => {
    if (idx === 0) return acc;
    const norm = tf.norm(tf.sub(cur, arr[idx - 1]), "euclidean").asScalar();
    acc.push(norm);
    return acc;
  }, []);
}

class OnsetDetectProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {}
}

registerProcessor("onset-detect-processor", OnsetDetectProcessor);
