import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmUsuariosComponent } from './adm-usuarios.component';

describe('AdmUsuariosComponent', () => {
  let component: AdmUsuariosComponent;
  let fixture: ComponentFixture<AdmUsuariosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdmUsuariosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
