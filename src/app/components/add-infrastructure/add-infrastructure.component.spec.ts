import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

import { AddInfrastructureComponent } from './add-infrastructure.component';
import { AddTankComponent } from '../add-tank/add-tank.component';
import { NascentPickupComponent } from '../nascent-pickup/nascent-pickup.component';
import { SurfacePickupComponent } from '../surface-pickup/surface-pickup.component';
import { DatepickerModule } from 'angular2-material-datepicker';

describe('AddInfrastructureComponent', () => {
  let component: AddInfrastructureComponent;
  let fixture: ComponentFixture<AddInfrastructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        AddInfrastructureComponent, 
        AddTankComponent, 
        NascentPickupComponent, 
        SurfacePickupComponent ],
        imports:
          [ReactiveFormsModule,
          FormsModule, 
          BrowserModule, 
          DatepickerModule,
          AngularFireModule.initializeApp(firebaseConfig)]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInfrastructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
