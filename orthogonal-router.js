const DEFAULT_CELL = 24;

function key(x, y) { return `${x},${y}`; }
function snap(value, cell) { return Math.round(value / cell) * cell; }
function distance(a, b) { return Math.abs(a.x - b.x) + Math.abs(a.y - b.y); }
function intersectsCell(x, y, obstacles, padding) { return obstacles.some((r) => x >= r.x - padding && x <= r.x + r.w + padding && y >= r.y - padding && y <= r.y + r.h + padding); }
function simplify(points) { const output = []; for (const point of points) { const previous = output[output.length - 1]; const before = output[output.length - 2]; if (previous && before && ((before.x === previous.x && previous.x === point.x) || (before.y === previous.y && previous.y === point.y))) output.pop(); output.push(point); } return output; }
function toPath(points) { return points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' '); }

export function orthogonalAStarPath(start, end, components, sourceId, targetId, options = {}) {
  const cell = options.cell || DEFAULT_CELL;
  const padding = options.padding || 18;
  const obstacles = components.filter((component) => component.id !== sourceId && component.id !== targetId).map((component) => ({ x: component.position.x, y: component.position.y, w: component.width || options.registry?.[component.type]?.width || 140, h: component.height || options.registry?.[component.type]?.height || 90 }));
  const maxX = Math.max(1200, ...components.map((component) => component.position.x + (component.width || options.registry?.[component.type]?.width || 140) + 120));
  const maxY = Math.max(900, ...components.map((component) => component.position.y + (component.height || options.registry?.[component.type]?.height || 90) + 120));
  const startNode = { x: snap(start.x, cell), y: snap(start.y, cell) };
  const endNode = { x: snap(end.x, cell), y: snap(end.y, cell) };
  const open = [{ x: startNode.x, y: startNode.y, g: 0, f: distance(startNode, endNode), previous: null }];
  const scores = new Map([[key(startNode.x, startNode.y), 0]]);
  const closed = new Set();
  const directions = [{ x: cell, y: 0 }, { x: -cell, y: 0 }, { x: 0, y: cell }, { x: 0, y: -cell }];
  let goal = null;
  while (open.length) {
    open.sort((a, b) => a.f - b.f || a.g - b.g);
    const current = open.shift();
    const currentKey = key(current.x, current.y);
    if (closed.has(currentKey)) continue;
    closed.add(currentKey);
    if (distance(current, endNode) <= cell) { goal = current; break; }
    for (const direction of directions) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      if (next.x < 0 || next.y < 0 || next.x > maxX || next.y > maxY || intersectsCell(next.x, next.y, obstacles, padding)) continue;
      const nextKey = key(next.x, next.y);
      if (closed.has(nextKey)) continue;
      const g = current.g + cell;
      if (g >= (scores.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue;
      scores.set(nextKey, g);
      open.push({ x: next.x, y: next.y, g, f: g + distance(next, endNode), previous: current });
    }
  }
  if (!goal) return toPath([start, { x: start.x, y: end.y }, end]);
  const gridPoints = [];
  for (let node = goal; node; node = node.previous) gridPoints.push({ x: node.x, y: node.y });
  gridPoints.reverse();
  const points = [start, ...gridPoints.slice(1, -1), end];
  return toPath(simplify(points));
}

const routeHost = globalThis.window || globalThis;
routeHost.balancebotRoute = function balancebotRoute(start, end, wire, components, registry) {
  const fromId = String(wire.from || '').split('.')[0];
  const toId = String(wire.to || '').split('.')[0];
  return orthogonalAStarPath(start, end, components, fromId, toId, { registry, cell: 24, padding: 18 });
};
