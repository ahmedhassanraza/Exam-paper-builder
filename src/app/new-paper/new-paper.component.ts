import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { calculateTotalMarks, createQuestion, ExamPaper, OPTION_LETTERS, Question, QUESTION_TYPE_OPTIONS, QuestionType } from '../models/paper.model';
import { PaperService } from '../services/paper.service';

@Component({
  selector: 'app-new-paper', standalone: true, imports: [FormsModule],
  templateUrl: './new-paper.component.html', styleUrl: './new-paper.component.css'
})
export class NewPaperComponent implements OnInit {
  private readonly service = inject(PaperService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  paper: ExamPaper = this.service.createBlankPaper();
  readonly typeOptions = QUESTION_TYPE_OPTIONS;
  readonly optionLetters = OPTION_LETTERS;
  errors: string[] = [];
  isDirty = false;
  editing = false;
  get totalMarks(): number { return calculateTotalMarks(this.paper.questions); }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    const existing = this.service.getPaper(id);
    if (existing) { this.paper = existing; this.editing = true; }
    else void this.router.navigate(['/']);
  }
  addQuestion(): void { this.paper.questions.push(createQuestion(this.paper.questions.length + 1)); this.renumber(); this.isDirty = true; }
  removeQuestion(index: number): void { this.paper.questions.splice(index, 1); this.renumber(); this.isDirty = true; }
  changeType(question: Question, type: QuestionType): void { question.type = type; if (type !== 'mcq') question.correctAnswerIndex = null; this.isDirty = true; }
  markDirty(): void { this.isDirty = true; }
  cancelForm(): void { void this.router.navigate(['/']); }
  createPaper(): void {
    this.errors = [];
    if (!this.paper.title.trim()) this.errors.push('Enter a paper title.');
    if (!this.paper.subject.trim()) this.errors.push('Enter a subject.');
    if (!this.paper.className.trim()) this.errors.push('Enter a class or grade.');
    if (!Number.isFinite(Number(this.paper.durationMinutes)) || Number(this.paper.durationMinutes) < 1) this.errors.push('Duration must be at least 1 minute.');
    if (!this.paper.questions.length) this.errors.push('Add at least one question.');
    this.paper.questions.forEach((q, i) => {
      if (!q.text.trim()) this.errors.push(`Question ${i + 1}: enter the question text.`);
      if (!Number.isFinite(Number(q.marks)) || Number(q.marks) <= 0) this.errors.push(`Question ${i + 1}: marks must be greater than zero.`);
      if (q.type === 'mcq' && (q.options.some((option) => !option.trim()) || q.correctAnswerIndex === null)) this.errors.push(`Question ${i + 1}: complete all four options and select the correct answer.`);
    });
    if (this.errors.length) return;
    const saved = this.service.savePaper({ ...this.paper, totalMarks: this.totalMarks });
    this.isDirty = false;
    void this.router.navigate(['/papers', saved.id, 'preview']);
  }
  private renumber(): void { this.paper.questions.forEach((question, index) => question.number = index + 1); }
}
