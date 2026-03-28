export const INITIAL_FORM = {
  name: "",
  age: "",
  week: "20",
  weight: "",
  bp: "120",
  sugar: "90",
  hb: "11.5",
  symptoms: [],
  diet: "",
  activity: "",
};

export const SYMPTOMS = [
  "🤢 Nausea",
  "😴 Fatigue",
  "🤕 Headache",
  "🦵 Leg cramps",
  "💔 Heartburn",
  "🌀 Dizziness",
  "😰 Swelling",
  "🌧 Mood swings",
  "🍽 Food aversions",
  "💤 Insomnia",
  "🔙 Back pain",
  "🩸 Spotting",
];

export const trimesterLabel = (week) => {
  if (week <= 13) return "1st Trimester";
  if (week <= 26) return "2nd Trimester";
  return "3rd Trimester";
};

export const babySizeLabel = (week) => {
  const sizes = {
    4: "a poppy seed",
    6: "a sweet pea",
    8: "a raspberry",
    10: "a prune",
    12: "a lime",
    14: "a lemon",
    16: "an avocado",
    18: "a bell pepper",
    20: "a banana",
    22: "a papaya",
    24: "an ear of corn",
    26: "a scallion",
    28: "an eggplant",
    30: "a cucumber",
    32: "a squash",
    34: "a pineapple",
    36: "a romaine lettuce",
    38: "a pumpkin",
    40: "a watermelon",
  };

  const keys = Object.keys(sizes)
    .map(Number)
    .sort((a, b) => a - b);

  const closest = keys.reduce((prev, current) =>
    Math.abs(current - week) < Math.abs(prev - week) ? current : prev
  );

  return sizes[closest];
};
