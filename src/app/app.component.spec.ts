import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { By }              from '@angular/platform-browser';
import { DebugElement }    from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {APP_BASE_HREF} from '@angular/common';

import { MenuComponent } from './components/menu/menu.component';
import { HeaderComponent } from './components/header/header.component';
import { RoutingModule } from './modules/routing.module';
import { HomeComponent } from './components/home/home.component';
import { SearchComponent } from './components/search/search.component';
import { LoginComponent } from './components/login/login.component';
import { EvalSersaComponent } from './components/eval-sersa/eval-sersa.component';
import { MapGoogleComponent } from './components/map-google/map-google.component';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { AddTankComponent } from './components/add-tank/add-tank.component';
import { NotFoundComponentComponent } from './components/not-found-component/not-found-component.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { SurfacePickupComponent } from './components/surface-pickup/surface-pickup.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NascentPickupComponent } from './components/nascent-pickup/nascent-pickup.component';
import { AddInfrastructureComponent } from './components/add-infrastructure/add-infrastructure.component';
import { NewNotificationComponent } from './components/new-notification/new-notification.component';
import { GenerateReportComponent } from './components/generate-report/generate-report.component';
import { PersmissionRequestsComponent } from './components/persmission-requests/persmission-requests.component';
import { TankDetailsComponent } from './components/tank-details/tank-details.component';
import { SignupComponent } from './components/signup/signup.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { GraphicdetailsComponent } from './components/graphicdetails/graphicdetails.component';

import { AgmCoreModule } from 'angular2-google-maps/core';
import { DatepickerModule } from 'angular2-material-datepicker';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MenuComponent,
        HeaderComponent,
        EvalSersaComponent,
        MapGoogleComponent,
        ProfileHeaderComponent,
        LoginComponent,
        SearchComponent,
        AddTankComponent,
        NotFoundComponentComponent,
        SurfacePickupComponent,
        AboutUsComponent,
        NewNotificationComponent,
        ProfileComponent,
        NascentPickupComponent,
        AddInfrastructureComponent,
        NewNotificationComponent,
        HomeComponent,
        GenerateReportComponent,
        PersmissionRequestsComponent,
        SignupComponent,
        TankDetailsComponent,
        NotificationsComponent,
        GraphicdetailsComponent
      ],
       imports: [
         RoutingModule, 
         AgmCoreModule, 
         ReactiveFormsModule, 
         FormsModule, 
         DatepickerModule,
         AngularFireModule.initializeApp(firebaseConfig)],
       providers: [{provide: APP_BASE_HREF, useValue : '/' }]
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  /*it(`should have as title 'app works!'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app works!');
  }));
*/
  /*it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('app works!');
  }));*/
});
