/* ============================================================
   NETSAGE AI — Full Application Logic
   Router, all 10 page renderers, interactivity
   ============================================================ */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Chart.js Global Config ──
Chart.defaults.color = '#8899b4';
Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.display = false;
Chart.defaults.animation.duration = 800;
Chart.defaults.animation.easing = 'easeOutQuart';
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.point.hoverRadius = 5;
Chart.defaults.elements.line.tension = 0.4;

function generateTimeLabels(count = 20) {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now - i * 60000);
    labels.push(d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }));
  }
  return labels;
}
function generateData(count, min, max) { return Array.from({ length: count }, () => rand(min, max)); }

// ── Clock ──
function updateClock() {
  const el = $('#live-clock');
  if (el) el.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

/* ══════════════════════════════════════════
   ROUTER
   ══════════════════════════════════════════ */

const PAGE_TITLES = {
  'dashboard': ['Mission Control Dashboard', 'ISRO Network Infrastructure · Real-time Monitoring'],
  'network-map': ['Network Topology Map', 'Interactive device mapping with real-time health status'],
  'ai-assistant': ['AI Assistant', 'Offline-first conversational AI powered by Llama 3'],
  'incidents': ['Incident Management', 'Track, analyze, and resolve network incidents'],
  'predictions': ['AI Prediction Center', 'Machine learning failure predictions and analytics'],
  'telemetry': ['Telemetry Analytics', 'Detailed device telemetry and performance metrics'],
  'device-risk': ['Device Risk Assessment', 'Per-device risk scoring and health monitoring'],
  'digital-twin': ['Digital Twin Simulator', 'Network simulation and what-if scenario analysis'],
  'reports': ['Report Center', 'Auto-generated reports powered by offline LLM'],
  'settings': ['Settings', 'System configuration and preferences']
};

const pageInitMap = {};
const pageInitialized = {};

function navigateTo(viewId) {
  // Hide all views
  $$('.view').forEach(v => v.classList.remove('active'));
  $$('.nav-item').forEach(n => n.classList.remove('active'));

  // Show target view
  const view = $(`#view-${viewId}`);
  if (view) {
    view.classList.add('active');
    // Force re-animation
    view.style.animation = 'none';
    view.offsetHeight;
    view.style.animation = '';
  }

  // Activate nav item
  const navItem = $(`.nav-item[data-view="${viewId}"]`);
  if (navItem) navItem.classList.add('active');

  // Update title
  const titles = PAGE_TITLES[viewId] || ['NetSage AI', ''];
  $('#page-title').textContent = titles[0];
  $('#page-subtitle').textContent = titles[1];

  // Init page if not already
  if (!pageInitialized[viewId] && pageInitMap[viewId]) {
    pageInitMap[viewId]();
    pageInitialized[viewId] = true;
  }

  // Update hash
  if (location.hash !== `#/${viewId}`) {
    history.pushState(null, '', `#/${viewId}`);
  }
}

function initRouter() {
  // Nav clicks
  $$('.nav-item[data-view]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.view);
    });
  });

  // Hash change
  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace('#/', '') || 'dashboard';
    navigateTo(hash);
  });

  // Initial route
  const initial = location.hash.replace('#/', '') || 'dashboard';
  navigateTo(initial);
}

/* ══════════════════════════════════════════
   SHARED DATA
   ══════════════════════════════════════════ */

const LOCATIONS = ['Bangalore-HQ','Delhi-DC','Mumbai-DC','Chennai-SAT','Ahmedabad-SAC','Sriharikota','Thiruvananthapuram','Lucknow-OFC','Kolkata-DC','Hyderabad-NRSC','Pune-IUCAA','Bhopal-OFC','Jodhpur-RLY','Hassan-DSN','Port-Blair'];
const DEVICE_TYPES = ['Core Router','Edge Switch','Firewall','Server','Access Point','Load Balancer'];

const DEVICES = [
  { name:'R12', location:'Delhi-DC', type:'Core Router', risk:92, cpu:95, mem:91, latency:45, packetLoss:8.2, uptime:99.2 },
  { name:'FW03', location:'Sriharikota', type:'Firewall', risk:85, cpu:72, mem:94, latency:32, packetLoss:3.1, uptime:99.5 },
  { name:'S07', location:'Mumbai-DC', type:'Edge Switch', risk:78, cpu:68, mem:76, latency:28, packetLoss:18.2, uptime:99.1 },
  { name:'LB-02', location:'Ahmedabad-SAC', type:'Load Balancer', risk:71, cpu:82, mem:65, latency:35, packetLoss:4.5, uptime:99.6 },
  { name:'SRV-22', location:'Bangalore-HQ', type:'Server', risk:64, cpu:58, mem:82, latency:12, packetLoss:1.2, uptime:99.8 },
  { name:'AP-14', location:'Chennai-SAT', type:'Access Point', risk:55, cpu:45, mem:60, latency:52, packetLoss:5.8, uptime:99.3 },
  { name:'R08', location:'Kolkata-DC', type:'Core Router', risk:42, cpu:55, mem:58, latency:38, packetLoss:2.3, uptime:99.7 },
  { name:'SW-15', location:'Hyderabad-NRSC', type:'Edge Switch', risk:38, cpu:42, mem:52, latency:22, packetLoss:1.8, uptime:99.9 },
  { name:'R03', location:'Pune-IUCAA', type:'Core Router', risk:25, cpu:35, mem:45, latency:18, packetLoss:0.8, uptime:99.95 },
  { name:'FW01', location:'Bangalore-HQ', type:'Firewall', risk:18, cpu:30, mem:38, latency:8, packetLoss:0.3, uptime:99.98 },
  { name:'SW-02', location:'Lucknow-OFC', type:'Edge Switch', risk:12, cpu:28, mem:34, latency:25, packetLoss:0.5, uptime:99.97 },
  { name:'R06', location:'Hassan-DSN', type:'Core Router', risk:8, cpu:22, mem:30, latency:15, packetLoss:0.1, uptime:99.99 },
];

const PREDICTIONS_DATA = [
  { device:'Router R12 — Delhi-DC', confidence:92, severity:'critical', message:'92% probability of failure within 20min. CPU sustained >95% for 25min, memory at 91%.', timeToFailure:20, countdownStart:Date.now() },
  { device:'Switch S07 — Mumbai-DC', confidence:78, severity:'warning', message:'Packet loss trending upward. Historical pattern suggests congestion event in ~45min.', timeToFailure:45, countdownStart:Date.now() },
  { device:'Firewall FW03 — Sriharikota', confidence:85, severity:'critical', message:'Memory leak detected. At current rate, out-of-memory crash predicted in 35 minutes.', timeToFailure:35, countdownStart:Date.now() },
  { device:'Server SRV-22 — Bangalore', confidence:64, severity:'warning', message:'Disk I/O latency increasing. SMART diagnostics indicate potential drive degradation.', timeToFailure:120, countdownStart:Date.now() },
  { device:'AP-14 — Chennai-SAT', confidence:55, severity:'info', message:'Signal strength fluctuation detected. Environmental interference suspected.', timeToFailure:90, countdownStart:Date.now() },
  { device:'LB-02 — Ahmedabad-SAC', confidence:71, severity:'warning', message:'Connection pool nearing capacity. Recommend scaling or failover readiness.', timeToFailure:60, countdownStart:Date.now() },
];

const INCIDENTS = [
  { id:'INC-2026-0347', time:'14:22:07', severity:'critical', title:'Router R12 CPU Critical', desc:'CPU usage exceeded 95% threshold for 25 consecutive minutes. Auto-escalation triggered.', device:'R12', tag:'critical' },
  { id:'INC-2026-0346', time:'14:18:33', severity:'warning', title:'Mumbai-DC Packet Loss Spike', desc:'Packet loss rate increased to 18.2% on trunk link MUM-BLR-01. Traffic rerouted via backup.', device:'S07', tag:'warning' },
  { id:'INC-2026-0345', time:'14:12:15', severity:'info', title:'AI Prediction Generated', desc:'LSTM model predicts Sriharikota FW03 memory exhaustion within 35 minutes (85% confidence).', device:'FW03', tag:'info' },
  { id:'INC-2026-0344', time:'13:58:41', severity:'resolved', title:'Kolkata-DC Link Restored', desc:'Fiber cut on KOL-DEL-02 repaired. Full duplex restored at 10Gbps. Failover duration: 12m.', device:'R08', tag:'resolved' },
  { id:'INC-2026-0343', time:'13:45:20', severity:'warning', title:'Chennai Satellite Uplink Degraded', desc:'Signal-to-noise ratio dropped below threshold. Antenna realignment recommended.', device:'AP-14', tag:'warning' },
  { id:'INC-2026-0342', time:'13:30:05', severity:'info', title:'Scheduled Maintenance Window', desc:'Ahmedabad-SAC load balancer firmware update initiated. ETA: 15 minutes.', device:'LB-02', tag:'info' },
  { id:'INC-2026-0341', time:'13:15:22', severity:'critical', title:'Sriharikota FW03 Memory Alert', desc:'Memory utilization at 91%. Memory leak pattern detected in firewall rule processing.', device:'FW03', tag:'critical' },
  { id:'INC-2026-0340', time:'12:58:09', severity:'resolved', title:'Bangalore DNS Resolution Fixed', desc:'Internal DNS latency spike resolved. Root cause: stale cache entries cleared.', device:'FW01', tag:'resolved' },
  { id:'INC-2026-0339', time:'12:40:33', severity:'warning', title:'Hyderabad NRSC Disk Warning', desc:'Telemetry storage disk at 87% capacity. Auto-archival policy executing.', device:'SW-15', tag:'warning' },
  { id:'INC-2026-0338', time:'12:22:17', severity:'resolved', title:'Pune Link Failover Success', desc:'Automatic failover to backup link completed in 0.8s. Zero packet loss during transition.', device:'R03', tag:'resolved' },
  { id:'INC-2026-0337', time:'11:55:02', severity:'info', title:'AI Model Retrained', desc:'LSTM prediction model retrained with latest 30-day telemetry data. Accuracy improved to 94.7%.', device:'—', tag:'info' },
];

const CHAT_RESPONSES = {
  'why is delhi slow': 'Based on telemetry analysis, Delhi-DC (Router R12) is experiencing CPU saturation at 95.2% for the past 25 minutes.\n\n**Root Cause:** BGP route table overflow combined with 3x normal traffic volume from satellite uplink redistribution.\n\n**Recommended Actions:**\n1. Apply traffic shaping QoS policy on R12\n2. Redistribute load to Mumbai-DC backup path\n3. Schedule maintenance window for route table optimization',
  'show critical routers': 'Currently **3 devices** are in critical state:\n\n| Device | Location | Risk | Issue |\n|--------|----------|------|-------|\n| R12 | Delhi-DC | 92% | CPU 95%, sustained |\n| FW03 | Sriharikota | 85% | Memory leak |\n| S07 | Mumbai-DC | 78% | Packet loss 18% |\n\nAll have active AI predictions with ETAs. Recommend immediate attention to R12.',
  'predict failures for next hour': '**24-Hour Failure Forecast:**\n\n🔴 **+20min** — R12 (Delhi-DC): CPU failure, 92% confidence\n🔴 **+35min** — FW03 (Sriharikota): OOM crash, 85% confidence\n🟡 **+45min** — S07 (Mumbai-DC): Congestion event, 78% confidence\n🟡 **+60min** — LB-02 (Ahmedabad): Pool exhaustion, 71% confidence\n🔵 **+90min** — AP-14 (Chennai): Signal degradation, 55% confidence\n\nTotal predicted incidents: 5 | Avg lead time: 22 minutes',
  'explain bgp': '**Border Gateway Protocol (BGP)**\n\nBGP is the path-vector routing protocol that manages routing between autonomous systems (AS) on the internet.\n\n**Key Concepts:**\n- **AS Numbers** — Unique identifiers for autonomous systems\n- **Route Advertisements** — Networks announce their reachable prefixes\n- **Path Attributes** — LOCAL_PREF, MED, AS_PATH for route selection\n- **iBGP vs eBGP** — Internal vs external BGP peering\n\nISRO uses iBGP internally across data centers to ensure optimal path selection for telemetry and mission data.',
  'network status': 'Network Health Summary:\n\n| Metric | Value | Status |\n|--------|-------|--------|\n| Overall Health | 94.2% | ✅ Good |\n| Active Devices | 347/350 | ✅ |\n| Critical Alerts | 3 | 🔴 |\n| Warning Alerts | 9 | 🟡 |\n| Avg Latency | 23ms | ✅ |\n| Uptime | 99.97% | ✅ |\n\nAll air-gapped security protocols active. Zero outbound connections.',
  'default': 'I\'ve analyzed the relevant telemetry data. Based on LSTM prediction models and historical pattern matching, the network is operating within acceptable parameters with 3 notable risk areas.\n\nWould you like me to:\n1. Provide detailed root-cause analysis for a specific device?\n2. Generate a full incident report?\n3. Run a what-if simulation?'
};

/* ══════════════════════════════════════════
   NETWORK TOPOLOGY ENGINE (shared)
   ══════════════════════════════════════════ */

class NetworkTopology {
  constructor(canvasId, opts = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = []; this.edges = []; this.particles = [];
    this.animFrame = 0; this.hoveredNode = null; this.selectedNode = null;
    this.onNodeClick = opts.onNodeClick || null;
    this.running = true;

    this.resize();
    this.generateTopology();
    this.setupEvents();
    this.animate();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = rect.width;
    this.height = rect.height;
  }

  generateTopology() {
    const cx = this.width / 2, cy = this.height / 2;
    this.nodes.push({ id: 0, x: cx, y: cy, label: 'Bangalore-HQ', type: 'Core Router', health: rand(85, 100), risk: rand(5, 20), cpu: rand(40, 70), mem: rand(50, 75), radius: 18, isHub: true });

    const ring1 = 5, ring2 = 9;
    for (let i = 0; i < ring1; i++) {
      const angle = (Math.PI * 2 * i) / ring1 - Math.PI / 2;
      const r = Math.min(this.width, this.height) * 0.22;
      const h = rand(50, 100);
      this.nodes.push({ id: this.nodes.length, x: cx + Math.cos(angle) * r + rand(-10, 10), y: cy + Math.sin(angle) * r + rand(-10, 10), label: LOCATIONS[i + 1], type: pick(DEVICE_TYPES), health: h, risk: 100 - h, cpu: rand(30, 95), mem: rand(40, 92), radius: 12, isHub: false });
      this.edges.push({ from: 0, to: this.nodes.length - 1 });
    }
    for (let i = 0; i < ring2; i++) {
      const angle = (Math.PI * 2 * i) / ring2 - Math.PI / 4;
      const r = Math.min(this.width, this.height) * 0.38;
      const h = rand(30, 100);
      this.nodes.push({ id: this.nodes.length, x: cx + Math.cos(angle) * r + rand(-15, 15), y: cy + Math.sin(angle) * r + rand(-15, 15), label: LOCATIONS[i + ring1 + 1] || `Node-${i + ring1}`, type: pick(DEVICE_TYPES), health: h, risk: 100 - h, cpu: rand(30, 95), mem: rand(40, 92), radius: 9, isHub: false });
      this.edges.push({ from: 1 + (i % ring1), to: this.nodes.length - 1 });
    }
    this.edges.push({ from: 1, to: 3 }, { from: 2, to: 4 }, { from: 3, to: 5 });

    this.edges.forEach((_, idx) => {
      for (let p = 0; p < 2; p++) this.particles.push({ edgeIdx: idx, progress: rand(0, 1), speed: rand(0.003, 0.008), size: rand(1.5, 3) });
    });
  }

  getColor(health) {
    if (health >= 75) return { fill: '#00ff88', glow: 'rgba(0,255,136,0.3)', border: 'rgba(0,255,136,0.5)' };
    if (health >= 50) return { fill: '#ffb800', glow: 'rgba(255,184,0,0.3)', border: 'rgba(255,184,0,0.5)' };
    return { fill: '#ff2d78', glow: 'rgba(255,45,120,0.3)', border: 'rgba(255,45,120,0.5)' };
  }

  setupEvents() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      this.hoveredNode = null;
      for (const n of this.nodes) { if (Math.hypot(mx - n.x, my - n.y) < n.radius + 6) { this.hoveredNode = n; break; } }
      const tooltip = $('#tooltip');
      if (this.hoveredNode) {
        this.canvas.style.cursor = 'pointer';
        const n = this.hoveredNode, c = this.getColor(n.health);
        tooltip.innerHTML = `<div style="font-weight:700;margin-bottom:4px">${n.label}</div><div style="color:#8899b4;font-size:11px;margin-bottom:6px">${n.type}</div><div style="display:flex;gap:14px;font-family:'JetBrains Mono',monospace;font-size:11px"><span>Health: <b style="color:${c.fill}">${n.health.toFixed(0)}%</b></span><span>CPU: <b>${n.cpu.toFixed(0)}%</b></span><span>Mem: <b>${n.mem.toFixed(0)}%</b></span></div>`;
        tooltip.classList.add('visible');
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY - 10) + 'px';
      } else { this.canvas.style.cursor = 'default'; tooltip.classList.remove('visible'); }
    });
    this.canvas.addEventListener('click', (e) => {
      if (this.hoveredNode && this.onNodeClick) { this.selectedNode = this.hoveredNode; this.onNodeClick(this.hoveredNode); }
    });
    this.canvas.addEventListener('mouseleave', () => { this.hoveredNode = null; $('#tooltip').classList.remove('visible'); });
  }

  animate() {
    if (!this.running) return;
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.animFrame++;

    // Edges
    this.edges.forEach(e => {
      const f = this.nodes[e.from], t = this.nodes[e.to];
      const c = this.getColor((f.health + t.health) / 2);
      this.ctx.beginPath(); this.ctx.moveTo(f.x, f.y); this.ctx.lineTo(t.x, t.y);
      this.ctx.strokeStyle = c.border; this.ctx.lineWidth = 1; this.ctx.globalAlpha = 0.3; this.ctx.stroke();
      this.ctx.setLineDash([4, 6]); this.ctx.strokeStyle = c.glow; this.ctx.lineWidth = 0.5; this.ctx.lineDashOffset = -this.animFrame * 0.5; this.ctx.stroke(); this.ctx.setLineDash([]); this.ctx.globalAlpha = 1;
    });

    // Particles
    this.particles.forEach(p => {
      const e = this.edges[p.edgeIdx]; if (!e) return;
      const f = this.nodes[e.from], t = this.nodes[e.to];
      p.progress += p.speed; if (p.progress > 1) p.progress = 0;
      const x = f.x + (t.x - f.x) * p.progress, y = f.y + (t.y - f.y) * p.progress;
      this.ctx.beginPath(); this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = this.getColor((f.health + t.health) / 2).fill;
      this.ctx.globalAlpha = 0.7; this.ctx.fill(); this.ctx.globalAlpha = 1;
    });

    // Nodes
    this.nodes.forEach(n => {
      const c = this.getColor(n.health);
      const isH = this.hoveredNode === n, isS = this.selectedNode === n;
      const pr = n.radius + (isH || isS ? 8 : 4) + Math.sin(this.animFrame * 0.03 + n.id) * 2;

      this.ctx.beginPath(); this.ctx.arc(n.x, n.y, pr, 0, Math.PI * 2);
      this.ctx.fillStyle = c.glow; this.ctx.globalAlpha = isH || isS ? 0.4 : 0.15; this.ctx.fill(); this.ctx.globalAlpha = 1;

      if (isS) { this.ctx.beginPath(); this.ctx.arc(n.x, n.y, n.radius + 4, 0, Math.PI * 2); this.ctx.strokeStyle = '#fff'; this.ctx.lineWidth = 2; this.ctx.stroke(); }

      this.ctx.beginPath(); this.ctx.arc(n.x, n.y, n.radius + 2, 0, Math.PI * 2);
      this.ctx.strokeStyle = c.border; this.ctx.lineWidth = isH ? 2 : 1; this.ctx.stroke();

      this.ctx.beginPath(); this.ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      const g = this.ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
      g.addColorStop(0, c.fill); g.addColorStop(1, c.glow);
      this.ctx.fillStyle = g; this.ctx.globalAlpha = isH ? 0.9 : 0.7; this.ctx.fill(); this.ctx.globalAlpha = 1;

      if (n.isHub || isH || isS) {
        this.ctx.font = `${n.isHub ? '600 11px' : '500 10px'} 'Inter', sans-serif`;
        this.ctx.fillStyle = '#e8edf5'; this.ctx.textAlign = 'center';
        this.ctx.fillText(n.label, n.x, n.y + n.radius + 16);
      }
    });

    requestAnimationFrame(() => this.animate());
  }

  perturbHealth() {
    this.nodes.forEach(n => {
      n.health = Math.max(10, Math.min(100, n.health + rand(-5, 5)));
      n.risk = 100 - n.health;
      n.cpu = Math.max(10, Math.min(100, n.cpu + rand(-8, 8)));
      n.mem = Math.max(20, Math.min(100, n.mem + rand(-5, 5)));
    });
  }

  destroy() { this.running = false; }
}

/* ══════════════════════════════════════════
   PAGE: DASHBOARD
   ══════════════════════════════════════════ */

const chartInstances = {};
let dashboardTopology;

function createSparkline(canvasId, data, color) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'line',
    data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: color, borderWidth: 1.5, fill: true, backgroundColor: color.replace(')', ', 0.08)').replace('rgb', 'rgba'), pointRadius: 0, tension: 0.4 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } }
  });
}

function makeGradient(ctx, h, c) {
  const g = ctx.getContext('2d').createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, c.replace(')', ', 0.25)').replace('rgb', 'rgba'));
  g.addColorStop(1, c.replace(')', ', 0)').replace('rgb', 'rgba'));
  return g;
}

const tooltipOpts = (borderColor) => ({
  backgroundColor: 'rgba(10,20,40,0.95)', titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
  bodyFont: { family: "'JetBrains Mono', monospace", size: 12 }, borderColor, borderWidth: 1, padding: 10
});

pageInitMap['dashboard'] = function () {
  // Sparklines
  createSparkline('spark-devices', generateData(12, 340, 350), 'rgb(0, 212, 255)');
  createSparkline('spark-health', generateData(12, 90, 98), 'rgb(0, 255, 136)');
  createSparkline('spark-alerts', generateData(12, 5, 20), 'rgb(255, 45, 120)');
  createSparkline('spark-latency', generateData(12, 15, 40), 'rgb(255, 184, 0)');
  createSparkline('spark-uptime', generateData(12, 99.9, 100), 'rgb(0, 255, 136)');
  createSparkline('spark-predictions', generateData(12, 3, 15), 'rgb(168, 85, 247)');

  const tl = generateTimeLabels(20);

  // CPU
  const cpuCtx = $('#chart-cpu');
  if (cpuCtx) chartInstances.cpu = new Chart(cpuCtx, { type: 'line', data: { labels: tl, datasets: [{ label: 'CPU %', data: generateData(20, 40, 95), borderColor: '#00d4ff', borderWidth: 2, fill: true, backgroundColor: makeGradient(cpuCtx, 200, 'rgb(0, 212, 255)') }] }, options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 9 } } }, y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { callback: v => v + '%', font: { size: 9 } } } }, plugins: { tooltip: { ...tooltipOpts('rgba(0,212,255,0.3)'), callbacks: { label: c => `CPU: ${c.parsed.y.toFixed(1)}%` } } } } });

  // Memory
  const memCtx = $('#chart-memory');
  if (memCtx) chartInstances.memory = new Chart(memCtx, { type: 'line', data: { labels: tl, datasets: [{ label: 'Mem %', data: generateData(20, 50, 92), borderColor: '#a855f7', borderWidth: 2, fill: true, backgroundColor: makeGradient(memCtx, 200, 'rgb(168, 85, 247)') }] }, options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 9 } } }, y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { callback: v => v + '%', font: { size: 9 } } } }, plugins: { tooltip: { ...tooltipOpts('rgba(168,85,247,0.3)'), callbacks: { label: c => `Mem: ${c.parsed.y.toFixed(1)}%` } } } } });

  // Packet Loss
  const plCtx = $('#chart-packetloss');
  if (plCtx) { const d = generateData(20, 0, 18); chartInstances.packetloss = new Chart(plCtx, { type: 'bar', data: { labels: tl, datasets: [{ data: d, backgroundColor: d.map(v => v > 10 ? 'rgba(255,45,120,0.6)' : v > 5 ? 'rgba(255,184,0,0.5)' : 'rgba(0,255,136,0.4)'), borderRadius: 3, borderSkipped: false }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 9 } } }, y: { min: 0, max: 25, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { callback: v => v + '%', font: { size: 9 } } } }, plugins: { tooltip: { ...tooltipOpts('rgba(255,184,0,0.3)'), callbacks: { label: c => `Loss: ${c.parsed.y.toFixed(2)}%` } } } } }); }

  // Latency
  const latCtx = $('#chart-latency');
  if (latCtx) chartInstances.latency = new Chart(latCtx, { type: 'line', data: { labels: tl, datasets: [{ data: generateData(20, 10, 120), borderColor: '#ffb800', borderWidth: 2, fill: true, backgroundColor: makeGradient(latCtx, 200, 'rgb(255, 184, 0)') }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 6, font: { size: 9 } } }, y: { min: 0, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { callback: v => v + 'ms', font: { size: 9 } } } }, plugins: { tooltip: { ...tooltipOpts('rgba(255,184,0,0.3)'), callbacks: { label: c => `Latency: ${c.parsed.y.toFixed(1)}ms` } } } } });

  // Topology
  dashboardTopology = new NetworkTopology('topology-canvas');

  // Predictions
  renderPredictions('prediction-list');

  // Chat
  initChat('chat-messages', 'chat-input', 'chat-send');

  // Incidents
  renderDashIncidents();

  // Risk Table
  renderRiskTable();

  // Live updates
  setInterval(() => updateDashCharts(), 3000);
  setInterval(() => updateKPIs(), 5000);
  setInterval(() => { if (dashboardTopology) dashboardTopology.perturbHealth(); }, 8000);
};

function renderPredictions(containerId) {
  const c = document.getElementById(containerId); if (!c) return;
  c.innerHTML = PREDICTIONS_DATA.map((p, i) => {
    const elapsed = (Date.now() - p.countdownStart) / 1000;
    const rem = Math.max(0, p.timeToFailure * 60 - elapsed);
    const min = Math.floor(rem / 60), sec = Math.floor(rem % 60);
    return `<div class="prediction-item severity-${p.severity}"><div class="pred-header"><span class="pred-device">${p.device}</span><span class="pred-confidence">${p.confidence}%</span></div><div class="pred-message">${p.message}</div><div class="pred-timeline-bar"><div class="pred-timeline-fill" style="width:${Math.min(95, p.confidence)}%"></div></div><div class="pred-time-labels"><span class="pred-time-label">Now</span><span class="pred-time-label">${Math.floor(p.timeToFailure/3)}m</span><span class="pred-time-label">${Math.floor(p.timeToFailure*2/3)}m</span><span class="pred-time-label">Failure</span></div><div class="pred-countdown">⏱ ETA: ${min}m ${sec.toString().padStart(2,'0')}s</div></div>`;
  }).join('');
}

function initChat(msgId, inputId, sendId) {
  const container = document.getElementById(msgId);
  const input = document.getElementById(inputId);
  const sendBtn = document.getElementById(sendId);
  if (!container || !input || !sendBtn) return;

  const initial = [
    { role: 'ai', text: 'NetSage AI initialized. Operating in fully offline mode — zero internet dependency. All inference runs on local Llama 3 instance. How can I assist?' },
    { role: 'user', text: 'What\'s the current network status?' },
    { role: 'ai', text: CHAT_RESPONSES['network status'] }
  ];
  initial.forEach((m, i) => setTimeout(() => addMsg(container, m.role, m.text), i * 200));

  const handleSend = () => {
    const text = input.value.trim(); if (!text) return;
    addMsg(container, 'user', text);
    input.value = '';
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-msg ai';
    typingEl.innerHTML = `<div class="chat-avatar">🤖</div><div class="chat-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
    const key = Object.keys(CHAT_RESPONSES).find(k => text.toLowerCase().includes(k)) || 'default';
    setTimeout(() => { container.removeChild(typingEl); addMsg(container, 'ai', CHAT_RESPONSES[key]); }, 1200 + Math.random() * 800);
  };
  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
}

function addMsg(container, role, text) {
  const d = document.createElement('div');
  d.className = `chat-msg ${role}`;
  d.innerHTML = `<div class="chat-avatar">${role === 'ai' ? '🤖' : '👤'}</div><div class="chat-bubble">${text}</div>`;
  container.appendChild(d);
  container.scrollTop = container.scrollHeight;
}

function renderDashIncidents() {
  const c = $('#incident-timeline'); if (!c) return;
  c.innerHTML = INCIDENTS.slice(0, 9).map((inc, i) => `<div class="timeline-item" style="animation-delay:${i*0.08}s"><div class="timeline-marker"><div class="timeline-dot ${inc.severity}"></div>${i < 8 ? '<div class="timeline-line"></div>' : ''}</div><div class="timeline-content"><div class="timeline-time">${inc.time} IST</div><div class="timeline-title">${inc.title}</div><div class="timeline-desc">${inc.desc}</div><span class="timeline-tag ${inc.tag}">${inc.tag}</span></div></div>`).join('');
}

function renderRiskTable() {
  const tbody = $('#risk-table-body'); if (!tbody) return;
  const rl = r => r >= 70 ? 'high' : r >= 40 ? 'medium' : 'low';
  const sl = r => r >= 70 ? 'critical' : r >= 40 ? 'warning' : 'healthy';
  tbody.innerHTML = DEVICES.map(d => `<tr><td><span class="device-name">${d.name}</span></td><td>${d.location}</td><td><div class="risk-bar-container"><div class="risk-bar"><div class="risk-bar-fill ${rl(d.risk)}" style="width:${d.risk}%"></div></div><span class="risk-percent ${rl(d.risk)}">${d.risk}%</span></div></td><td><span class="status-badge ${sl(d.risk)}"><span class="status-badge-dot"></span>${sl(d.risk)}</span></td><td style="font-family:'JetBrains Mono',monospace;font-size:11px">${d.cpu}%</td><td style="font-family:'JetBrains Mono',monospace;font-size:11px">${d.mem}%</td></tr>`).join('');
}

function updateDashCharts() {
  const t = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  Object.entries(chartInstances).forEach(([k, ch]) => {
    if (!ch) return;
    ch.data.labels.push(t); ch.data.labels.shift();
    ch.data.datasets.forEach(ds => {
      let v;
      switch (k) { case 'cpu': v = rand(40, 95); break; case 'memory': v = rand(50, 92); break; case 'packetloss': v = rand(0, 18); break; case 'latency': v = rand(10, 120); break; default: v = rand(20, 80); }
      ds.data.push(v); ds.data.shift();
      if (k === 'packetloss') ds.backgroundColor = ds.data.map(v => v > 10 ? 'rgba(255,45,120,0.6)' : v > 5 ? 'rgba(255,184,0,0.5)' : 'rgba(0,255,136,0.4)');
    });
    ch.update('none');
  });
}

function updateKPIs() {
  const h = $('#kpi-health'), a = $('#kpi-alerts'), l = $('#kpi-latency'), p = $('#kpi-predictions');
  if (h) h.innerHTML = `${(93+rand(0,4)).toFixed(1)}<span style="font-size:16px;color:var(--green)">%</span>`;
  if (a) a.textContent = randInt(8, 16);
  if (l) l.innerHTML = `${randInt(18,35)}<span style="font-size:14px;color:var(--text-muted)">ms</span>`;
  if (p) p.textContent = randInt(5, 12);
}

/* ══════════════════════════════════════════
   PAGE: NETWORK MAP
   ══════════════════════════════════════════ */

let netmapTopology;
pageInitMap['network-map'] = function () {
  netmapTopology = new NetworkTopology('netmap-full-canvas', {
    onNodeClick: (node) => showDeviceDetail(node)
  });
  setInterval(() => { if (netmapTopology) netmapTopology.perturbHealth(); }, 6000);
};

function showDeviceDetail(node) {
  const ph = $('#netmap-detail .detail-placeholder');
  const dc = $('#netmap-detail-content');
  if (ph) ph.style.display = 'none';
  if (!dc) return;
  dc.style.display = 'block';
  const c = node.health >= 75 ? 'var(--green)' : node.health >= 50 ? 'var(--amber)' : 'var(--magenta)';
  const bg = node.health >= 75 ? 'var(--green-dim)' : node.health >= 50 ? 'var(--amber-dim)' : 'var(--magenta-dim)';
  const st = node.health >= 75 ? 'healthy' : node.health >= 50 ? 'warning' : 'critical';
  dc.innerHTML = `
    <div class="detail-device-header">
      <div class="detail-device-icon" style="background:${bg};color:${c}">🖥️</div>
      <div><div class="detail-device-name">${node.label}</div><div class="detail-device-type">${node.type} · <span class="status-badge ${st}"><span class="status-badge-dot"></span>${st}</span></div></div>
    </div>
    <div class="detail-metrics">
      <div class="detail-metric"><div class="detail-metric-value" style="color:${c}">${node.health.toFixed(0)}%</div><div class="detail-metric-label">Health</div></div>
      <div class="detail-metric"><div class="detail-metric-value">${node.risk.toFixed(0)}%</div><div class="detail-metric-label">Risk Score</div></div>
      <div class="detail-metric"><div class="detail-metric-value">${node.cpu.toFixed(0)}%</div><div class="detail-metric-label">CPU Usage</div></div>
      <div class="detail-metric"><div class="detail-metric-value">${node.mem.toFixed(0)}%</div><div class="detail-metric-label">Memory</div></div>
    </div>
    <h4 style="font-size:12px;color:var(--text-muted);margin:16px 0 8px;text-transform:uppercase;letter-spacing:1px">Connected Devices</h4>
    <div style="display:flex;flex-direction:column;gap:6px">
      ${[1,2,3].map(i => `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:rgba(255,255,255,0.02);border-radius:6px;font-size:12px"><span style="font-family:'JetBrains Mono',monospace">${pick(DEVICE_TYPES).split(' ')[0]}-${randInt(1,30)}</span><span class="status-badge ${pick(['healthy','healthy','warning'])}"><span class="status-badge-dot"></span>${pick(['healthy','healthy','warning'])}</span></div>`).join('')}
    </div>
    <h4 style="font-size:12px;color:var(--text-muted);margin:16px 0 8px;text-transform:uppercase;letter-spacing:1px">Recent Alerts</h4>
    <div style="display:flex;flex-direction:column;gap:6px">
      <div style="padding:8px 10px;background:rgba(255,255,255,0.02);border-radius:6px;font-size:11px;color:var(--text-secondary)">
        <div style="color:var(--amber);font-weight:600;margin-bottom:2px">⚠ High CPU Warning</div>
        <div>CPU exceeded 80% threshold · 12min ago</div>
      </div>
      <div style="padding:8px 10px;background:rgba(255,255,255,0.02);border-radius:6px;font-size:11px;color:var(--text-secondary)">
        <div style="color:var(--green);font-weight:600;margin-bottom:2px">✓ Link Restored</div>
        <div>Backup link failover completed · 45min ago</div>
      </div>
    </div>`;
}

/* ══════════════════════════════════════════
   PAGE: AI ASSISTANT
   ══════════════════════════════════════════ */

pageInitMap['ai-assistant'] = function () {
  initChat('ai-chat-body', 'ai-chat-input', 'ai-chat-send');

  // Suggested queries
  $$('.suggested-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = $('#ai-chat-input');
      if (input) { input.value = btn.dataset.query; input.focus(); }
    });
  });

  // Knowledge base topic click
  $$('.kb-topic').forEach(t => {
    t.addEventListener('click', () => {
      const input = $('#ai-chat-input');
      const topic = t.querySelector('span:last-child').textContent;
      if (input) { input.value = `Explain ${topic}`; input.focus(); }
    });
  });

  // Conversation items
  $$('.ai-convo-item').forEach(item => {
    item.addEventListener('click', () => {
      $$('.ai-convo-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
};

/* ══════════════════════════════════════════
   PAGE: INCIDENTS
   ══════════════════════════════════════════ */

pageInitMap['incidents'] = function () {
  renderFullIncidents();
  initIncidentChart();

  // Filter pills
  $$('#view-incidents .filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('#view-incidents .filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderFullIncidents(pill.dataset.severity);
    });
  });
};

function renderFullIncidents(filter = 'all') {
  const c = $('#incidents-full-list'); if (!c) return;
  const filtered = filter === 'all' ? INCIDENTS : INCIDENTS.filter(i => i.severity === filter);
  c.innerHTML = filtered.map((inc, i) => `
    <div class="incident-card sev-${inc.severity}" style="animation:fadeInUp 0.3s ease-out ${i*0.05}s both">
      <div class="incident-top">
        <span class="incident-id">${inc.id}</span>
        <span class="timeline-tag ${inc.tag}">${inc.tag}</span>
      </div>
      <div class="incident-title">${inc.title}</div>
      <div class="incident-desc">${inc.desc}</div>
      <div class="incident-footer">
        <span class="incident-meta">🕐 ${inc.time} IST</span>
        <span class="incident-meta">🖥️ ${inc.device}</span>
      </div>
    </div>`).join('');
}

function initIncidentChart() {
  const ctx = $('#chart-incident-trends'); if (!ctx) return;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  new Chart(ctx, {
    type: 'bar',
    data: { labels: days, datasets: [
      { label: 'Critical', data: [3, 2, 5, 1, 4, 2, 3], backgroundColor: 'rgba(255,45,120,0.6)', borderRadius: 4 },
      { label: 'Warning', data: [8, 5, 12, 6, 9, 4, 7], backgroundColor: 'rgba(255,184,0,0.5)', borderRadius: 4 },
      { label: 'Info', data: [12, 8, 6, 10, 5, 7, 9], backgroundColor: 'rgba(0,212,255,0.4)', borderRadius: 4 },
    ] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { boxWidth: 8, padding: 12, font: { size: 10 } } } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: { color: 'rgba(255,255,255,0.03)' } } } }
  });
}

/* ══════════════════════════════════════════
   PAGE: PREDICTIONS
   ══════════════════════════════════════════ */

pageInitMap['predictions'] = function () {
  renderPredictions('pred-full-list');
  renderRiskHeatmap();
  initPredAccuracyChart();
  renderForecastTimeline();
};

function renderRiskHeatmap() {
  const c = $('#risk-heatmap'); if (!c) return;
  const allDevices = [...DEVICES, ...Array(24).fill(0).map((_, i) => ({ name: `D-${i + 13}`, risk: randInt(2, 60) }))];
  c.innerHTML = allDevices.map(d => {
    const color = d.risk >= 70 ? 'var(--magenta)' : d.risk >= 40 ? 'var(--amber)' : 'var(--green)';
    const bg = d.risk >= 70 ? 'var(--magenta-dim)' : d.risk >= 40 ? 'var(--amber-dim)' : 'var(--green-dim)';
    return `<div class="heatmap-cell" style="background:${bg}"><span class="hm-name">${d.name}</span><span class="hm-risk" style="color:${color}">${d.risk}%</span></div>`;
  }).join('');
}

function initPredAccuracyChart() {
  const ctx = $('#chart-pred-accuracy'); if (!ctx) return;
  const days = Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`);
  new Chart(ctx, {
    type: 'line',
    data: { labels: days, datasets: [
      { label: 'Predicted', data: generateData(30, 3, 12), borderColor: '#00d4ff', borderWidth: 2, fill: false },
      { label: 'Actual', data: generateData(30, 2, 10), borderColor: '#ff2d78', borderWidth: 2, borderDash: [5, 5], fill: false },
    ] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { boxWidth: 12, padding: 12, font: { size: 10 } } } }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 9 } } }, y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { font: { size: 9 } }, title: { display: true, text: 'Incidents', font: { size: 10 }, color: '#4a5e7a' } } } }
  });
}

function renderForecastTimeline() {
  const c = $('#forecast-timeline'); if (!c) return;
  const events = [
    { time: '+15m', event: 'R12 CPU thermal throttling expected', prob: '92%', color: 'var(--magenta)' },
    { time: '+35m', event: 'FW03 memory exhaustion predicted', prob: '85%', color: 'var(--magenta)' },
    { time: '+45m', event: 'S07 congestion event likely', prob: '78%', color: 'var(--amber)' },
    { time: '+1.5h', event: 'LB-02 connection pool capacity', prob: '71%', color: 'var(--amber)' },
    { time: '+3h', event: 'Routine latency spike (Delhi)', prob: '60%', color: 'var(--amber)' },
    { time: '+6h', event: 'Scheduled maintenance window', prob: '100%', color: 'var(--cyan)' },
    { time: '+12h', event: 'AP-14 signal degradation cycle', prob: '55%', color: 'var(--cyan)' },
    { time: '+24h', event: 'Storage capacity review due', prob: '45%', color: 'var(--cyan)' },
  ];
  c.innerHTML = events.map(e => `<div class="forecast-item"><span class="forecast-time">${e.time}</span><span class="forecast-event">${e.event}</span><span class="forecast-prob" style="color:${e.color}">${e.prob}</span></div>`).join('');
}

/* ══════════════════════════════════════════
   PAGE: TELEMETRY
   ══════════════════════════════════════════ */

const telemCharts = {};
pageInitMap['telemetry'] = function () {
  const tl = generateTimeLabels(30);
  const configs = [
    { id: 'telem-cpu', label: 'CPU', color: '#00d4ff', min: 30, max: 95, unit: '%' },
    { id: 'telem-mem', label: 'Memory', color: '#a855f7', min: 40, max: 92, unit: '%' },
    { id: 'telem-disk', label: 'Disk I/O', color: '#ffb800', min: 50, max: 400, unit: ' MB/s' },
    { id: 'telem-net', label: 'Throughput', color: '#00ff88', min: 200, max: 2000, unit: ' Mbps' },
    { id: 'telem-pl', label: 'Pkt Loss', color: '#ff2d78', min: 0, max: 15, unit: '%' },
    { id: 'telem-lat', label: 'Latency', color: '#ffb800', min: 5, max: 100, unit: 'ms' },
  ];

  configs.forEach(cfg => {
    const ctx = document.getElementById(cfg.id); if (!ctx) return;
    telemCharts[cfg.id] = new Chart(ctx, {
      type: 'line',
      data: { labels: tl, datasets: [{ label: cfg.label, data: generateData(30, cfg.min, cfg.max), borderColor: cfg.color, borderWidth: 2, fill: true, backgroundColor: makeGradient(ctx, 240, cfg.color) }] },
      options: { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' }, scales: { x: { grid: { display: false }, ticks: { maxTicksLimit: 8, font: { size: 9 } } }, y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { callback: v => v + cfg.unit, font: { size: 9 } } } }, plugins: { tooltip: tooltipOpts(cfg.color.replace('#', 'rgba(').replace(/../g, (m, i) => (i === 0 ? '' : parseInt(m, 16) + ',')) + '0.3)') } }
    });
  });

  // Time range pills
  $$('#view-telemetry .filter-pill').forEach(p => {
    p.addEventListener('click', () => {
      $$('#view-telemetry .filter-pill').forEach(pp => pp.classList.remove('active'));
      p.classList.add('active');
    });
  });

  // Live update telemetry values
  setInterval(() => {
    const vals = { 'telem-cpu-val': `${rand(40,95).toFixed(1)}%`, 'telem-mem-val': `${rand(50,92).toFixed(1)}%`, 'telem-disk-val': `${randInt(100,450)} MB/s`, 'telem-net-val': `${(rand(0.5,2.5)).toFixed(1)} Gbps`, 'telem-pl-val': `${rand(0,8).toFixed(1)}%`, 'telem-lat-val': `${randInt(10,80)}ms` };
    Object.entries(vals).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
  }, 4000);
};

/* ══════════════════════════════════════════
   PAGE: DEVICE RISK
   ══════════════════════════════════════════ */

pageInitMap['device-risk'] = function () {
  renderDeviceCards();

  // Filters
  $$('#view-device-risk .filter-pill').forEach(p => {
    p.addEventListener('click', () => {
      $$('#view-device-risk .filter-pill').forEach(pp => pp.classList.remove('active'));
      p.classList.add('active');
      renderDeviceCards(p.dataset.dstatus);
    });
  });

  // Search
  const searchInput = $('#device-search');
  if (searchInput) searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    $$('.device-card').forEach(card => {
      card.style.display = card.dataset.name.includes(q) || card.dataset.location.includes(q) ? '' : 'none';
    });
  });
};

function renderDeviceCards(filter = 'all') {
  const c = $('#device-cards-grid'); if (!c) return;
  const status = r => r >= 70 ? 'critical' : r >= 40 ? 'warning' : 'healthy';
  const riskClass = r => r >= 70 ? 'risk-high' : r >= 40 ? 'risk-medium' : 'risk-low';
  const riskColor = r => r >= 70 ? 'var(--magenta)' : r >= 40 ? 'var(--amber)' : 'var(--green)';

  const filtered = filter === 'all' ? DEVICES : DEVICES.filter(d => status(d.risk) === filter);
  const circ = 2 * Math.PI * 32; // SVG circle circumference

  c.innerHTML = filtered.map(d => {
    const offset = circ - (d.risk / 100) * circ;
    const strokeColor = riskColor(d.risk).replace('var(--', '').replace(')', '');
    const strokeMap = { magenta: '#ff2d78', amber: '#ffb800', green: '#00ff88' };
    const stroke = strokeMap[strokeColor] || '#00ff88';
    return `
    <div class="device-card ${riskClass(d.risk)}" data-name="${d.name.toLowerCase()}" data-location="${d.location.toLowerCase()}">
      <div class="device-card-header">
        <div><div class="device-card-name">${d.name}</div><div class="device-card-location">${d.location}</div><div class="device-card-type">${d.type}</div></div>
        <span class="status-badge ${status(d.risk)}"><span class="status-badge-dot"></span>${status(d.risk)}</span>
      </div>
      <div class="risk-gauge">
        <svg class="risk-gauge-circle" width="80" height="80" viewBox="0 0 80 80">
          <circle class="risk-gauge-bg" cx="40" cy="40" r="32" />
          <circle class="risk-gauge-fill" cx="40" cy="40" r="32" stroke="${stroke}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" />
        </svg>
        <div class="risk-gauge-text" style="color:${riskColor(d.risk)}">${d.risk}%</div>
      </div>
      <div class="device-card-metrics">
        <div class="device-metric"><span class="device-metric-label">CPU</span><span class="device-metric-val">${d.cpu}%</span></div>
        <div class="device-metric"><span class="device-metric-label">Memory</span><span class="device-metric-val">${d.mem}%</span></div>
        <div class="device-metric"><span class="device-metric-label">Latency</span><span class="device-metric-val">${d.latency}ms</span></div>
        <div class="device-metric"><span class="device-metric-label">Pkt Loss</span><span class="device-metric-val">${d.packetLoss}%</span></div>
      </div>
      <div class="device-card-footer"><span>Uptime: ${d.uptime}%</span><span>Last alert: ${randInt(1, 120)}m ago</span></div>
    </div>`;
  }).join('');
}

/* ══════════════════════════════════════════
   PAGE: DIGITAL TWIN
   ══════════════════════════════════════════ */

let dtTopology;
pageInitMap['digital-twin'] = function () {
  dtTopology = new NetworkTopology('dt-canvas');

  // Scenario buttons
  $$('.scenario-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.scenario-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Run simulation
  $('#sim-start').addEventListener('click', () => runSimulation());
  $('#sim-reset').addEventListener('click', () => resetSimulation());
};

function runSimulation() {
  const statusBadge = $('#sim-status');
  const log = $('#sim-log');
  statusBadge.textContent = 'RUNNING';
  statusBadge.className = 'sim-status-badge running';

  const logEntries = [
    { time: '0.0s', text: '▶ Simulation started — Node Failure scenario' },
    { time: '0.5s', text: '📡 Injecting fault on target device...' },
    { time: '1.2s', text: '⚠ Target node health dropping: 100% → 45%' },
    { time: '2.0s', text: '🔄 Rerouting traffic through backup paths...' },
    { time: '3.1s', text: '⚡ Cascade impact detected on 3 downstream nodes' },
    { time: '4.5s', text: '📊 Latency increased by 35ms on affected paths' },
    { time: '5.8s', text: '✅ Failover complete — traffic stabilized' },
    { time: '7.0s', text: '📋 Impact report generated' },
  ];

  log.innerHTML = '';
  logEntries.forEach((entry, i) => {
    setTimeout(() => {
      log.innerHTML += `<div class="sim-log-entry"><span class="sim-log-time">${entry.time}</span><span>${entry.text}</span></div>`;
      log.scrollTop = log.scrollHeight;
    }, i * 900);
  });

  // Update impact metrics over time
  setTimeout(() => {
    $('#impact-nodes').textContent = '3 affected';
    $('#impact-nodes').style.color = 'var(--amber)';
  }, 2000);
  setTimeout(() => {
    $('#impact-traffic').textContent = '2.4 Gbps rerouted';
    $('#impact-traffic').style.color = 'var(--cyan)';
  }, 3000);
  setTimeout(() => {
    $('#impact-latency').textContent = '+35ms increase';
    $('#impact-latency').style.color = 'var(--amber)';
  }, 4000);
  setTimeout(() => {
    $('#impact-avail').textContent = '97.3% → 99.1%';
    $('#impact-avail').style.color = 'var(--green)';
  }, 5500);
  setTimeout(() => {
    $('#impact-recovery').textContent = '~5.8 seconds';
    $('#impact-recovery').style.color = 'var(--green)';
    statusBadge.textContent = 'COMPLETE';
    statusBadge.className = 'sim-status-badge complete';
  }, 7000);

  // Perturb topology
  if (dtTopology) {
    dtTopology.nodes.forEach(n => { n.health = Math.max(20, n.health - rand(5, 30)); n.risk = 100 - n.health; });
  }
}

function resetSimulation() {
  const statusBadge = $('#sim-status');
  statusBadge.textContent = 'READY';
  statusBadge.className = 'sim-status-badge';
  $('#sim-log').innerHTML = '<div class="sim-log-entry">System ready for simulation.</div>';
  ['impact-nodes','impact-traffic','impact-latency','impact-avail','impact-recovery'].forEach(id => {
    const el = document.getElementById(id); if (el) { el.textContent = '—'; el.style.color = ''; }
  });
  if (dtTopology) dtTopology.nodes.forEach(n => { n.health = rand(50, 100); n.risk = 100 - n.health; });
}

/* ══════════════════════════════════════════
   PAGE: REPORTS
   ══════════════════════════════════════════ */

pageInitMap['reports'] = function () {
  renderReportsTable();

  // Generate report buttons
  $$('.report-template-card .btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = '⏳ Generating...';
      btn.disabled = true;
      setTimeout(() => { btn.textContent = '✅ Generated!'; btn.style.background = 'var(--green-dim)'; btn.style.color = 'var(--green)'; }, 2000);
      setTimeout(() => { btn.textContent = 'Generate Report'; btn.style.background = ''; btn.style.color = ''; btn.disabled = false; }, 4000);
    });
  });
};

function renderReportsTable() {
  const tbody = $('#reports-table-body'); if (!tbody) return;
  const reports = [
    { name: 'Daily Health Summary — Jul 1', type: 'Health', time: '2h ago', status: 'ready' },
    { name: 'Incident Report — R12 CPU Event', type: 'Incident', time: '5h ago', status: 'ready' },
    { name: 'Weekly Risk Assessment', type: 'Risk', time: '1d ago', status: 'ready' },
    { name: 'Daily Health Summary — Jun 30', type: 'Health', time: '1d ago', status: 'ready' },
    { name: 'Capacity Planning Q3 2026', type: 'Capacity', time: '3d ago', status: 'ready' },
    { name: 'Incident Report — Kolkata Link', type: 'Incident', time: '5d ago', status: 'archived' },
  ];
  tbody.innerHTML = reports.map(r => `
    <tr>
      <td style="font-weight:600">${r.name}</td>
      <td><span class="timeline-tag info">${r.type}</span></td>
      <td style="color:var(--text-muted)">${r.time}</td>
      <td><span class="status-badge ${r.status === 'ready' ? 'healthy' : 'warning'}"><span class="status-badge-dot"></span>${r.status}</span></td>
      <td><button class="btn-secondary" style="padding:4px 12px;font-size:11px">↓ Download</button></td>
    </tr>`).join('');
}

/* ══════════════════════════════════════════
   PAGE: SETTINGS
   ══════════════════════════════════════════ */

pageInitMap['settings'] = function () {
  // Settings nav
  $$('.settings-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      $$('.settings-nav-item').forEach(i => i.classList.remove('active'));
      $$('.settings-section').forEach(s => s.classList.remove('active'));
      item.classList.add('active');
      const section = $(`#settings-${item.dataset.section}`);
      if (section) section.classList.add('active');
    });
  });

  // Range sliders
  $$('.styled-range').forEach(range => {
    const valueDisplay = range.parentElement.querySelector('.range-value');
    if (valueDisplay) {
      range.addEventListener('input', () => {
        let val = range.value;
        if (range.max === '100' && range.min === '0') val = (val / 100).toFixed(2);
        else if (range.max === '100') val = val + '%';
        else if (range.max === '200') val = val + 'ms';
        else if (range.max === '30') val = val + '%';
        valueDisplay.textContent = val;
      });
    }
  });
};

/* ══════════════════════════════════════════
   FULLSCREEN
   ══════════════════════════════════════════ */

function initFullscreen() {
  const btn = $('#btn-fullscreen');
  if (btn) btn.addEventListener('click', () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
}

/* ══════════════════════════════════════════
   INITIALIZATION
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initFullscreen();

  console.log('%c NetSage AI v2.1.0 — Full Application ', 'background: linear-gradient(135deg, #00d4ff, #0088cc); color: #fff; padding: 8px 16px; border-radius: 4px; font-weight: 700; font-size: 14px;');
  console.log('%c Air-Gapped Mode • 10 Pages • Zero Internet Dependency ', 'background: rgba(0,255,136,0.15); color: #00ff88; padding: 4px 12px; border-radius: 3px;');
});
