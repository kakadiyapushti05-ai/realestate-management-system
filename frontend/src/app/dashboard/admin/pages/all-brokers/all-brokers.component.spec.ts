import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllBrokersComponent } from './all-brokers.component';

describe('AllBrokersComponent', () => {
  let component: AllBrokersComponent;
  let fixture: ComponentFixture<AllBrokersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllBrokersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllBrokersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
