const mongoose = require("mongoose");
require("dotenv").config();
const Knowledge = require("../models/Knowledge");
const Vendor = require("../models/Vendor");
const { getEmbedding } = require("../utils/embedding");

const SEED_DATA = [
  {
    category: "clinical_guidelines",
    title: "Normal Pregnancy Vital Ranges",
    content:
      "Normal blood pressure during pregnancy is typically below 120/80 mmHg. Blood pressure above 140/90 mmHg may indicate preeclampsia and requires immediate medical attention. Normal fasting blood sugar is 60-95 mg/dL. Hemoglobin below 11 g/dL indicates anemia in pregnancy. Weight gain of 11-16 kg is normal for a healthy BMI pregnancy.",
    tags: ["vitals", "blood-pressure", "sugar", "hemoglobin", "pregnancy"],
  },
  {
    category: "clinical_guidelines",
    title: "Trimester-wise Care Guidelines",
    content:
      "First trimester (weeks 1-13): Focus on folic acid supplementation, managing morning sickness, first ultrasound at 6-8 weeks, NT scan at 11-13 weeks. Second trimester (weeks 14-26): Anomaly scan at 18-22 weeks, glucose tolerance test at 24-28 weeks, iron supplements. Third trimester (weeks 27-40): Biweekly checkups, monitor fetal movements, prepare birth plan, Group B strep test at 35-37 weeks.",
    tags: ["trimester", "checkups", "ultrasound", "supplements"],
  },
  {
    category: "clinical_guidelines",
    title: "Warning Signs in Pregnancy",
    content:
      "Seek immediate medical help for: severe headache with visual disturbances (preeclampsia), vaginal bleeding, sudden severe abdominal pain, reduced fetal movement (fewer than 10 kicks in 2 hours), water breaking before 37 weeks, high fever above 100.4F, persistent vomiting preventing hydration, sudden swelling of face or hands.",
    tags: ["emergency", "warning-signs", "preeclampsia", "bleeding"],
  },
  {
    category: "nutrition",
    title: "Pregnancy Nutrition Guidelines",
    content:
      "Essential nutrients during pregnancy: Iron (27mg/day) from leafy greens, lentils, red meat. Folic acid (600mcg/day) from beans, citrus, fortified cereals. Calcium (1000mg/day) from dairy, almonds, fortified foods. DHA/Omega-3 from fish, walnuts, flaxseeds. Avoid: raw/undercooked meats, unpasteurized dairy, high-mercury fish, excessive caffeine (limit 200mg/day), alcohol.",
    tags: ["diet", "nutrition", "iron", "folic-acid", "calcium"],
  },
  {
    category: "exercise",
    title: "Safe Exercise During Pregnancy",
    content:
      "Recommended exercises: Walking (30 min/day), prenatal yoga, swimming, stationary cycling, light strength training. Avoid: contact sports, hot yoga/pilates, exercises lying flat on back after 1st trimester, heavy lifting, high-altitude activities. Stop exercising if: dizzy, short of breath, chest pain, headache, calf pain, vaginal bleeding, contractions.",
    tags: ["exercise", "fitness", "yoga", "walking"],
  },
  {
    category: "services",
    title: "MomKidCare Consultation Services",
    content:
      "MomKidCare offers: OB-GYN consultations (in-person and teleconsult), pediatric consultations, lactation support, prenatal classes, postnatal recovery programs, mental health counseling for new parents, nutrition planning with certified dietitians, vaccination scheduling for mother and child.",
    tags: ["services", "consultation", "teleconsult", "classes"],
  },
  {
    category: "services",
    title: "Emergency Services and Facilities",
    content:
      "Emergency helpline: 102 (Ambulance), 108 (Emergency). MomKidCare partner hospitals provide 24/7 emergency obstetric care. High-risk pregnancy management available at all partner facilities. NICU facilities available at City Women's Hospital and Rainbow Children's Hospital.",
    tags: ["emergency", "hospital", "ambulance", "NICU"],
  },
  {
    category: "pediatric",
    title: "Newborn and Infant Care Guidelines",
    content:
      "Newborn care essentials: Exclusive breastfeeding for first 6 months, skin-to-skin contact, immunization schedule starting at birth (BCG, OPV, Hep-B). Track milestones: social smile by 6-8 weeks, head control by 3-4 months, sitting by 6-7 months, crawling by 8-10 months, first words by 12 months. Warning signs: poor feeding, excessive crying, fever above 100.4F in infants under 3 months, no eye contact by 3 months.",
    tags: ["newborn", "infant", "breastfeeding", "immunization", "milestones"],
  },
  {
    category: "mental_health",
    title: "Maternal Mental Health",
    content:
      "Postpartum depression affects 1 in 7 women. Symptoms: persistent sadness, anxiety, difficulty bonding with baby, changes in sleep/appetite, withdrawal from family. Seek help if symptoms last more than 2 weeks. MomKidCare provides confidential counseling services. Prenatal anxiety is also common — mindfulness, support groups, and professional therapy can help.",
    tags: ["mental-health", "postpartum", "depression", "anxiety", "counseling"],
  },
  {
    category: "clinical_guidelines",
    title: "Common Pregnancy Symptoms and Management",
    content:
      "Morning sickness: eat small frequent meals, ginger tea, vitamin B6. Heartburn: avoid spicy/fatty foods, eat slowly, elevate head while sleeping. Back pain: prenatal exercises, proper posture, support belt. Leg cramps: stay hydrated, magnesium-rich foods, calf stretches before bed. Constipation: high-fiber diet, plenty of water, regular walking. Insomnia: sleep on left side, avoid screens before bed, relaxation techniques.",
    tags: ["symptoms", "nausea", "heartburn", "back-pain", "insomnia"],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await Knowledge.countDocuments();
    if (existing > 0) {
      console.log(`Knowledge base already has ${existing} documents. Clearing...`);
      await Knowledge.deleteMany({});
    }

    for (const item of SEED_DATA) {
      const embeddingText = `${item.title}\n${item.content}\nTags: ${item.tags.join(", ")}`;
      const embedding = await getEmbedding(embeddingText);

      await Knowledge.create({
        ...item,
        embedding,
      });

      console.log(`Seeded: ${item.title}`);
    }

    console.log(`Done. Seeded ${SEED_DATA.length} knowledge documents.`);

    // Seed vendors
    const existingVendors = await Vendor.countDocuments();
    if (existingVendors > 0) {
      console.log(`Vendors collection has ${existingVendors} docs. Clearing...`);
      await Vendor.deleteMany({});
    }

    const VENDORS = [
      { name: "Sunita Sharma", type: "nanny", rating: 4.8, reviewCount: 124, experience: "8 years", specializations: ["Newborn care", "Night nanny", "Twins specialist"], languages: ["Hindi", "English"], city: "Delhi", area: "South Delhi", price: "₹15,000/month", priceValue: 15000, verified: true, bio: "Certified infant care specialist with 8+ years experience. CPR trained.", tags: ["newborn", "experienced", "night-care"] },
      { name: "Mary Thomas", type: "nanny", rating: 4.9, reviewCount: 89, experience: "12 years", specializations: ["Toddler care", "Montessori trained", "Special needs"], languages: ["English", "Malayalam"], city: "Bangalore", area: "Koramangala", price: "₹18,000/month", priceValue: 18000, verified: true, bio: "Montessori-trained nanny with focus on early childhood development.", tags: ["toddler", "montessori", "premium"] },
      { name: "Rekha Devi", type: "nanny", rating: 4.6, reviewCount: 67, experience: "5 years", specializations: ["Infant care", "Cooking", "Housekeeping"], languages: ["Hindi"], city: "Delhi", area: "East Delhi", price: "₹10,000/month", priceValue: 10000, verified: true, bio: "Caring nanny experienced with infants 0-2 years.", tags: ["infant", "affordable", "multi-skill"] },
      { name: "Dr. Priya Mehta", type: "doctor", rating: 4.9, reviewCount: 312, experience: "15 years", specializations: ["High-risk pregnancy", "PCOS", "Fertility"], languages: ["Hindi", "English", "Gujarati"], city: "Mumbai", area: "Andheri", price: "₹1,200/visit", priceValue: 1200, verified: true, bio: "Senior OB-GYN at City Women's Hospital. Specializes in high-risk pregnancies.", tags: ["gynecologist", "high-risk", "fertility"] },
      { name: "Dr. Anjali Reddy", type: "doctor", rating: 4.7, reviewCount: 198, experience: "10 years", specializations: ["Normal delivery", "Prenatal care", "Postpartum"], languages: ["English", "Telugu", "Hindi"], city: "Hyderabad", area: "Banjara Hills", price: "₹800/visit", priceValue: 800, verified: true, bio: "Passionate about natural birthing and holistic prenatal care.", tags: ["prenatal", "natural-birth", "postpartum"] },
      { name: "Dr. Kavita Singh", type: "pediatrician", rating: 4.8, reviewCount: 256, experience: "12 years", specializations: ["Neonatal care", "Vaccination", "Growth assessment"], languages: ["Hindi", "English"], city: "Delhi", area: "Dwarka", price: "₹700/visit", priceValue: 700, verified: true, bio: "Child health specialist with expertise in newborn and infant care.", tags: ["pediatrics", "vaccination", "newborn"] },
      { name: "Neha Kapoor", type: "dietitian", rating: 4.7, reviewCount: 145, experience: "7 years", specializations: ["Pregnancy nutrition", "Gestational diabetes", "Postpartum diet"], languages: ["Hindi", "English"], city: "Delhi", area: "Gurgaon", price: "₹1,500/session", priceValue: 1500, verified: true, bio: "Certified prenatal nutritionist. Custom meal plans for each trimester.", tags: ["nutrition", "pregnancy-diet", "diabetes"] },
      { name: "Pooja Iyer", type: "lactation_consultant", rating: 4.9, reviewCount: 178, experience: "9 years", specializations: ["Breastfeeding support", "Latch issues", "Low supply"], languages: ["English", "Tamil", "Hindi"], city: "Bangalore", area: "Indiranagar", price: "₹2,000/session", priceValue: 2000, verified: true, bio: "IBCLC certified lactation consultant. Home visits available.", tags: ["breastfeeding", "lactation", "home-visit"] },
      { name: "Ananya Bose", type: "doula", rating: 4.8, reviewCount: 92, experience: "6 years", specializations: ["Birth support", "Postpartum doula", "HypnoBirthing"], languages: ["English", "Bengali", "Hindi"], city: "Kolkata", area: "Salt Lake", price: "₹25,000/package", priceValue: 25000, verified: true, bio: "Trained birth companion offering continuous support during labor and postpartum.", tags: ["birth-support", "hypnobirthing", "postpartum"] },
      { name: "Dr. Meera Nair", type: "mental_health", rating: 4.6, reviewCount: 134, experience: "11 years", specializations: ["Postpartum depression", "Anxiety", "Prenatal stress"], languages: ["English", "Malayalam", "Hindi"], city: "Mumbai", area: "Powai", price: "₹2,500/session", priceValue: 2500, verified: true, bio: "Perinatal mental health specialist. Online sessions available.", tags: ["mental-health", "ppd", "anxiety", "online"] },
      { name: "Ritu Aggarwal", type: "yoga_instructor", rating: 4.7, reviewCount: 88, experience: "8 years", specializations: ["Prenatal yoga", "Postnatal recovery", "Breathing techniques"], languages: ["Hindi", "English"], city: "Delhi", area: "Vasant Kunj", price: "₹800/session", priceValue: 800, verified: true, bio: "Certified prenatal yoga instructor. Group and private sessions.", tags: ["yoga", "prenatal", "postnatal", "breathing"] },
      { name: "Dr. Shalini Gupta", type: "physiotherapist", rating: 4.5, reviewCount: 76, experience: "9 years", specializations: ["Pelvic floor therapy", "Back pain", "Diastasis recti"], languages: ["Hindi", "English"], city: "Delhi", area: "Noida", price: "₹1,200/session", priceValue: 1200, verified: true, bio: "Women's health physiotherapist specializing in pre and postnatal recovery.", tags: ["physiotherapy", "pelvic-floor", "recovery"] },
    ];

    for (const vendor of VENDORS) {
      await Vendor.create(vendor);
      console.log(`Seeded vendor: ${vendor.name}`);
    }

    console.log(`Seeded ${VENDORS.length} vendors.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err.message);
    process.exit(1);
  }
}

seed();
