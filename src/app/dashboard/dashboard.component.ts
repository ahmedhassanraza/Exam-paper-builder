import { Component } from '@angular/core';
import { AllPapersComponent } from '../all-papers/all-papers.component';
import { HeaderComponent } from '../header/header.component';
import { StatisticsComponent } from '../statistics/statistics.component';

@Component({
  selector: 'app-dashboard',
  imports: [HeaderComponent, StatisticsComponent, AllPapersComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {}
