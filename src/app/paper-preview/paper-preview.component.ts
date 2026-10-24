import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { calculateTotalMarks, ExamPaper } from '../models/paper.model';
import { PaperService } from '../services/paper.service';

@Component({
  selector: 'app-paper-preview',
  imports: [DatePipe, RouterLink],
  templateUrl: './paper-preview.component.html',
  styleUrl: './paper-preview.component.css'
})
export class PaperPreviewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paperService = inject(PaperService);

  @Input() paper: ExamPaper | null = null;
  @Input() embedded = false;
  @Output() readonly back = new EventEmitter<void>();

  missing = false;
  readonly optionLetters = ['A', 'B', 'C', 'D'];

  get schoolAddress(): string {
    return this.paperService.settings().address.trim();
  }

  get maximumMarks(): number {
    return this.paper ? calculateTotalMarks(this.paper.questions) : 0;
  }

  ngOnInit(): void {
    if (this.paper) {
      return;
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.missing = true;
      return;
    }

    const found = this.paperService.getPaper(id);
    if (!found) {
      this.missing = true;
      return;
    }

    this.paper = found;
  }

  goBack(): void {
    if (this.embedded) {
      this.back.emit();
      return;
    }
    void this.router.navigate(['/']);
  }

  printPaper(): void {
    window.print();
  }
}
