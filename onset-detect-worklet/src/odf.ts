import * as tf from "@tensorflow/tfjs";

export default function(buffer: number[], frameSize = 512, hopSize = 128) {
  const powerOf2 = (n: number): boolean => Number.isInteger(Math.log2(n));
  if (!powerOf2(frameSize) || !powerOf2(hopSize)) {
    throw new Error("Invalid args: frameSize and hopSize both must be powers of 2");
  }
  const numFrames = buffer.length / hopSize;
  if (!Number.isInteger(numFrames)) {
    throw new Error("Length of buffer is not divisible by hopSize.");
  }
  const stft: tf.Tensor1D[] = tf
    .range(0, numFrames)
    .arraySync()
    .map(i => tf.tensor1d(buffer.slice(i * hopSize, i * hopSize + frameSize)))
    .map(frame => tf.spectral.rfft(frame) as tf.Tensor1D);
  return stft.reduce((acc: tf.Scalar[], cur, idx, arr) => {
    if (idx === 0) return acc;
    const norm = tf.norm(tf.sub(cur, arr[idx - 1]), "euclidean").asScalar();
    acc.push(norm);
    return acc;
  }, []);
}
