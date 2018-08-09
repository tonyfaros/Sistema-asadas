import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NascentDetailsComponent } from './nascent-details.component';

describe('NascentDetailsComponent', () => {
  let component: NascentDetailsComponent;
  let fixture: ComponentFixture<NascentDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NascentDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NascentDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
