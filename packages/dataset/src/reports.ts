import type { CareerReport, CareerReportContent, CareerScore } from "./types";

/**
 * Authored Career Report content per career — the levels/plan/universities/certs
 * the brief requires but doesn't supply (we extend, never reduce). The conclusion
 * is generated per student at request time (see buildCareerReport), so it's
 * personalized rather than canned.
 */
export const CAREER_REPORTS: Record<string, CareerReportContent> = {
  "software-engineer": {
    levels: [
      { title: "Junior / Entry Engineer", salary: "$70K–$90K" },
      { title: "Mid-level Engineer", salary: "$95K–$130K" },
      { title: "Senior / Staff Engineer", salary: "$130K–$180K+" },
    ],
    actionPlan: {
      now: ["Take CS & math; build small app projects", "Learn one language well (Python or JavaScript)"],
      near: ["Earn a CS degree or bootcamp; put projects on GitHub", "Land a software internship"],
      far: ["Ship production code in a junior role", "Specialize (web, mobile, ML) toward senior"],
    },
    universities: [
      { program: "Computer Science, BSc", requirements: "Strong math; a coding portfolio helps", whyFits: "Core CS theory plus hands-on projects map straight to the job." },
      { program: "Software Engineering Bootcamp", requirements: "HS diploma; aptitude test", whyFits: "Faster, project-first route into a junior role." },
    ],
    certifications: { now: ["CS50 / freeCodeCamp (free)"], during: ["AWS Cloud Practitioner"], after: ["AWS Solutions Architect", "Meta or Google professional certs"] },
  },
  doctor: {
    levels: [
      { title: "Resident", salary: "~$60K" },
      { title: "Attending Physician", salary: "$200K–$300K" },
      { title: "Specialist / Senior", salary: "$300K–$350K+" },
    ],
    actionPlan: {
      now: ["Excel in biology & chemistry; volunteer in a clinic", "Shadow a doctor"],
      near: ["Finish a pre-med degree; ace the MCAT", "Apply to medical school"],
      far: ["Complete med school + residency", "Get board-certified and practice"],
    },
    universities: [
      { program: "Pre-Medicine / Biology, BSc", requirements: "Strong science & GPA; MCAT later", whyFits: "Builds the science foundation medical schools require." },
      { program: "Health Sciences, BSc", requirements: "Biology & chemistry focus", whyFits: "Clinical exposure plus med-school prerequisites." },
    ],
    certifications: { now: ["CPR / First Aid"], during: ["Clinical research experience"], after: ["USMLE licensing", "Board certification"] },
  },
  nurse: {
    levels: [
      { title: "Entry RN", salary: "$55K–$70K" },
      { title: "Experienced RN", salary: "$80K–$95K" },
      { title: "Charge / Specialty Nurse", salary: "$95K–$110K" },
    ],
    actionPlan: {
      now: ["Take biology; volunteer at a hospital", "Earn a CNA cert if you can"],
      near: ["Earn an ADN or BSN", "Pass the NCLEX-RN"],
      far: ["Gain floor experience; pick a specialty", "Move toward charge or specialty roles"],
    },
    universities: [
      { program: "Nursing (BSN), BSc", requirements: "Biology & chemistry; clinical placements", whyFits: "Direct, accredited route to RN licensure." },
      { program: "Associate Degree in Nursing (ADN)", requirements: "HS diploma; science prerequisites", whyFits: "Faster, lower-cost path to becoming an RN." },
    ],
    certifications: { now: ["CPR / BLS"], during: ["CNA certification"], after: ["NCLEX-RN license", "Specialty certs (e.g., critical care)"] },
  },
  teacher: {
    levels: [
      { title: "New Teacher", salary: "$40K–$50K" },
      { title: "Experienced Teacher", salary: "$55K–$70K" },
      { title: "Lead / Department Head", salary: "$70K–$85K" },
    ],
    actionPlan: {
      now: ["Tutor or mentor younger students", "Take education or psychology electives"],
      near: ["Earn an education degree", "Complete student teaching"],
      far: ["Get licensed and lead a classroom", "Pursue a specialty or leadership role"],
    },
    universities: [
      { program: "Education, BA", requirements: "Subject knowledge; student-teaching placement", whyFits: "Pairs subject mastery with classroom practice." },
      { program: "Subject degree + teaching credential", requirements: "Bachelor's + credential program", whyFits: "Deep subject expertise plus certification." },
    ],
    certifications: { now: ["Tutoring / mentoring experience"], during: ["State teaching credential"], after: ["National Board Certification"] },
  },
  "social-worker": {
    levels: [
      { title: "Case Worker", salary: "$40K–$50K" },
      { title: "Licensed Social Worker", salary: "$55K–$70K" },
      { title: "Clinical / Supervisor", salary: "$75K–$90K" },
    ],
    actionPlan: {
      now: ["Volunteer with a community org", "Take psychology & sociology classes"],
      near: ["Earn a BSW or related degree", "Complete field placements"],
      far: ["Get licensed (LMSW / LCSW)", "Specialize (schools, health, family)"],
    },
    universities: [
      { program: "Social Work (BSW), BA", requirements: "Field placements; strong empathy", whyFits: "Accredited route toward licensure." },
      { program: "Psychology, BA", requirements: "Behavioral science focus", whyFits: "Foundation for an MSW and clinical work." },
    ],
    certifications: { now: ["Volunteer hours"], during: ["BSW field certification"], after: ["LMSW / LCSW license"] },
  },
  "financial-analyst": {
    levels: [
      { title: "Junior Analyst", salary: "$60K–$75K" },
      { title: "Senior Analyst", salary: "$85K–$110K" },
      { title: "Finance Manager", salary: "$110K–$150K+" },
    ],
    actionPlan: {
      now: ["Take economics & statistics", "Learn Excel and basic accounting"],
      near: ["Earn a finance / economics degree", "Land a finance internship"],
      far: ["Work as an analyst; sharpen modeling", "Pursue the CFA and move up"],
    },
    universities: [
      { program: "Finance, BSc", requirements: "Strong math; analytical aptitude", whyFits: "Covers accounting, markets, and modeling." },
      { program: "Economics, BA", requirements: "Quantitative coursework", whyFits: "Analytical foundation valued in finance." },
    ],
    certifications: { now: ["Financial modeling course"], during: ["Bloomberg Market Concepts"], after: ["CFA Level I–III", "CPA (if accounting)"] },
  },
  "graphic-designer": {
    levels: [
      { title: "Junior Designer", salary: "$45K–$60K" },
      { title: "Designer", salary: "$60K–$80K" },
      { title: "Senior / Art Director", salary: "$80K–$110K" },
    ],
    actionPlan: {
      now: ["Build a portfolio; learn the Adobe suite", "Take art & design classes"],
      near: ["Earn a design degree or a strong portfolio", "Freelance or intern"],
      far: ["Specialize (brand, motion, product)", "Grow into senior or art-director roles"],
    },
    universities: [
      { program: "Graphic Design, BFA", requirements: "Portfolio; visual aptitude", whyFits: "Builds craft, typography, and a portfolio." },
      { program: "Design / Visual Arts (Associate)", requirements: "Portfolio; HS diploma", whyFits: "Faster, portfolio-first route into the field." },
    ],
    certifications: { now: ["Adobe tutorials"], during: ["Adobe Certified Professional"], after: ["UX/UI or motion specializations"] },
  },
  entrepreneur: {
    levels: [
      { title: "Founder (early)", salary: "Varies / often lean" },
      { title: "Growing Business", salary: "$50K–$120K+" },
      { title: "Established / Exit", salary: "$120K–$1M+" },
    ],
    actionPlan: {
      now: ["Start a small project or side hustle", "Take business & coding classes"],
      near: ["Study business or build a startup", "Find a mentor; validate an idea"],
      far: ["Launch and grow a venture", "Raise funding or bootstrap to profit"],
    },
    universities: [
      { program: "Business Administration, BBA", requirements: "Leadership; initiative", whyFits: "Strategy, finance, and operations for founders." },
      { program: "Computer Science + Business", requirements: "Technical + business aptitude", whyFits: "Build the product and run the company." },
    ],
    certifications: { now: ["A business / startup competition"], during: ["YC Startup School (free)"], after: ["Industry-specific credentials"] },
  },
  "data-scientist": {
    levels: [
      { title: "Junior Data Scientist", salary: "$75K–$95K" },
      { title: "Data Scientist", salary: "$110K–$140K" },
      { title: "Senior / Lead", salary: "$140K–$170K+" },
    ],
    actionPlan: {
      now: ["Take statistics & programming", "Learn Python and basic ML"],
      near: ["Earn a degree in data science, stats, or CS", "Build data projects; intern"],
      far: ["Work with real data pipelines", "Specialize (ML, NLP) and lead projects"],
    },
    universities: [
      { program: "Data Science, BSc", requirements: "Strong math & stats", whyFits: "Stats, ML, and programming in one program." },
      { program: "Computer Science or Statistics, BSc", requirements: "Quantitative focus", whyFits: "Rigorous foundation for data roles." },
    ],
    certifications: { now: ["Kaggle / Python courses"], during: ["Google Data Analytics cert"], after: ["TensorFlow / AWS ML certs"] },
  },
  "marketing-manager": {
    levels: [
      { title: "Coordinator", salary: "$45K–$55K" },
      { title: "Marketing Manager", salary: "$70K–$95K" },
      { title: "Director", salary: "$100K–$140K+" },
    ],
    actionPlan: {
      now: ["Run a social account or school campaign", "Take writing & communications classes"],
      near: ["Earn a marketing / communications degree", "Intern on a marketing team"],
      far: ["Manage campaigns and budgets", "Grow into director-level strategy"],
    },
    universities: [
      { program: "Marketing, BBA", requirements: "Communication; creativity", whyFits: "Strategy, branding, and analytics." },
      { program: "Communications, BA", requirements: "Strong writing", whyFits: "Messaging and media skills for marketing." },
    ],
    certifications: { now: ["Google Digital Garage (free)"], during: ["Google Ads / Analytics certs"], after: ["HubSpot / content marketing certs"] },
  },
  lawyer: {
    levels: [
      { title: "Associate (new)", salary: "$70K–$90K" },
      { title: "Mid-level Attorney", salary: "$120K–$180K" },
      { title: "Partner / Senior", salary: "$180K–$300K+" },
    ],
    actionPlan: {
      now: ["Join debate; take history & writing", "Read about how the legal system works"],
      near: ["Earn any bachelor's; ace the LSAT", "Apply to law school"],
      far: ["Finish law school; pass the bar", "Specialize and grow toward partner"],
    },
    universities: [
      { program: "Pre-Law / Political Science, BA", requirements: "Strong reading & writing; LSAT later", whyFits: "Builds the argumentation law school expects." },
      { program: "History or English, BA", requirements: "Heavy reading & writing", whyFits: "Excellent preparation for legal reasoning." },
    ],
    certifications: { now: ["Debate / mock trial"], during: ["Law school (JD)"], after: ["State bar admission"] },
  },
  psychologist: {
    levels: [
      { title: "Research / Assistant", salary: "$45K–$60K" },
      { title: "Licensed Psychologist", salary: "$80K–$100K" },
      { title: "Senior / Clinical Lead", salary: "$100K–$120K+" },
    ],
    actionPlan: {
      now: ["Take psychology; volunteer on a helpline", "Read intro psychology"],
      near: ["Earn a psychology degree", "Get research or clinical experience"],
      far: ["Complete a graduate / doctoral program", "Get licensed and practice"],
    },
    universities: [
      { program: "Psychology, BA/BSc", requirements: "Behavioral science; research methods", whyFits: "Foundation for graduate clinical training." },
      { program: "Cognitive Science, BSc", requirements: "Science + statistics", whyFits: "Research-strong route into psychology." },
    ],
    certifications: { now: ["Mental Health First Aid"], during: ["Research assistantship"], after: ["State licensure (PhD / PsyD)"] },
  },
  electrician: {
    levels: [
      { title: "Apprentice", salary: "$35K–$45K" },
      { title: "Journeyman", salary: "$60K–$75K" },
      { title: "Master Electrician", salary: "$80K–$95K+" },
    ],
    actionPlan: {
      now: ["Take math & shop classes", "Find a pre-apprenticeship program"],
      near: ["Enter an electrician apprenticeship", "Earn while you learn on the job"],
      far: ["Pass the journeyman exam", "Earn a master license; run jobs"],
    },
    universities: [
      { program: "Electrician Apprenticeship", requirements: "HS diploma; hands-on aptitude", whyFits: "Paid, on-the-job route — no four-year degree needed." },
      { program: "Electrical Technology (Associate)", requirements: "HS diploma; math", whyFits: "Classroom + lab foundation before licensure." },
    ],
    certifications: { now: ["OSHA 10 safety"], during: ["Journeyman license"], after: ["Master Electrician license"] },
  },
  "nurse-practitioner": {
    levels: [
      { title: "Entry NP", salary: "$95K–$110K" },
      { title: "Experienced NP", salary: "$115K–$130K" },
      { title: "Specialist NP", salary: "$130K–$150K+" },
    ],
    actionPlan: {
      now: ["Excel in biology; volunteer in healthcare", "Aim for strong grades"],
      near: ["Become an RN (BSN)", "Gain clinical experience"],
      far: ["Earn an MSN / DNP as a Nurse Practitioner", "Certify in a specialty"],
    },
    universities: [
      { program: "Nursing (BSN) → MSN", requirements: "Science strength; RN licensure first", whyFits: "The standard ladder into advanced practice." },
      { program: "Accelerated BSN", requirements: "Prior degree or strong science", whyFits: "Faster route toward NP graduate study." },
    ],
    certifications: { now: ["CPR / BLS"], during: ["NCLEX-RN"], after: ["NP board certification (AANP / ANCC)"] },
  },
  "ux-designer": {
    levels: [
      { title: "Junior UX Designer", salary: "$60K–$80K" },
      { title: "UX Designer", salary: "$85K–$110K" },
      { title: "Senior / Lead UX", salary: "$120K–$150K+" },
    ],
    actionPlan: {
      now: ["Redesign an app you use; learn Figma", "Take art & psychology classes"],
      near: ["Build a UX portfolio; degree or bootcamp", "Intern on a product team"],
      far: ["Ship real product designs", "Specialize (research, interaction) and lead"],
    },
    universities: [
      { program: "UX / Interaction Design, BFA/BSc", requirements: "Portfolio; empathy for users", whyFits: "Design craft plus user research." },
      { program: "HCI / Design (Associate or Bootcamp)", requirements: "Portfolio; HS diploma", whyFits: "Portfolio-first route into junior UX roles." },
    ],
    certifications: { now: ["Figma basics (free)"], during: ["Google UX Design cert"], after: ["Nielsen Norman UX certification"] },
  },
  "musician-producer": {
    levels: [
      { title: "Emerging Artist", salary: "Varies / gig-based" },
      { title: "Working Producer", salary: "$45K–$70K" },
      { title: "Established", salary: "$70K–$120K+" },
    ],
    actionPlan: {
      now: ["Make and release music; learn a DAW", "Take music theory"],
      near: ["Study music production or self-teach", "Build a portfolio and audience"],
      far: ["Produce for others; license tracks", "Grow a catalog and brand"],
    },
    universities: [
      { program: "Music Production / Audio, BFA", requirements: "Portfolio; musical ability", whyFits: "Studio craft, theory, and production tools." },
      { program: "Music Tech (Associate)", requirements: "Demo; HS diploma", whyFits: "Hands-on, faster route into producing." },
    ],
    certifications: { now: ["DAW tutorials (Ableton / Logic)"], during: ["Audio engineering cert"], after: ["Pro Tools certification"] },
  },
};

/** Assemble the full, personalized Career Report for a scored career. */
export function buildCareerReport(cs: CareerScore): CareerReport {
  const content = CAREER_REPORTS[cs.career.code];
  const c = cs.career;
  const vals = cs.breakdown.values.matched;
  const valPhrase = vals.length ? ` It lines up with what you said matters most — ${vals.join(" and ")}.` : "";
  const conclusion = `${cs.explanation}${valPhrase} The path runs about ${c.educationPathLabel.toLowerCase()}, and from there ${c.title} grows from entry level into senior, well-paid work. If the day-in-the-life feels like you, it's a strong place to aim.`;
  return {
    career: c,
    matchPercent: cs.matchPercent,
    levels: content?.levels ?? [],
    actionPlan: content?.actionPlan ?? { now: [], near: [], far: [] },
    universities: content?.universities ?? [],
    certifications: content?.certifications ?? { now: [], during: [], after: [] },
    conclusion,
  };
}
