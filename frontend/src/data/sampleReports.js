export const SAMPLE_REPORTS = [
  {
    id: "cbc-demo-01",
    title: "Complete Blood Count (CBC) with Differential",
    category: "Hematology",
    specimen: "Whole Blood (EDTA)",
    reportDate: "12 Nov 2026",
    patientInfo: "Adult Female, 34 years",
    summary:
      "Overall, your blood cell counts are mostly stable. However, your Hemoglobin and Mean Corpuscular Volume (MCV) are slightly below the expected reference range, which often indicates mild iron-deficiency or microcytic anemia. White blood cells and platelets are healthy, showing no immediate sign of acute infection or clotting irregularities.",
    keyFindings: [
      "Hemoglobin is 10.8 g/dL (reference: 12.0 - 15.5 g/dL) - Mildly Low.",
      "Mean Corpuscular Volume (MCV) is 76 fL (reference: 80 - 100 fL) - Indicates smaller red blood cells.",
      "Total White Blood Cell (WBC) count is normal at 6,800 /µL, indicating no acute infection.",
      "Platelet count is normal at 245,000 /µL, supporting normal blood clotting capacity.",
    ],
    parameters: [
      {
        id: "p1",
        name: "Hemoglobin (Hb)",
        value: "10.8",
        unit: "g/dL",
        referenceRange: "12.0 - 15.5",
        status: "LOW",
        category: "Red Blood Cells",
        simpleExplanation:
          "Hemoglobin is the oxygen-carrying protein inside red blood cells. A slightly low reading suggests fewer oxygen-carrying molecules, which can cause tiredness or mild breathlessness.",
        lifestyleContext: "Commonly associated with dietary iron intake, monthly cycles, or vitamin B12 levels. Discuss dietary iron rich foods with your doctor."
      },
      {
        id: "p2",
        name: "RBC Count",
        value: "4.10",
        unit: "million/µL",
        referenceRange: "3.90 - 5.20",
        status: "NORMAL",
        category: "Red Blood Cells",
        simpleExplanation:
          "Total number of circulating red blood cells. Your count falls within the healthy standard baseline.",
        lifestyleContext: "Maintained by adequate bone marrow function, hydration, and nutrition."
      },
      {
        id: "p3",
        name: "Hematocrit (PCV)",
        value: "33.2",
        unit: "%",
        referenceRange: "36.0 - 46.0",
        status: "LOW",
        category: "Red Blood Cells",
        simpleExplanation:
          "The percentage of your blood volume made up of red cells. Being slightly low corresponds with the mildly lower hemoglobin value.",
        lifestyleContext: "Reflects the overall volume ratio of red cells to plasma."
      },
      {
        id: "p4",
        name: "Mean Corpuscular Volume (MCV)",
        value: "76.4",
        unit: "fL",
        referenceRange: "80.0 - 100.0",
        status: "LOW",
        category: "RBC Indices",
        simpleExplanation:
          "Measures the average physical size of your red blood cells. A value below 80 fL is termed 'microcytic' and is very commonly seen in early iron insufficiency.",
        lifestyleContext: "Your physician may check serum ferritin or transferrin saturation."
      },
      {
        id: "p5",
        name: "Platelet Count",
        value: "245",
        unit: "10³/µL",
        referenceRange: "150 - 450",
        status: "NORMAL",
        category: "Clotting",
        simpleExplanation:
          "Platelets are tiny cell fragments essential for healing and stopping bleeding. Your level is well within the healthy zone.",
        lifestyleContext: "Supports normal wound healing and blood vessel integrity."
      },
      {
        id: "p6",
        name: "Total Leukocyte Count (WBC)",
        value: "6.8",
        unit: "10³/µL",
        referenceRange: "4.5 - 11.0",
        status: "NORMAL",
        category: "Immune Defense",
        simpleExplanation:
          "White blood cells protect your body against infections and inflammation. A normal count indicates your immune system is resting peacefully.",
        lifestyleContext: "Rises during bacterial or viral fighting; normal here."
      },
      {
        id: "p7",
        name: "Neutrophils",
        value: "62",
        unit: "%",
        referenceRange: "40 - 70",
        status: "NORMAL",
        category: "WBC Differential",
        simpleExplanation:
          "The primary first-responder immune cells for bacterial defense. Value is balanced.",
        lifestyleContext: "Balanced immune response."
      },
      {
        id: "p8",
        name: "Lymphocytes",
        value: "29",
        unit: "%",
        referenceRange: "20 - 45",
        status: "NORMAL",
        category: "WBC Differential",
        simpleExplanation:
          "Immune cells that remember past viruses and produce antibodies. Normal and healthy.",
        lifestyleContext: "Supports long-term adaptive viral immunity."
      }
    ],
    questionsForDoctor: [
      "Could my mild low hemoglobin and MCV explain feeling fatigued lately?",
      "Would you recommend checking a Serum Ferritin and Iron Binding Capacity test?",
      "Should I adjust my diet to include more iron-rich foods, or do I need temporary supplementation?",
      "When would be the best time to repeat this test to check if levels have improved?"
    ],
    generalAdvice: [
      "Do not start high-dose iron pills without clinical guidance, as unnecessary iron can irritate the stomach.",
      "Pair iron-rich foods (spinach, lentils, seeds, lean meats) with Vitamin C (citrus, bell peppers) to boost absorption naturally.",
      "Stay well hydrated with clean water daily."
    ]
  },
  {
    id: "lipid-demo-02",
    title: "Comprehensive Lipid Profile & Fasting Glucose",
    category: "Biochemistry",
    specimen: "Serum (12h Fasting)",
    reportDate: "10 Nov 2026",
    patientInfo: "Adult Male, 46 years",
    summary:
      "This lipid panel reveals mild elevations in LDL ('bad cholesterol') and triglycerides, while your protective HDL ('good cholesterol') is in an acceptable range. Your fasting blood sugar is slightly higher than ideal baseline (pre-diabetes threshold). These values are valuable early warning signs that respond very well to dietary changes, cardiovascular exercise, and stress reduction.",
    keyFindings: [
      "Total Cholesterol is 218 mg/dL (Desirable: < 200 mg/dL) - Mildly elevated.",
      "LDL ('Bad') Cholesterol is 138 mg/dL (Optimal: < 100 mg/dL) - Attention recommended.",
      "HDL ('Good') Cholesterol is 48 mg/dL (Healthy: > 40 mg/dL for men) - Good protective level.",
      "Triglycerides are 178 mg/dL (Normal: < 150 mg/dL) - Borderline high.",
      "Fasting Blood Glucose is 108 mg/dL (Normal: 70 - 99 mg/dL) - Mild impaired fasting glucose."
    ],
    parameters: [
      {
        id: "lp1",
        name: "Total Cholesterol",
        value: "218",
        unit: "mg/dL",
        referenceRange: "< 200",
        status: "HIGH",
        category: "Lipids",
        simpleExplanation:
          "The overall estimate of all types of cholesterol circulating in your bloodstream. Being mildly above 200 suggests reviewing saturated fat intake and cardiovascular fitness.",
        lifestyleContext: "Replacing saturated fats with unsaturated fats (olive oil, nuts) can help lower overall levels."
      },
      {
        id: "lp2",
        name: "LDL Cholesterol (Calculated)",
        value: "138",
        unit: "mg/dL",
        referenceRange: "< 100",
        status: "HIGH",
        category: "Lipids",
        simpleExplanation:
          "Commonly nicknamed 'bad cholesterol'. High levels can slowly deposit along arterial walls over years. Discuss your cardiovascular risk score with your doctor.",
        lifestyleContext: "Soluble fiber (oats, legumes, psyllium husk) actively binds digestive cholesterol."
      },
      {
        id: "lp3",
        name: "HDL Cholesterol",
        value: "48",
        unit: "mg/dL",
        referenceRange: "> 40",
        status: "NORMAL",
        category: "Lipids",
        simpleExplanation:
          "Known as 'good cholesterol'. It acts like a scavenger, picking up extra cholesterol from tissues and shuttling it back to the liver for clearance.",
        lifestyleContext: "Aerobic exercise (brisk walking, swimming, cycling) is one of the best ways to boost HDL."
      },
      {
        id: "lp4",
        name: "Triglycerides",
        value: "178",
        unit: "mg/dL",
        referenceRange: "< 150",
        status: "HIGH",
        category: "Lipids",
        simpleExplanation:
          "A type of fat stored from excess calories, refined carbohydrates, and sugary beverages. Slightly elevated here.",
        lifestyleContext: "Reducing sugary drinks, sweets, and alcohol typically brings triglycerides down quickly."
      },
      {
        id: "lp5",
        name: "Fasting Blood Glucose",
        value: "108",
        unit: "mg/dL",
        referenceRange: "70 - 99",
        status: "HIGH",
        category: "Metabolic",
        simpleExplanation:
          "Measures blood sugar after at least 8 to 12 hours without eating. Being between 100-125 mg/dL is categorized as impaired fasting glucose (early insulin resistance indicator).",
        lifestyleContext: "A brisk 15-minute walk after meals helps muscles absorb circulating glucose naturally."
      }
    ],
    questionsForDoctor: [
      "What is my overall 10-year cardiovascular risk assessment based on my age, blood pressure, and this lipid profile?",
      "Would you recommend checking an HbA1c test to see my 3-month blood sugar average?",
      "Can we try a 3-month lifestyle and dietary protocol before discussing statin medication?",
      "What target LDL level should I aim for?"
    ],
    generalAdvice: [
      "Incorporate 30 minutes of moderate aerobic activity at least 5 days a week.",
      "Reduce ultra-processed foods, baked sweets, and sweetened drinks.",
      "Increase daily dietary fiber intake with oats, chia seeds, vegetables, and beans."
    ]
  }
];
