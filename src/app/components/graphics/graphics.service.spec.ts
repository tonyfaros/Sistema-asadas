import { TestBed, inject } from '@angular/core/testing';

import { GraphicsService } from './graphics.service';

describe('GraphicsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GraphicsService]
    });
  });

  it('should ...', inject([GraphicsService], (service: GraphicsService) => {
    expect(service).toBeTruthy();
  }));
});
