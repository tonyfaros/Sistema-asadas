import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {APP_BASE_HREF} from '@angular/common';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

import { routing } from '../../common/mock/routes-mock';

import { HomeComponent } from '../home/home.component';
import { NotFoundComponentComponent } from '../not-found-component/not-found-component.component';

import { EvalSersaComponent } from './eval-sersa.component';

describe('EvalSersaComponent', () => {
  let component: EvalSersaComponent;
  let fixture: ComponentFixture<EvalSersaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        EvalSersaComponent,
        HomeComponent,
        NotFoundComponentComponent ],
      imports:[
          AngularFireModule.initializeApp(firebaseConfig),
          routing],
       providers: [{provide: APP_BASE_HREF, useValue : '/' }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EvalSersaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
