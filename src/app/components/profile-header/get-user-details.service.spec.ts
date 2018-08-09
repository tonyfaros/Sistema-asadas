import { TestBed, inject } from '@angular/core/testing';
import { GetUserDetailsService } from './get-user-details.service';

describe('GetUserDetailsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetUserDetailsService]
    });
  });

  it('should ...', inject([GetUserDetailsService], (service: GetUserDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
