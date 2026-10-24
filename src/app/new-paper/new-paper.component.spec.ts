import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NewPaperComponent } from './new-paper.component';

describe('NewPaperComponent', () => {
  let component: NewPaperComponent;
  let fixture: ComponentFixture<NewPaperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewPaperComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewPaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
