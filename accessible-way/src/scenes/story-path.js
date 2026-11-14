// Waypoints follow the existing Blender scenes. Distances are world metres,
// independent of the old animation clip's frame rate or playback direction.
export const HOUSE_FRAME = [-16.5, 0, -6.3];
export const HOSPITAL_FRAME = [19.9677677, 0, -4.767767];
export const HOSPITAL_YAW = -Math.PI / 4;
export const OUTDOOR_SPEED = .75;

const house = [
  [-.35, .862, -.4], [-.34152, .862, 1.57702],
  [-.0209, .862, 2.9419], [0, .862, 4],
].map(point => point.map((value, i) => value + HOUSE_FRAME[i]));
const city = [
  [-16.5, .862, -2.3], [-16.5, .83625, -1.76154],
  [-16.5, .30972, 1.10449], [-16.47843, .297, 1.56241],
  [-16.37947, .297, 1.56198], [-15.80019, .297, 1.17386],
  [-15.57959, .297, 1.10159], [-15.34834, .297, 1.08011],
  [11.30046, .297, 1.08008], [11.64123, .297, 1.14122],
  [11.83388, .297, 1.2694], [12.53669, .297, 2.33569],
  [12.63466, .297, 2.39546], [12.7484, .297, 2.3947],
  [12.93688, .297, 2.26312], [13.5123, .32164, 1.6877],
  [16.00003, .84364, -.80003], [16.50294, .862, -1.30294],
];
const hospital = [
  [0, .862, 4.9], [-.00018, .862, -2.36979],
  [-.03289, .862, -2.62674], [-.13834, .862, -2.86317],
  [-.73925, .862, -3.60112], [-.89237, .862, -3.67945],
  [-1.06363, .862, -3.69996], [-2.88253, .862, -3.69277],
  [-3.02749, .862, -3.60744], [-3.0657, .862, -3.53063],
  [-3.1427, .862, -3.10571], [-3.18804, .862, -3.03267],
  [-3.33886, .862, -2.9554], [-5.15, .862, -2.95],
].map(([x, y, z]) => [
  x * Math.cos(HOSPITAL_YAW) + z * Math.sin(HOSPITAL_YAW) + HOSPITAL_FRAME[0],
  y, -x * Math.sin(HOSPITAL_YAW) + z * Math.cos(HOSPITAL_YAW) + HOSPITAL_FRAME[2],
]);

const length = (a, b) => Math.hypot(...a.map((v, i) => v - b[i]));
const pathLength = points => points.slice(1).reduce((total, p, i) => total + length(p, points[i]), 0);
export const HOUSE_END = pathLength(house);
export const ARRIVAL_DISTANCE = HOUSE_END + pathLength(city);
export const routePoints = [...house, ...city.slice(1), ...hospital.slice(1)];
const cumulative = [0];
for (let i = 1; i < routePoints.length; i++) cumulative.push(cumulative[i - 1] + length(routePoints[i], routePoints[i - 1]));
export const TOTAL_DISTANCE = cumulative.at(-1);

let cityDistance = HOUSE_END;
let secondBuildingDistance = cityDistance;
for (let i = 1; i < city.length; i++) {
  const a = city[i - 1], b = city[i], segment = length(a, b);
  if (a[0] <= -2.15 && b[0] >= -2.15 && b[0] > a[0]) {
    secondBuildingDistance = cityDistance + segment * (-2.15 - a[0]) / (b[0] - a[0]);
    break;
  }
  cityDistance += segment;
}
export const SECOND_BUILDING_DISTANCE = secondBuildingDistance;
// Stop in front of the entrance canopy, where the seated person stays visible.
// Indoor Map then begins at the actual doorway, using the same continuous route.
export const HOSPITAL_STOP_DISTANCE = ARRIVAL_DISTANCE - 2.8;
export const STEP_DISTANCES = [0, 0, 0, SECOND_BUILDING_DISTANCE, HOSPITAL_STOP_DISTANCE, TOTAL_DISTANCE];

export function pointAt(distance) {
  const d = Math.max(0, Math.min(TOTAL_DISTANCE, distance));
  let low = 1, high = cumulative.length - 1;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (cumulative[middle] < d) low = middle + 1;
    else high = middle;
  }
  const a = routePoints[low - 1], b = routePoints[low];
  const t = (d - cumulative[low - 1]) / (cumulative[low] - cumulative[low - 1] || 1);
  return a.map((value, i) => value + (b[i] - value) * t);
}

export function headingAt(distance, direction = 1) {
  const a = pointAt(Math.max(0, distance - .15));
  const b = pointAt(Math.min(TOTAL_DISTANCE, distance + .15));
  return Math.atan2((b[0] - a[0]) * direction, (b[2] - a[2]) * direction);
}

export function turnDelta(from, to) {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}
