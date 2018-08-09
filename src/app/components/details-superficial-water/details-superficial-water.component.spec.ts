import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsSuperficialWaterComponent } from './details-superficial-water.component';

describe('DetailsSuperficialWaterComponent', () => {
  let component: DetailsSuperficialWaterComponent;
  let fixture: ComponentFixture<DetailsSuperficialWaterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailsSuperficialWaterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailsSuperficialWaterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
