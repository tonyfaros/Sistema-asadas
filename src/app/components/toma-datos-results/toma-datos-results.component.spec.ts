import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TomaDatosResultsComponent } from './toma-datos-results.component';

describe('TomaDatosResultsComponent', () => {
  let component: TomaDatosResultsComponent;
  let fixture: ComponentFixture<TomaDatosResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TomaDatosResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TomaDatosResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
