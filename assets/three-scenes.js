/* ─────────────────────────────────────────────
   Three.js scenes — loaded as a module on every page.
   - #hero-3d           → 3D network graph (home only)
   - .page-header-3d    → small rotating wireframe (inner pages)
   - .cta-3d            → particle flow-field background (CTA strips)
   Skipped if prefers-reduced-motion is set.
   ───────────────────────────────────────────── */

import * as THREE from 'three';

const REDUCED = window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const DPR_CAP = 2;

/* Read --amber from CSS at runtime; refresh when the theme attribute flips. */
function amberHex() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--amber').trim();
  if (v.startsWith('#')) return v;
  return '#f0a500';
}
function amberGlowHex() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue('--amber-glow').trim();
  if (v.startsWith('#')) return v;
  return '#ffc444';
}

/* Container-visibility observer — pauses rendering when scene leaves viewport
   to save CPU/GPU on long pages. */
function visibilityRunner(container, render) {
  let visible = true;
  const io = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
  }, { rootMargin: '50px' });
  io.observe(container);

  function tick() {
    if (visible) render();
    requestAnimationFrame(tick);
  }
  tick();
}

/* ─── 1. HERO 3D NETWORK GRAPH ─── */
function initHero3D() {
  const container = document.getElementById('hero-3d');
  if (!container) return;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 220;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP));
  container.appendChild(renderer.domElement);

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  resize();
  window.addEventListener('resize', resize);

  /* Generate node positions on the surface of a slightly noisy sphere */
  const NODE_COUNT = 28;
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const r = 75 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    nodes.push(new THREE.Vector3(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    ));
  }

  /* Nodes as a single Points cloud (cheaper than 28 meshes) */
  const nodePositions = new Float32Array(nodes.length * 3);
  nodes.forEach((n, i) => {
    nodePositions[i*3]   = n.x;
    nodePositions[i*3+1] = n.y;
    nodePositions[i*3+2] = n.z;
  });
  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePositions, 3));
  const nodeMat = new THREE.PointsMaterial({
    color: amberHex(),
    size: 4.2,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: true
  });
  const nodeCloud = new THREE.Points(nodeGeo, nodeMat);

  /* Edges: connect each node to a handful of nearest neighbours */
  const MAX_DIST = 75;
  const edges = [];
  const linePos = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = nodes[i].distanceTo(nodes[j]);
      if (d < MAX_DIST) {
        edges.push([nodes[i], nodes[j]]);
        linePos.push(nodes[i].x, nodes[i].y, nodes[i].z);
        linePos.push(nodes[j].x, nodes[j].y, nodes[j].z);
      }
    }
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: amberHex(),
    transparent: true,
    opacity: 0.16
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);

  /* Pulses — small bright spheres travelling along random edges */
  const PULSE_COUNT = Math.min(6, Math.floor(edges.length / 3));
  const pulseGeo = new THREE.SphereGeometry(2.3, 6, 6);
  const pulseMat = new THREE.MeshBasicMaterial({ color: amberGlowHex() });
  const pulses = [];
  for (let i = 0; i < PULSE_COUNT; i++) {
    const mesh = new THREE.Mesh(pulseGeo, pulseMat);
    mesh.userData = {
      edge: edges[Math.floor(Math.random() * edges.length)],
      t: Math.random(),
      speed: 0.0025 + Math.random() * 0.005
    };
    pulses.push(mesh);
  }

  /* All graph children rotate together */
  const root = new THREE.Group();
  root.add(nodeCloud, lines);
  pulses.forEach(p => root.add(p));
  scene.add(root);

  /* Mouse parallax — gentle tilt toward pointer */
  const target = { x: 0, y: 0 };
  container.addEventListener('pointermove', (e) => {
    const r = container.getBoundingClientRect();
    target.x = ((e.clientY - r.top)  / r.height - 0.5) * 0.6;
    target.y = ((e.clientX - r.left) / r.width  - 0.5) * 0.6;
  });
  container.addEventListener('pointerleave', () => { target.x = 0; target.y = 0; });

  /* Theme-aware colour refresh */
  new MutationObserver(() => {
    const c = amberHex();
    const g = amberGlowHex();
    nodeMat.color.set(c);
    lineMat.color.set(c);
    pulseMat.color.set(g);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  visibilityRunner(container, () => {
    root.rotation.y += 0.0011;
    root.rotation.x += (target.x - root.rotation.x) * 0.03;
    root.rotation.z += (target.y - root.rotation.z) * 0.03;

    pulses.forEach(p => {
      p.userData.t += p.userData.speed;
      if (p.userData.t >= 1) {
        p.userData.t = 0;
        p.userData.edge = edges[Math.floor(Math.random() * edges.length)];
      }
      const [a, b] = p.userData.edge;
      p.position.lerpVectors(a, b, p.userData.t);
    });

    renderer.render(scene, camera);
  });
}

/* ─── 2. PAGE-HEADER WIREFRAME ─── */
function initPageHeader3D() {
  document.querySelectorAll('.page-header-3d').forEach(container => {
    const SIZE = container.clientWidth || 200;

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 36;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP));
    renderer.setSize(SIZE, SIZE);
    container.appendChild(renderer.domElement);

    /* Wireframe icosahedron — minimal, geometric */
    const baseGeo = new THREE.IcosahedronGeometry(13, 0);
    const edgesGeo = new THREE.EdgesGeometry(baseGeo);
    const edgeMat  = new THREE.LineBasicMaterial({
      color: amberHex(),
      transparent: true,
      opacity: 0.75
    });
    const wire = new THREE.LineSegments(edgesGeo, edgeMat);

    /* A second, larger, very-dim wireframe rotating opposite direction
       for depth */
    const outerGeo = new THREE.IcosahedronGeometry(17, 0);
    const outerEdges = new THREE.EdgesGeometry(outerGeo);
    const outerMat = new THREE.LineBasicMaterial({
      color: amberHex(),
      transparent: true,
      opacity: 0.2
    });
    const outerWire = new THREE.LineSegments(outerEdges, outerMat);

    scene.add(wire, outerWire);

    new MutationObserver(() => {
      const c = amberHex();
      edgeMat.color.set(c);
      outerMat.color.set(c);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    visibilityRunner(container, () => {
      wire.rotation.x += 0.005;
      wire.rotation.y += 0.007;
      outerWire.rotation.x -= 0.003;
      outerWire.rotation.y -= 0.004;
      renderer.render(scene, camera);
    });
  });
}

/* ─── 3. CTA STRIP FLOW-FIELD ─── */
function initCTA3D() {
  document.querySelectorAll('.cta-3d').forEach(container => {
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
    camera.position.z = 110;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, DPR_CAP));
    container.appendChild(renderer.domElement);

    function resize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener('resize', resize);

    const COUNT = 220;
    const positions  = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const SX = 200, SY = 80, SZ = 80;
    for (let i = 0; i < COUNT; i++) {
      positions[i*3]   = (Math.random() - 0.5) * SX * 2;
      positions[i*3+1] = (Math.random() - 0.5) * SY * 2;
      positions[i*3+2] = (Math.random() - 0.5) * SZ * 2;
      velocities[i*3]   = (Math.random() - 0.5) * 0.15;
      velocities[i*3+1] = (Math.random() - 0.5) * 0.06 + 0.03; // gentle upward drift
      velocities[i*3+2] = (Math.random() - 0.5) * 0.08;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: amberHex(),
      size: 1.6,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    new MutationObserver(() => {
      mat.color.set(amberHex());
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    visibilityRunner(container, () => {
      const pos = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        pos[i*3]   += velocities[i*3];
        pos[i*3+1] += velocities[i*3+1];
        pos[i*3+2] += velocities[i*3+2];
        /* Wrap around */
        if (pos[i*3]   >  SX) pos[i*3]   = -SX;
        if (pos[i*3]   < -SX) pos[i*3]   =  SX;
        if (pos[i*3+1] >  SY) pos[i*3+1] = -SY;
        if (pos[i*3+1] < -SY) pos[i*3+1] =  SY;
        if (pos[i*3+2] >  SZ) pos[i*3+2] = -SZ;
        if (pos[i*3+2] < -SZ) pos[i*3+2] =  SZ;
      }
      geo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    });
  });
}

/* ─── BOOT ─── */
if (!REDUCED) {
  initHero3D();
  initPageHeader3D();
  initCTA3D();
}
