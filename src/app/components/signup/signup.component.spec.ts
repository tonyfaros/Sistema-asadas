import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {APP_BASE_HREF} from '@angular/common';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

import { routing } from '../../common/mock/routes-mock';

import { HomeComponent } from '../home/home.component';
import { NotFoundComponentComponent } from '../not-found-component/not-found-component.component';

import { SignupComponent } from './signup.component';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupComponent, HomeComponent, NotFoundComponentComponent ],
      imports:[
          ReactiveFormsModule,
          FormsModule,
          AngularFireModule.initializeApp(firebaseConfig),
          routing] ,
      providers: [{provide: APP_BASE_HREF, useValue : '/' }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
