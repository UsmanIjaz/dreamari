import "dotenv/config";
import { PrismaClient, SwipeDecision, InviteStatus } from "@prisma/client";
import { auth } from "../src/auth";

const prisma = new PrismaClient();
const PASSWORD = "dreamari123";

type Persona = {
  email: string;
  firstName: string;
  build: Record<string, unknown>;
  likes: string[];
  passes: string[];
};

const PERSONAS: Persona[] = [
  {
    email: "maya@demo.test",
    firstName: "Maya",
    build: {
      grade: "11th grade", gpa: "3.5 – 3.8",
      subjects: ["Art", "Computer Science", "English"], strengths: ["Creating", "Technology", "Speaking"],
      days: ["Be creative", "Build things"], values: ["Creativity", "Income"],
      energy: "Balanced", team: "Small team", interaction: "Some talking",
      years: "4 years", finance: "Somewhat important", location: "Anywhere in the US", pathPref: "college",
    },
    likes: ["graphic-design", "computer-science"], passes: ["pre-medicine"],
  },
  {
    email: "sam@demo.test",
    firstName: "Sam",
    build: {
      grade: "12th grade", gpa: "3.8 – 4.0",
      subjects: ["Mathematics", "Computer Science", "Science"], strengths: ["Problem solving", "Technology"],
      days: ["Solve problems", "Build things"], values: ["Income", "Creativity"],
      energy: "Calm", team: "Solo", interaction: "Mostly solo",
      years: "4 years", finance: "Not a concern", location: "Anywhere in the US", pathPref: "college",
    },
    likes: ["data-science", "computer-science"], passes: [],
  },
  {
    email: "theo@demo.test",
    firstName: "Theo",
    build: {
      grade: "12th grade", gpa: "3.0 – 3.5",
      subjects: ["Mathematics", "P.E."], strengths: ["Technology", "Problem solving"],
      days: ["Build things", "Solve problems"], values: ["Income", "Stability"],
      energy: "Fast pace", team: "Small team", interaction: "Some talking",
      years: "2–4 years", finance: "Cost matters a lot", location: "In my home state", pathPref: "trades",
    },
    likes: ["skilled-trades"], passes: [],
  },
];

/** Create (or reuse) a user via Better Auth, optionally elevating to admin. */
async function ensureUser(email: string, name: string, role?: "admin") {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const res = await auth.api.signUpEmail({ body: { email, password: PASSWORD, name } });
    user = await prisma.user.findUnique({ where: { id: res.user.id } });
  }
  if (user && role && user.role !== role) {
    user = await prisma.user.update({ where: { id: user.id }, data: { role } });
  }
  return user!;
}

async function main() {
  const admin = await ensureUser("admin@dreamari.test", "Avery", "admin");

  // demo school + cohort (grade)
  let school = await prisma.school.findFirst({ where: { name: "Westfield High" } });
  if (!school) school = await prisma.school.create({ data: { name: "Westfield High", region: "US", createdById: admin.id } });
  let cohort = await prisma.cohort.findFirst({ where: { schoolId: school.id, label: "11th grade" } });
  if (!cohort) cohort = await prisma.cohort.create({ data: { schoolId: school.id, label: "11th grade", gradeLevel: "11th" } });

  await prisma.invite.upsert({
    where: { code: "DRM-WELCOME" },
    update: { schoolId: school.id, cohortId: cohort.id },
    create: { code: "DRM-WELCOME", intendedFirstName: "New Student", createdById: admin.id, schoolId: school.id, cohortId: cohort.id },
  });

  for (const p of PERSONAS) {
    const u = await ensureUser(p.email, p.firstName);
    await prisma.user.update({ where: { id: u.id }, data: { schoolId: school.id, cohortId: cohort.id } });
    await prisma.buildProfile.upsert({
      where: { studentId: u.id },
      update: { ...p.build, completedAt: new Date() },
      create: { studentId: u.id, ...p.build, completedAt: new Date() },
    });
    for (const code of p.likes) {
      await prisma.swipe.upsert({
        where: { studentId_majorCode: { studentId: u.id, majorCode: code } },
        update: { decision: SwipeDecision.LIKE, fit: 4, facetAnswers: [true, true, true, false, true] },
        create: { studentId: u.id, majorCode: code, decision: SwipeDecision.LIKE, fit: 4, facetAnswers: [true, true, true, false, true] },
      });
    }
    for (const code of p.passes) {
      await prisma.swipe.upsert({
        where: { studentId_majorCode: { studentId: u.id, majorCode: code } },
        update: { decision: SwipeDecision.PASS, fit: 1, facetAnswers: [true, false, false, false, false] },
        create: { studentId: u.id, majorCode: code, decision: SwipeDecision.PASS, fit: 1, facetAnswers: [true, false, false, false, false] },
      });
    }
  }

  await prisma.invite.upsert({
    where: { code: "DRM-USED01" },
    update: { status: InviteStatus.REDEEMED },
    create: { code: "DRM-USED01", status: InviteStatus.REDEEMED, createdById: admin.id, redeemedAt: new Date() },
  });

  console.log("Seeded: 1 admin + 3 students (Better Auth). Password for all:", PASSWORD);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
