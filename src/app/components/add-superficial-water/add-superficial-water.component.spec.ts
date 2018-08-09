import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSuperficialWaterComponent } from './add-superficial-water.component';

describe('AddSuperficialWaterComponent', () => {
  let component: AddSuperficialWaterComponent;
  let fixture: ComponentFixture<AddSuperficialWaterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddSuperficialWaterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSuperficialWaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
