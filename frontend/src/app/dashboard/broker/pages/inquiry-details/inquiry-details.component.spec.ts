import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryDetailsComponent } from './inquiry-details.component';

describe('InquiryDetailsComponent', () => {
  let component: InquiryDetailsComponent;
  let fixture: ComponentFixture<InquiryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InquiryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
