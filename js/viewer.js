/* HemoAtlas — 3D viewer (Three.js r150). Exposes window.Viewer */
(function () {
  'use strict';
  const T = window.THREE;
  const wrap = document.getElementById('stageWrap');
  const canvas = document.getElementById('stage');
  const noGL = document.getElementById('noGL');
  if (!wrap || !canvas) { window.Viewer = null; return; }
  if (!T) { noGL.hidden = false; window.Viewer = null; return; }

  let renderer;
  try {
    renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) { noGL.hidden = false; window.Viewer = null; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = T.LinearEncoding; // r150 legacy colour mode: colours are authored in display space
  renderer.setClearColor(0x000000, 0);

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(38, 1, 0.1, 200);
  scene.add(new T.HemisphereLight(0xffffff, 0x3a4fa0, 0.7));
  const key = new T.DirectionalLight(0xffffff, 0.9); key.position.set(3, 6, 7); scene.add(key);
  const rim = new T.DirectionalLight(0x7aa8ff, 0.8); rim.position.set(-6, 2, -5); scene.add(rim);
  const warm = new T.PointLight(0xff4d5e, 0.8, 30); warm.position.set(4, -3, 4); scene.add(warm);

  const root = new T.Group(); scene.add(root);
  const bodyG = new T.Group(); root.add(bodyG);
  const heartG = new T.Group(); root.add(heartG);

  const RED = 0xd7263d, BLUE = 0x2f6fe0;
  const V = (a) => new T.Vector3(a[0], a[1], a[2]);

  const pickables = [];
  const registry = {};
  const flows = [];

  function mk(geo, color, o) {
    o = o || {};
    const op = o.opacity === undefined ? 1 : o.opacity;
    const m = new T.MeshPhysicalMaterial({
      color, roughness: o.rough === undefined ? 0.38 : o.rough, metalness: 0,
      clearcoat: o.clear === undefined ? 0.5 : o.clear, clearcoatRoughness: 0.35,
      emissive: o.emis === undefined ? color : o.emis, emissiveIntensity: o.ei === undefined ? 0.12 : o.ei,
      transparent: op < 1, opacity: op, side: o.side || T.FrontSide, depthWrite: op >= 1,
    });
    const mesh = new T.Mesh(geo, m);
    mesh.userData.baseEI = m.emissiveIntensity;
    return mesh;
  }
  function reg(parent, mesh, id, layer) {
    mesh.userData.part = id; mesh.userData.layer = layer;
    parent.add(mesh); pickables.push(mesh);
    (registry[id] = registry[id] || []).push(mesh);
    return mesh;
  }
  function proxy(parent, geo, id, layer) {
    const m = new T.Mesh(geo, new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
    m.userData.proxy = true;
    reg(parent, m, id, layer);
    return m;
  }

  /* ----- vessels ----- */
  const KIND = {
    a: { color: RED, layer: 'arteries', fc: 0xff8794 },
    v: { color: BLUE, layer: 'veins', fc: 0x86b4ff },
    pa: { color: BLUE, layer: 'arteries', fc: 0x86b4ff },
    pv: { color: RED, layer: 'veins', fc: 0xff8794 },
  };
  function addFlow(group, curve, kind, r, layer, speed) {
    const len = curve.getLength();
    const n = Math.max(3, Math.round(len * (speed.density || 2) * 0.55));
    const im = new T.InstancedMesh(new T.SphereGeometry(r, 10, 8), new T.MeshBasicMaterial({ color: kind.fc }), n);
    im.frustumCulled = false;
    group.add(im);
    flows.push({ curve, im, n, len, speed: speed.v, phase: Math.random(), layer, group });
  }
  function vessel(group, id, pts, r, k, opt) {
    opt = opt || {};
    const K = KIND[k];
    if (group === bodyG) r *= 1.55;
    const curve = new T.CatmullRomCurve3(pts.map(V), false, 'catmullrom', 0.5);
    const seg = Math.max(24, pts.length * 14);
    reg(group, mk(new T.TubeGeometry(curve, seg, r, 14, false), K.color, { ei: 0.16, rough: 0.28, clear: 0.7 }), id, K.layer);
    if (r < 0.1) proxy(group, new T.TubeGeometry(curve, Math.round(seg / 2), Math.max(r * 2.4, 0.09), 6, false), id, K.layer);
    if (!opt.noFlow) addFlow(group, curve, K, r * 1.3, K.layer, { v: opt.speed || 1.1, density: opt.density || 2.2 });
    return curve;
  }
  function flowOnly(group, pts, k, r, speed) {
    const curve = new T.CatmullRomCurve3(pts.map(V), false, 'catmullrom', 0.5);
    addFlow(group, curve, KIND[k], r, KIND[k].layer, { v: speed || 1.3, density: 2.6 });
  }

  /* ----- ellipsoid chambers/organs ----- */
  function ellipsoid(parent, id, layer, c, rad, rotZ, color, o) {
    const pivot = new T.Group(); pivot.position.set(c[0], c[1], c[2]); pivot.rotation.z = rotZ || 0;
    parent.add(pivot);
    const mesh = mk(new T.SphereGeometry(1, 56, 36), color, o);
    mesh.scale.set(rad[0], rad[1], rad[2]);
    reg(pivot, mesh, id, layer);
    return { pivot, mesh, surf: (x, y) => rad[2] * Math.sqrt(Math.max(1 - (x / rad[0]) ** 2 - (y / rad[1]) ** 2, 0.03)) };
  }

  /* ================= HEART (heart coordinates) ================= */
  const HC = { op: 0.7 };
  const lv = ellipsoid(heartG, 'lv', 'heart', [0.5, -0.55, 0], [0.8, 1.15, 0.76], 0.35, 0xc92a3f, { opacity: HC.op, ei: 0.2 });
  const rv = ellipsoid(heartG, 'rv', 'heart', [-0.4, -0.45, 0.28], [0.78, 1.05, 0.62], 0.3, 0x3a66cf, { opacity: HC.op, ei: 0.2 });
  ellipsoid(heartG, 'ra', 'heart', [-0.98, 0.5, -0.12], [0.52, 0.62, 0.52], 0, 0x4a7be0, { opacity: HC.op, ei: 0.2 });
  ellipsoid(heartG, 'la', 'heart', [0.88, 0.7, -0.5], [0.55, 0.5, 0.5], 0, 0xe04257, { opacity: HC.op, ei: 0.2 });

  // coronary arteries (on ventricle surfaces, in pivot-local coordinates)
  (function () {
    const lp = [[-0.35, 0.9], [-0.05, 0.68], [0.3, 0.25], [0.45, -0.35], [0.4, -0.95]].map(p => [p[0], p[1], lv.surf(p[0], p[1]) + 0.02]);
    const rp = [[0.35, 0.8], [-0.2, 0.6], [-0.6, 0.15], [-0.62, -0.45], [-0.4, -0.85]].map(p => [p[0], p[1], rv.surf(p[0], p[1]) + 0.02]);
    [[lv, lp], [rv, rp]].forEach(([e, pts]) => {
      const curve = new T.CatmullRomCurve3(pts.map(V));
      reg(e.pivot, mk(new T.TubeGeometry(curve, 30, 0.04, 8, false), 0xff5468, { ei: 0.35, rough: 0.3 }), 'coronary', 'heart');
      proxy(e.pivot, new T.TubeGeometry(curve, 16, 0.11, 6, false), 'coronary', 'heart');
    });
  })();

  // valves (gold rings)
  function valve(id, p, r, rx, rz) {
    const m = mk(new T.TorusGeometry(r, 0.05, 12, 36), 0xf2c14e, { ei: 0.45, rough: 0.25, clear: 0.8 });
    m.position.set(p[0], p[1], p[2]); m.rotation.x = rx; m.rotation.z = rz || 0;
    reg(heartG, m, id, 'heart');
    const pr = new T.Mesh(new T.CylinderGeometry(r + 0.06, r + 0.06, 0.22, 16), new T.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
    pr.position.copy(m.position); pr.rotation.copy(m.rotation); pr.rotation.x += Math.PI / 2 * 0; // cylinder axis y; torus axis z
    pr.rotation.x = m.rotation.x - Math.PI / 2;
    pr.userData.proxy = true; reg(heartG, pr, id, 'heart');
  }
  valve('tricuspid', [-0.72, 0.12, 0.12], 0.27, Math.PI / 2.2, 0.15);
  valve('mitral', [0.68, 0.18, -0.2], 0.24, Math.PI / 2.2, -0.1);
  valve('aorticValve', [0.1, 0.6, 0.05], 0.17, Math.PI / 2, 0);
  valve('pulmValve', [-0.25, 0.64, 0.45], 0.16, Math.PI / 2, 0);

  // SA node
  const sa = mk(new T.SphereGeometry(0.1, 20, 16), 0xffe27a, { ei: 0.9, emis: 0xffd23f, rough: 0.2 });
  sa.position.set(-1.0, 0.95, 0.27); reg(heartG, sa, 'sa', 'heart');
  proxy(heartG, new T.SphereGeometry(0.2, 8, 8), 'sa', 'heart').position.copy(sa.position);

  // great vessels (flow along dedicated chains below)
  const AORTA = [[0.10, 0.45, 0.05], [0.10, 1.25, 0.05], [0.30, 1.80, -0.05], [0.80, 1.80, -0.25], [1.05, 1.35, -0.45], [1.05, 0.70, -0.75]];
  vessel(heartG, 'aorta', AORTA, 0.2, 'a', { noFlow: true });
  vessel(heartG, 'pulmA', [[-0.25, 0.5, 0.45], [-0.2, 0.9, 0.42], [-0.05, 1.3, 0.35]], 0.17, 'pa', { noFlow: true });
  vessel(heartG, 'pulmA', [[-0.05, 1.3, 0.35], [0.6, 1.6, 0.2], [1.3, 1.5, 0.0]], 0.14, 'pa', { noFlow: true });
  vessel(heartG, 'pulmA', [[-0.05, 1.3, 0.35], [-0.5, 1.65, 0.2], [-1.3, 1.6, 0.1]], 0.14, 'pa', { noFlow: true });
  vessel(heartG, 'svc', [[-0.9, 2.0, -0.1], [-0.92, 1.0, -0.1], [-0.9, 0.5, -0.1]], 0.17, 'v', { noFlow: true });
  vessel(heartG, 'ivc', [[-1.3, -1.6, -0.2], [-1.35, -0.5, -0.2], [-1.15, 0.1, -0.15], [-1.0, 0.25, -0.1]], 0.19, 'v', { noFlow: true });
  vessel(heartG, 'pulmV', [[1.7, 1.0, -0.4], [1.1, 0.8, -0.45]], 0.1, 'pv', { noFlow: true });
  vessel(heartG, 'pulmV', [[1.7, 0.4, -0.5], [1.1, 0.55, -0.5]], 0.1, 'pv', { noFlow: true });
  vessel(heartG, 'pulmV', [[-1.5, 0.95, -0.55], [-0.3, 0.82, -0.62], [0.55, 0.7, -0.55]], 0.1, 'pv', { noFlow: true });
  vessel(heartG, 'pulmV', [[-1.5, 0.4, -0.6], [-0.3, 0.52, -0.62], [0.55, 0.55, -0.55]], 0.1, 'pv', { noFlow: true });

  // blood flow through the heart
  const mid = [[-0.7, 0.05, 0.15], [-0.45, -0.35, 0.3], [-0.3, 0.2, 0.45], [-0.2, 0.8, 0.45], [-0.05, 1.3, 0.35]];
  flowOnly(heartG, [[-0.9, 2.0, -0.1], [-0.92, 1.1, -0.1], [-0.85, 0.4, 0.0]].concat(mid, [[0.7, 1.6, 0.2], [1.3, 1.5, 0.0]]), 'pa', 0.07, 1.5);
  flowOnly(heartG, [[-1.3, -1.6, -0.2], [-1.35, -0.5, -0.2], [-1.0, 0.2, -0.1], [-0.9, 0.35, -0.05]].concat(mid, [[-0.5, 1.65, 0.2], [-1.3, 1.6, 0.1]]), 'pa', 0.07, 1.5);
  const lvTail = [[0.65, 0.18, -0.2], [0.5, -0.4, 0.0], [0.3, 0.1, 0.1]].concat(AORTA);
  flowOnly(heartG, [[1.7, 1.0, -0.4], [1.1, 0.8, -0.45], [0.8, 0.6, -0.45]].concat(lvTail), 'pv', 0.07, 1.5);
  flowOnly(heartG, [[-1.5, 0.95, -0.55], [-0.3, 0.82, -0.62], [0.5, 0.65, -0.5]].concat(lvTail), 'pv', 0.07, 1.5);
  flowOnly(heartG, [[1.7, 0.4, -0.5], [1.1, 0.55, -0.5], [0.8, 0.6, -0.45]].concat(lvTail), 'pv', 0.07, 1.4);

  /* ================= BODY ================= */
  const HS = 0.5, HP = [0.2, 2.05, 0.1];
  const hp = (x, y, z) => [HP[0] + HS * x, HP[1] + HS * y, HP[2] + HS * z];
  const ZA = -0.22;
  const mir = (pts) => pts.map(p => [-p[0], p[1], p[2]]);

  // outline
  const shellMat = new T.MeshPhysicalMaterial({ color: 0xc5d8ff, transparent: true, opacity: 0.075, roughness: 0.15, clearcoat: 1, depthWrite: false });
  const shell = new T.Group(); bodyG.add(shell);
  function sh(geo, x, y, z, sc, rz) {
    const m = new T.Mesh(geo, shellMat); m.position.set(x, y, z);
    if (sc) m.scale.set(sc[0], sc[1], sc[2]); if (rz) m.rotation.z = rz; shell.add(m); return m;
  }
  sh(new T.SphereGeometry(0.66, 32, 24), 0, 4.5, 0, [0.9, 1.1, 1]);
  sh(new T.CylinderGeometry(0.3, 0.34, 0.8, 20), 0, 3.7, 0);
  sh(new T.CapsuleGeometry(0.92, 2.1, 8, 28), 0, 1.5, 0, [1.18, 1, 0.62]);
  sh(new T.CapsuleGeometry(0.27, 3.3, 8, 16), 1.62, 1.25, 0, null, 0.19);
  sh(new T.CapsuleGeometry(0.27, 3.3, 8, 16), -1.62, 1.25, 0, null, -0.19);
  sh(new T.CapsuleGeometry(0.45, 4.2, 8, 20), 0.52, -2.8, 0);
  sh(new T.CapsuleGeometry(0.45, 4.2, 8, 20), -0.52, -2.8, 0);

  // pedestal rings
  const ring1 = new T.Mesh(new T.RingGeometry(2.4, 2.46, 80), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, side: T.DoubleSide }));
  ring1.rotation.x = -Math.PI / 2; ring1.position.y = -5.45; bodyG.add(ring1);
  const ring2 = new T.Mesh(new T.RingGeometry(2.9, 2.94, 80), new T.MeshBasicMaterial({ color: 0xff5c70, transparent: true, opacity: 0.4, side: T.DoubleSide }));
  ring2.rotation.x = -Math.PI / 2; ring2.position.y = -5.45; bodyG.add(ring2);

  // organs
  ellipsoid(bodyG, 'lungs', 'organs', [0.88, 2.3, -0.05], [0.55, 1.0, 0.5], 0, 0xf2a7b8, { opacity: 0.38, ei: 0.1, rough: 0.5 });
  ellipsoid(bodyG, 'lungs', 'organs', [-0.88, 2.3, -0.05], [0.6, 1.0, 0.5], 0, 0xf2a7b8, { opacity: 0.38, ei: 0.1, rough: 0.5 });
  ellipsoid(bodyG, 'liver', 'organs', [-0.5, 0.95, 0.05], [0.85, 0.42, 0.45], -0.15, 0x9a3b3f, { opacity: 0.88, ei: 0.1 });
  ellipsoid(bodyG, 'kidneys', 'organs', [0.62, 0.55, -0.3], [0.26, 0.42, 0.2], 0.2, 0xb04656, { ei: 0.14 });
  ellipsoid(bodyG, 'kidneys', 'organs', [-0.62, 0.55, -0.3], [0.26, 0.42, 0.2], -0.2, 0xb04656, { ei: 0.14 });
  (function () {
    const g = new T.IcosahedronGeometry(1, 5);
    const p = g.attributes.position; const v = new T.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); const n = v.clone().normalize();
      const d = 0.05 * (Math.sin(n.x * 11) + Math.sin(n.y * 9 + 1) + Math.sin(n.z * 12 + 2));
      v.copy(n).multiplyScalar(1 + d); p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    const m = mk(g, 0xe9a3b5, { ei: 0.12, rough: 0.55 });
    m.scale.set(0.5, 0.4, 0.55); m.position.set(0, 4.58, 0);
    reg(bodyG, m, 'brain', 'organs');
  })();

  // heart placement
  heartG.position.set(HP[0], HP[1], HP[2]); heartG.scale.setScalar(HS);

  // arteries (point order = direction of flow)
  const SP = 1.1;
  vessel(bodyG, 'aorta', [hp(1.05, 0.7, -0.75), [0.52, 1.7, -0.3], [0.32, 0.9, ZA], [0.3, 0.0, ZA], [0.28, -0.45, ZA]], 0.09, 'a', { speed: 1.4 });
  vessel(bodyG, 'carotid', [[0.33, 2.71, 0.05], [0.0, 3.1, 0.06], [-0.2, 3.6, 0.05], [-0.2, 4.15, 0.08]], 0.045, 'a');
  vessel(bodyG, 'carotid', [[0.45, 2.69, 0.0], [0.32, 3.1, 0.04], [0.24, 3.6, 0.05], [0.24, 4.15, 0.08]], 0.045, 'a');
  const armA = [[-0.4, 3.05, 0.0], [-0.95, 3.0, 0.0], [-1.3, 2.7, 0.0], [-1.55, 1.9, 0.0], [-1.65, 1.2, 0.0], [-1.85, 0.3, 0.0], [-1.98, -0.6, 0.03], [-2.03, -0.95, 0.04]];
  vessel(bodyG, 'armArtery', [[0.33, 2.71, 0.05]].concat(armA), 0.04, 'a');
  vessel(bodyG, 'armArtery', [[0.55, 2.65, -0.05]].concat(mir(armA)), 0.04, 'a');
  vessel(bodyG, 'renalArtery', [[0.3, 0.72, ZA], [0.42, 0.66, -0.28], [0.5, 0.62, -0.3]], 0.03, 'a', { density: 5 });
  vessel(bodyG, 'renalArtery', [[0.3, 0.55, ZA], [0.0, 0.52, -0.28], [-0.4, 0.55, -0.3]], 0.03, 'a', { density: 5 });
  const legA = [[0.28, -0.45, ZA], [0.34, -0.9, -0.15], [0.5, -1.6, -0.05], [0.52, -2.8, 0.0], [0.52, -3.8, 0.05], [0.52, -4.7, 0.1]];
  vessel(bodyG, 'femoralA', legA, 0.05, 'a');
  vessel(bodyG, 'femoralA', [[0.28, -0.45, ZA], [0.0, -0.9, -0.15], [-0.38, -1.6, -0.05], [-0.5, -2.8, 0.0], [-0.5, -3.8, 0.05], [-0.5, -4.7, 0.1]], 0.05, 'a');

  // pulmonary (to / from the lungs)
  vessel(bodyG, 'pulmA', [hp(1.3, 1.5, 0), [1.0, 2.5, 0.0], [1.15, 2.2, -0.05]], 0.05, 'pa', { density: 4 });
  vessel(bodyG, 'pulmA', [hp(-1.3, 1.6, 0.1), [-0.7, 2.6, 0.05], [-1.05, 2.3, -0.05]], 0.05, 'pa', { density: 4 });
  vessel(bodyG, 'pulmV', [[1.15, 2.05, -0.1], hp(1.7, 1.0, -0.4)], 0.04, 'pv', { density: 4 });
  vessel(bodyG, 'pulmV', [[1.1, 2.4, -0.1], hp(1.7, 0.4, -0.5)], 0.04, 'pv', { density: 4 });
  vessel(bodyG, 'pulmV', [[-1.1, 2.1, -0.1], hp(-1.5, 0.95, -0.55)], 0.04, 'pv', { density: 4 });
  vessel(bodyG, 'pulmV', [[-1.05, 2.45, -0.1], hp(-1.5, 0.4, -0.6)], 0.04, 'pv', { density: 4 });

  // veins (point order = toward the heart)
  const svcEnd = hp(-0.9, 2.0, -0.1);
  vessel(bodyG, 'jugular', [[-0.4, 4.15, 0.1], [-0.42, 3.6, 0.1], [-0.3, 3.2, 0.08], svcEnd], 0.05, 'v');
  vessel(bodyG, 'jugular', [[0.42, 4.15, 0.1], [0.42, 3.6, 0.1], [0.3, 3.25, 0.08], [0.0, 3.05, 0.06], svcEnd], 0.05, 'v');
  const armV = [[-2.08, -0.95, 0.12], [-2.0, -0.6, 0.13], [-1.88, 0.3, 0.12], [-1.7, 1.2, 0.12], [-1.6, 1.9, 0.12], [-1.35, 2.7, 0.1], [-0.9, 3.1, 0.08], [-0.4, 3.12, 0.06]];
  vessel(bodyG, 'armVein', armV.concat([svcEnd]), 0.045, 'v');
  vessel(bodyG, 'armVein', mir(armV).concat([[0.05, 3.0, 0.1], svcEnd]), 0.045, 'v');
  const ivcStart = hp(-1.3, -1.6, -0.2);
  vessel(bodyG, 'ivc', [[0.0, -0.45, ZA], [-0.05, 0.4, ZA], [-0.18, 0.95, -0.12], ivcStart], 0.1, 'v', { speed: 1.2 });
  vessel(bodyG, 'renalVein', [[0.5, 0.45, -0.32], [0.2, 0.36, -0.3], [-0.04, 0.36, ZA]], 0.035, 'v', { density: 5 });
  vessel(bodyG, 'renalVein', [[-0.4, 0.42, -0.32], [-0.2, 0.38, -0.3], [-0.06, 0.38, ZA]], 0.035, 'v', { density: 5 });
  vessel(bodyG, 'femoralV', [[-0.4, -4.7, -0.05], [-0.4, -3.8, -0.1], [-0.38, -2.8, -0.1], [-0.3, -1.6, -0.12], [-0.12, -0.9, ZA], [0.0, -0.45, ZA]], 0.055, 'v');
  vessel(bodyG, 'femoralV', [[0.4, -4.7, -0.05], [0.42, -3.8, -0.1], [0.42, -2.8, -0.1], [0.38, -1.6, -0.12], [0.15, -0.9, ZA], [0.0, -0.45, ZA]], 0.055, 'v');

  // capillary beds
  function lerpC(u) { return [0.84 + (0.18 - 0.84) * u, 0.15 + (0.44 - 0.15) * u, 0.24 + (0.88 - 0.24) * u]; }
  function bed(A, Vp, n, spread) {
    const rnd = () => Math.random() - 0.5;
    for (let k = 0; k < n; k++) {
      const m = [(A[0] + Vp[0]) / 2, (A[1] + Vp[1]) / 2 - 0.12, (A[2] + Vp[2]) / 2];
      const pts = [V(A),
        new T.Vector3(A[0] + rnd() * spread, A[1] - 0.1 + rnd() * 0.06, A[2] + rnd() * spread * 0.5),
        new T.Vector3(m[0] + rnd() * spread * 1.8, m[1] - 0.1 + rnd() * 0.12, m[2] + rnd() * spread),
        new T.Vector3(Vp[0] + rnd() * spread, Vp[1] - 0.1 + rnd() * 0.06, Vp[2] + rnd() * spread * 0.5), V(Vp)];
      const curve = new T.CatmullRomCurve3(pts);
      const geo = new T.TubeGeometry(curve, 28, 0.02, 5, false);
      const cols = [];
      for (let i = 0; i < geo.attributes.position.count; i++) cols.push.apply(cols, lerpC(Math.floor(i / 6) / 28));
      geo.setAttribute('color', new T.Float32BufferAttribute(cols, 3));
      const mesh = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.4, emissive: 0x444444, emissiveIntensity: 0.3 }));
      mesh.userData.baseEI = 0.3;
      reg(bodyG, mesh, 'capillaries', 'micro');
    }
    const c = [(A[0] + Vp[0]) / 2, (A[1] + Vp[1]) / 2 - 0.15, (A[2] + Vp[2]) / 2];
    const pr = proxy(bodyG, new T.SphereGeometry(0.3, 10, 8), 'capillaries', 'micro'); pr.position.set(c[0], c[1], c[2]);
  }
  bed([-2.03, -0.95, 0.04], [-2.08, -0.95, 0.12], 12, 0.2);
  bed([2.03, -0.95, 0.04], [2.08, -0.95, 0.12], 12, 0.2);
  bed([-0.5, -4.7, 0.1], [-0.4, -4.7, -0.05], 12, 0.22);
  bed([0.52, -4.7, 0.1], [0.4, -4.7, -0.05], 12, 0.22);

  // tag homes
  bodyG.traverse(o => { o.userData.home = 'body'; });
  heartG.traverse(o => { o.userData.home = 'heart'; });

  /* ================= State & controls ================= */
  const layers = { arteries: true, veins: true, organs: true, outline: true, flow: true };
  let mode = 'body', auto = true, bpm = 72, running = true, selId = null, hoverId = null;
  const handlers = {};
  const emit = (k, a, b) => handlers[k] && handlers[k](a, b);

  const cam = { theta: 0.5, phi: 1.5, dist: 17, tDist: 17, target: new T.Vector3(0, 0.2, 0), tTarget: new T.Vector3(0, 0.2, 0) };
  const heartTarget = { pos: new T.Vector3(HP[0], HP[1], HP[2]), scale: HS };
  let aspect = 1;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const limits = () => mode === 'body' ? [3.2, 26] : [2.2, 14 * Math.max(1, 1.1 / aspect)];
  const defaultView = () => mode === 'body'
    ? { dist: 15.6 * Math.max(1, 0.62 / aspect), target: [0, 0.1, 0] }
    : { dist: 6.6 * Math.max(1, 1.1 / aspect), target: [0.05, 0.25, 0] };

  function isVisibleDeep(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
  function applyLayers() {
    pickables.forEach(m => {
      const l = m.userData.layer;
      m.visible = layers[l] !== false;
    });
    shell.visible = layers.outline;
    flows.forEach(f => { f.im.visible = layers.flow && layers[f.layer] !== false; });
  }
  function applyMode() {
    bodyG.visible = mode === 'body';
    if (mode === 'body') { heartTarget.pos.set(HP[0], HP[1], HP[2]); heartTarget.scale = HS; }
    else { heartTarget.pos.set(0, 0, 0); heartTarget.scale = 1; }
  }
  applyLayers(); applyMode();

  function resetView(instant) {
    const d = defaultView();
    cam.tDist = d.dist; cam.tTarget.set(d.target[0], d.target[1], d.target[2]);
    if (instant) { cam.dist = cam.tDist; cam.target.copy(cam.tTarget); }
  }
  resetView(true);

  /* picking */
  const ray = new T.Raycaster(); const ndc = new T.Vector2();
  function pick(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const list = pickables.filter(isVisibleDeep);
    const hits = ray.intersectObjects(list, false);
    if (!hits.length) return null;
    const h = hits.find(x => x.object.userData.layer !== 'organs') || hits[0];
    let id = h.object.userData.part;
    if (mode === 'body' && HEART_IDS.indexOf(id) >= 0) id = 'heart';
    return id;
  }
  function setOf(id) { return id === 'heart' ? ['heart'].concat(HEART_IDS) : [id]; }

  /* glow */
  let glowMeshes = [], hoverMeshes = [];
  function meshesFor(id) {
    if (!id) return [];
    const out = [];
    setOf(id).forEach(k => (registry[k] || []).forEach(m => { if (!m.userData.proxy) out.push(m); }));
    return out;
  }
  function resetGlow(list) { list.forEach(m => { if (m.material.emissiveIntensity !== undefined) m.material.emissiveIntensity = m.userData.baseEI; }); }

  /* camera focus */
  function centerOf(id) {
    const savePos = heartG.position.clone(), saveS = heartG.scale.x;
    heartG.position.copy(heartTarget.pos); heartG.scale.setScalar(heartTarget.scale);
    root.updateMatrixWorld(true);
    const box = new T.Box3(); let any = false;
    meshesFor(id).forEach(m => {
      const inMode = m.userData.home === 'heart' || mode === 'body';
      if (inMode && m.visible) { box.expandByObject(m); any = true; }
    });
    heartG.position.copy(savePos); heartG.scale.setScalar(saveS);
    root.updateMatrixWorld(true);
    if (!any) return null;
    const c = box.getCenter(new T.Vector3()), s = box.getSize(new T.Vector3());
    return { c, size: Math.max(s.x, s.y, s.z) };
  }
  function focusOn(id) {
    const r = centerOf(id); if (!r) return;
    const lim = limits();
    cam.tTarget.copy(r.c);
    cam.tDist = clamp(r.size * 2.7 + 1.2, lim[0] + 0.4, lim[1]);
  }

  function select(id, opt) {
    opt = opt || {};
    if (id && PARTS[id]) {
      const pm = PARTS[id].modes;
      if (pm.indexOf(mode) < 0) setMode(pm[0], { keepSel: true, noReset: true });
    }
    resetGlow(glowMeshes);
    selId = id || null;
    glowMeshes = meshesFor(selId);
    if (selId && opt.focus !== false) { auto = false; emit('auto', false); focusOn(selId); }
    emit('select', selId);
  }
  function setMode(m, o) {
    o = o || {};
    if (m === mode) return;
    mode = m; applyMode(); applyLayers();
    if (!o.noReset) resetView(false);
    if (!o.keepSel) { resetGlow(glowMeshes); glowMeshes = []; selId = null; emit('select', null); }
    emit('mode', mode);
  }

  /* pointer interaction */
  const ptrs = new Map(); let moved = 0, downPos = null, pinch0 = 0;
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (ptrs.size === 1) { moved = 0; downPos = { x: e.clientX, y: e.clientY }; }
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); }
  });
  canvas.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId);
    if (p) {
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      if (ptrs.size === 1) {
        moved += Math.abs(dx) + Math.abs(dy);
        cam.theta -= dx * 0.0065; cam.phi = clamp(cam.phi - dy * 0.0065, 0.25, Math.PI - 0.25);
        if (moved > 6 && auto) { auto = false; emit('auto', false); }
      } else if (ptrs.size === 2) {
        p.x = e.clientX; p.y = e.clientY;
        const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch0) { const lim = limits(); cam.tDist = clamp(cam.tDist * (pinch0 / d), lim[0], lim[1]); }
        pinch0 = d; moved += 10; return;
      }
      p.x = e.clientX; p.y = e.clientY;
    } else {
      hoverReq = { x: e.clientX, y: e.clientY };
    }
  });
  function endPtr(e) {
    const had = ptrs.has(e.pointerId);
    ptrs.delete(e.pointerId);
    if (had && ptrs.size === 0 && moved < 7 && e.type === 'pointerup') {
      const id = pick(e.clientX, e.clientY);
      select(id, { focus: true });
    }
    if (ptrs.size < 2) pinch0 = 0;
  }
  canvas.addEventListener('pointerup', endPtr);
  canvas.addEventListener('pointercancel', endPtr);
  canvas.addEventListener('pointerleave', () => { hoverReq = null; setHover(null); });
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const lim = limits(); cam.tDist = clamp(cam.tDist * Math.exp(e.deltaY * 0.0012), lim[0], lim[1]);
  }, { passive: false });

  let hoverReq = null;
  function setHover(id, x, y) {
    if (id !== hoverId) {
      resetGlow(hoverMeshes); hoverId = id; hoverMeshes = meshesFor(id);
      canvas.style.cursor = id ? 'pointer' : 'grab';
    }
    emit('hover', id, id ? { x, y } : null);
  }

  /* resize / visibility */
  function resize() {
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    aspect = w / h; camera.aspect = aspect; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(wrap); resize();
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { running = es[0].isIntersecting; }, { threshold: 0 }).observe(wrap);

  /* animation */
  const clock = new T.Clock(); let time = 0;
  const dummy = new T.Object3D(); const tmp = new T.Vector3();
  function beat(ph) {
    const a = (ph - 0.06) / 0.05, b = (ph - 0.34) / 0.07;
    return Math.exp(-a * a) + 0.55 * Math.exp(-b * b);
  }
  function frame() {
    requestAnimationFrame(frame);
    if (!running || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05); time += dt;
    const ph = (time * bpm / 60) % 1; const bt = beat(ph);

    // hover picking (throttled to frame)
    if (hoverReq && !ptrs.size) { const id = pick(hoverReq.x, hoverReq.y); const r = wrap.getBoundingClientRect(); setHover(id, hoverReq.x - r.left, hoverReq.y - r.top); hoverReq = null; }

    // heart transform
    const k = 1 - Math.exp(-dt * 6);
    heartG.position.lerp(heartTarget.pos, k);
    const s0 = heartG.scale.x / (1 + 0.05 * (heartG.userData.pulse || 0));
    const sBase = s0 + (heartTarget.scale - s0) * k;
    heartG.userData.pulse = bt;
    heartG.scale.setScalar(sBase * (1 + 0.05 * bt));
    sa.material.emissiveIntensity = 0.5 + 1.2 * bt;

    // camera
    if (auto && !ptrs.size) cam.theta += dt * 0.28;
    cam.dist += (cam.tDist - cam.dist) * k; cam.target.lerp(cam.tTarget, k);
    const sp = Math.sin(cam.phi);
    camera.position.set(cam.target.x + cam.dist * sp * Math.sin(cam.theta), cam.target.y + cam.dist * Math.cos(cam.phi), cam.target.z + cam.dist * sp * Math.cos(cam.theta));
    camera.lookAt(cam.target);

    // glow
    const pulse = 0.5 + 0.5 * Math.sin(time * 5);
    hoverMeshes.forEach(m => { m.material.emissiveIntensity = m.userData.baseEI + 0.35; });
    glowMeshes.forEach(m => { m.material.emissiveIntensity = m.userData.baseEI + 0.45 + 0.35 * pulse; });

    // flows
    const rate = (bpm / 72) * (1 + 0.7 * bt);
    if (layers.flow) {
      flows.forEach(f => {
        if (!f.im.visible || !isVisibleDeep(f.im)) return;
        f.phase = (f.phase + dt * f.speed * rate / f.len) % 1;
        for (let i = 0; i < f.n; i++) {
          f.curve.getPointAt((f.phase + i / f.n) % 1, tmp);
          dummy.position.copy(tmp); dummy.updateMatrix(); f.im.setMatrixAt(i, dummy.matrix);
        }
        f.im.instanceMatrix.needsUpdate = true;
      });
    }
    renderer.render(scene, camera);
  }
  frame();

  window.Viewer = {
    setMode: (m) => setMode(m),
    getMode: () => mode,
    select: (id, o) => select(id, o),
    clear: () => select(null),
    setLayer: (k, v) => { layers[k] = v; applyLayers(); },
    setAuto: (v) => { auto = v; },
    setBpm: (v) => { bpm = clamp(+v || 72, 40, 180); },
    zoom: (f) => { const lim = limits(); cam.tDist = clamp(cam.tDist * f, lim[0], lim[1]); },
    reset: () => { resetView(false); select(null); },
    on: (k, fn) => { handlers[k] = fn; },
  };
})();
