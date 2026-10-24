import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header.component';
import { SchoolSettings } from '../models/paper.model';
import { PaperService } from '../services/paper.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, HeaderComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  private readonly paperService = inject(PaperService);

  settings: SchoolSettings = { ...this.paperService.settings() };
  message = '';
  errorMessage = '';

  saveSettings(): void {
    this.paperService.saveSettings(this.settings);
    this.errorMessage = '';
    this.message = 'Settings saved. New papers will use these defaults.';
  }

  downloadBackup(): void {
    const backup = this.paperService.exportBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `exam-paper-builder-backup-${stamp}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.message = 'Backup file downloaded.';
    this.errorMessage = '';
  }

  restoreBackup(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        const restored = this.paperService.restoreBackup(parsed);
        if (!restored) {
          this.errorMessage = 'That file is not a valid paper backup.';
          this.message = '';
          return;
        }
        this.settings = { ...this.paperService.settings() };
        this.errorMessage = '';
        this.message = 'Backup restored.';
      } catch {
        this.errorMessage = 'Could not read that backup file.';
        this.message = '';
      }
    };
    reader.readAsText(file);
  }

  deleteAllPapers(): void {
    if (!window.confirm('Delete all saved papers from this browser? This cannot be undone.')) {
      return;
    }
    this.paperService.deleteAllPapers();
    this.errorMessage = '';
    this.message = 'All papers were deleted.';
  }
}
