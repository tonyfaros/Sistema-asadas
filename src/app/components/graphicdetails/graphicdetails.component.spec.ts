import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicdetailsComponent } from './graphicdetails.component';

describe('GraphicdetailsComponent', () => {
  let component: GraphicdetailsComponent;
  let fixture: ComponentFixture<GraphicdetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GraphicdetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphicdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
