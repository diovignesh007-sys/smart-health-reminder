const db = require('../config/db');

function calculateBMI(weight, height) {
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(1));
}

function analyzeHealth(data) {
  const { age, weight, height, blood_pressure_systolic, blood_pressure_diastolic,
    blood_sugar, heart_rate, sleep_hours, exercise_per_week, smoking, alcohol, symptoms } = data;

  const bmi = calculateBMI(weight, height);
  const issues = [];
  const instructions = [];
  let riskScore = 0;

  // BMI Analysis
  if (bmi < 18.5) {
    issues.push({ label: 'Underweight', detail: `BMI: ${bmi}`, severity: 'medium' });
    instructions.push({ text: 'Increase calorie intake with nutrient-dense foods (nuts, avocado, whole grains, legumes).', priority: 'high' });
    instructions.push({ text: 'Eat 5–6 small meals per day instead of 3 large meals.', priority: 'medium' });
    riskScore += 20;
  } else if (bmi >= 25 && bmi < 30) {
    issues.push({ label: 'Overweight', detail: `BMI: ${bmi}`, severity: 'medium' });
    instructions.push({ text: 'Reduce processed foods, sugary beverages, and fried items.', priority: 'high' });
    instructions.push({ text: 'Walk 10,000 steps daily or do 30 minutes of cardio 5x per week.', priority: 'high' });
    riskScore += 20;
  } else if (bmi >= 30) {
    issues.push({ label: 'Obese', detail: `BMI: ${bmi}`, severity: 'high' });
    instructions.push({ text: 'Consult a doctor or dietitian immediately for a structured weight management plan.', priority: 'high' });
    instructions.push({ text: 'Begin low-impact exercise (swimming, walking) and track daily caloric intake.', priority: 'high' });
    riskScore += 40;
  }

  // Blood Pressure
  if (blood_pressure_systolic && blood_pressure_diastolic) {
    if (blood_pressure_systolic >= 140 || blood_pressure_diastolic >= 90) {
      issues.push({ label: 'High Blood Pressure', detail: `${blood_pressure_systolic}/${blood_pressure_diastolic} mmHg`, severity: 'high' });
      instructions.push({ text: 'Reduce sodium intake (less than 1500mg/day). Avoid processed and canned foods.', priority: 'high' });
      instructions.push({ text: 'Practice deep breathing, meditation, or yoga for 20 minutes daily.', priority: 'medium' });
      instructions.push({ text: 'Monitor blood pressure every morning and log readings.', priority: 'high' });
      riskScore += 30;
    } else if (blood_pressure_systolic < 90 || blood_pressure_diastolic < 60) {
      issues.push({ label: 'Low Blood Pressure', detail: `${blood_pressure_systolic}/${blood_pressure_diastolic} mmHg`, severity: 'medium' });
      instructions.push({ text: 'Increase fluid and salt intake slightly. Eat small frequent meals.', priority: 'medium' });
      riskScore += 15;
    }
  }

  // Blood Sugar
  if (blood_sugar) {
    if (blood_sugar > 126) {
      issues.push({ label: 'High Blood Sugar (Diabetic Range)', detail: `${blood_sugar} mg/dL`, severity: 'high' });
      instructions.push({ text: 'Eliminate sugary drinks, white rice, white bread, and sweets immediately.', priority: 'high' });
      instructions.push({ text: 'Check blood sugar fasting every morning. Consult a doctor for medication guidance.', priority: 'high' });
      riskScore += 40;
    } else if (blood_sugar >= 100 && blood_sugar <= 125) {
      issues.push({ label: 'Pre-Diabetic Blood Sugar', detail: `${blood_sugar} mg/dL`, severity: 'medium' });
      instructions.push({ text: 'Switch to a low-glycemic diet: vegetables, legumes, whole grains.', priority: 'high' });
      riskScore += 20;
    }
  }

  // Heart Rate
  if (heart_rate) {
    if (heart_rate > 100) {
      issues.push({ label: 'High Resting Heart Rate', detail: `${heart_rate} bpm`, severity: 'medium' });
      instructions.push({ text: 'Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Do 4 cycles daily.', priority: 'medium' });
      riskScore += 15;
    } else if (heart_rate < 50) {
      issues.push({ label: 'Low Resting Heart Rate', detail: `${heart_rate} bpm`, severity: 'medium' });
      instructions.push({ text: 'Consult a cardiologist to rule out bradycardia.', priority: 'high' });
      riskScore += 15;
    }
  }

  // Sleep
  if (sleep_hours < 6) {
    issues.push({ label: 'Insufficient Sleep', detail: `${sleep_hours} hours/night`, severity: 'medium' });
    instructions.push({ text: 'Set a fixed bedtime and wake time. Avoid screens 1 hour before sleeping.', priority: 'medium' });
    riskScore += 15;
  } else if (sleep_hours > 9) {
    issues.push({ label: 'Oversleeping', detail: `${sleep_hours} hours/night`, severity: 'low' });
    instructions.push({ text: 'Oversleeping may indicate depression or thyroid issues. Consider a medical check.', priority: 'medium' });
    riskScore += 5;
  }

  // Exercise
  if (exercise_per_week < 3) {
    issues.push({ label: 'Insufficient Physical Activity', detail: `${exercise_per_week} days/week`, severity: 'medium' });
    instructions.push({ text: 'Aim for at least 150 minutes of moderate exercise per week.', priority: 'high' });
    riskScore += 15;
  }

  // Lifestyle
  if (smoking) {
    issues.push({ label: 'Smoking', detail: 'Active smoker', severity: 'high' });
    instructions.push({ text: 'Quit smoking immediately. Use nicotine patches, gum, or consult a cessation program.', priority: 'high' });
    riskScore += 30;
  }

  if (alcohol) {
    issues.push({ label: 'Alcohol Consumption', detail: 'Regular alcohol use', severity: 'medium' });
    instructions.push({ text: 'Limit alcohol to less than 1 drink/day. Consider dry weeks.', priority: 'medium' });
    riskScore += 20;
  }

  if (symptoms && symptoms.trim().length > 0) {
    instructions.push({ text: `You reported symptoms: "${symptoms}". Please consult a healthcare provider.`, priority: 'high' });
    riskScore += 10;
  }

  // General instructions
  instructions.push({ text: 'Drink at least 8–10 glasses (2–2.5L) of water daily.', priority: 'low' });
  instructions.push({ text: 'Eat at least 5 servings of fruits and vegetables every day.', priority: 'low' });

  // Status and Recovery
  let health_status = 'healthy';
  let recovery_days = 0;

  if (riskScore >= 50) {
    health_status = 'unhealthy';
    recovery_days = Math.min(180, riskScore * 1.5);
  } else if (riskScore >= 20) {
    health_status = 'at_risk';
    recovery_days = Math.min(90, riskScore * 1.2);
  }

  const schedule = generateSchedule(issues, bmi, sleep_hours);

  return { bmi, issues, instructions, health_status, recovery_days: Math.round(recovery_days), schedule };
}

function generateSchedule(issues, bmi, sleep_hours) {
  const hasCardiac = issues.some(i => i.label.includes('Blood Pressure') || i.label.includes('Heart Rate'));
  const hasDiabetes = issues.some(i => i.label.includes('Blood Sugar'));
  const isOverweight = bmi >= 25;

  return [
    { time_slot: '6:00 AM', activity: 'Wake up & drink 1 glass of warm lemon water', category: 'hydration' },
    { time_slot: '6:15 AM', activity: hasCardiac ? 'Blood pressure check & log reading' : 'Breathing exercise / meditation (10 min)', category: 'monitoring' },
    { time_slot: '6:30 AM', activity: isOverweight ? '30-min brisk walk or low-impact cardio' : '20-min yoga or stretching', category: 'exercise' },
    { time_slot: '7:30 AM', activity: hasDiabetes ? 'Fasting blood sugar check' : 'Morning health journal log', category: 'monitoring' },
    { time_slot: '8:00 AM', activity: hasDiabetes ? 'Low-GI breakfast (oats, eggs, vegetables). No sugar.' : 'Nutritious breakfast (protein + whole grains + fruit)', category: 'diet' },
    { time_slot: '10:00 AM', activity: 'Drink 1 glass of water. Light healthy snack (nuts/fruit)', category: 'hydration' },
    { time_slot: '1:00 PM', activity: 'Balanced lunch: 50% vegetables, 25% protein, 25% whole grains', category: 'diet' },
    { time_slot: '1:30 PM', activity: '10-minute walk after lunch', category: 'exercise' },
    { time_slot: '3:00 PM', activity: 'Drink water. Healthy snack. Avoid caffeine.', category: 'hydration' },
    { time_slot: '6:00 PM', activity: isOverweight ? '30-min moderate exercise (cycling, swimming, jogging)' : '20-min evening walk or light workout', category: 'exercise' },
    { time_slot: '7:30 PM', activity: 'Light dinner. Finish 2 hours before bed.', category: 'diet' },
    { time_slot: '9:00 PM', activity: 'Screen-off. Read, journal, or relax.', category: 'sleep' },
    { time_slot: '10:00 PM', activity: `Sleep (target ${sleep_hours < 7 ? 7 : sleep_hours} hours). Dark, quiet, cool room.`, category: 'sleep' },
  ];
}

// Submit Health Data
exports.submitHealth = async (req, res) => {
  const userId = req.user.id;

  try {
    const { bmi, issues, instructions, health_status, recovery_days, schedule } = analyzeHealth(req.body);
    const { age, gender, weight, height, blood_pressure_systolic, blood_pressure_diastolic,
      blood_sugar, heart_rate, sleep_hours, exercise_per_week, smoking, alcohol, symptoms } = req.body;

    const [record] = await db.query(
      `INSERT INTO health_records 
       (user_id, age, gender, weight, height, bmi, blood_pressure_systolic, blood_pressure_diastolic,
        blood_sugar, heart_rate, sleep_hours, exercise_per_week, smoking, alcohol, symptoms, health_status, recovery_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, age, gender, weight, height, bmi,
        blood_pressure_systolic || null, blood_pressure_diastolic || null,
        blood_sugar || null, heart_rate || null,
        sleep_hours, exercise_per_week,
        smoking ? 1 : 0, alcohol ? 1 : 0,
        symptoms || '', health_status, recovery_days]
    );

    const recordId = record.insertId;

    for (const inst of instructions) {
      await db.query(
        'INSERT INTO health_instructions (health_record_id, instruction, priority) VALUES (?, ?, ?)',
        [recordId, inst.text, inst.priority]
      );
    }

    for (const slot of schedule) {
      await db.query(
        'INSERT INTO daily_schedules (health_record_id, time_slot, activity, category) VALUES (?, ?, ?, ?)',
        [recordId, slot.time_slot, slot.activity, slot.category]
      );
    }

    res.json({ message: 'Health analysis complete!', bmi, issues, instructions, health_status, recovery_days, schedule, recordId });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};

// Get Latest Record
exports.getLatestRecord = async (req, res) => {
  const userId = req.user.id;
  try {
    const [records] = await db.query(
      'SELECT * FROM health_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    if (records.length === 0) return res.json({ record: null });

    const record = records[0];
    const [instructions] = await db.query(
      'SELECT * FROM health_instructions WHERE health_record_id = ?', [record.id]
    );
    const [schedule] = await db.query(
      'SELECT * FROM daily_schedules WHERE health_record_id = ?', [record.id]
    );

    res.json({ record, instructions, schedule });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
};