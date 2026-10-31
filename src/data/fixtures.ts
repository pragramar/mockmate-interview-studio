import type {
  CoachExercise,
  InterviewSummary,
  ProgressPoint,
  PractisedSkill,
  Report,
} from "@/types";

/**
 * Demonstration fixtures.
 *
 * Everything in this file is clearly-labelled sample data for a frontend
 * demonstration. It represents no real users, sessions, or model output.
 */

export const DEMO_USER = { name: "Demo user", initials: "DU" };

export const DEMO_INTERVIEWS: InterviewSummary[] = [
  {
    id: "demo-1",
    createdAt: "2026-10-24T10:12:00Z",
    mode: "mock",
    role: "backend",
    domains: ["System design", "Databases"],
    difficulty: "intermediate",
    durationMinutes: 30,
    status: "completed",
    reportAvailable: true,
    demo: true,
  },
  {
    id: "demo-2",
    createdAt: "2026-10-19T15:40:00Z",
    mode: "mock",
    role: "sde",
    domains: ["Data structures", "Algorithms"],
    difficulty: "easy",
    durationMinutes: 15,
    status: "completed",
    reportAvailable: true,
    demo: true,
  },
  {
    id: "demo-3",
    createdAt: "2026-10-15T09:05:00Z",
    mode: "guided",
    role: "sde",
    domains: ["Data structures"],
    difficulty: "easy",
    durationMinutes: 15,
    status: "completed",
    reportAvailable: false,
    demo: true,
  },
  {
    id: "demo-4",
    createdAt: "2026-10-08T18:22:00Z",
    mode: "mock",
    role: "frontend",
    domains: ["JavaScript", "React"],
    difficulty: "intermediate",
    durationMinutes: 30,
    status: "completed",
    reportAvailable: true,
    demo: true,
  },
];

export const SAMPLE_REPORT: Report = {
  id: "report-demo-1",
  sessionId: "demo-1",
  mode: "mock",
  role: "backend",
  domainSummary: "System design · Databases",
  durationLabel: "31 min",
  evaluatedAnswers: 5,
  evidenceQuality:
    "Four of five answers produced usable evidence. The caching question ran short of time, so its assessment leans on one excerpt and is marked lower confidence.",
  technical: {
    score: 72,
    band: "Solid foundation with gaps in scaling trade-offs",
    reliability: "medium",
    note: "Based on 5 evaluated answers across two domains. Medium confidence: answers were substantive but several lacked concrete examples.",
  },
  communication: {
    score: 64,
    band: "Clear explanations, frequent fillers under pressure",
    reliability: "medium",
    note: "Derived from transcript structure, pacing and filler-word counts. Medium confidence: a 40-second segment was transcribed with low certainty.",
  },
  strengths: [
    {
      title: "Structured answers",
      observation:
        "You consistently opened with a one-line summary before diving into detail, which made multi-part answers easy to follow.",
      evidence: {
        quote:
          "So in short, I'd pick a queue between the API and the worker — let me walk through why, then the failure modes.",
        timestamp: "4:12",
        source: "Question 2 — Rate limiting",
        why: "The transcript shows a summary-first structure, then an explicit roadmap. Examiners can follow the reasoning without re-asking.",
      },
    },
    {
      title: "Sound data-modelling instincts",
      observation:
        "You chose indexes and normalisation deliberately, explaining the read/write trade-off instead of defaulting to one.",
      evidence: {
        quote:
          "I'd index on user_id plus created_at because the hot query is 'last N orders per user', but writes are heavy so I wouldn't index more than needed.",
        timestamp: "11:48",
        source: "Question 3 — Schema design",
        why: "The answer names the access pattern first and justifies the index against write cost — evidence of deliberate reasoning, not recall.",
      },
    },
    {
      title: "Honest about uncertainty",
      observation:
        "When unsure you said so and described how you would find out, rather than guessing confidently.",
      evidence: {
        quote:
          "I haven't tuned Postgres partitioning in practice — my understanding is range partitions per month, but I'd verify with the docs before committing.",
        timestamp: "19:30",
        source: "Question 4 — Partitioning",
        why: "Explicit uncertainty plus a verification plan is observable in the transcript and is a behaviour interviewers rate positively.",
      },
    },
  ],
  improvements: [
    {
      title: "Quantify scaling arguments",
      observedIssue:
        "Scaling answers stayed qualitative — 'it would get slow' — without estimating orders of magnitude.",
      evidence: {
        quote: "At that point the single table would get slow, so we'd need to shard it somehow.",
        timestamp: "14:02",
        source: "Question 3 — Schema design",
        why: "No row counts, QPS or memory figures appear anywhere in the answer, so the trade-off cannot be evaluated.",
      },
      relevance:
        "Backend interviews increasingly ask you to size systems; a back-of-envelope estimate is often the differentiator between 'knows the word' and 'can reason'.",
      practiceAction:
        "Practise one estimation drill per design question: rows/day, bytes/row, QPS. Aim for one number before every 'so we'd…' statement.",
    },
    {
      title: "Reduce filler words under pressure",
      observedIssue:
        "Filler words ('like', 'basically', 'you know') clustered when questions turned unfamiliar.",
      evidence: {
        quote: "So basically, like, the partition, you know, would basically split the data…",
        timestamp: "19:36",
        source: "Question 4 — Partitioning",
        why: "Seven fillers in 22 seconds appear in the transcript segment; the same segment also shows a 1.5× pace drop.",
      },
      relevance:
        "Fillers are not penalised heavily, but dense clusters signal hesitation and can obscure the point you are making.",
      practiceAction:
        "Re-answer the partitioning question aloud with a deliberate one-second pause where a filler would go. Compare transcripts of both attempts.",
    },
    {
      title: "Close answers with a conclusion",
      observedIssue:
        "Several answers ended mid-detail when the interviewer stopped probing, leaving the conclusion unstated.",
      evidence: {
        quote: "…and that's why the worker retries, and the queue also has, uh—",
        timestamp: "8:55",
        source: "Question 2 — Rate limiting",
        why: "The transcript ends the turn without a wrap-up sentence; the final trade-off you had planned never reached the listener.",
      },
      relevance:
        "A 10-second conclusion ('so the key trade-off is X vs Y, and I'd pick X because…') makes the whole answer feel finished.",
      practiceAction:
        "Use the Guided Coach's 'summary last' drill: answer, then force yourself to add one closing sentence.",
    },
  ],
  questions: [
    {
      id: "q1",
      question: "Walk me through how you would design the rate-limiting layer for a public API.",
      responseExcerpt:
        "So in short, I'd pick a queue between the API and the worker — let me walk through why, then the failure modes…",
      expectedConcepts: [
        "Token bucket or sliding window",
        "Distributed state (Redis)",
        "429 semantics",
      ],
      demonstrated: ["Token bucket naming", "Client identification by key"],
      missing: ["Where the counters live in a multi-node deployment", "Retry-After header"],
      evaluatorFeedback:
        "You named a standard algorithm and its purpose clearly. The answer stopped before explaining how counters stay consistent across nodes — the expected follow-up.",
      evidenceRef: "4:12",
    },
    {
      id: "q2",
      question: "A job queue is processing slowly and retries are piling up. How do you debug it?",
      responseExcerpt:
        "First I'd check whether it's the consumers or the queue itself — look at consumer CPU, then queue depth over time…",
      expectedConcepts: [
        "Isolate consumer vs broker",
        "Observe queue depth/metrics",
        "Poison-message handling",
      ],
      demonstrated: ["Isolation-first instinct", "Mentioned queue depth"],
      missing: ["Dead-letter queues", "Idempotency of retries"],
      evaluatorFeedback:
        "Good diagnostic ordering. Retries were discussed but idempotency — the concept the question was steering towards — did not come up.",
      evidenceRef: "8:55",
    },
    {
      id: "q3",
      question: "Design the schema for 'orders' when the hot query is the last N orders per user.",
      responseExcerpt:
        "I'd index on user_id plus created_at because the hot query is 'last N orders per user', but writes are heavy so I wouldn't index more than needed.",
      expectedConcepts: [
        "Composite index matching the access pattern",
        "Pagination strategy",
        "Growth/sharding estimate",
      ],
      demonstrated: ["Composite index reasoning", "Write-cost awareness"],
      missing: ["Keyset pagination", "Any order-of-magnitude sizing"],
      evaluatorFeedback:
        "The index choice was justified against the workload — strong. The answer stayed qualitative; no estimates were offered for table size or QPS.",
      evidenceRef: "14:02",
    },
    {
      id: "q4",
      question:
        "When would you partition a large Postgres table, and how would you choose the key?",
      responseExcerpt:
        "I haven't tuned Postgres partitioning in practice — my understanding is range partitions per month, but I'd verify with the docs before committing.",
      expectedConcepts: [
        "Range vs hash partitioning",
        "Partition-pruning benefits",
        "Operational cost of migrations",
      ],
      demonstrated: ["Honest uncertainty", "Range partitioning by time"],
      missing: ["Partition pruning", "Migration mechanics"],
      evaluatorFeedback:
        "Uncertainty was stated cleanly and paired with a verification plan — good behaviour. Depth beyond the basic pattern was not reached.",
      evidenceRef: "19:30",
    },
    {
      id: "q5",
      question: "How would you cache the product page of an e-commerce site?",
      responseExcerpt:
        "A CDN in front for the static shell, and Redis for fragments like price and stock…",
      expectedConcepts: [
        "Cache invalidation strategy",
        "TTL vs explicit invalidation",
        "Stampede protection",
      ],
      demonstrated: ["CDN + Redis layering"],
      missing: ["Invalidation triggers", "Stampede protection"],
      evaluatorFeedback:
        "The layering was sensible. The answer was cut short by the time limit, so this assessment relies on a single excerpt and is lower confidence.",
      evidenceRef: "26:41",
    },
  ],
  speech: {
    wpm: {
      label: "Words per minute",
      value: "128",
      unit: "wpm",
      confidence: "high",
      explanation:
        "Calculated by deterministic code from the transcript word count divided by detected speaking time. 120–150 wpm is a typical interview range.",
    },
    speakingDuration: {
      label: "Speaking time",
      value: "18",
      unit: "min",
      confidence: "high",
      explanation:
        "Sum of speech segments detected from audio energy. 58% of the interview was your speaking time.",
    },
    pauseDuration: {
      label: "Pause time",
      value: "13",
      unit: "min",
      confidence: "high",
      explanation:
        "Includes interviewer speaking time and your thinking pauses; the two are separated on the timeline.",
    },
    fillers: {
      label: "Filler words",
      value: "34",
      confidence: "medium",
      explanation:
        "Counted from the transcript by list matching. Transcription errors can add or drop a few; treat as approximate.",
    },
    interruptions: {
      label: "Interruption events",
      value: "2",
      confidence: "high",
      explanation:
        "Moments where both speakers were active for over one second. Both were you resuming after the interviewer stopped.",
    },
    transcriptCoverage: {
      label: "Transcript coverage",
      value: "94",
      unit: "%",
      confidence: "high",
      explanation:
        "Share of audio with a confident transcript. One 40-second segment (19:28–20:08) was transcribed with low certainty and is excluded from language feedback.",
    },
    timeline: [
      { kind: "speech", startSec: 0, endSec: 42 },
      { kind: "silence", startSec: 42, endSec: 51 },
      { kind: "speech", startSec: 51, endSec: 340 },
      { kind: "silence", startSec: 340, endSec: 352 },
      { kind: "speech", startSec: 352, endSec: 708 },
      { kind: "silence", startSec: 708, endSec: 724 },
      { kind: "speech", startSec: 724, endSec: 1092 },
      { kind: "silence", startSec: 1092, endSec: 1107 },
      { kind: "speech", startSec: 1107, endSec: 1452 },
      { kind: "silence", startSec: 1452, endSec: 1471 },
      { kind: "speech", startSec: 1471, endSec: 1640 },
      { kind: "silence", startSec: 1640, endSec: 1660 },
      { kind: "speech", startSec: 1660, endSec: 1860 },
    ],
  },
  languageFeedback: [
    {
      original: "So basically the queue would basically retry the failed jobs.",
      correction: "The queue retries failed jobs.",
      explanation:
        "Removing the repeated 'basically' tightens the sentence without changing the meaning.",
      meaningPreserved: true,
    },
    {
      original: "We are having the indexes on user_id.",
      correction: "We have indexes on user_id.",
      explanation: "Simple present fits a state description; 'are having' is a common tense slip.",
      meaningPreserved: true,
    },
    {
      original: "The partition will splitting the data by month.",
      correction: "The partition splits the data by month.",
      explanation:
        "'Will splitting' mixes future and gerund; either 'will split' or 'splits' works.",
      meaningPreserved: true,
      transcriptionUncertain: true,
    },
  ],
  resumeFeedback: [
    "Your resume lists 'built a REST API with authentication'. The interview answers about rate limiting and queues were consistent with hands-on ownership of that project.",
    "The resume mentions Docker and CI/CD, but no interview answer touched deployment or pipelines — the interview did not test this, so no conclusion can be drawn either way.",
    "Project depth was concentrated on one project; the interviewer could not verify the two smaller listed projects. Consider preparing one concrete detail per project.",
  ],
  practicePlan: [
    {
      title: "Estimation drill: size a system before designing it",
      description: "Three guided design questions that force one back-of-envelope estimate each.",
      href: "/coach/session/ex-1",
    },
    {
      title: "Summary-last drill for long answers",
      description: "Practise closing every answer with a one-sentence conclusion.",
      href: "/coach/session/ex-2",
    },
    {
      title: "Filler-aware re-answer practice",
      description: "Re-answer a question and compare filler counts between attempts.",
      href: "/coach/session/ex-3",
    },
  ],
  methodology: {
    deterministic: [
      "Words per minute, speaking/pause durations and the speech timeline are calculated by code from the audio energy and transcript timestamps.",
      "Filler-word counts use a fixed word list matched against the transcript.",
      "Concept matching (demonstrated vs missing) starts from a keyword map over the transcript.",
    ],
    modelGenerated: [
      "The qualitative strength/improvement observations, evaluator feedback and language explanations are model-generated from the transcript.",
      "The technical and communication scores are model-assessed summaries of the evaluated answers, not objective measurements.",
    ],
    unavailable: [
      "No resume-to-interview consistency check was possible for skills the interview never touched.",
      "One 40-second segment had low transcription certainty and is excluded from language feedback.",
    ],
    limitations:
      "Evidence comes from one 31-minute session with five questions. Small samples make trends unreliable; treat this report as one data point, not a verdict.",
  },
  demo: true,
};

export const COACH_EXERCISES: CoachExercise[] = [
  {
    id: "ex-1",
    skill: "System design",
    title: "Design a URL shortener",
    difficulty: "easy",
    question:
      "Design a URL shortener like bit.ly: given a long URL, return a short code; visiting the short code redirects. Start with what you'd store and how you'd generate codes.",
    hints: [
      "Hint 1 — Think about the smallest unit first: what uniquely identifies one mapping between short code and long URL?",
      "Hint 2 — A base-62 encoding of a counter is one classic code generator. What are its trade-offs against hashing?",
      "Hint 3 — Estimate first: if you shorten 100 URLs/day for a college project versus 10,000/day for production, how does the storage and lookup design change?",
    ],
    explanation:
      "The core is a key–value mapping: short code → long URL. Codes can come from an auto-incrementing counter encoded in base-62 (short, sequential, needs coordination) or from hashing the URL (no coordination, risk of collisions that you must resolve). Reads dominate writes roughly 10:1, so a cache in front of the mapping is the first optimisation worth mentioning.",
    modelAnswer:
      "I'd store mappings in a key–value store: short code → long URL, with created_at. To generate codes, I'd encode a distributed counter in base-62 — six characters covers ~57 billion codes. Hashing the URL is simpler but needs collision handling, so the counter approach is easier to reason about. Reads dominate, so I'd cache hot codes with a TTL and redirect with a 301 for permanence — or 302 if I need click analytics. For scale, I'd estimate first: 10k writes/day is trivial; the interesting number is read QPS, which decides how aggressively to cache.",
  },
  {
    id: "ex-2",
    skill: "Communication",
    title: "Answer with a summary last",
    difficulty: "easy",
    question:
      "Explain the difference between processes and threads, as if answering an interviewer. Your goal this time is not the content — it's the structure: open with one framing sentence and close with a one-sentence conclusion.",
    hints: [
      "Hint 1 — Write your answer normally first. Does it open with 'It depends' or 'So basically…'? Replace the opening with a one-line framing.",
      "Hint 2 — A useful frame: 'The key difference is memory isolation; let me give two consequences.'",
      "Hint 3 — End with: 'So if you need isolation, choose processes; if you need cheap sharing, choose threads.' Does your closing sentence actually make a choice?",
    ],
    explanation:
      "Structured answers follow a frame → detail → conclusion shape. The frame tells the listener where the answer is going; the conclusion tells them what to remember. Both are one sentence each — the skill is discipline, not length.",
    modelAnswer:
      "The key difference is memory isolation: processes are isolated by the OS, threads share the address space of their parent. That single difference drives most consequences — threads are cheap to create and communicate through shared memory, but a bug in one can corrupt the others; processes cost more to spawn and need IPC, but crashes stay contained. So the choice is really about isolation versus sharing cost: pick threads for cheap concurrency inside one program, processes for fault isolation.",
  },
  {
    id: "ex-3",
    skill: "Data structures",
    title: "When would you use a hash map over an array?",
    difficulty: "easy",
    question:
      "Explain when you'd reach for a hash map instead of an array, with a concrete example. Attempt it once, review the hints, then re-answer and compare.",
    hints: [
      "Hint 1 — What does a hash map give you that an array doesn't? Name the operation and its complexity.",
      "Hint 2 — Think of a real example: counting occurrences, looking up a user by ID, detecting duplicates.",
      "Hint 3 — A complete answer also says when NOT to use one: ordering, memory overhead, no range queries.",
    ],
    explanation:
      "The decisive property is O(1) average lookup by key versus O(n) search in an array. A complete answer mentions the trade-offs: hash maps lose ordering, cost extra memory, and can't answer range queries — which is exactly when a sorted array or tree wins.",
    modelAnswer:
      "Whenever the hot operation is lookup by key — counting frequencies, deduplicating, indexing by ID — a hash map turns O(n) scans into O(1) average lookups. For example, counting word frequencies: one pass, map from word to count. I'd reach for an array instead when order or position matters, when I need range queries or a sorted traversal, or when memory is tight — hash maps carry load-factor overhead and rehashing pauses.",
  },
  {
    id: "ex-4",
    skill: "Databases",
    title: "Why is this query slow?",
    difficulty: "intermediate",
    question:
      "A query 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 10' is slow on a table with 50M rows. Walk through your diagnosis.",
    hints: [
      "Hint 1 — The first tool is the execution plan: what would you look for in EXPLAIN output?",
      "Hint 2 — Without an index on (user_id, created_at), the database sorts or scans. What does 'ORDER BY' cost without a matching index?",
      "Hint 3 — 'SELECT *' is worth one sentence, not five — the real fix is the access path.",
    ],
    explanation:
      "The likely plan without an index: filter by user_id via a scan or a non-covering index, then a sort of all matching rows before taking 10. A composite index on (user_id, created_at DESC) lets the database read the top 10 entries directly — no sort at all. The diagnosis habit: EXPLAIN first, measure again after the fix.",
    modelAnswer:
      "I'd start with EXPLAIN. If the plan scans or sorts, the cause is a missing composite index: (user_id, created_at) lets Postgres walk the index in order and stop after 10 rows — no sort step. I'd confirm the row-count distribution: if one user owns a million orders, LIMIT 10 still reads just 10 index entries. I'd mention 'SELECT *' briefly — wide rows cost I/O — but the fix is the access path, and I'd re-run EXPLAIN to verify the plan changed.",
  },
  {
    id: "ex-5",
    skill: "Behavioural",
    title: "Describe a debugging story with evidence",
    difficulty: "intermediate",
    question:
      "Tell me about a bug you debugged that taught you something. Structure it: what broke, how you found it, what you changed, what you'd do differently.",
    hints: [
      "Hint 1 — Pick a bug with a concrete symptom ('users saw zero rupee invoices'), not 'the code was slow'.",
      "Hint 2 — The finding step is where interviewers listen: name the actual tool or log line that revealed the cause.",
      "Hint 3 — The lesson must be falsifiable: 'I now write the failing test first' beats 'I learned to be careful'.",
    ],
    explanation:
      "Behavioural answers land when they contain verifiable specifics: a symptom, a tool, a change, a testable lesson. Vague reflections ('communication is important') are indistinguishable from having nothing to say.",
    modelAnswer:
      "In my hostel-management project, students occasionally saw another student's mess dues — intermittent, maybe one in fifty loads. I reproduced nothing for a day, then added a request-ID log line and found two concurrent requests sharing a cached response object — the cache key omitted the user ID. I fixed the key, added a test that hits the endpoint twice with different users concurrently, and later added the request-ID to all logs. The lesson I applied since: concurrency bugs need a reproduction strategy first; logging came second, and I now design cache keys from the response's identity, not convenience.",
  },
];

export const PROGRESS_SERIES: ProgressPoint[] = [
  { label: "8 Oct", technicalScore: 58, communicationScore: 52, wordsPerMinute: 118 },
  { label: "12 Oct", technicalScore: 61, communicationScore: 55, wordsPerMinute: 121 },
  { label: "15 Oct", technicalScore: 64, communicationScore: 58, wordsPerMinute: 122 },
  { label: "19 Oct", technicalScore: 67, communicationScore: 60, wordsPerMinute: 125 },
  { label: "22 Oct", technicalScore: 69, communicationScore: 63, wordsPerMinute: 126 },
  { label: "24 Oct", technicalScore: 72, communicationScore: 64, wordsPerMinute: 128 },
];

export const PRACTISED_SKILLS: PractisedSkill[] = [
  { name: "System design", sessions: 4, lastPractised: "2026-10-24T10:12:00Z" },
  { name: "Data structures", sessions: 6, lastPractised: "2026-10-19T15:40:00Z" },
  { name: "Databases", sessions: 3, lastPractised: "2026-10-24T10:12:00Z" },
  { name: "Communication", sessions: 5, lastPractised: "2026-10-22T14:00:00Z" },
  { name: "Behavioural", sessions: 2, lastPractised: "2026-10-12T11:30:00Z" },
];

/** Scripted questions for the simulated mock interview (Mode A). */
export const MOCK_INTERVIEW_SCRIPT = [
  {
    id: "sq-1",
    topic: "Data structures",
    question:
      "To start: you need to check whether a list of numbers contains a duplicate. How would you approach it, and what's the complexity?",
    interviewerLine:
      "Let's begin with a warm-up. Suppose you're given a list of integers and need to check whether any value appears twice. Walk me through your approach.",
  },
  {
    id: "sq-2",
    topic: "Databases",
    question:
      "Your API endpoint that reads a user's profile became slow after a release. How would you start investigating?",
    interviewerLine:
      "Now a scenario. A profile endpoint that used to respond in 80 ms now takes 2 seconds after last week's release. Take me through your first steps.",
  },
  {
    id: "sq-3",
    topic: "System design",
    question:
      "Design the notification feature for a college event app: only some students should get an event reminder. What are the moving parts?",
    interviewerLine:
      "Let's design something small but real: an event app needs to remind only subscribed students before an event starts. Sketch the components.",
  },
  {
    id: "sq-4",
    topic: "JavaScript",
    question:
      "In JavaScript, when would you use Promise.all versus Promise.allSettled, and what breaks if you pick the wrong one?",
    interviewerLine:
      "A language question: Promise.all versus Promise.allSettled — when is each the right call, and what goes wrong if you mix them up?",
  },
  {
    id: "sq-5",
    topic: "Behavioural",
    question:
      "Tell me about a time you shipped something that broke in production. What did you do in the first ten minutes?",
    interviewerLine:
      "Last one, behavioural: describe a time something you shipped broke. Focus on your first ten minutes after noticing.",
  },
];

/** Scripted exercises for the simulated guided coaching session (Mode B). */
export const GUIDED_SESSION_INTRO = {
  interviewerLine:
    "This is guided practice, so take your time — hints, explanations and a model answer are available as you go. Let's start with the exercise you picked.",
};
