import { mkdir, writeFile } from 'node:fs/promises';

// Synthetic radar frames for SKYFALL. Palette stops are sampled from the supplied KMA legend.
const output = new URL('../../output/maps/', import.meta.url);
const longitudeStep = 0.016;
const latitudeStep = 0.0128;
const westOrigin = 127.708;
const southOrigin = 36.6344;
const maxCells = 256;
const scans = [
  { name: '1329', bounds: [127.40, 36.40, 128.08, 36.96], core: [127.732, 36.64], reach: [0.031, 0.033], rate: 18 },
  { name: '1331', bounds: [127.40, 36.40, 128.08, 36.96], core: [127.735, 36.65], reach: [0.046, 0.041], rate: 33 },
  { name: '1340', bounds: [127.40, 36.40, 128.08, 36.96], core: [127.738, 36.66], reach: [0.055, 0.045], rate: 61 },
  { name: '1345', bounds: [127.40, 36.40, 128.08, 36.96], core: [127.743, 36.66], reach: [0.057, 0.051], rate: 116 },
  { name: '1350', bounds: [127.40, 36.40, 128.14, 37.04], core: [127.752, 36.68], reach: [0.070, 0.074], rate: 118 },
  { name: '1415', bounds: [127.15, 36.29, 128.43, 37.21], core: [127.764, 36.70], reach: [0.11, 0.12], rate: 122 },
  { name: '1500', bounds: [127.04, 36.06, 128.79, 37.59], core: [127.80, 36.79], reach: [0.19, 0.23], rate: 126 },
  { name: '1545', bounds: [126.50, 35.92, 129.32, 38.17], core: [127.86, 36.92], reach: [0.31, 0.35], rate: 132 },
  { name: '1620', bounds: [126.42, 35.80, 129.48, 38.27], core: [127.89, 36.96], reach: [0.38, 0.42], rate: 137 },
  { name: '1705', bounds: [126.27, 35.66, 129.70, 38.40], core: [127.90, 36.98], reach: [0.45, 0.47], rate: 140 },
  { name: '1935', bounds: [125.65, 34.98, 130.05, 38.77], core: [127.91, 36.98], reach: [0.53, 0.62], rate: 146 },
  { name: '2020', bounds: [125.32, 34.60, 130.32, 39.03], core: [127.91, 36.98], reach: [0.63, 0.79], rate: 148 },
  { name: '2110', bounds: [124.90, 33.60, 130.90, 39.50], core: [127.84, 36.90], reach: [0.94, 1.06], rate: 177 },
  { name: '2215', bounds: [124.40, 33.00, 131.30, 40.00], core: [127.78, 36.72], reach: [1.23, 1.30], rate: 210 },
  { name: '2250', bounds: [124.40, 33.00, 131.30, 40.00], core: [127.78, 36.72], reach: [1.26, 1.34], rate: 217 },
  { name: '2255', bounds: [124.40, 33.00, 131.30, 40.00], core: [127.78, 36.72], reach: [1.30, 1.38], rate: 226 },
];

const palette = [
  [0.1, '#009bf5'], [0.5, '#0033f5'], [1, '#00ff00'], [3, '#008c00'],
  [5, '#ffe100'], [10, '#ff6600'], [20, '#d20000'], [30, '#e0a9ff'],
  [50, '#b329ff'], [70, '#b3b4de'], [80, '#4c4eb1'], [90, '#000390'],
  [110, '#333333'],
];

function lattice(x, y) {
  const hash = Math.imul(x, 374761393) + Math.imul(y, 668265263) | 0;
  const stirred = Math.imul(hash ^ hash >>> 13, 1274126177);
  return ((stirred ^ stirred >>> 16) >>> 0) / 4294967295;
}

function noise(x, y) {
  const west = Math.floor(x), south = Math.floor(y);
  const dx = x - west, dy = y - south;
  const u = dx * dx * (3 - 2 * dx), v = dy * dy * (3 - 2 * dy);
  const lower = lattice(west, south) * (1 - u) + lattice(west + 1, south) * u;
  const upper = lattice(west, south + 1) * (1 - u) + lattice(west + 1, south + 1) * u;
  return lower * (1 - v) + upper * v;
}

function cellColor(longitude, latitude, scan) {
  const x = (longitude - scan.core[0]) / scan.reach[0];
  const y = (latitude - scan.core[1]) / scan.reach[1];
  const drift = x - 0.42 * y + 0.32 * (noise(x * 2.6 + 6, y * 2.6) - 0.5);
  const envelope = Math.exp(-2.3 * drift ** 2 - 1.4 * y ** 2);
  const tail = Math.exp(-3 * (drift - 0.52) ** 2 - 0.62 * (y + 1.12) ** 2);
  const texture = 0.56 * noise(x * 5.2 + 15, y * 5.2) + 0.30 * noise(x * 12, y * 12 + 7)
    + 0.14 * noise(x * 29, y * 29);
  const body = Math.max(0, envelope * (0.72 + texture) + 0.20 * tail - (0.10 + 0.15 * (1 - texture)));
  const estimate = scan.rate * body ** 1.75;
  return palette.findLast(([minimum]) => estimate >= minimum)?.[1] ?? null;
}

function scanGrid(scan, left, bottom, right, top) {
  const bounds = [
    westOrigin + left * longitudeStep, southOrigin + bottom * latitudeStep,
    westOrigin + right * longitudeStep, southOrigin + top * latitudeStep,
  ];
  const cells = Array.from({ length: top - bottom }, (_, row) => {
    const latitude = southOrigin + (top - row - 0.5) * latitudeStep;
    return Array.from({ length: right - left }, (_, column) => {
      const longitude = westOrigin + (left + column + 0.5) * longitudeStep;
      return cellColor(longitude, latitude, scan);
    });
  });
  return { bounds, cells };
}

await mkdir(output, { recursive: true });
for (const scan of scans) {
  const [west, south, east, north] = scan.bounds;
  const left = Math.floor((west - westOrigin) / longitudeStep);
  const right = Math.ceil((east - westOrigin) / longitudeStep);
  const bottom = Math.floor((south - southOrigin) / latitudeStep);
  const top = Math.ceil((north - southOrigin) / latitudeStep);
  let part = 0;
  for (let row = top; row > bottom; row -= maxCells) {
    for (let column = left; column < right; column += maxCells) {
      const grid = scanGrid(scan, column, Math.max(bottom, row - maxCells), Math.min(right, column + maxCells), row);
      if (!grid.cells.some(line => line.some(cell => cell !== null))) continue;
      part += 1;
      const file = 'radar-' + scan.name + (part > 1 ? '-' + part : '') + '.json';
      await writeFile(new URL(file, output), JSON.stringify(grid) + '\n');
    }
  }
  console.log(scan.name + ' ' + part);
}
