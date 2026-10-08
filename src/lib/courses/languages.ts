import type { CourseDefinition } from "./types";

/** University of Toronto School of Continuing Studies — Arabic. */
export const LANGUAGES_COURSES: CourseDefinition[] = [
  {
    id: "lang-arabic-script",
    interest: "languages",
    title: "Arabic Script",
    code: "SCS 3127",
    school: "University of Toronto · School of Continuing Studies",
    href: "https://learn.utoronto.ca/programs-courses/courses/3127-arabic-script",
    blurb:
      "Read and write the Arabic alphabet — script principles, practice, and a first look at calligraphy.",
    /** 2 hrs × 5 Saturdays (Sep 17–Oct 22 2022; Thanksgiving Oct 8 skipped). */
    hours: 10,
    sessions: [
      {
        label: "Week 1",
        items: [
          "Script basics, joined/isolated forms, consonants ن أ ب ت ث, short & long vowels",
        ],
      },
      {
        label: "Week 2",
        items: [
          "Consonants ر ز ج ح خ د ذ, connected words, intro calligraphy",
        ],
      },
      {
        label: "Week 3",
        items: ["Consonants س ش ص ض ط ظ ع غ, read/write simple words"],
      },
      {
        label: "Week 4",
        items: [
          "Consonants ف ق ك ل م ه, nunation (double harakat)",
        ],
      },
      {
        label: "Week 5",
        items: [
          "Taa marbouta & gender, hamza, لا, reading/writing assessment",
        ],
      },
    ],
  },
  {
    id: "lang-arabic-msa-1",
    interest: "languages",
    title: "Arabic (Modern Standard): Level I",
    code: "SCS 2388",
    school: "University of Toronto · School of Continuing Studies",
    href: "https://learn.utoronto.ca/arabic",
    blurb:
      "Beginner Modern Standard Arabic — sounds, basic grammar, and simple spoken and written exchange.",
    /** 2 hrs × 10 Mondays (Jan 23–Apr 3 2023; Family Day Feb 20 skipped). */
    hours: 20,
    sessions: [
      {
        label: "Week 1",
        items: [
          "Orientation — greetings, singular/possessive pronouns, numbers 1–5, alphabet, nationalities",
        ],
      },
      {
        label: "Week 2",
        items: [
          "Question words, demonstratives (هذا / هذه), professions, numbers 5–10",
        ],
      },
      {
        label: "Week 3",
        items: [
          "Present tense with “I”, adverbs of time, days & months",
        ],
      },
      {
        label: "Week 4",
        items: [
          "Present tense with “you” (m/f), home & family vocab, short self-description",
        ],
      },
      {
        label: "Week 5",
        items: [
          "Negation (لا / ليس), sun & moon letters, revision quiz",
        ],
      },
      {
        label: "Week 6",
        items: [
          "Present tense with “he” & “she”, family vocab, numbers 11–20",
        ],
      },
      {
        label: "Week 7",
        items: ["Telling time, conversational phrases, numbers 20–100"],
      },
      {
        label: "Week 8",
        items: ["Why / because (لماذا / لأن), body parts"],
      },
      {
        label: "Week 9",
        items: ["General revision, pronunciation, fill a registration form"],
      },
      {
        label: "Week 10",
        items: ["Final project — student presentations"],
      },
    ],
  },
];
