import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

import { routing } from '../../common/mock/routes-mock';

import { HomeComponent } from '../home/home.component';
import { NotFoundComponentComponent } from '../not-found-component/not-found-component.component';

import { AddAsadaComponent } from './add-asada.component';
import { DatepickerComponent } from '../../../../node_modules/angular2-material-datepicker/src/datepicker.component';
import { AngularFireService } from '../../common/service/angularFire.service';

describe('AddAsadaComponent', () => {
  let component: AddAsadaComponent;
  let fixture: ComponentFixture<AddAsadaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAsadaComponent,
      DatepickerComponent,
      HomeComponent,
      NotFoundComponentComponent ], 
      imports:[
          ReactiveFormsModule,
          FormsModule, 
          BrowserModule,
           AngularFireModule.initializeApp(firebaseConfig),
           routing],
      providers: [AngularFireService,{provide: APP_BASE_HREF, useValue : '/' }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAsadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
