import { TestBed, inject } from '@angular/core/testing';
import { FormsSersaService } from './forms-sersa.service';

describe('FormsSersaService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FormsSersaService]
    });
  });

  it('should ...', inject([FormsSersaService], (service: FormsSersaService) => {
    expect(service).toBeTruthy();
  }));
});
