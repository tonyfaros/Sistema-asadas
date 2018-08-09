import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersmissionRequestsComponent } from './persmission-requests.component';

describe('PersmissionRequestsComponent', () => {
  let component: PersmissionRequestsComponent;
  let fixture: ComponentFixture<PersmissionRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PersmissionRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersmissionRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
