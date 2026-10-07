import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePropertyListComponent } from './update-property-list.component';

describe('UpdatePropertyListComponent', () => {
  let component: UpdatePropertyListComponent;
  let fixture: ComponentFixture<UpdatePropertyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePropertyListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdatePropertyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
