import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNascentComponent } from './add-nascent.component';

describe('AddNascentComponent', () => {
  let component: AddNascentComponent;
  let fixture: ComponentFixture<AddNascentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddNascentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddNascentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
