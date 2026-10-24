import { Component, inject } from '@angular/core';
import { PaperService } from '../services/paper.service';

@Component({
  selector: 'app-statistics',
  imports: [],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent {
  readonly paperService = inject(PaperService);
}
