import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AllPapersComponent } from './all-papers.component';

describe('AllPapersComponent', () => {
  let component: AllPapersComponent;
  let fixture: ComponentFixture<AllPapersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPapersComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPapersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
