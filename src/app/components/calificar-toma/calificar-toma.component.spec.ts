import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalificarTomaComponent } from './calificar-toma.component';

describe('CalificarTomaComponent', () => {
  let component: CalificarTomaComponent;
  let fixture: ComponentFixture<CalificarTomaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalificarTomaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalificarTomaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
