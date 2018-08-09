import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapGoogleService } from './map-google.service';
import { MapGoogleComponent } from './map-google.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";
import { AgmCoreModule } from 'angular2-google-maps/core';

describe('MapGoogleComponent', () => {
  let component: MapGoogleComponent;
  let fixture: ComponentFixture<MapGoogleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [MapGoogleService],
      declarations: [ MapGoogleComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports:[ 
          AngularFireModule.initializeApp(firebaseConfig),
          AgmCoreModule.forRoot({
          apiKey: 'AIzaSyAXBn_MRcWzjZb_t63rkAy0_PCzC3spwjg'
        })]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapGoogleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
  it('Test that brings asadas', () => {
    expect(component.getTrueElements()).toBeTruthy();
  })
*/

});
