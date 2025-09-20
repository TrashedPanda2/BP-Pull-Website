window.loadLightHeader = function(attachTo) {
  if (!window.FinisherHeader) return;
  new FinisherHeader({
    attachTo,
    count: 90,
    size: { min: 1, max: 20, pulse: 0 },
    speed: { x: { min: 0, max: 0.4 }, y: { min: 0, max: 0.1 } },
    colors: { background: "#ffffff", particles: ["#000000"] },
    blending: "screen",
    opacity: { center: 0, edge: 0.5 },
    skew: -2,
    shapes: ["c","s","t"]
  });
}
