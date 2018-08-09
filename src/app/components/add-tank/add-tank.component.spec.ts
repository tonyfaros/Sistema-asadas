import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

import { AddTankComponent } from './add-tank.component';
import { DatepickerComponent } from '../../../../node_modules/angular2-material-datepicker/src/datepicker.component';



describe('AddTankComponent', () => {
  let component: AddTankComponent;
  let fixture: ComponentFixture<AddTankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        AddTankComponent, 
        DatepickerComponent ],
        imports:[
          ReactiveFormsModule,
          FormsModule, 
          BrowserModule,
          AngularFireModule.initializeApp(firebaseConfig)]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
