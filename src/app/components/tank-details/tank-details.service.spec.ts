import { TestBed, inject } from '@angular/core/testing';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

import { TankDetailsService } from './tank-details.service';

describe('TankDetailsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TankDetailsService],
      imports:[AngularFireModule.initializeApp(firebaseConfig)] 
    }) .compileComponents();
  });

  it('should ...', inject([TankDetailsService], (service: TankDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
