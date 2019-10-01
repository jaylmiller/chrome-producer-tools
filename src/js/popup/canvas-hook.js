import { useRef, useEffect } from "react";

export function useCanvas(draw) {
  const context = "2d";
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext(context);
    let animationFrameId = requestAnimationFrame(renderFrame);

    function renderFrame() {
      animationFrameId = requestAnimationFrame(renderFrame);
      draw(ctx);
    }

    return () => cancelAnimationFrame(animationFrameId);
  });

  return canvasRef;
}

// export function useD3Canvas(draw, width, height) {
//   useEffect(() => {
//     d3.
//   })
//   const canvas = d3
//     .select("#canvasContainer")
//     .append("canvas")
//     .attr("width", width)
//     .attr("height", height);
//   const ctx = canvas.node().getContext('2d');
// }
