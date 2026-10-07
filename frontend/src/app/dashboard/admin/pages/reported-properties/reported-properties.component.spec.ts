import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportedPropertiesComponent } from './reported-properties.component';

describe('ReportedPropertiesComponent', () => {
  let component: ReportedPropertiesComponent;
  let fixture: ComponentFixture<ReportedPropertiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportedPropertiesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportedPropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
