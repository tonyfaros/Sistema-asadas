import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

import { DatepickerModule } from 'angular2-material-datepicker';

import { routing } from '../../common/mock/routes-mock';

import { HomeComponent } from '../home/home.component';
import { NotFoundComponentComponent } from '../not-found-component/not-found-component.component';

import { TankDetailsComponent } from './tank-details.component';
import { DatepickerComponent } from '../../../../node_modules/angular2-material-datepicker/src/datepicker.component';

describe('TankDetailsComponent', () => {
  let component: TankDetailsComponent;
  let fixture: ComponentFixture<TankDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        TankDetailsComponent,
        HomeComponent,
        NotFoundComponentComponent,
        DatepickerComponent ], 
      imports:[
           ReactiveFormsModule,
          FormsModule, 
          BrowserModule,
          AngularFireModule.initializeApp(firebaseConfig), routing],
       providers: [{provide: APP_BASE_HREF, useValue : '/' }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TankDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
