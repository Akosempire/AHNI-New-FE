/**
 * Copy and data for the AHNi public site.
 * Keep facts here so pages stay layout-only. Figures are limited to facts already
 * published on the portal (founded 2009, Abuja HQ, five geopolitical zones, partner list).
 * TODO(content): replace story copy/figures with real programme results when available.
 */

export const ORG = {
  short: "AHNi",
  name: "Achieving Health Nigeria Initiative",
  reg: "CAC/NO/33391",
  founded: 2009,
  address: "No. 30 Anthony Enahoro Street, Utako District, Abuja, Nigeria",
  phones: ["+234 09 461 5555", "+234 09 461 500"],
  fax: "+234 09 461 5511",
  hours: [
    { d: "Monday – Thursday", h: "8:00am – 5:30pm" },
    { d: "Friday", h: "8:00am – 2:00pm" },
    { d: "Saturday – Sunday", h: "Closed" },
  ],
  emails: {
    operations: "AHNiOperations@ahnigeria.org",
    careers: "careers@ahnigeria.org",
    consultants: "consultants@ahnigeria.org",
    procurement: "procurement@ahnigeria.org",
    vendor: "vendor@ahnigeria.org",
    support: "support@ahnigeria.org",
  },
  website: "https://ahnigeria.org",
};

export type OppTypeKey = "JOB" | "CONSULTANT" | "ADHOC" | "EOI" | "RFQ" | "RFP";

export const OPP_TYPES: { key: OppTypeKey; label: string; plural: string; group: "people" | "procurement" }[] = [
  { key: "JOB", label: "Full-time job", plural: "Jobs", group: "people" },
  { key: "CONSULTANT", label: "Consultancy", plural: "Consultancies", group: "people" },
  { key: "ADHOC", label: "Ad-hoc assignment", plural: "Ad-hoc", group: "people" },
  { key: "EOI", label: "Expression of interest", plural: "EOIs", group: "procurement" },
  { key: "RFQ", label: "Request for quote", plural: "RFQs", group: "procurement" },
  { key: "RFP", label: "Request for proposal", plural: "RFPs", group: "procurement" },
];

export const PORTALS = [
  { label: "Staff Portal", desc: "For AHNi employees", href: "/auth/login" },
  { label: "Vendor Portal", desc: "Registered vendors & suppliers", href: "/vendor-portal/login" },
  { label: "Consultant Portal", desc: "Consultants & external partners", href: "/consultant-portal" },
];

export type FocusIconKey =
  | "ribbon" | "lungs" | "mosquito" | "mother" | "building" | "microscope"
  | "stethoscope" | "community" | "scale" | "spark" | "book" | "shield";

export type FocusArea = {
  slug: string;
  title: string;
  short: string;
  icon: FocusIconKey;
  group: "Disease control" | "Systems" | "Communities" | "Evidence";
  summary: string;
  points?: string[];
};

export const FOCUS_AREAS: FocusArea[] = [
  {
    slug: "hiv-tb-malaria",
    title: "HIV, TB & Malaria",
    short: "HIV, TB & Malaria",
    icon: "ribbon",
    group: "Disease control",
    summary:
      "Working alongside government and partners such as the Global Fund, USAID and CDC to find, treat and prevent HIV, tuberculosis and malaria.",
    points: ["Case finding & testing", "Treatment & adherence support", "Prevention in high-burden communities"],
  },
  {
    slug: "health-systems",
    title: "Health System Strengthening",
    short: "Health Systems",
    icon: "building",
    group: "Systems",
    summary:
      "Building robust healthcare infrastructure and institutional capacity through policy support, workforce development and better data.",
    points: ["Healthcare infrastructure development", "Health workforce capacity building", "Health information systems"],
  },
  {
    slug: "reproductive-health",
    title: "Reproductive, Maternal & Child Health",
    short: "Maternal & Child",
    icon: "mother",
    group: "Communities",
    summary:
      "Reducing maternal and child mortality through improved access to quality care and evidence-based interventions.",
    points: ["Maternal and child health programmes", "Family planning services", "Skilled birth attendance"],
  },
  {
    slug: "primary-healthcare",
    title: "Primary Healthcare",
    short: "Primary Care",
    icon: "stethoscope",
    group: "Systems",
    summary:
      "Building and supporting primary healthcare systems so accessible, quality care is available at community level.",
  },
  {
    slug: "disease-prevention",
    title: "Disease Prevention & Control",
    short: "Prevention",
    icon: "shield",
    group: "Disease control",
    summary:
      "Prevention and control programmes targeting both communicable and non-communicable diseases.",
  },
  {
    slug: "community-health",
    title: "Community Health",
    short: "Community Health",
    icon: "community",
    group: "Communities",
    summary:
      "Working with communities to promote health, prevent disease and design culturally appropriate solutions.",
  },
  {
    slug: "education-training",
    title: "Education & Training",
    short: "Training",
    icon: "book",
    group: "Communities",
    summary:
      "Training and education programmes that build local capacity and keep healthcare delivery sustainable.",
    points: ["Healthcare professional training", "Community health education", "Leadership development"],
  },
  {
    slug: "health-research",
    title: "Health Research",
    short: "Research",
    icon: "microscope",
    group: "Evidence",
    summary:
      "Conducting and supporting health research that generates evidence for effective policies and programmes.",
  },
  {
    slug: "health-equity",
    title: "Health Equity",
    short: "Equity",
    icon: "scale",
    group: "Evidence",
    summary:
      "Ensuring equitable access to healthcare services and addressing the social determinants of health.",
  },
  {
    slug: "health-innovation",
    title: "Health Innovation",
    short: "Innovation",
    icon: "spark",
    group: "Evidence",
    summary:
      "Promoting and implementing innovative healthcare technologies and service-delivery models.",
  },
];

/** Story cards for the "impact" carousel. Stats use published facts only. */
export const STORIES = [
  {
    title: "Community-led programming",
    img: "/img/healthcare-safety.jpg",
    alt: "AHNi team members in masks standing outside a health facility",
    chips: ["Community health", "Since 2009"],
    stats: [
      { v: "2009", l: "Year AHNi was founded" },
      { v: "5", l: "Geopolitical zones reached" },
    ],
    href: "/focus-areas#community-health",
  },
  {
    title: "Partnering with government",
    img: "/img/leadership-conference.jpg",
    alt: "Government officials and development partners at a stakeholder meeting",
    chips: ["Partnerships", "Health systems"],
    stats: [
      { v: "10+", l: "Government & donor partners" },
      { v: "3", l: "Priority diseases: HIV, TB, malaria" },
    ],
    href: "/focus-areas#health-systems",
  },
  {
    title: "Learning that lasts",
    img: "/img/education.jpg",
    alt: "A smiling schoolgirl holding a reading book",
    chips: ["Education & training", "Communities"],
    stats: [
      { v: "15+", l: "Years of programming" },
      { v: "10", l: "Focus areas across health & development" },
    ],
    href: "/focus-areas#education-training",
  },
  {
    title: "Evidence for better policy",
    img: "/img/login.jpeg",
    alt: "Students writing in their notebooks in a classroom",
    chips: ["Research", "Health equity"],
    stats: [
      { v: "Abuja", l: "Headquarters & technical hub" },
      { v: "Nationwide", l: "Evidence-driven technical assistance" },
    ],
    href: "/focus-areas#health-research",
  },
];

export const PARTNERS = [
  { name: "Government of Nigeria", img: "/img/GOVT OF NIGERIA.jpeg" },
  { name: "The Global Fund", img: "/img/GF AIDS AND TB.jpg" },
  { name: "USAID", img: "/img/id7T80qjOv_1765148519754.png" },
  { name: "UK Aid", img: "/img/ukaid2.png.jpeg" },
  { name: "UNICEF", img: "/img/Logo_of_UNICEF.svg.png" },
  { name: "FHI 360", img: "/img/idBZNTby4A_1765148566781.svg" },
  { name: "UNFPA", img: "/img/UNFPA_logo.svg.png" },
  { name: "UNHCR", img: "/img/UNHCR.svg.png" },
];

export const APPROACH = [
  {
    title: "Technical assistance",
    body:
      "Health technical assistance to Nigeria's public health sector – from federal ministries to state programmes and local facilities.",
  },
  {
    title: "Community-led programming",
    body:
      "We work directly with communities to understand needs and co-design culturally appropriate, inclusive health solutions.",
  },
  {
    title: "Health system strengthening",
    body:
      "Infrastructure, workforce and information systems that keep improving outcomes long after a project ends.",
  },
  {
    title: "Research & evidence",
    body:
      "Research, monitoring and evaluation that turn programme data into better policy and smarter investment.",
  },
];

export const MENU = [
  {
    label: "Opportunities",
    href: "/opportunities",
    children: [
      { label: "All opportunities", href: "/opportunities" },
      { label: "Jobs", href: "/opportunities?type=JOB" },
      { label: "Consultancies", href: "/opportunities?type=CONSULTANT" },
      { label: "Ad-hoc assignments", href: "/opportunities?type=ADHOC" },
      { label: "Expressions of interest", href: "/opportunities?type=EOI" },
      { label: "RFQs & RFPs", href: "/opportunities?type=RFQ" },
    ],
  },
  {
    label: "Focus Areas",
    href: "/focus-areas",
    children: FOCUS_AREAS.slice(0, 7).map((f) => ({ label: f.title, href: `/focus-areas#${f.slug}` })),
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Who we are", href: "/about" },
      { label: "Mission & vision", href: "/about#mission" },
      { label: "How we work", href: "/about#approach" },
      { label: "Partners", href: "/about#partners" },
    ],
  },
  {
    label: "Portals",
    href: "/auth/login",
    children: PORTALS.map((p) => ({ label: p.label, href: p.href })),
  },
  { label: "Contact", href: "/contact" },
];
