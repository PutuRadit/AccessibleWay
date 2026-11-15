// Preferensi untuk prototipe, bukan klasifikasi kemampuan pengguna.
export const mobilityProfiles = Object.freeze([
  Object.freeze({ id: "wheelchair", label: "Kursi roda", icon: "wheelchair", hint: "Akses tanpa tangga. Gunakan lift untuk berpindah lantai.", stepFreeOnly: true, walkingFactor: 1, stairsPenalty: 0 }),
  Object.freeze({ id: "walker", label: "Walker", icon: "walker", hint: "Utamakan lift. Tangga hanya dipakai jika kamu izinkan.", stepFreeOnly: false, walkingFactor: 1.1, stairsPenalty: 24 }),
  Object.freeze({ id: "crutches", label: "Kruk", icon: "crutches", hint: "Utamakan lift. Tangga diberi prioritas lebih rendah jika diizinkan.", stepFreeOnly: false, walkingFactor: 1.1, stairsPenalty: 32 }),
  Object.freeze({ id: "limited-mobility", label: "Mobilitas terbatas", icon: "walking", hint: "Utamakan jarak berjalan yang singkat dan lift antarlantai.", stepFreeOnly: false, walkingFactor: 1.25, stairsPenalty: 16 }),
]);

export const getMobilityProfile = id => mobilityProfiles.find(profile => profile.id === id) ?? null;

export function resolveIndoorPreferences({ mobility = "", avoidStairs = true } = {}) {
  const profile = getMobilityProfile(mobility);
  return { mobility: profile?.id ?? "", profile, avoidStairs: profile?.stepFreeOnly ? true : avoidStairs !== false };
}
