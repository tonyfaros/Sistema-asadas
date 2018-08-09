import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurfacePickupComponent } from './surface-pickup.component';

describe('SurfacePickupComponent', () => {
  let component: SurfacePickupComponent;
  let fixture: ComponentFixture<SurfacePickupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurfacePickupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurfacePickupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
