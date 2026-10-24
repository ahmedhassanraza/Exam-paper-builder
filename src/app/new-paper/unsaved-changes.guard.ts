import { CanDeactivateFn } from '@angular/router';
import { NewPaperComponent } from './new-paper.component';

export const unsavedChangesGuard: CanDeactivateFn<NewPaperComponent> = (component) => {
  if (!component.isDirty) {
    return true;
  }

  return window.confirm('Discard unsaved changes?');
};
