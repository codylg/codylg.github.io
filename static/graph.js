(function () {
  const svgNS = 'http://www.w3.org/2000/svg';
  const wrap = document.getElementById('graphWrap');
  const svg = document.getElementById('graphSvg');
  const defs = svg.querySelector('defs');
  const nodes = Array.from(wrap.querySelectorAll('.node'));
  const pulseRgb = "78, 60, 150";

  // Edges reference nodes by index in the `nodes` array above.
  const edges = [
    [0, 1], [0, 2], [1, 2], [1, 3], [3, 6],
    [3, 8], [4, 5], [4, 7], [6, 7], [6, 8], [5, 1], [4, 3]
  ];

  const lines = edges.map(() => {
    const line = document.createElementNS(svgNS, 'line');
    line.classList.add('line-base');
    svg.appendChild(line);
    return line;
  });

  const pulses = edges.map((_, i) => {
    const gradId = `pulse-grad-${i}`;
    const gradient = document.createElementNS(svgNS, 'linearGradient');
    gradient.setAttribute('id', gradId);
    gradient.setAttribute('gradientUnits', 'userSpaceOnUse');
    const stops = [0, 0, 0.5, 1, 1].map(off => {
      const stop = document.createElementNS(svgNS, 'stop');
      stop.setAttribute('offset', String(off));
      gradient.appendChild(stop);
      return stop;
    });
    defs.appendChild(gradient);

    const pulseLine = document.createElementNS(svgNS, 'line');
    pulseLine.classList.add('line-pulse');
    pulseLine.setAttribute('stroke', `url(#${gradId})`);
    svg.appendChild(pulseLine);

    // Travel duration stays fast (matches the original feel); the idle gap
    // between pulses is what makes them fire less often.
    const travelDur = 0.5 + Math.random() * 0.24;
    const idleDur = 5 + Math.random() * 5;
    const period = travelDur + idleDur;

    return {
      gradient,
      stops,
      line: pulseLine,
      travelDur,
      period,
      offset: Math.random() * period
    };
  });

  const state = nodes.map(el => ({
    el,
    baseX: parseFloat(el.dataset.x),
    baseY: parseFloat(el.dataset.y),
    amp: parseFloat(el.dataset.amp) || 6,
    speed: parseFloat(el.dataset.speed) || 1,
    phase: parseFloat(el.dataset.phase) || 0,
    scale: parseFloat(el.dataset.scale) || 1
  }));

  // Base position is set once as a static percentage — only `transform`
  // changes per frame, so floating stays on the compositor and doesn't jitter.
  state.forEach(n => {
    n.el.style.left = n.baseX + '%';
    n.el.style.top = n.baseY + '%';
  });

  function layout() {
    const rect = wrap.getBoundingClientRect();
    const t = performance.now() / 1000;
    // Reference design width the amp/speed values were tuned at — scaling
    // the float range keeps drift proportional on smaller containers too.
    const ampScale = rect.width / 640;

    state.forEach(n => {
      const amp = n.amp * ampScale;
      const dx = Math.sin(t * n.speed + n.phase) * amp * 1.3;
      const dy = Math.cos(t * n.speed * 0.8 + n.phase) * amp * 1.5;
      n.el.style.transform = `translate(-50%, -50%) scale(${n.scale}) translate(${dx}px, ${dy}px)`;
      n._x = (n.baseX / 100) * rect.width + dx;
      n._y = (n.baseY / 100) * rect.height + dy;
    });

    edges.forEach(([a, b], i) => {
      const na = state[a], nb = state[b];
      const line = lines[i];
      line.setAttribute('x1', na._x);
      line.setAttribute('y1', na._y);
      line.setAttribute('x2', nb._x);
      line.setAttribute('y2', nb._y);

      const pulse = pulses[i];
      pulse.line.setAttribute('x1', na._x);
      pulse.line.setAttribute('y1', na._y);
      pulse.line.setAttribute('x2', nb._x);
      pulse.line.setAttribute('y2', nb._y);
      pulse.gradient.setAttribute('x1', na._x);
      pulse.gradient.setAttribute('y1', na._y);
      pulse.gradient.setAttribute('x2', nb._x);
      pulse.gradient.setAttribute('y2', nb._y);

      const localT = (t + pulse.offset) % pulse.period;
      const traveling = localT < pulse.travelDur;
      const p = traveling ? localT / pulse.travelDur : 1;
      const peakAlpha = traveling ? 0.95 : 0;
      const spread = 0.16;
      const lo = Math.max(0, p - spread);
      const hi = Math.min(1, p + spread);
      const offsets = [0, lo, p, hi, 1];
      const alphas = [0, 0, peakAlpha, 0, 0];
      pulse.stops.forEach((stop, si) => {
        stop.setAttribute('offset', String(offsets[si]));
        stop.setAttribute('stop-color', `rgba(${pulseRgb},${alphas[si]})`);
      });
    });

    requestAnimationFrame(layout);
  }

  requestAnimationFrame(layout);
})();
