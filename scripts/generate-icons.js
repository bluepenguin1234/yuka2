/**
 * Generates all app icon / splash assets from one SVG motif.
 * Run: node scripts/generate-icons.js   (requires devDependency: sharp)
 *
 * Motif: scan-frame corner brackets around a heart — "the scanner that cares."
 * Brand: deep green #0E5A4A on gradient, coral heart #E8654F, cream #FBF7F1.
 */
const sharp = require('sharp');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'images');

const HEART_PATH =
  'M50 88 C 20 63, 5 45, 5 28 C 5 13, 16 5, 28 5 C 38 5, 46 11, 50 20 ' +
  'C 54 11, 62 5, 72 5 C 84 5, 95 13, 95 28 C 95 45, 80 63, 50 88 Z';

function motifSvg({ size, bracketColor, heartColor, background, inset, stroke, armRatio = 0.42 }) {
  const arm = Math.round((size - inset * 2) * armRatio * 0.5);
  const left = inset;
  const right = size - inset;
  const top = inset;
  const bottom = size - inset;
  const heartSize = size * 0.42;
  const hx = (size - heartSize) / 2;
  const hy = (size - heartSize) / 2 + size * 0.01;
  const bg = background
    ? `<defs><radialGradient id="g" cx="35%" cy="28%" r="90%">
         <stop offset="0%" stop-color="#136B55"/><stop offset="100%" stop-color="#0A4237"/>
       </radialGradient></defs>
       <rect width="${size}" height="${size}" fill="url(#g)"/>`
    : '';
  const bracket = (x1, y1, x2, y2, x3, y3) =>
    `<polyline points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="none" stroke="${bracketColor}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bg}
    ${bracket(left, top + arm, left, top, left + arm, top)}
    ${bracket(right - arm, top, right, top, right, top + arm)}
    ${bracket(left, bottom - arm, left, bottom, left + arm, bottom)}
    ${bracket(right - arm, bottom, right, bottom, right, bottom - arm)}
    <g transform="translate(${hx} ${hy}) scale(${heartSize / 100})">
      <path d="${HEART_PATH}" fill="${heartColor}"/>
    </g>
  </svg>`;
}

async function render(svg, file, resize) {
  let img = sharp(Buffer.from(svg));
  if (resize) img = img.resize(resize, resize);
  await img.png().toFile(path.join(OUT, file));
  console.log('wrote', file);
}

(async () => {
  // App icon: full-bleed gradient, white brackets, coral heart (iOS masks corners itself)
  const appIcon = motifSvg({
    size: 1024, bracketColor: '#FFFFFF', heartColor: '#E8654F',
    background: true, inset: 200, stroke: 58,
  });
  await render(appIcon, 'icon.png');
  await render(appIcon, 'favicon.png', 48);

  // Splash icon: transparent bg (splash background is brand cream via app.json)
  const splash = motifSvg({
    size: 512, bracketColor: '#0E5A4A', heartColor: '#E8654F',
    background: false, inset: 70, stroke: 30,
  });
  await render(splash, 'splash-icon.png');

  // Android adaptive: foreground motif inside the ~66% safe zone, solid bg, white monochrome
  const androidFg = motifSvg({
    size: 1024, bracketColor: '#FFFFFF', heartColor: '#E8654F',
    background: false, inset: 310, stroke: 44,
  });
  await render(androidFg, 'android-icon-foreground.png');
  await render(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
       <defs><radialGradient id="g" cx="35%" cy="28%" r="90%">
         <stop offset="0%" stop-color="#136B55"/><stop offset="100%" stop-color="#0A4237"/>
       </radialGradient></defs>
       <rect width="1024" height="1024" fill="url(#g)"/></svg>`,
    'android-icon-background.png'
  );
  const mono = motifSvg({
    size: 1024, bracketColor: '#FFFFFF', heartColor: '#FFFFFF',
    background: false, inset: 310, stroke: 44,
  });
  await render(mono, 'android-icon-monochrome.png');
})();
