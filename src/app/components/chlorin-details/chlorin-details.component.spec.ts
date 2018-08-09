import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormGroup } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';


import { ChlorinDetailsComponent } from './chlorin-details.component';
import { DatepickerComponent } from '../../../../node_modules/angular2-material-datepicker/src/datepicker.component';

describe('ChlorinDetailsComponent', () => {
  let component: ChlorinDetailsComponent;
  let fixture: ComponentFixture<ChlorinDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChlorinDetailsComponent,
            DatepickerComponent ],
      imports:[
          ReactiveFormsModule,
          FormsModule, 
          BrowserModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChlorinDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
