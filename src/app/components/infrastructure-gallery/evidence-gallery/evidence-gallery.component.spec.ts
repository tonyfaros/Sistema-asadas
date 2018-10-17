import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EvidenceGalleryComponent } from './evidence-gallery.component';

describe('EvidenceGalleryComponent', () => {
  let component: EvidenceGalleryComponent;
  let fixture: ComponentFixture<EvidenceGalleryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EvidenceGalleryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvidenceGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
