import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {APP_BASE_HREF} from '@angular/common';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

import { routing } from '../../common/mock/routes-mock';

import { HomeComponent } from '../home/home.component';
import { NotFoundComponentComponent } from '../not-found-component/not-found-component.component';

import { AddChlorinSystemComponent } from './add-chlorin-system.component';
import { DatepickerComponent } from '../../../../node_modules/angular2-material-datepicker/src/datepicker.component';

describe('AddChlorinSystemComponent', () => {
  let component: AddChlorinSystemComponent;
  let fixture: ComponentFixture<AddChlorinSystemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChlorinSystemComponent,
        DatepickerComponent,
        HomeComponent,
        NotFoundComponentComponent ],
      imports:[
          ReactiveFormsModule,
          FormsModule, 
          BrowserModule,
          AngularFireModule.initializeApp(firebaseConfig),
          routing],
       providers: [{provide: APP_BASE_HREF, useValue : '/' }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChlorinSystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
