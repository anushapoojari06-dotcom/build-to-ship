export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English', native: 'English', flag: '🌐', region: 'Global' },
  { code: 'kn-IN', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', region: 'Karnataka' },
  { code: 'te-IN', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', region: 'Andhra / Telangana' },
  { code: 'ta-IN', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', region: 'Tamil Nadu' },
  { code: 'bn-IN', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', region: 'West Bengal' },
  { code: 'mr-IN', name: 'Marathi', native: 'मराठी', flag: '🇮🇳', region: 'Maharashtra' },
  { code: 'ml-IN', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', region: 'Kerala' },
  { code: 'ur-IN', name: 'Urdu', native: 'اردو', flag: '🇮🇳', region: 'South Asia' },
  { code: 'hi-IN', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', region: 'India' },
  { code: 'es-ES', name: 'Spanish', native: 'Español', flag: '🇪🇸', region: 'Spain / LATAM' },
  { code: 'fr-FR', name: 'French', native: 'Français', flag: '🇫🇷', region: 'France' },
  { code: 'tl-PH', name: 'Tagalog', native: 'Tagalog', flag: '🇵🇭', region: 'Philippines' },
  { code: 'ar-SA', name: 'Arabic', native: 'العربية', flag: '🇸🇦', region: 'Middle East' },
];

// Multilingual Affirmation & Negation Dictionary for Voice Confirmation
export const VOICE_CONFIRMATION_KEYWORDS = {
  affirmative: [
    'yes', 'yeah', 'yep', 'correct', 'right', 'sure', 'confirm', 'okay', 'ok',
    'haan', 'ha', 'sahi', 'theek', 'accha', // Hindi / Urdu
    'haudu', 'sari', 'houdu', // Kannada
    'avunu', 'sare', // Telugu
    'aam', 'sari', 'aamaa', // Tamil
    'thik', 'sothik', // Bengali
    'ho', 'barobar', 'hoy', // Marathi
    'athe', 'sari', // Malayalam
    'durust', 'ji haan' // Urdu
  ],
  negative: [
    'no', 'nope', 'nah', 'wrong', 'change', 'repeat', 'incorrect', 'cancel', 'redo',
    'nahi', 'na', 'galat', 'badlo', // Hindi / Urdu
    'illa', 'thappu', 'bedi', // Kannada
    'kaadu', 'vaddu', // Telugu
    'illai', 'vendaam', // Tamil
    'bhul', 'bodlao', // Bengali
    'chook', 'nako', // Marathi
    'alla', 'thettu', // Malayalam
    'galat hai', 'badal do' // Urdu
  ]
};

// Global Voice Navigation Commands
export const GLOBAL_VOICE_COMMANDS = {
  next: ['next', 'go next', 'forward', 'aage', 'munde', 'mundhuku', 'adutha', 'pore'],
  repeat: ['repeat', 'repeat again', 'read again', 'listen again', 'say again', 'phir se', 'punaha', 'marupadi'],
  stop: ['stop', 'quiet', 'shut up', 'pause', 'ruko', 'nillu', 'aagu', 'nillunga', 'thamo'],
  home: ['home', 'go home', 'main page', 'start', 'shuru'],
  form: ['form', 'job form', 'apply', 'fill form', 'application'],
  reader: ['reader', 'document', 'letter', 'simplify', 'read document'],
  settings: ['settings', 'options', 'contrast', 'language', 'speed']
};

export const JOB_APPLICATION_FIELDS = [
  {
    id: 'full_name',
    label: 'Full Name',
    icon: 'User',
    audio_prompt: 'Please say your full name.',
    type: 'text',
    placeholder: 'e.g. Maria Gonzalez / Ramesh Kumar',
    example: 'Say: "My name is Ramesh Kumar"'
  },
  {
    id: 'phone_number',
    label: 'Phone Number',
    icon: 'Phone',
    audio_prompt: 'What is a good phone number to reach you?',
    type: 'tel',
    placeholder: 'e.g. 98765 43210',
    example: 'Say: "My number is 98765 43210"'
  },
  {
    id: 'city',
    label: 'City or Town',
    icon: 'MapPin',
    audio_prompt: 'What city or town do you live in?',
    type: 'text',
    placeholder: 'e.g. Bengaluru, Hyderabad, or Chicago',
    example: 'Say: "I live in Bengaluru"'
  },
  {
    id: 'work_history',
    label: 'Past Work Experience',
    icon: 'Briefcase',
    audio_prompt: 'Tell me about jobs you have worked in the past.',
    type: 'textarea',
    placeholder: 'e.g. Farm worker, shop assistant, driver, construction',
    example: 'Say: "I worked as a delivery driver for two years"'
  },
  {
    id: 'availability',
    label: 'Work Availability',
    icon: 'Calendar',
    audio_prompt: 'Can you work full time, part time, or weekends?',
    type: 'text',
    placeholder: 'e.g. Full-time, mornings, all days',
    example: 'Say: "I can work full-time"'
  }
];

export const SAMPLE_DOCUMENTS = [
  {
    title: 'Hospital Billing Notice',
    tag: 'Medical',
    text: `Pursuant to the Healthcare Financing Administration guidelines, this correspondence serves as a formal notification of patient liability under account #98421. Outstanding deductible balances for inpatient diagnostic imaging rendered on November 14 have been adjudicated. Failure to remit remittance or negotiate an installment reimbursement schedule within thirty (30) calendar days may result in transfer of outstanding debt to third-party subrogation agencies.`
  },
  {
    title: 'Housing Lease Extension',
    tag: 'Legal / Rent',
    text: `Be advised that pursuant to Paragraph 18 of the Residential Tenancy Agreement executed on March 1, the Lessor hereby issues formal notice of tenancy expiration on April 30. The Lessee is granted thirty days from receipt of this notice to communicate intent to execute an amended covenant with revised quarterly municipal utility surcharges, or alternately surrender the premises in broom-clean condition.`
  },
  {
    title: 'Benefits Verification Letter',
    tag: 'Government',
    text: `This notice confirms your statutory eligibility for supplemental nutrition assistance. You are required to submit documented proof of earned and unearned gross monthly household income, along with utility expense verifications, to your designated county social service caseworker no later than Friday, October 17 at 5:00 PM Eastern Standard Time to prevent benefit termination.`
  },
  {
    title: 'Rural Agricultural Subsidy Notice',
    tag: 'Farming / Subsidy',
    text: `Under the statutory agrarian support directive, beneficiaries enrolled in the direct benefit transfer mechanism must submit Aadhaar-seeded soil testing receipts alongside seed replenishment declarations to the district agricultural extension office by the fifteenth proximo to prevent subsidy forfeiture.`
  }
];
