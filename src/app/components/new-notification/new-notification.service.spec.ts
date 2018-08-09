import { TestBed, inject } from '@angular/core/testing';

import { NewNotificationService } from './new-notification.service';

describe('NewNotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NewNotificationService]
    });
  });

  it('should ...', inject([NewNotificationService], (service: NewNotificationService) => {
    expect(service).toBeTruthy();
  }));
});
