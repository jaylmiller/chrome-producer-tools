/**
 * @param {AudioContext} ctx
 * @returns {Promise<AudioWorkletNode>}
 */
export default function(ctx) {
  return ctx.audioWorklet
    .addModule("worklet-processor.js")
    .then(() => new AudioWorkletNode(ctx, "onset-detect-processor"));
}
