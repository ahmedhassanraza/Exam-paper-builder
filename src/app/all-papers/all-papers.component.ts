import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ExamPaper } from '../models/paper.model';
import { PaperService } from '../services/paper.service';

@Component({
  selector: 'app-all-papers',
  imports: [DatePipe, RouterLink],
  templateUrl: './all-papers.component.html',
  styleUrl: './all-papers.component.css'
})
export class AllPapersComponent {
  private readonly paperService = inject(PaperService);

  readonly searchQuery = signal('');
  readonly paperToDelete = signal<ExamPaper | null>(null);

  readonly filteredPapers = computed(() => this.paperService.searchPapers(this.searchQuery()));
  readonly hasAnyPapers = computed(() => this.paperService.papers().length > 0);

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
  }

  askDelete(paper: ExamPaper): void {
    this.paperToDelete.set(paper);
  }

  cancelDelete(): void {
    this.paperToDelete.set(null);
  }

  confirmDelete(): void {
    const paper = this.paperToDelete();
    if (!paper) {
      return;
    }
    this.paperService.deletePaper(paper.id);
    this.paperToDelete.set(null);
  }
}
