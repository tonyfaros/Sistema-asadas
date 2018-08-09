import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareAsadasComponent } from './compare-asadas.component';

describe('CompareAsadasComponent', () => {
  let component: CompareAsadasComponent;
  let fixture: ComponentFixture<CompareAsadasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompareAsadasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompareAsadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
