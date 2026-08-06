export interface Instructor {
  name: string;
  credentials: string;
  bio: string;
  avatar: string;
  certs: string[];
  experience: string;
}

export interface CurriculumModule {
  title: string;
  lessons: string[];
  duration: string;
}

export interface CourseDetail {
  id: string;
  tagline: string;
  outcomes: string[];
  requirements: string[];
  audience: string[];
  curriculum: CurriculumModule[];
  instructor: Instructor;
  rating: number;
  reviews: number;
  students: number;
  lastUpdated: string;
  language: string;
  certificate: boolean;
  highlights: { icon: string; label: string; value: string }[];
}

const DEFAULT_INSTRUCTOR: Instructor = {
  name: 'Emmanuel Okafor',
  credentials: 'CISSP, CISM, CEH, PMP',
  bio: 'Emmanuel is a seasoned cybersecurity professional with over 18 years of experience across financial services, government, and telecom. He has trained more than 4,000 IT professionals across West Africa and holds eight active vendor certifications.',
  avatar: 'EO',
  certs: ['CISSP', 'CISM', 'CEH', 'PMP', 'CISA'],
  experience: '18+ years',
};

const CLOUD_INSTRUCTOR: Instructor = {
  name: 'Adaeze Nwosu',
  credentials: 'AWS-SAA, AZ-104, CCSP, CCNA',
  bio: 'Adaeze is a cloud architect with 12 years of experience designing enterprise infrastructure on AWS and Azure. Former AWS Technical Trainer and Microsoft Certified Trainer, she specialises in hybrid cloud security.',
  avatar: 'AN',
  certs: ['AWS-SAA', 'AWS-SCS', 'AZ-104', 'CCSP'],
  experience: '12+ years',
};

const MGMT_INSTRUCTOR: Instructor = {
  name: 'Chukwuemeka Bello',
  credentials: 'PMP, ITIL 4, CISM, MBA',
  bio: 'Chukwuemeka is a certified project management professional and ITIL practitioner. He has led digital transformation programmes for four Fortune 500 companies and currently consults for the Nigerian government on IT governance.',
  avatar: 'CB',
  certs: ['PMP', 'ITIL 4', 'CISM', 'PRINCE2'],
  experience: '15+ years',
};

export const COURSE_DETAILS: Record<string, CourseDetail> = {
  'bc-cissp': {
    id: 'bc-cissp',
    tagline: 'The gold standard in information security — fully exam-ready in 6 days.',
    outcomes: [
      'Master all 8 CISSP domains from Security & Risk Management to Software Development Security',
      'Apply security concepts to real-world enterprise architecture scenarios',
      'Pass the CAT (Computerized Adaptive Testing) exam with confidence',
      'Understand legal, regulatory, and compliance frameworks across jurisdictions',
      'Design, implement, and manage a best-practice security programme',
    ],
    requirements: [
      '5+ years of cumulative paid work experience in 2+ of 8 CISSP domains',
      'A solid understanding of IT infrastructure and networking fundamentals',
      'Basic knowledge of cryptography concepts',
    ],
    audience: [
      'Security managers and directors',
      'IT directors and CISOs',
      'Security auditors and architects',
      'Network engineers moving into security',
    ],
    curriculum: [
      {
        title: 'Domain 1 – Security & Risk Management',
        duration: '4 hrs',
        lessons: ['CIA Triad & Security Governance', 'Legal & Regulatory Issues', 'Risk Management Frameworks', 'Business Continuity Planning', 'Personnel Security Policies'],
      },
      {
        title: 'Domain 2 – Asset Security',
        duration: '2.5 hrs',
        lessons: ['Information & Asset Classification', 'Ownership Concepts', 'Protect Privacy', 'Asset Retention & Data Remanence'],
      },
      {
        title: 'Domain 3 – Security Architecture & Engineering',
        duration: '5 hrs',
        lessons: ['Security Models & Evaluation Criteria', 'Cryptography Foundations', 'PKI & Key Management', 'Physical Security', 'Secure Design Principles'],
      },
      {
        title: 'Domain 4 – Communication & Network Security',
        duration: '4 hrs',
        lessons: ['OSI & TCP/IP Models', 'Secure Network Architecture', 'Network Protocols & Attacks', 'Firewalls, VPNs & Proxies', 'Wireless Security'],
      },
      {
        title: 'Domain 5 – Identity & Access Management',
        duration: '3 hrs',
        lessons: ['Identity Management Lifecycle', 'Authentication Methods & MFA', 'Access Control Models', 'Federated Identity & SSO', 'Privileged Access Management'],
      },
      {
        title: 'Domains 6–8 – Assessment, Operations & Development',
        duration: '5.5 hrs',
        lessons: ['Security Assessment & Testing', 'Security Operations Centre', 'Incident Management', 'Disaster Recovery', 'Secure SDLC & Code Review'],
      },
      {
        title: 'Exam Preparation & Practice Tests',
        duration: '4 hrs',
        lessons: ['CAT Exam Strategy', '250-question practice session', 'Domain weakness analysis', 'Memory techniques & mnemonics'],
      },
    ],
    instructor: DEFAULT_INSTRUCTOR,
    rating: 4.9,
    reviews: 812,
    students: 3240,
    lastUpdated: 'June 2026',
    language: 'English',
    certificate: true,
    highlights: [
      { icon: '🎓', label: 'Level', value: 'Advanced' },
      { icon: '⏱', label: 'Duration', value: '6 Days' },
      { icon: '📅', label: 'Next Cohort', value: 'Aug 11, 2026' },
      { icon: '👥', label: 'Students', value: '3,240+' },
      { icon: '🌐', label: 'Delivery', value: 'Live Online / In-person' },
      { icon: '📜', label: 'Certificate', value: 'Included' },
    ],
  },

  'bc-secplus': {
    id: 'bc-secplus',
    tagline: 'The most popular entry-level security cert — pass in 5 days, guaranteed.',
    outcomes: [
      'Understand core security concepts and threat landscape',
      'Configure and secure networks, cloud environments, and endpoints',
      'Implement identity management, access control, and PKI',
      'Apply incident response and digital forensics fundamentals',
      'Achieve CompTIA SY0-701 certification',
    ],
    requirements: [
      'CompTIA Network+ or 2 years of IT admin experience recommended',
      'Basic understanding of networking protocols',
    ],
    audience: [
      'IT administrators entering cybersecurity',
      'Help desk professionals seeking progression',
      'Military and government IT staff',
      'Career changers into information security',
    ],
    curriculum: [
      { title: 'Threats, Attacks & Vulnerabilities', duration: '3 hrs', lessons: ['Malware Types', 'Social Engineering', 'Application Attacks', 'Network Attacks', 'Threat Intelligence'] },
      { title: 'Architecture & Design', duration: '3 hrs', lessons: ['Enterprise Security Architecture', 'Virtualisation & Cloud', 'Secure Application Development', 'Authentication & Authorisation Design'] },
      { title: 'Implementation', duration: '3.5 hrs', lessons: ['Implementing PKI', 'Wireless Protocols', 'Secure Protocols', 'Network Security Devices', 'Endpoint Security'] },
      { title: 'Operations & Incident Response', duration: '3 hrs', lessons: ['Incident Response Procedures', 'Digital Forensics', 'Mitigation Techniques', 'Vulnerability Scanning'] },
      { title: 'Governance, Risk & Compliance', duration: '2.5 hrs', lessons: ['Regulations & Frameworks', 'Organisational Risk', 'Data Privacy', 'Business Impact Analysis'] },
      { title: 'Exam Cram & Practice Labs', duration: '4 hrs', lessons: ['180 practice questions', 'PBQ (performance-based) question walkthroughs', 'Last-day exam simulation'] },
    ],
    instructor: DEFAULT_INSTRUCTOR,
    rating: 4.8,
    reviews: 1540,
    students: 5800,
    lastUpdated: 'May 2026',
    language: 'English',
    certificate: true,
    highlights: [
      { icon: '🎓', label: 'Level', value: 'Beginner' },
      { icon: '⏱', label: 'Duration', value: '5 Days' },
      { icon: '📅', label: 'Next Cohort', value: 'Jul 28, 2026' },
      { icon: '👥', label: 'Students', value: '5,800+' },
      { icon: '🌐', label: 'Delivery', value: 'Hybrid' },
      { icon: '📜', label: 'Certificate', value: 'Included' },
    ],
  },

  'bc-aws-saa': {
    id: 'bc-aws-saa',
    tagline: 'Design resilient, cost-optimised AWS solutions — certified in 5 days.',
    outcomes: [
      'Design highly available and fault-tolerant architectures on AWS',
      'Select the right AWS services for compute, storage, database, and networking workloads',
      'Implement security controls and identity management using IAM, KMS, and AWS Shield',
      'Optimise cost using Reserved Instances, Savings Plans, and right-sizing',
      'Pass the SAA-C03 exam on your first attempt',
    ],
    requirements: [
      '1+ year of hands-on experience with AWS',
      'Understanding of networking and Linux/Windows administration',
    ],
    audience: [
      'Cloud engineers and architects',
      'DevOps engineers expanding AWS knowledge',
      'System administrators moving to cloud',
      'Solution architects seeking certification',
    ],
    curriculum: [
      { title: 'AWS Core Services & Global Infrastructure', duration: '2.5 hrs', lessons: ['Regions & Availability Zones', 'IAM & Security Basics', 'EC2 & Auto Scaling', 'VPC Deep Dive'] },
      { title: 'Storage & Databases', duration: '3 hrs', lessons: ['S3 & Glacier', 'EBS, EFS & FSx', 'RDS & Aurora', 'DynamoDB', 'Caching with ElastiCache'] },
      { title: 'High Availability & Resilience', duration: '3 hrs', lessons: ['Elastic Load Balancing', 'Route 53 Routing Policies', 'CloudFront & Global Accelerator', 'Disaster Recovery Strategies'] },
      { title: 'Decoupling & Serverless', duration: '2 hrs', lessons: ['SQS, SNS & EventBridge', 'Lambda & API Gateway', 'Step Functions', 'Kinesis & Firehose'] },
      { title: 'Security, Monitoring & Cost', duration: '2.5 hrs', lessons: ['Encryption & KMS', 'CloudTrail & Config', 'Cost Explorer & Budgets', 'AWS Trusted Advisor'] },
      { title: 'Hands-on Labs & Exam Simulation', duration: '5 hrs', lessons: ['12 guided AWS lab exercises', 'Architectural diagramming', 'Full practice exam SAA-C03', 'Review & question analysis'] },
    ],
    instructor: CLOUD_INSTRUCTOR,
    rating: 4.8,
    reviews: 940,
    students: 2890,
    lastUpdated: 'June 2026',
    language: 'English',
    certificate: true,
    highlights: [
      { icon: '🎓', label: 'Level', value: 'Intermediate' },
      { icon: '⏱', label: 'Duration', value: '5 Days' },
      { icon: '📅', label: 'Next Cohort', value: 'Jul 14, 2026' },
      { icon: '👥', label: 'Students', value: '2,890+' },
      { icon: '🌐', label: 'Delivery', value: 'AWS Lab Environment' },
      { icon: '📜', label: 'Certificate', value: 'Included' },
    ],
  },

  'bc-pmp': {
    id: 'bc-pmp',
    tagline: 'The world\'s leading PM cert — 35 PDUs included, pass guaranteed.',
    outcomes: [
      'Apply predictive and agile project management methodologies',
      'Lead project teams through the full project lifecycle',
      'Manage scope, schedule, cost, risk, and stakeholder expectations',
      'Use PMI\'s PMBOK 7th Edition performance domains',
      'Earn 35 PDUs required for PMP application',
    ],
    requirements: [
      '3–5 years of project management experience',
      'Secondary or bachelor\'s degree',
      '35 hours of project management education (provided by this course)',
    ],
    audience: [
      'Project managers seeking formal certification',
      'Programme and portfolio managers',
      'Business analysts leading projects',
      'IT managers and team leads',
    ],
    curriculum: [
      { title: 'PMI Framework & Exam Overview', duration: '2 hrs', lessons: ['PMP Application Process', 'PMBOK 7 vs 6 Changes', 'ECO (Exam Content Outline)', 'Predictive vs Agile Mindset'] },
      { title: 'Project Performance Domains', duration: '4 hrs', lessons: ['Stakeholder Domain', 'Team Domain', 'Development Approach', 'Planning Domain', 'Project Work Domain'] },
      { title: 'Scope, Schedule & Cost', duration: '4 hrs', lessons: ['WBS & Requirements', 'Critical Path & Schedule Compression', 'Earned Value Management', 'Cost Baseline & Forecasting'] },
      { title: 'Risk, Quality & Procurement', duration: '3 hrs', lessons: ['Risk Identification & Analysis', 'Risk Responses', 'Quality Management', 'Procurement Strategies & Contracts'] },
      { title: 'Agile & Hybrid Approaches', duration: '3 hrs', lessons: ['Scrum Framework', 'Kanban & Lean', 'SAFe Overview', 'Hybrid Project Environments'] },
      { title: 'Exam Simulation & PMP Application', duration: '3 hrs', lessons: ['180-question exam simulation', 'Situational question strategy', 'PMP application walkthrough', 'PDU tracking'] },
    ],
    instructor: MGMT_INSTRUCTOR,
    rating: 4.8,
    reviews: 680,
    students: 2140,
    lastUpdated: 'April 2026',
    language: 'English',
    certificate: true,
    highlights: [
      { icon: '🎓', label: 'Level', value: 'Intermediate' },
      { icon: '⏱', label: 'Duration', value: '5 Days' },
      { icon: '📅', label: 'Next Cohort', value: 'Aug 11, 2026' },
      { icon: '👥', label: 'Students', value: '2,140+' },
      { icon: '🌐', label: 'Delivery', value: 'PMBOK 7 Aligned' },
      { icon: '📜', label: '35 PDUs', value: 'Included' },
    ],
  },

  'bc-cism': {
    id: 'bc-cism',
    tagline: 'Lead enterprise security programmes — the CISO\'s preferred certification.',
    outcomes: [
      'Develop and manage an information security programme aligned to business objectives',
      'Identify and manage information risk in a corporate context',
      'Govern security programmes using industry frameworks',
      'Lead incident management and response for enterprise environments',
    ],
    requirements: [
      '5+ years of information security work experience',
      '3 years in security management (may be substituted with other credentials)',
    ],
    audience: ['CISOs and security directors', 'IT managers', 'Security consultants', 'Risk and compliance professionals'],
    curriculum: [
      { title: 'Information Security Governance', duration: '3.5 hrs', lessons: ['Security Strategy Alignment', 'Governance Frameworks', 'Metrics & Reporting', 'Security Charter'] },
      { title: 'Information Risk Management', duration: '3 hrs', lessons: ['Risk Identification', 'Risk Assessment Methods', 'Risk Treatment Options', 'Monitoring & Reporting'] },
      { title: 'Security Programme Development', duration: '3 hrs', lessons: ['Programme Resources', 'Security Architecture', 'Awareness & Training', 'Third-party Risk'] },
      { title: 'Incident Management', duration: '3 hrs', lessons: ['Incident Response Plans', 'Classification & Escalation', 'Post-Incident Review', 'Crisis Communications'] },
      { title: 'Exam Prep & Domain Review', duration: '4 hrs', lessons: ['150-question practice exam', 'Domain-by-domain debrief', 'High-yield topic flashcards'] },
    ],
    instructor: DEFAULT_INSTRUCTOR,
    rating: 4.8,
    reviews: 520,
    students: 1680,
    lastUpdated: 'May 2026',
    language: 'English',
    certificate: true,
    highlights: [
      { icon: '🎓', label: 'Level', value: 'Advanced' },
      { icon: '⏱', label: 'Duration', value: '4 Days' },
      { icon: '📅', label: 'Next Cohort', value: 'Aug 4, 2026' },
      { icon: '👥', label: 'Students', value: '1,680+' },
      { icon: '🌐', label: 'Delivery', value: 'Virtual Classroom' },
      { icon: '📜', label: 'Certificate', value: 'Included' },
    ],
  },
};

export function getCourseDetail(id: string): CourseDetail | null {
  return COURSE_DETAILS[id] ?? null;
}

export const DEFAULT_DETAIL: Omit<CourseDetail, 'id'> = {
  tagline: 'Expert-led bootcamp. Exam-ready in days, not months.',
  outcomes: [
    'Gain deep understanding of all exam domains',
    'Apply knowledge through hands-on labs and real-world scenarios',
    'Receive comprehensive study materials and practice exams',
    'Benefit from instructor support throughout the course',
  ],
  requirements: [
    'Basic IT knowledge recommended',
    'A desire to advance your professional career',
  ],
  audience: ['IT professionals seeking certification', 'Career changers into technology'],
  curriculum: [
    { title: 'Core Concepts & Foundations', duration: '3 hrs', lessons: ['Course introduction & exam overview', 'Core domain knowledge', 'Key frameworks and standards', 'Terminology deep dive'] },
    { title: 'Domain Deep Dives', duration: '6 hrs', lessons: ['Domain 1 – Foundations', 'Domain 2 – Technical Controls', 'Domain 3 – Operations', 'Domain 4 – Governance'] },
    { title: 'Hands-on Labs', duration: '4 hrs', lessons: ['Guided lab exercises', 'Scenario-based practice', 'Peer review sessions'] },
    { title: 'Exam Simulation', duration: '3 hrs', lessons: ['Full-length practice exam', 'Question analysis', 'Last-day review'] },
  ],
  instructor: DEFAULT_INSTRUCTOR,
  rating: 4.7,
  reviews: 280,
  students: 1200,
  lastUpdated: 'May 2026',
  language: 'English',
  certificate: true,
  highlights: [
    { icon: '🎓', label: 'Level', value: 'Intermediate' },
    { icon: '⏱', label: 'Duration', value: '5 Days' },
    { icon: '🌐', label: 'Delivery', value: 'Live Online' },
    { icon: '📜', label: 'Certificate', value: 'Included' },
  ],
};
