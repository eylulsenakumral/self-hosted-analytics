/**
 * Screenshot Placeholder Generator
 *
 * Creates SVG-based placeholder screenshots when actual browser screenshots aren't available
 */

export function generateDashboardSVG(theme: 'light' | 'dark' = 'dark'): string {
  const colors = theme === 'dark' ? {
    bg: '#0a0a0b',
    card: '#1a1a1b',
    border: '#2a2a2b',
    text: '#ffffff',
    textMuted: '#737373',
    accent: '#667eea',
  } : {
    bg: '#ffffff',
    card: '#f5f5f5',
    border: '#e5e5e5',
    text: '#000000',
    textMuted: '#737373',
    accent: '#667eea',
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&amp;display=swap');
    .title { font-family: 'JetBrains Mono', monospace; font-size: 48px; font-weight: 800; fill: url(#gradient); }
    .subtitle { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 400; fill: ${colors.textMuted}; }
    .metric-label { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 500; fill: ${colors.textMuted}; }
    .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 36px; font-weight: 700; fill: ${colors.text}; }
    .footer { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 400; fill: ${colors.textMuted}; }
  </style>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="${colors.bg}"/>

  <!-- Header -->
  <text x="600" y="120" text-anchor="middle" class="title">Self-Hosted Analytics</text>
  <text x="600" y="160" text-anchor="middle" class="subtitle">Privacy-first analytics dashboard</text>

  <!-- Metric Cards Grid -->
  <g transform="translate(100, 220)">
    <!-- Card 1: Page Views -->
    <rect x="0" y="0" width="480" height="120" rx="16" fill="${colors.card}" stroke="${colors.border}" stroke-width="2"/>
    <text x="30" y="40" class="metric-label">Page Views (24h)</text>
    <text x="30" y="85" class="metric-value">1,234</text>

    <!-- Card 2: Unique Visitors -->
    <rect x="520" y="0" width="480" height="120" rx="16" fill="${colors.card}" stroke="${colors.border}" stroke-width="2"/>
    <text x="550" y="40" class="metric-label">Unique Visitors</text>
    <text x="550" y="85" class="metric-value">892</text>

    <!-- Card 3: Top Page -->
    <rect x="0" y="160" width="480" height="120" rx="16" fill="${colors.card}" stroke="${colors.border}" stroke-width="2"/>
    <text x="30" y="200" class="metric-label">Top Page</text>
    <text x="30" y="245" class="metric-value">/home</text>

    <!-- Card 4: Top Referrer -->
    <rect x="520" y="160" width="480" height="120" rx="16" fill="${colors.card}" stroke="${colors.border}" stroke-width="2"/>
    <text x="550" y="200" class="metric-label">Top Referrer</text>
    <text x="550" y="245" class="metric-value">google.com</text>
  </g>

  <!-- Footer -->
  <text x="600" y="580" text-anchor="middle" class="footer">Self-Hosted Analytics Dashboard</text>
</svg>`;
}

export function generateSetupWizardSVG(step: number): string {
  const steps = [
    { title: 'Step 1: Initialize Database', desc: 'One-click SQLite setup', action: 'npm run setup' },
    { title: 'Step 2: Copy Tracking Script', desc: 'Add to your website', action: '<script src="/tracker.js">' },
    { title: 'Step 3: Test Event Tracking', desc: 'Verify installation', action: 'Send test event' },
    { title: 'Step 4: View Dashboard', desc: 'See your analytics', action: 'Open /dashboard' },
  ];

  const currentStep = steps[step - 1] || steps[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&amp;display=swap');
    .step-title { font-family: 'JetBrains Mono', monospace; font-size: 42px; font-weight: 800; fill: #ffffff; }
    .step-desc { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 400; fill: #737373; }
    .step-action { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 400; fill: #e5e5e5; }
    .footer { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 400; fill: #737373; }
    .step-num-active { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700; fill: #ffffff; }
    .step-num-inactive { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700; fill: #737373; }
  </style>

  <!-- Background -->
  <rect width="1200" height="630" fill="#0a0a0b"/>

  <!-- Progress Indicator -->
  <g transform="translate(240, 80)">
    ${[1, 2, 3, 4].map(num => `
    <circle cx="${num * 200}" cy="30" r="24" fill="${num <= step ? '#667eea' : '#2a2a2b'}" stroke="${num <= step ? '#667eea' : '#3a3a3b'}" stroke-width="2"/>
    <text x="${num * 200}" y="38" text-anchor="middle" class="${num <= step ? 'step-num-active' : 'step-num-inactive'}">${num}</text>
    `).join('')}
  </g>

  <!-- Step Content Card -->
  <rect x="200" y="180" width="800" height="280" rx="24" fill="#1a1a1b" stroke="#2a2a2b" stroke-width="2"/>

  <!-- Step Content -->
  <text x="600" y="250" text-anchor="middle" class="step-title">${currentStep.title}</text>
  <text x="600" y="300" text-anchor="middle" class="step-desc">${currentStep.desc}</text>

  <!-- Code/Action Box -->
  <rect x="300" y="340" width="600" height="60" rx="12" fill="#2a2a2b"/>
  <text x="600" y="378" text-anchor="middle" class="step-action">${currentStep.action}</text>

  <!-- Footer -->
  <text x="600" y="580" text-anchor="middle" class="footer">Setup Wizard — 4 steps to analytics</text>
</svg>`;
}