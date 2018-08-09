import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';

import { LoginComponent } from './login.component';
import { routing } from '../../common/mock/routes-mock';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";
import { HomeComponent } from '../home/home.component';
import { NotFoundComponentComponent } from '../not-found-component/not-found-component.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent, HomeComponent, NotFoundComponentComponent ],
      imports:[
          ReactiveFormsModule,
          FormsModule, 
          AngularFireModule.initializeApp(firebaseConfig),
          routing],
      providers: [{provide: APP_BASE_HREF, useValue : '/' }]
    })
    fixture = TestBed.createComponent(LoginComponent);

    component = fixture.componentInstance; // BannerComponent test instance
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
