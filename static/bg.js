(function () {
  'use strict';

  // --- Config ---
  var PIXEL_SCALE = 1;
  var FLOW_STEP = 10; // compute flow every Nth pixel, interpolate between

  // Dot grid density levels — matches site's pattern language
  // spacing/checker packed into flat arrays for hot-loop access
  var LEVEL_SPACING = [0, 16, 8, 6, 4, 4, 2, 2, 1];
  var LEVEL_CHECKER = [0, 0, 0, 1, 0, 1, 0, 1, 0];

  // Precompute brightness-to-level lookup (256 entries)
  var LEVEL_MINS = [0.00, 0.02, 0.06, 0.12, 0.18, 0.26, 0.36, 0.50, 0.70];
  var LEVEL_LUT = new Uint8Array(256);
  (function () {
    for (var i = 0; i < 256; i++) {
      var b = i / 255;
      var lvl = 0;
      for (var j = 1; j < LEVEL_MINS.length; j++) {
        if (b >= LEVEL_MINS[j]) lvl = j;
        else break;
      }
      LEVEL_LUT[i] = lvl;
    }
  })();

  // --- Zone config ---
  var TRANSITION_WIDTH = 200; // pixels to blend animated → static
  var MAX_ANIM_WIDTH = 320;   // max animated zone width (caps on wide screens)

  // Animated zone boundaries (in canvas pixels)
  // Desktop: vertical strip on left. Tablet/mobile: horizontal strip on top.
  var zoneMode = 'left'; // 'left' or 'top'
  var zoneStart = 0;     // x where animated zone begins (0 unless oversize)
  var zoneTransStart = 0; // zoneStart - TRANSITION_WIDTH (left-side blend)
  var zoneEnd = 0;       // x or y boundary where animated zone ends
  var zoneTransEnd = 0;  // zoneEnd + TRANSITION_WIDTH
  var rippleOffsetX = 0; // x offset for ripple origin (sidebar left edge)

  // --- State ---
  var canvas, ctx, imgData, pixels32;
  var W, H, rW, rH;
  var grid = null;
  var gridSize = 0;
  var mouse = { x: -1, y: -1 };
  var targetMouse = { x: -1, y: -1 };
  var mouseActive = false;
  var bgRgb, midRgb;
  var running = true;

  // Packed 32-bit colors (ABGR on little-endian)
  var bgColor32 = 0;
  var fgColor32 = 0;

  // Cursor trail: ring buffer of recent positions with fade
  var TRAIL_LENGTH = 500;
  var trail = [];
  var trailHead = 0;
  var trailFade = 0; // global trail opacity (0 = invisible, 1 = full)
  var lastTrailX = -1, lastTrailY = -1; // last recorded trail position (canvas coords)
  var lastMouseX = -1, lastMouseY = -1;
  var mouseMoving = false;
  var stationaryTime = 0; // how long cursor has been still
  var STATIONARY_DELAY = 1.5; // seconds before fade begins

  var TRAIL_INTERP_DIST = 12; // max pixels between trail points before interpolating
  var stationaryFrameCount = 0;
  var STATIONARY_RECORD_LIMIT = 30; // max stationary frames to record (0.5s at 60fps)

  // Pre-allocate trail pool to avoid GC
  function initTrailPool() {
    trail = new Array(TRAIL_LENGTH);
    for (var i = 0; i < TRAIL_LENGTH; i++) {
      trail[i] = { x: 0, y: 0, age: 999 };
    }
  }
  var trailCount = 0; // how many active points

  function addTrailPoint(tx, ty) {
    var p = trail[trailHead];
    p.x = tx;
    p.y = ty;
    p.age = 0;
    trailHead = (trailHead + 1) % TRAIL_LENGTH;
    if (trailCount < TRAIL_LENGTH) trailCount++;
  }

  function clearTrail() {
    for (var i = 0; i < TRAIL_LENGTH; i++) {
      trail[i].age = 999;
    }
    trailCount = 0;
    trailHead = 0;
  }

  function readColors() {
    var style = getComputedStyle(document.documentElement);
    var bg = style.getPropertyValue('--a').trim();
    var mid = style.getPropertyValue('--b').trim();
    bgRgb = hexToRgb(bg);
    midRgb = hexToRgb(mid);
    // Pack as ABGR for Uint32Array writes (little-endian)
    bgColor32 = (255 << 24) | (bgRgb[2] << 16) | (bgRgb[1] << 8) | bgRgb[0];
    fgColor32 = (255 << 24) | (midRgb[2] << 16) | (midRgb[1] << 8) | midRgb[0];
  }

  function hexToRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16)
    ];
  }

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    rW = Math.ceil(W / PIXEL_SCALE);
    rH = Math.ceil(H / PIXEL_SCALE);
    canvas.width = rW;
    canvas.height = rH;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.imageSmoothingEnabled = false;
    imgData = ctx.createImageData(rW, rH);
    pixels32 = new Uint32Array(imgData.data.buffer);
    updateZone();
  }

  function updateZone() {
    var panels = document.querySelector('.content-panels');
    var tw = (W <= 600) ? 0 : Math.ceil(TRANSITION_WIDTH / PIXEL_SCALE);
    zoneStart = 0;
    zoneTransStart = 0;
    rippleOffsetX = 0;

    if (W >= 1024 && panels) {
      // Desktop: sidebar is fixed left, content starts at panels' left edge
      var rect = panels.getBoundingClientRect();
      zoneMode = 'left';
      var sidebarLeft = Math.ceil(rect.left / PIXEL_SCALE);
      var sidebarWidth = sidebarLeft; // sidebar spans from page left to content

      // Cap animated width and add left blend on oversize windows
      if (sidebarWidth > Math.ceil(MAX_ANIM_WIDTH / PIXEL_SCALE)) {
        zoneEnd = sidebarLeft;
        zoneStart = sidebarLeft - Math.ceil(MAX_ANIM_WIDTH / PIXEL_SCALE);
        zoneTransStart = Math.max(0, zoneStart - tw);
      } else {
        zoneEnd = sidebarLeft;
        zoneStart = 0;
        zoneTransStart = 0;
      }

      // Pin ripple to sidebar position (logo is inside .page-header)
      var header = document.querySelector('header.page-header');
      if (header) {
        var headerRect = header.getBoundingClientRect();
        rippleOffsetX = Math.ceil(headerRect.left / PIXEL_SCALE);
        if (rippleOffsetX < 0) rippleOffsetX = 0;
      }
    } else if (W > 600 && panels) {
      // Tablet: header above content, animate down to panels' top edge
      var rect = panels.getBoundingClientRect();
      zoneMode = 'top';
      zoneEnd = Math.ceil(rect.top / PIXEL_SCALE);
    } else if (panels) {
      // Mobile (<= 600px): content is edge-to-edge, no transition needed
      var rect = panels.getBoundingClientRect();
      zoneMode = 'top';
      zoneEnd = Math.ceil(rect.top / PIXEL_SCALE);
    } else {
      // Fallback: animate everything
      zoneMode = 'left';
      zoneEnd = rW;
    }
    zoneTransEnd = zoneEnd + tw;
  }

  // --- Flow noise ---
  function flowAt(sx, sy, time) {
    var angle1 = Math.sin(sx * 0.8 + time * 0.05) * 0.4 +
                 Math.cos(sy * 0.6 + time * 0.035) * 0.3;
    var flow1 = Math.sin(sx * 1.2 + sy * 0.9 + angle1 * 3.0 + time * 0.06);

    var angle2 = Math.cos(sx * 1.3 - time * 0.04) * 0.5 +
                 Math.sin(sy * 1.1 + time * 0.06) * 0.3;
    var flow2 = Math.sin(sx * 2.1 - sy * 1.4 + angle2 * 2.5 + time * 0.07);

    var angle3 = Math.sin(sx * 2.0 + sy * 1.5 + time * 0.08) * 0.4;
    var flow3 = Math.sin(sx * 3.5 + sy * 2.8 + angle3 * 2.0 - time * 0.09);

    var flow4 = Math.sin((sx + sy) * 0.7 + time * 0.04 + Math.sin(time * 0.025) * 2);

    var flow5 = Math.sin(sx * 5.0 - sy * 3.2 + time * 0.1) * 0.5 +
                Math.cos(sx * 4.2 + sy * 4.8 - time * 0.08) * 0.5;

    var v = flow1 * 0.25 + flow2 * 0.22 + flow3 * 0.18 + flow4 * 0.2 + flow5 * 0.15;
    v = (v + 1) * 0.5;
    v = v * v;
    v *= 0.45;
    return v;
  }

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext('2d');

    readColors();
    initTrailPool();
    resize();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function (e) {
      var nx = e.clientX / W;
      var ny = e.clientY / H;
      if (!mouseActive) {
        mouse.x = nx;
        mouse.y = ny;
        lastMouseX = nx * rW;
        lastMouseY = ny * rH;
        lastTrailX = -1; // prevent interpolation from old position
        lastTrailY = -1;
        clearTrail();
        trailFade = 0;
        stationaryTime = 0;
        mouseActive = true;
      }
      targetMouse.x = nx;
      targetMouse.y = ny;
      // Record trail points, interpolating to fill gaps on fast moves
      var tx = nx * rW;
      var ty = ny * rH;
      if (lastTrailX >= 0) {
        var tdx = tx - lastTrailX;
        var tdy = ty - lastTrailY;
        var dist = Math.sqrt(tdx * tdx + tdy * tdy);
        if (dist > TRAIL_INTERP_DIST) {
          var steps = Math.min(Math.ceil(dist / TRAIL_INTERP_DIST), 10);
          for (var si = 1; si < steps; si++) {
            var t = si / steps;
            addTrailPoint(lastTrailX + tdx * t, lastTrailY + tdy * t);
          }
        }
      }
      addTrailPoint(tx, ty);
      lastTrailX = tx;
      lastTrailY = ty;
    });
    window.addEventListener('mouseleave', function () {
      mouseActive = false;
      lastTrailX = -1;
      lastTrailY = -1;
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        running = false;
      } else {
        running = true;
        readColors();
        requestAnimationFrame(frame);
      }
    });

    requestAnimationFrame(frame);
  }

  // --- Render ---
  var time = 0;
  var lastFrameTime = 0;

  function frame(timestamp) {
    if (!running) return;
    if (!lastFrameTime) lastFrameTime = timestamp;
    var dt = Math.min((timestamp - lastFrameTime) / 1000, 0.05);
    lastFrameTime = timestamp;
    time += dt;

    if (mouseActive) {
      mouse.x = targetMouse.x;
      mouse.y = targetMouse.y;

      var dx = mouse.x * rW - lastMouseX;
      var dy = mouse.y * rH - lastMouseY;
      mouseMoving = (dx * dx + dy * dy) > 0.5;
      lastMouseX = mouse.x * rW;
      lastMouseY = mouse.y * rH;

      // Record stationary trail points so trail stays alive (limited)
      if (!mouseMoving && trailFade > 0 && stationaryFrameCount < STATIONARY_RECORD_LIMIT) {
        addTrailPoint(mouse.x * rW, mouse.y * rH);
        stationaryFrameCount++;
      }
    }

    // Track stationary time
    if (mouseMoving && mouseActive) {
      stationaryTime = 0;
      stationaryFrameCount = 0;
    } else {
      stationaryTime += dt;
    }

    // Fade trail in/out
    var trailTarget;
    if (mouseActive && mouseMoving) {
      trailTarget = 1;
    } else if (stationaryTime > STATIONARY_DELAY || !mouseActive) {
      trailTarget = 0;
    } else {
      trailTarget = 1;
    }
    var fadeLerp = 1 - Math.pow(1 - 0.04, dt * 60);
    trailFade += (trailTarget - trailFade) * fadeLerp;
    if (trailFade < 0.001) trailFade = 0;

    // Age trail points and build live list in one pass
    var trailRadius = 80;
    var trailRadiusSq = trailRadius * trailRadius;
    var trailInvR = 1 / trailRadius;
    var trailMaxAge = 2.0;

    var trailMinX = 1e9, trailMinY = 1e9, trailMaxX = -1e9, trailMaxY = -1e9;
    var liveTrail = [];
    var hasTrail = trailFade > 0 && trailCount > 0;
    if (hasTrail) {
      for (var ti = 0; ti < TRAIL_LENGTH; ti++) {
        var tp = trail[ti];
        tp.age += dt;
        if (tp.age >= trailMaxAge) continue;
        liveTrail.push(tp);
        var tpx = tp.x, tpy = tp.y;
        if (tpx - trailRadius < trailMinX) trailMinX = tpx - trailRadius;
        if (tpy - trailRadius < trailMinY) trailMinY = tpy - trailRadius;
        if (tpx + trailRadius > trailMaxX) trailMaxX = tpx + trailRadius;
        if (tpy + trailRadius > trailMaxY) trailMaxY = tpy + trailRadius;
      }
      if (liveTrail.length === 0) hasTrail = false;
    } else {
      // Still need to age points even when trail not visible
      for (var ti = 0; ti < TRAIL_LENGTH; ti++) {
        trail[ti].age += dt;
      }
    }
    var liveTrailLen = liveTrail.length;

    var bg32 = bgColor32;
    var fg32 = fgColor32;

    // Fixed ripple — pinned to sidebar position on oversize windows
    var rippleOrigin = (W <= 600) ? 54 : 72;
    var rippleCx = rippleOffsetX + rippleOrigin / PIXEL_SCALE;
    var rippleCy = rippleOrigin / PIXEL_SCALE;
    var rippleRadius = Math.min(rW, rH) * 0.4;
    var rippleInvR = 1 / rippleRadius;

    // Build coarse flow grid
    var step = FLOW_STEP;
    var gW = ((rW / step) | 0) + 2;
    var gH = ((rH / step) | 0) + 2;
    var needed = gW * gH;
    if (!grid || gridSize < needed) {
      grid = new Float32Array(needed);
      gridSize = needed;
    }

    var invRW = 1 / rW;
    var invRH = 1 / rH;

    // Determine grid bounds for animated zone
    var transW = Math.ceil(TRANSITION_WIDTH / PIXEL_SCALE);
    var animGridMin = 0; // min grid index for animated+transition zone (left side)
    var animGridMax; // max grid index (exclusive) for animated+transition zone
    if (zoneMode === 'left') {
      animGridMin = ((zoneTransStart / step) | 0);
      if (animGridMin < 0) animGridMin = 0;
      animGridMax = ((zoneTransEnd / step) | 0) + 2;
      if (animGridMax > gW) animGridMax = gW;
    } else {
      animGridMax = gH; // in 'top' mode, we limit by row below
    }
    var animGridRowMax; // for 'top' mode
    if (zoneMode === 'top') {
      animGridRowMax = ((zoneTransEnd / step) | 0) + 2;
      if (animGridRowMax > gH) animGridRowMax = gH;
    } else {
      animGridRowMax = gH;
    }

    for (var gy = 0; gy < gH; gy++) {
      var py = gy * step;
      var ny = py * invRH;
      var sy = ny * 6;
      var gOff = gy * gW;

      // In 'top' mode, skip expensive computation for rows below the zone
      var rowInAnimZone = (zoneMode === 'top') ? (gy < animGridRowMax) : true;

      var rdy = py - rippleCy;
      var rdySq = rdy * rdy;
      var rowInTrailY = hasTrail && py >= trailMinY && py <= trailMaxY;

      // Determine column limits for this row
      var colMin = rowInAnimZone ? ((zoneMode === 'left') ? animGridMin : 0) : gW;
      var colLimit = rowInAnimZone ? ((zoneMode === 'left') ? animGridMax : gW) : 0;

      for (var gx = 0; gx < gW; gx++) {
        if (gx < colMin || gx >= colLimit) {
          // Outside animated zone — set grid to 0 (static dot grid)
          grid[gOff + gx] = 0;
          continue;
        }

        var px = gx * step;
        var nx = px * invRW;
        var sx = nx * 6;

        // Fixed ripple under logo
        var rdx = px - rippleCx;
        var rDist = Math.sqrt(rdx * rdx + rdySq);
        var rFalloff = 1 - Math.min(1, rDist * rippleInvR);
        rFalloff = rFalloff * rFalloff;
        var ripple = Math.sin(rDist * 0.05 - time * 0.8) * rFalloff * 0.25;

        // Trail brightness — skip if outside bounding box
        var trailBright = 0;
        if (rowInTrailY && px >= trailMinX && px <= trailMaxX) {
          for (var ti = 0; ti < liveTrailLen; ti++) {
            var tp = liveTrail[ti];
            var ageFade = 1 - tp.age / trailMaxAge;
            var tdx = px - tp.x;
            var tdy = py - tp.y;
            var tDistSq = tdx * tdx + tdy * tdy;
            if (tDistSq >= trailRadiusSq) continue;
            var tFalloff = 1 - Math.sqrt(tDistSq) * trailInvR;
            trailBright += tFalloff * ageFade * 0.06;
          }
          if (trailBright > 0.5) trailBright = 0.5;
          trailBright *= trailFade;
        }

        var base = flowAt(sx, sy, time) + ripple;
        if (base < 0) base = 0;
        var val = base + trailBright;

        // Apply transition fade at zone boundaries
        if (zoneMode === 'left' && px > zoneEnd) {
          val *= 1 - (px - zoneEnd) / transW;
          if (val < 0) val = 0;
        } else if (zoneMode === 'left' && zoneStart > 0 && px < zoneStart) {
          // Left-side blend on oversize windows
          val *= (px - zoneTransStart) / transW;
          if (val < 0) val = 0;
        } else if (zoneMode === 'top' && py > zoneEnd) {
          val *= 1 - (py - zoneEnd) / transW;
          if (val < 0) val = 0;
        }

        grid[gOff + gx] = val;
      }
    }

    // Per-pixel rendering
    var invStep = 1 / step;
    var BG_SPACING = 16;
    var BG_HALF = BG_SPACING >> 1;
    var buf = pixels32;

    // Pixel boundaries for static-only zones (no interpolation needed)
    var staticRightStart; // right-side static zone start
    var staticLeftEnd;    // left-side static zone end (oversize windows)
    if (zoneMode === 'left') {
      staticRightStart = zoneTransEnd < rW ? zoneTransEnd : rW;
      staticLeftEnd = zoneTransStart > 0 ? zoneTransStart : 0;
    } else {
      staticRightStart = rW;
      staticLeftEnd = 0;
    }
    var staticRowStart = (zoneMode === 'top') ? (zoneTransEnd < rH ? zoneTransEnd : rH) : rH;

    for (var y = 0; y < rH; y++) {
      var yOff = y * rW;
      var bgRow = y % BG_SPACING;
      var bgIsOddRow = (Math.floor(y / BG_SPACING) & 1) === 1;
      var bgXOffset = bgIsOddRow ? BG_HALF : 0;
      var bgDotRow = (bgRow === 0);

      // In 'top' mode, rows below the zone are all static
      if (zoneMode === 'top' && y >= staticRowStart) {
        // Fast static fill for entire row
        for (var x = 0; x < rW; x++) {
          buf[yOff + x] = (bgDotRow && ((x - bgXOffset) % BG_SPACING === 0)) ? fg32 : bg32;
        }
        continue;
      }

      // Left-side static zone (oversize windows)
      if (staticLeftEnd > 0) {
        for (var x = 0; x < staticLeftEnd; x++) {
          buf[yOff + x] = (bgDotRow && ((x - bgXOffset) % BG_SPACING === 0)) ? fg32 : bg32;
        }
      }

      var gyf = y * invStep;
      var gy0 = gyf | 0;
      var fy = gyf - gy0;
      var rowA = gy0 * gW;
      var rowB = (gy0 + 1) * gW;

      // Animated zone pixels (with bilinear interpolation)
      var xStart = staticLeftEnd;
      var xLimit = (zoneMode === 'left') ? (staticRightStart < rW ? staticRightStart : rW) : rW;
      for (var x = xStart; x < xLimit; x++) {
        var gxf = x * invStep;
        var gx0 = gxf | 0;
        var fx = gxf - gx0;

        var a = grid[rowA + gx0];
        var b = grid[rowA + gx0 + 1];
        var c = grid[rowB + gx0];
        var d = grid[rowB + gx0 + 1];
        var brightness = a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;

        var isOn;

        if (brightness > 0.02) {
          var li = (brightness * 255) | 0;
          if (li > 255) li = 255;
          var lvl = LEVEL_LUT[li];
          var sp = LEVEL_SPACING[lvl];
          if (sp === 1) {
            isOn = true;
          } else if (LEVEL_CHECKER[lvl]) {
            var half = sp >> 1;
            var mx = x % sp;
            var my = y % sp;
            isOn = (mx === 0 && my === 0) || (mx === half && my === half);
          } else {
            isOn = (x % sp === 0) && (y % sp === 0);
          }
        } else {
          isOn = bgDotRow && ((x - bgXOffset) % BG_SPACING === 0);
        }

        buf[yOff + x] = isOn ? fg32 : bg32;
      }

      // Static zone pixels (cheap — no interpolation)
      if (zoneMode === 'left') {
        for (var x = xLimit; x < rW; x++) {
          buf[yOff + x] = (bgDotRow && ((x - bgXOffset) % BG_SPACING === 0)) ? fg32 : bg32;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
