import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InfrastructureGalleryComponent } from './infrastructure-gallery.component';

describe('InfrastructureGalleryComponent', () => {
  let component: InfrastructureGalleryComponent;
  let fixture: ComponentFixture<InfrastructureGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfrastructureGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfrastructureGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
