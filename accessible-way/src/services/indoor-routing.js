// Dijkstra on explicit corridor, door, and vertical-connector edges.
// Routes never connect room centers with an arbitrary straight line.
import { resolveIndoorPreferences } from "../data/mobility-profiles.js";

export function shortestIndoorPath(graph, startId, endId, options = {}) {
  const { avoidStairs, profile } = resolveIndoorPreferences(options);
  if (!graph.nodes[startId] || !graph.nodes[endId]) return null;
  const adjacency = new Map(Object.keys(graph.nodes).map(id => [id, []]));
  for (const edge of graph.edges) {
    if (!adjacency.has(edge.from) || !adjacency.has(edge.to)) continue;
    if (avoidStairs && (!edge.accessible || edge.kind === "stairs")) continue;
    const walkingFactor = edge.kind === "lift" ? 1 : (profile?.walkingFactor ?? 1);
    const cost = edge.distance * walkingFactor + (edge.kind === "lift" ? 4 : 0) + (edge.kind === "stairs" ? profile?.stairsPenalty ?? 0 : 0);
    adjacency.get(edge.from).push({ ...edge, cost });
    adjacency.get(edge.to).push({ ...edge, from: edge.to, to: edge.from, cost });
  }
  const distances = new Map([[startId, 0]]), previous = new Map(), visited = new Set();
  while (true) {
    let current = null, best = Infinity;
    for (const [id, distance] of distances) if (!visited.has(id) && distance < best) { current = id; best = distance; }
    if (current === null) return null;
    if (current === endId) break;
    visited.add(current);
    for (const edge of adjacency.get(current)) {
      const distance = best + edge.cost;
      if (distance < (distances.get(edge.to) ?? Infinity)) { distances.set(edge.to, distance); previous.set(edge.to, edge); }
    }
  }
  const edges = [], nodeIds = [endId];
  for (let current = endId; current !== startId;) {
    const edge = previous.get(current);
    if (!edge) return null;
    edges.unshift(edge); current = edge.from; nodeIds.unshift(current);
  }
  return { nodes: nodeIds.map(id => graph.nodes[id]), edges, distance: edges.reduce((sum, edge) => sum + edge.distance, 0) };
}

export function findIndoorRoute(building, startId, endId, options = {}) {
  const { avoidStairs, mobility, profile } = resolveIndoorPreferences(options);
  if (!profile) return { ok: false, code: "mobility-required", message: "Pilih kebutuhan mobilitas terlebih dahulu untuk menampilkan rute." };
  const start = building.rooms.find(room => room.id === startId);
  const end = building.rooms.find(room => room.id === endId);
  if (!start || !end) return { ok: false, code: "missing", message: "Pilih titik awal dan ruangan tujuan terlebih dahulu." };
  if (start.id === end.id) return { ok: false, code: "same", message: "Titik awal dan tujuan masih sama. Pilih ruangan tujuan yang berbeda." };
  if (avoidStairs && (!start.accessible || !end.accessible)) return { ok: false, code: "inaccessible", message: profile?.stepFreeOnly ? "Titik ini memerlukan tangga. Pilih ruangan atau lift yang memiliki akses tanpa tangga untuk rute kursi roda." : "Ruangan ini memerlukan tangga. Pilih ruangan lain, atau ubah pilihan Hindari tangga jika sesuai kebutuhanmu." };
  const path = shortestIndoorPath(building.graph, start.nodeId, end.nodeId, { avoidStairs, mobility });
  if (!path) return { ok: false, code: "unreachable", message: "Rute yang sesuai belum tersedia pada denah ini. Coba ruangan atau pilihan akses yang lain." };
  const segments = [];
  for (const node of path.nodes) {
    if (segments.at(-1)?.floor !== node.floor) segments.push({ floor: node.floor, nodes: [], distance: 0 });
    segments.at(-1).nodes.push(node);
  }
  for (const segment of segments) {
    segment.points = segment.nodes.map(node => [node.x, node.y]);
    segment.distance = path.edges.filter(edge => building.graph.nodes[edge.from].floor === segment.floor && building.graph.nodes[edge.to].floor === segment.floor).reduce((sum, edge) => sum + edge.distance, 0);
  }
  const transfers = [];
  for (let i = 0; i < path.edges.length; i++) {
    const edge = path.edges[i];
    if (!["lift", "stairs"].includes(edge.kind)) continue;
    const from = building.graph.nodes[edge.from], to = building.graph.nodes[edge.to];
    const previous = transfers.at(-1);
    if (previous && previous.kind === edge.kind && previous.toFloor === from.floor && previous.lastEdgeIndex === i - 1) { previous.toFloor = to.floor; previous.lastEdgeIndex = i; }
    else transfers.push({ kind: edge.kind, fromFloor: from.floor, toFloor: to.floor, point: [from.x, from.y], lastEdgeIndex: i });
  }
  const steps = [{ kind: "start", floor: start.floor, title: `Mulai di ${start.name}`, detail: `Titik awal · ${start.floorLabel}` }];
  for (const segment of segments) {
    if (segment.nodes.length > 1) steps.push({ kind: "walk", floor: segment.floor, title: `Ikuti jalur biru di ${segment.floor}F`, detail: `Sekitar ${Math.max(1, Math.round(segment.distance))} m melalui pintu dan koridor.` });
    const transfer = transfers.find(item => item.fromFloor === segment.floor);
    if (transfer) steps.push({ kind: transfer.kind, floor: transfer.toFloor, title: `Gunakan ${transfer.kind === "lift" ? "lift" : "tangga"} ke ${transfer.toFloor}F`, detail: `${transfer.fromFloor}F → ${transfer.toFloor}F · buka lantai tujuan untuk melanjutkan.` });
  }
  steps.push({ kind: "end", floor: end.floor, title: `Tiba di ${end.name}`, detail: `Ruangan tujuan · ${end.floorLabel}` });
  return { ok: true, ...path, start, end, avoidStairs, mobility, segments, transfers, steps, floors: [...new Set(path.nodes.map(node => node.floor))] };
}
