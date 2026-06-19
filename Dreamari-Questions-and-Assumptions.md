# Dreamari: Questions & Assumptions

The brief asks us to flag where it's ambiguous rather than silently assume. Below are the
decisions we made and the open questions, each with **quick-pick options**. Where we already
made a call, the recommended option is checked (**✅**) and reflects what's live today.

**Fastest way to answer:** reply *"all recommended"* to accept every ✅ default, **or** just
list the ones you'd change (e.g. *"A5 → B, Q1 → B"*). One line is plenty.

---

## Part 1: Assumptions we made (please confirm or correct)

### A1. Swipe interaction model
The brief: review a major's 5 sub-cards, then swipe like/pass on the major. We built each major as
a quick **"vibe check" of 5 yes/no swipes** (one per sub-card); **≥3 yes = liked**. We still store the
binary like/pass *plus* the 5 facet answers (richer signal for future tuning).
- [x] **A. Keep the 5-question vibe check** ✅ *(what we built, more signal, same like/pass stored)*
- [ ] B. Revert to one swipe per major (literal brief)

### A2. Swipe deck size
- [x] **A. Top 5 majors** ✅ *(as the brief specifies)*
- [ ] B. Top 3 (shorter session)
- [ ] C. Other: ______

### A3. Match-percentage display
We map raw scores onto a **35-98%** band so a student never sees a demoralizing low number.
- [x] **A. Keep the encouraging 35-98% band** ✅
- [ ] B. Show the true 0-100%

### A4. Scoring weights
Subjects & strengths ×3 · day-activities & values ×2 · education fit +4/+2/-2 · finance -3/+2/-1 ·
path preference +3/-2/+1. (Full breakdown is returned per match, so every score is inspectable.)
- [x] **A. Weights look reasonable, proceed** ✅
- [ ] B. Re-weight, tell us which dimensions should matter most: ______

### A5. "Trades" classification
The dataset never labels which careers are trades. For the College/Trades/Both preference we treat
**only Electrician** as a trade route.
- [x] **A. Correct, only Electrician** ✅ *(our assumption)*
- [ ] B. Also count these as trades: ______

### A6. Career Report content is illustrative
Per-level salaries, university options, certifications, and action plans were **authored by us**, the
brief specifies these fields but supplies no data for them. They're reasonable but not from an
authoritative source.
- [x] **A. Fine for the trial, illustrative content is OK** ✅
- [ ] B. Replace with sourced data (O\*NET / BLS / a dataset you provide): ______

### A7. Some BUILD fields are stored but not scored
**GPA, energy, team, interaction, and location** are captured and stored (as required) but **don't
affect the match score**, the brief's scoring dimensions don't include them.
- [x] **A. Correct, keep them stored, not scored** ✅ *(matches the brief)*
- [ ] B. Use some in matching, tick any: ☐ energy/team/interaction (work-style fit) ☐ GPA (reach/safety framing) ☐ location (tailor university options)

### A8. "Both" path preference
A student who picks **Both** gets a **neutral** score (no trade or college boost/penalty).
- [x] **A. Neutral is right** ✅
- [ ] B. "Both" should lightly favor *both* trade and college routes

---

## Part 2: Open questions (your call)

### Q1. Day-in-the-life simulations
Marketed on the landing/prototype but **not required by the Phase-3 brief**. We've stubbed the
"Play" tab as *coming soon*.
- [x] **A. Out of scope for the trial, future work** ✅
- [ ] B. Build a basic simulation now
- [ ] C. Soften the marketing claim until it's built

### Q2. Audience paths
Product targets high-schoolers (13-18). Onboarding offers High School / University / Job Seeker; we've
built the **High School journey fully**.
- [x] **A. High-school-first is right for now** ✅
- [ ] B. Fully support University + Job Seeker paths too

### Q3. Counselor/admin dashboard + school invites
We built this beyond the brief: schools → grades (cohorts) → invites, CSV roster upload, and email
invites. It demonstrates the full student-progress journey.
- [x] **A. Aligned, keep investing here** ✅
- [ ] B. De-prioritize; focus only on the student experience

### Q4. "No likes" fallback
If a student passes on every major, there's currently **no Career Report** (the You tab nudges them
back to explore).
- [ ] A. Leave as-is (must like ≥1 major)
- [x] **B. Also show their top-matched careers as a fallback** ✅ *(better for a discouraged student, small change)*

### Q5. Hosting & architecture
API + PostgreSQL on **Railway**; two web apps (student + admin) on **Vercel**; **cookie-session auth**
(Better Auth); **guest-first** onboarding with a lightweight **13+ age gate**; email on **dreamari.app**.
- [x] **A. All good** ✅
- [ ] B. Concerns: ______

---

*Anything you don't answer, we'll proceed with the ✅ option and note it in the final write-up.*
