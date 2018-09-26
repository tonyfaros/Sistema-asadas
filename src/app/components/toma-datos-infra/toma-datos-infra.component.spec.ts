import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TomaDatosInfraComponent } from './toma-datos-infra.component';

describe('TomaDatosInfraComponent', () => {
  let component: TomaDatosInfraComponent;
  let fixture: ComponentFixture<TomaDatosInfraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TomaDatosInfraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TomaDatosInfraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
