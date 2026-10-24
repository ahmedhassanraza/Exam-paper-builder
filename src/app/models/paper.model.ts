export type QuestionType = 'mcq' | 'short' | 'long';

export const QUESTION_TYPE_OPTIONS: ReadonlyArray<{ value: QuestionType; label: string }> = [
  { value: 'mcq', label: 'MCQ' },
  { value: 'short', label: 'Short answer' },
  { value: 'long', label: 'Long answer' }
];

export const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  text: string;
  marks: number;
  options: string[];
  correctAnswerIndex: number | null;
}

export interface ExamPaper {
  id: string;
  title: string;
  institution: string;
  subject: string;
  className: string;
  examDate: string;
  durationMinutes: number;
  totalMarks: number;
  instructions: string;
  questions: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface SchoolSettings {
  schoolName: string;
  address: string;
  defaultInstructions: string;
}

export interface PaperStatistics {
  totalPapers: number;
  objectiveQuestions: number;
  subjectiveQuestions: number;
}

export interface AppBackup {
  version: 1;
  exportedAt: string;
  settings: SchoolSettings;
  papers: ExamPaper[];
}

export function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createQuestion(number: number): Question {
  return {
    id: createId(),
    number,
    type: 'mcq',
    text: '',
    marks: 1,
    options: ['', '', '', ''],
    correctAnswerIndex: null
  };
}

export function isQuestionType(value: unknown): value is QuestionType {
  return value === 'mcq' || value === 'short' || value === 'long';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeQuestion(value: unknown, fallbackNumber: number): Question | null {
  if (!isRecord(value) || !isQuestionType(value['type'])) {
    return null;
  }

  const text = typeof value['text'] === 'string' ? value['text'] : '';
  const marks = Number(value['marks']);
  const number = Number(value['number']);
  const optionsSource = Array.isArray(value['options']) ? value['options'] : [];
  const options = [0, 1, 2, 3].map((index) => {
    const option = optionsSource[index];
    return typeof option === 'string' ? option : '';
  });

  const rawCorrect = value['correctAnswerIndex'];
  const correctAnswerIndex =
    rawCorrect === 0 || rawCorrect === 1 || rawCorrect === 2 || rawCorrect === 3
      ? rawCorrect
      : null;

  return {
    id: typeof value['id'] === 'string' && value['id'] ? value['id'] : createId(),
    number: Number.isFinite(number) && number > 0 ? Math.floor(number) : fallbackNumber,
    type: value['type'],
    text,
    marks: Number.isFinite(marks) ? marks : 1,
    options,
    correctAnswerIndex
  };
}

export function normalizePaper(value: unknown): ExamPaper | null {
  if (!isRecord(value)) {
    return null;
  }

  const questionsSource = Array.isArray(value['questions']) ? value['questions'] : [];
  const questions = questionsSource
    .map((question, index) => normalizeQuestion(question, index + 1))
    .filter((question): question is Question => question !== null);

  const durationMinutes = Number(value['durationMinutes']);
  const totalMarks = Number(value['totalMarks']);

  return {
    id: typeof value['id'] === 'string' && value['id'] ? value['id'] : createId(),
    title: typeof value['title'] === 'string' ? value['title'] : '',
    institution: typeof value['institution'] === 'string' ? value['institution'] : '',
    subject: typeof value['subject'] === 'string' ? value['subject'] : '',
    className: typeof value['className'] === 'string' ? value['className'] : '',
    examDate: typeof value['examDate'] === 'string' ? value['examDate'] : '',
    durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 0,
    totalMarks: Number.isFinite(totalMarks) ? totalMarks : 0,
    instructions: typeof value['instructions'] === 'string' ? value['instructions'] : '',
    questions,
    createdAt: typeof value['createdAt'] === 'string' ? value['createdAt'] : new Date().toISOString(),
    updatedAt: typeof value['updatedAt'] === 'string' ? value['updatedAt'] : new Date().toISOString()
  };
}

export function normalizeSettings(value: unknown): SchoolSettings {
  if (!isRecord(value)) {
    return { schoolName: '', address: '', defaultInstructions: '' };
  }

  return {
    schoolName: typeof value['schoolName'] === 'string' ? value['schoolName'] : '',
    address: typeof value['address'] === 'string' ? value['address'] : '',
    defaultInstructions: typeof value['defaultInstructions'] === 'string' ? value['defaultInstructions'] : ''
  };
}

export function calculateTotalMarks(questions: Question[]): number {
  return questions.reduce((sum, question) => {
    const marks = Number(question.marks);
    return sum + (Number.isFinite(marks) ? marks : 0);
  }, 0);
}

export function countObjective(questions: Question[]): number {
  return questions.filter((question) => question.type === 'mcq').length;
}

export function countSubjective(questions: Question[]): number {
  return questions.filter((question) => question.type !== 'mcq').length;
}

export function clonePaper(paper: ExamPaper): ExamPaper {
  return {
    ...paper,
    questions: paper.questions.map((question) => ({
      ...question,
      options: [...question.options]
    }))
  };
}
