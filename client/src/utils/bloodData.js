export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_COMPONENTS = [
  { id: 'Whole Blood', name: 'Whole Blood', storage: '2°C to 6°C', shelfLife: '35–42 Days', uses: 'Trauma, massive hemorrhage, exchange transfusion' },
  { id: 'Packed Red Blood Cells', name: 'Packed Red Blood Cells (PRBC)', storage: '2°C to 6°C', shelfLife: '42 Days', uses: 'Severe anemia, surgical blood loss, chemotherapy' },
  { id: 'Platelets', name: 'Platelets (Single Donor / RDP)', storage: '20°C to 24°C (continuous agitation)', shelfLife: '5 Days', uses: 'Dengue, thrombocytopenia, leukemia, organ transplant' },
  { id: 'Fresh Frozen Plasma', name: 'Fresh Frozen Plasma (FFP)', storage: '-18°C or colder', shelfLife: '1 Year', uses: 'Coagulopathy, severe burns, liver disease, massive transfusion' },
  { id: 'Cryoprecipitate', name: 'Cryoprecipitate', storage: '-18°C or colder', shelfLife: '1 Year', uses: 'Hemophilia, von Willebrand disease, hypofibrinogenemia' },
];

export const RBC_COMPATIBILITY = {
  'O-': {
    canDonateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    type: 'Universal RBC Donor'
  },
  'O+': {
    canDonateTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+'],
    type: 'Compatible with all Rh+ recipients'
  },
  'A-': {
    canDonateTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-'],
    type: 'Compatible with A and AB recipients'
  },
  'A+': {
    canDonateTo: ['A+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+'],
    type: 'Compatible with A+ and AB+'
  },
  'B-': {
    canDonateTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-', 'B-'],
    type: 'Compatible with B and AB recipients'
  },
  'B+': {
    canDonateTo: ['B+', 'AB+'],
    canReceiveFrom: ['O-', 'O+', 'B-', 'B+'],
    type: 'Compatible with B+ and AB+'
  },
  'AB-': {
    canDonateTo: ['AB-', 'AB+'],
    canReceiveFrom: ['O-', 'A-', 'B-', 'AB-'],
    type: 'Compatible with all Rh- recipients'
  },
  'AB+': {
    canDonateTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    type: 'Universal RBC Recipient'
  }
};

export const PLASMA_COMPATIBILITY = {
  'AB': { canDonateTo: ['O', 'A', 'B', 'AB'], canReceiveFrom: ['AB'], note: 'Universal Plasma Donor' },
  'A': { canDonateTo: ['O', 'A'], canReceiveFrom: ['A', 'AB'], note: 'Compatible with O and A' },
  'B': { canDonateTo: ['O', 'B'], canReceiveFrom: ['B', 'AB'], note: 'Compatible with O and B' },
  'O': { canDonateTo: ['O'], canReceiveFrom: ['O', 'A', 'B', 'AB'], note: 'Universal Plasma Recipient' }
};

export const CLINICAL_DISCLAIMER = 
  "Medical Disclaimer: The compatibility guidelines and stock indicators provided on Pulse Grid are strictly for emergency coordination and clinical guidance. Actual transfusion compatibility, crossmatching, antibody screening, and final eligibility MUST always be validated by qualified pathology laboratory personnel and licensed medical practitioners in compliance with National Blood Transfusion Council (NBTC) regulations.";

export const DONOR_ELIGIBILITY_CRITERIA = [
  { title: "Age Requirement", desc: "Between 18 and 65 years of age." },
  { title: "Body Weight", desc: "Minimum 45–50 kg for whole blood donation." },
  { title: "Hemoglobin Level", desc: "Minimum 12.5 g/dL measured prior to donation." },
  { title: "Donation Interval", desc: "At least 90 days (3 months) since previous whole blood donation." },
  { title: "Vitals & Well-being", desc: "Normal blood pressure (Systolic 100-140, Diastolic 60-90), pulse 60-100 bpm, free from active infections." },
  { title: "Medications & Surgeries", desc: "No major surgery in past 6 months, free from recent antibiotic course." }
];
