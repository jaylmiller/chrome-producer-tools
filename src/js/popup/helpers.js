const xToFreq = (x, binSize, stepSize) => {
  if (!x || !binSize || !stepSize) return 0;
  return binSize * (Math.pow(10, x / stepSize) - 1);
};
