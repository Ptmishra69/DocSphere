import { faker } from "@faker-js/faker";

// Generates medically realistic vitals using distributions
// Mirrors the synthetic data schema from architecture doc

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
const gaussian = (mean, std) => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

const INDIAN_NAMES = {
  male: ["Arjun", "Rahul", "Vikram", "Aakash", "Deepak", "Suresh", "Manoj", "Rohit", "Amit", "Sanjay"],
  female: ["Priya", "Anjali", "Sunita", "Meera", "Kavita", "Rekha", "Neha", "Pooja", "Divya", "Asha"],
  surnames: ["Sharma", "Verma", "Singh", "Gupta", "Patel", "Kumar", "Yadav", "Mishra", "Joshi", "Tiwari"],
};

const INDIAN_CITIES = [
  "Delhi", "Mumbai", "Noida", "Greater Noida", "Ghaziabad", "Lucknow",
  "Kanpur", "Agra", "Varanasi", "Jaipur", "Pune", "Hyderabad",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const COMMON_CONDITIONS = [
  "None", "None", "None", "Hypertension", "Diabetes Type 2",
  "Asthma", "Thyroid", "Anemia", "None", "None",
];

export const generateSyntheticPatient = () => {
  const gender = Math.random() > 0.5 ? "male" : "female";
  const age = Math.floor(gaussian(38, 15));
  const clampedAge = clamp(age, 18, 80);

  const firstName = faker.helpers.arrayElement(INDIAN_NAMES[gender]);
  const lastName = faker.helpers.arrayElement(INDIAN_NAMES.surnames);
  const name = `${firstName} ${lastName}`;

  // Age-adjusted vitals
  const isElderly = clampedAge > 60;
  const isChild = clampedAge < 25;

  const hr = clamp(Math.round(gaussian(isElderly ? 72 : 78, 10)), 55, 110);
  const spo2 = clamp(parseFloat(gaussian(isElderly ? 96.5 : 98, 1.2).toFixed(1)), 88, 100);
  const bpSys = clamp(Math.round(gaussian(isElderly ? 130 : 118, 12)), 90, 180);
  const bpDia = clamp(Math.round(gaussian(isElderly ? 82 : 76, 8)), 60, 110);
  const temp = clamp(parseFloat(gaussian(98.2, 0.6).toFixed(1)), 96.5, 103.5);
  const glucose = clamp(Math.round(gaussian(isElderly ? 105 : 92, 18)), 60, 200);
  const weight = clamp(parseFloat(gaussian(gender === "male" ? 68 : 58, 12).toFixed(1)), 40, 130);
  const height = clamp(Math.round(gaussian(gender === "male" ? 168 : 157, 8)), 145, 190);
  const bmi = parseFloat((weight / ((height / 100) ** 2)).toFixed(1));

  // Severity flags
  const flags = [];
  if (hr > 100) flags.push({ param: "Heart Rate", value: `${hr} bpm`, severity: "high" });
  if (spo2 < 94) flags.push({ param: "SpO2", value: `${spo2}%`, severity: "critical" });
  if (bpSys > 140) flags.push({ param: "BP Systolic", value: `${bpSys} mmHg`, severity: "high" });
  if (temp > 100) flags.push({ param: "Temperature", value: `${temp}°F`, severity: "medium" });
  if (glucose > 140) flags.push({ param: "Glucose", value: `${glucose} mg/dL`, severity: "medium" });

  return {
    id: `PT-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    name,
    gender,
    age: clampedAge,
    phone: `+91 ${faker.string.numeric(10)}`,
    city: faker.helpers.arrayElement(INDIAN_CITIES),
    bloodGroup: faker.helpers.arrayElement(BLOOD_GROUPS),
    existingCondition: faker.helpers.arrayElement(COMMON_CONDITIONS),
    vitals: {
      heart_rate: { value: hr, unit: "bpm", normal: [60, 100] },
      spo2: { value: spo2, unit: "%", normal: [95, 100] },
      bp_systolic: { value: bpSys, unit: "mmHg", normal: [90, 140] },
      bp_diastolic: { value: bpDia, unit: "mmHg", normal: [60, 90] },
      temperature: { value: temp, unit: "°F", normal: [97, 99.5] },
      glucose: { value: glucose, unit: "mg/dL", normal: [70, 140] },
      weight: { value: weight, unit: "kg", normal: [40, 120] },
      height: { value: height, unit: "cm", normal: [145, 190] },
      bmi: { value: bmi, unit: "kg/m²", normal: [18.5, 25] },
    },
    flags,
    timestamp: new Date().toISOString(),
    source: "synthetic",
  };
};

export const getVitalStatus = (vital) => {
  const { value, normal } = vital;
  if (value < normal[0]) return "low";
  if (value > normal[1]) return "high";
  return "normal";
};