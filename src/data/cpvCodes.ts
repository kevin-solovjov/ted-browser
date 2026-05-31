// CPV codes extracted from uploaded CSVs
// The CSVs store codes as column headers in format "XXXXXXXX-X"

export interface CpvGroup {
  code: string;
  label: string;
  relevance: 'high' | 'medium';
}

// Core primary codes from email thread - highest priority
export const PRIMARY_CPV_CODES = [
  '71000000',
  '72000000',
  '73000000',
];

// Relevant CPV codes (from relevant_cpv_codes.csv + email thread breakdown)
// Parsed from the CSV column headers (stripping check digit after dash)
export const RELEVANT_CPV_CODES: string[] = [
  // Engineering & construction services (71x)
  '71000000','71300000','71310000','71320000','71330000','71340000',
  '71620000',
  // IT services (72x)
  '72000000','72200000','72211000','72220000','72230000','72240000','72261000',
  '72222000','72222100','72222200',
  // R&D (73x)
  '73000000','73200000',
  // Medical equipment (33x)
  '33000000','33100000','33190000',
  // Defence (35x, 75x)
  '35000000','75220000',
  // Industrial machinery (42x)
  '42000000',
  // Transport equipment (34x)
  '34000000','34100000','34300000','34600000',
  // Software packages (48x) - from CSV
  '48000000','48100000','48200000','48300000','48400000','48500000','48600000','48700000','48800000',
  // Other from CSV
  '79421000',
];

// Somewhat relevant CPV codes (from somewhat_relevant_cpv_codes.csv)
// These overlap heavily but represent the broader monitoring list
export const SOMEWHAT_RELEVANT_CPV_CODES: string[] = [
  '43000000','44000000',
  // detailed 33x subcodes
  '33110000','33120000','33130000','33140000','33150000','33160000','33170000','33180000',
  // detailed 42x subcodes  
  '42100000','42200000','42300000','42400000','42500000','42600000','42700000','42900000',
  // detailed 48x subcodes
  '48110000','48120000','48130000','48140000','48150000','48160000','48170000','48180000','48190000',
  '48210000','48220000','48310000','48320000','48330000','48410000','48420000','48430000',
  '48440000','48450000','48460000','48470000','48480000','48490000',
  '48510000','48520000','48610000','48620000','48710000','48720000','48730000','48740000',
  '48750000','48760000','48770000','48780000','48790000','48810000','48814000','48960000','48970000','48980000','48990000',
];

// Human-readable labels for key groups
export const CPV_LABELS: Record<string, string> = {
  '71000000': 'Architecture, Engineering & Inspection',
  '71300000': 'Engineering Services',
  '71310000': 'Consultative Engineering',
  '71320000': 'Engineering Design',
  '71330000': 'Various Engineering Services',
  '71340000': 'Integrated Engineering',
  '71620000': 'Analysis Services',
  '72000000': 'IT Services & Software Development',
  '72200000': 'Software Programming & Consultancy',
  '72211000': 'Programming Services',
  '72220000': 'Systems & Technical Consultancy',
  '72230000': 'Custom Software Development',
  '72240000': 'Systems Analysis & Programming',
  '72261000': 'Software Support',
  '72222000': 'Information Systems Review',
  '73000000': 'Research & Development',
  '73200000': 'R&D Consultancy',
  '33000000': 'Medical Equipment & Devices',
  '33100000': 'Medical Equipment',
  '33190000': 'Miscellaneous Medical Devices',
  '35000000': 'Defence & Security Equipment',
  '75220000': 'Defence Services',
  '42000000': 'Industrial Machinery',
  '43000000': 'Mining & Construction Equipment',
  '44000000': 'Construction Structures & Materials',
  '34000000': 'Transport Equipment',
  '34100000': 'Motor Vehicles',
  '34300000': 'Vehicle Parts & Accessories',
  '34600000': 'Railway Locomotives & Rolling Stock',
  '48000000': 'Software Packages & Information Systems',
  '48100000': 'Industry-specific Software',
  '48200000': 'Network & Communications Software',
  '48300000': 'Document Creation & Conversion Software',
  '48400000': 'Transaction & Business Software',
  '48500000': 'Communication & Multimedia Software',
  '48600000': 'Database Software',
  '48700000': 'Software Utility Packages',
  '48800000': 'Information Systems & Servers',
};

// Group definitions for UI filtering
export const CPV_GROUPS = [
  {
    id: 'engineering',
    label: 'Engineering',
    icon: '⚙️',
    codes: ['71000000','71300000','71310000','71320000','71330000','71340000','71620000'],
  },
  {
    id: 'it_software',
    label: 'IT & Software',
    icon: '💻',
    codes: ['72000000','72200000','72211000','72220000','72230000','72240000','72261000','72222000','72222100','72222200','48000000','48100000','48200000','48300000','48400000','48500000','48600000','48700000','48800000'],
  },
  {
    id: 'rnd',
    label: 'R&D',
    icon: '🔬',
    codes: ['73000000','73200000'],
  },
  {
    id: 'medtech',
    label: 'MedTech',
    icon: '🏥',
    codes: ['33000000','33100000','33190000'],
  },
  {
    id: 'defence',
    label: 'Defence',
    icon: '🛡️',
    codes: ['35000000','75220000'],
  },
  {
    id: 'industry',
    label: 'Industry & Manufacturing',
    icon: '🏭',
    codes: ['42000000','43000000','44000000'],
  },
  {
    id: 'mobility',
    label: 'Mobility & Transport',
    icon: '🚗',
    codes: ['34000000','34100000','34300000','34600000'],
  },
];

export function getCodeRelevance(code: string): 'high' | 'medium' | 'low' {
  const baseCode = code.replace(/-\d$/, '');
  if (RELEVANT_CPV_CODES.includes(baseCode)) return 'high';
  if (SOMEWHAT_RELEVANT_CPV_CODES.includes(baseCode)) return 'medium';
  return 'low';
}

export function getCodeLabel(code: string): string {
  const baseCode = code.replace(/-\d$/, '');
  return CPV_LABELS[baseCode] || `CPV ${baseCode}`;
}
