import { computed, Injectable, signal } from '@angular/core';
import {
  AppBackup,
  calculateTotalMarks,
  clonePaper,
  countObjective,
  countSubjective,
  createId,
  createQuestion,
  ExamPaper,
  isRecord,
  normalizePaper,
  normalizeSettings,
  PaperStatistics,
  SchoolSettings
} from '../models/paper.model';

const PAPERS_KEY = 'exam-paper-builder.papers.v1';
const SETTINGS_KEY = 'exam-paper-builder.settings.v1';

@Injectable({ providedIn: 'root' })
export class PaperService {
  private readonly papersState = signal<ExamPaper[]>(this.readPapers());
  private readonly settingsState = signal<SchoolSettings>(this.readSettings());

  readonly papers = this.papersState.asReadonly();
  readonly settings = this.settingsState.asReadonly();

  readonly statistics = computed<PaperStatistics>(() => {
    const papers = this.papersState();
    const questions = papers.flatMap((paper) => paper.questions);

    return {
      totalPapers: papers.length,
      objectiveQuestions: countObjective(questions),
      subjectiveQuestions: countSubjective(questions)
    };
  });

  createBlankPaper(): ExamPaper {
    const settings = this.settingsState();
    const now = new Date().toISOString();

    return {
      id: '',
      title: '',
      institution: settings.schoolName,
      subject: '',
      className: '',
      examDate: '',
      durationMinutes: 60,
      totalMarks: 1,
      instructions: settings.defaultInstructions,
      questions: [createQuestion(1)],
      createdAt: now,
      updatedAt: now
    };
  }

  getPaper(id: string): ExamPaper | undefined {
    const found = this.papersState().find((paper) => paper.id === id);
    return found ? clonePaper(found) : undefined;
  }

  searchPapers(query: string): ExamPaper[] {
    const normalized = query.trim().toLowerCase();
    const papers = this.papersState();

    if (!normalized) {
      return papers;
    }

    return papers.filter((paper) => {
      return [paper.title, paper.subject, paper.className]
        .join(' ')
        .toLowerCase()
        .includes(normalized);
    });
  }

  savePaper(paper: ExamPaper): ExamPaper {
    const now = new Date().toISOString();
    const toSave: ExamPaper = clonePaper({
      ...paper,
      id: paper.id || createId(),
      title: paper.title.trim(),
      institution: paper.institution.trim(),
      subject: paper.subject.trim(),
      className: paper.className.trim(),
      examDate: paper.examDate,
      durationMinutes: Number(paper.durationMinutes) || 0,
      instructions: paper.instructions.trim(),
      totalMarks: calculateTotalMarks(paper.questions),
      questions: paper.questions.map((question, index) => ({
        ...question,
        number: Number(question.number) > 0 ? Math.floor(Number(question.number)) : index + 1,
        text: question.text.trim(),
        marks: Number(question.marks) || 0,
        options: question.options.map((option) => option.trim())
      })),
      createdAt: paper.createdAt || now,
      updatedAt: now
    });

    const current = this.papersState();
    const index = current.findIndex((item) => item.id === toSave.id);
    const next = [...current];

    if (index >= 0) {
      next[index] = toSave;
    } else {
      next.unshift(toSave);
    }

    this.papersState.set(next);
    this.writePapers(next);
    return clonePaper(toSave);
  }

  deletePaper(id: string): void {
    const next = this.papersState().filter((paper) => paper.id !== id);
    this.papersState.set(next);
    this.writePapers(next);
  }

  deleteAllPapers(): void {
    this.papersState.set([]);
    this.writePapers([]);
  }

  saveSettings(settings: SchoolSettings): void {
    const next = normalizeSettings(settings);
    this.settingsState.set(next);
    this.writeSettings(next);
  }

  exportBackup(): AppBackup {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: this.settingsState(),
      papers: this.papersState().map((paper) => clonePaper(paper))
    };
  }

  restoreBackup(payload: unknown): boolean {
    if (!isRecord(payload)) {
      return false;
    }

    const papersSource = Array.isArray(payload['papers']) ? payload['papers'] : null;
    if (!papersSource) {
      return false;
    }

    const papers = papersSource
      .map((item) => normalizePaper(item))
      .filter((item): item is ExamPaper => item !== null)
      .map((paper) => ({
        ...paper,
        totalMarks: calculateTotalMarks(paper.questions)
      }));

    const settings = normalizeSettings(payload['settings']);
    this.papersState.set(papers);
    this.settingsState.set(settings);
    this.writePapers(papers);
    this.writeSettings(settings);
    return true;
  }

  private readPapers(): ExamPaper[] {
    try {
      const raw = localStorage.getItem(PAPERS_KEY);
      if (!raw) {
        return [];
      }

      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map((item) => normalizePaper(item))
        .filter((item): item is ExamPaper => item !== null)
        .map((paper) => ({
          ...paper,
          totalMarks: calculateTotalMarks(paper.questions)
        }));
    } catch {
      return [];
    }
  }

  private readSettings(): SchoolSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return normalizeSettings(null);
      }
      return normalizeSettings(JSON.parse(raw));
    } catch {
      return normalizeSettings(null);
    }
  }

  private writePapers(papers: ExamPaper[]): void {
    try {
      localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
    } catch {
      // Storage may be unavailable or full; the in-memory state still works for this session.
    }
  }

  private writeSettings(settings: SchoolSettings): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore persistence failures for the same reason as papers.
    }
  }
}
