import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NewPaperComponent } from './new-paper/new-paper.component';
import { unsavedChangesGuard } from './new-paper/unsaved-changes.guard';
import { PaperPreviewComponent } from './paper-preview/paper-preview.component';
import { SettingsComponent } from './settings/settings.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'new-paper', component: NewPaperComponent, canDeactivate: [unsavedChangesGuard] },
  { path: 'papers/:id/edit', component: NewPaperComponent, canDeactivate: [unsavedChangesGuard] },
  { path: 'papers/:id/preview', component: PaperPreviewComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: '' }
];
