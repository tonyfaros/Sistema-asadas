import { TestBed, inject } from '@angular/core/testing';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";
import { AgmCoreModule } from 'angular2-google-maps/core';

import { MapGoogleService } from './map-google.service';


describe('MapGoogleService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapGoogleService],
      imports:[ 
          AngularFireModule.initializeApp(firebaseConfig),
          AgmCoreModule.forRoot({
          apiKey: 'AIzaSyAXBn_MRcWzjZb_t63rkAy0_PCzC3spwjg'
        })]
    });
  });

  it('should ...', inject([MapGoogleService], (service: MapGoogleService) => {
    expect(service).toBeTruthy();
  }));
});
