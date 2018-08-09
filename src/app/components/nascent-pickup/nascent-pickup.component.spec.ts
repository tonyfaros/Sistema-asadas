import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NascentPickupComponent } from './nascent-pickup.component';

describe('NascentPickupComponent', () => {
  let component: NascentPickupComponent;
  let fixture: ComponentFixture<NascentPickupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NascentPickupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NascentPickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
