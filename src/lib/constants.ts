export const SOKOTO_LGAS = [
  "Binji", "Bodinga", "Dange Shuni", "Gada", "Goronyo", "Gudu", "Gwadabawa",
  "Illela", "Isa", "Kebbe", "Kware", "Rabah", "Sabon Birni", "Shagari",
  "Silame", "Sokoto North", "Sokoto South", "Tambuwal", "Tangaza",
  "Tureta", "Wamako", "Wurno", "Yabo"
].sort();

export const INCIDENT_SEVERITY = ["LOW", "MODERATE", "HIGH", "CRITICAL"] as const;
export const INCIDENT_STATUS = ["REPORTED", "INVESTIGATING", "MITIGATED", "RESOLVED"] as const;
export const ALERT_SEVERITY = ["INFO", "WARNING", "CRITICAL"] as const;

export const LGA_COORDINATES: Record<string, [number, number]> = {
  "Binji": [13.216, 4.916],
  "Bodinga": [12.85, 5.116],
  "Dange Shuni": [12.866, 5.35],
  "Gada": [13.733, 5.65],
  "Goronyo": [13.433, 5.7],
  "Gudu": [13.433, 4.283],
  "Gwadabawa": [13.35, 5.25],
  "Illela": [13.716, 5.3],
  "Isa": [13.2, 6.333],
  "Kebbe": [12.016, 4.8],
  "Kware": [13.216, 5.266],
  "Rabah": [13.116, 5.5],
  "Sabon Birni": [13.55, 6.333],
  "Shagari": [12.45, 5.066],
  "Silame": [12.983, 4.783],
  "Sokoto North": [13.066, 5.233],
  "Sokoto South": [13.033, 5.233],
  "Tambuwal": [12.4, 4.666],
  "Tangaza": [13.383, 4.916],
  "Tureta": [12.416, 5.25],
  "Wamako": [13.033, 5.1],
  "Wurno": [13.283, 5.416],
  "Yabo": [12.416, 4.916]
};
