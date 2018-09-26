import { BrowserModule } from '@angular/platform-browser';
import {NgxChartsModule} from '@swimlane/ngx-charts';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';
//import { AgmCoreModule,SebmGoogleMap } from 'angular2-google-maps/core';
import { AgmCoreModule } from '@agm/core'; //<----- NO Sirve!
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



import { AppComponent } from './app.component';

//import {DataTableModule} from "angular2-datatable";

import { RoutingModule } from './modules/routing.module';


import { MenuComponent } from './components/menu/menu.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ProfileComponent } from './components/profile/profile.component';
import { NewNotificationComponent } from './components/new-notification/new-notification.component';
import { HomeComponent } from './components/home/home.component';
import { GenerateReportComponent } from './components/generate-report/generate-report.component';
import { PersmissionRequestsComponent } from './components/persmission-requests/persmission-requests.component';
import { SignupComponent } from './components/signup/signup.component';

import { NotFoundComponentComponent } from './components/not-found-component/not-found-component.component';
import {Tabs} from './components/tab-component/tabs';
import {Tab} from './components/tab-component/tab';

import { EvalSersaComponent } from './components/eval-sersa/eval-sersa.component';
import { SearchComponent } from './components/search/search.component';
import { AddTankComponent } from './components/add-tank/add-tank.component';
import { SurfacePickupComponent } from './components/surface-pickup/surface-pickup.component';
import { NascentPickupComponent } from './components/nascent-pickup/nascent-pickup.component';
import { AddInfrastructureComponent } from './components/add-infrastructure/add-infrastructure.component';
import { TankDetailsComponent } from './components/tank-details/tank-details.component';
import { AsadaDetailsComponent } from './components/asada-details/asada-details.component';
import { AddAsadaComponent } from './components/add-asada/add-asada.component';
import { AddChlorinSystemComponent } from './components/add-chlorin-system/add-chlorin-system.component';
import { ChlorinDetailsComponent } from './components/chlorin-details/chlorin-details.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { AddNascentComponent } from './components/add-nascent/add-nascent.component';
import { NascentDetailsComponent } from './components/nascent-details/nascent-details.component';
import { AddSuperficialWaterComponent } from './components/add-superficial-water/add-superficial-water.component';
import { DetailsSuperficialWaterComponent } from './components/details-superficial-water/details-superficial-water.component';

import { MapGoogleComponent } from './components/map-google/map-google.component';
import { AngularFireModule } from "angularfire2/index";
import { firebaseConfig } from "environments/firebase.config";
import { DatepickerModule } from 'angular2-material-datepicker';
import { AuthGuard } from './auth.service';
import { ToasterModule } from 'angular2-toaster';
import { ModalGalleryModule } from 'angular-modal-gallery';
import { ModalModule } from 'angular2-modal';

import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap';
import { GraphicsComponent } from './components/graphics/graphics.component';
import { ChartsModule } from 'ng2-charts';
import 'hammerjs';
import 'mousetrap';
import { GraphicdetailsComponent } from './components/graphicdetails/graphicdetails.component';
import { Ng2FileInputModule } from 'ng2-file-input';
import { PapaParseModule } from 'ngx-papaparse';
import { CompareAsadasComponent } from './components/compare-asadas/compare-asadas.component';
import { BitacoraComponent } from './components/bitacora/bitacora.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReporteComponent } from './components/reporte/reporte.component';
import { FilterComponent } from './components/filter/filter.component';
import { TomaDatosComponent } from './components/toma-datos/toma-datos.component';
import { AdmUsuariosComponent } from './components/adm-usuarios/adm-usuarios.component';
import { TomaDatosInfraComponent } from './components/toma-datos-infra/toma-datos-infra.component';


@NgModule({
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
    AsadaDetailsComponent,
    AddAsadaComponent,
    AddChlorinSystemComponent,
    ChlorinDetailsComponent,
    Tabs,
    Tab,
    NotificationsComponent,
    AddNascentComponent,
    NascentDetailsComponent,
    GraphicsComponent,
    AddSuperficialWaterComponent,
    DetailsSuperficialWaterComponent,
    GraphicdetailsComponent,
    CompareAsadasComponent,
    BitacoraComponent,
    DashboardComponent,
    ReporteComponent,
    TomaDatosComponent,
    AdmUsuariosComponent,
    FilterComponent,
    TomaDatosInfraComponent,
  ],
  imports: [
    DatepickerModule,

    //DataTableModule,
    BrowserModule,
    NgxChartsModule,

    CommonModule,
    FormsModule,
    HttpModule,
    ChartsModule,
    RoutingModule,        
    ReactiveFormsModule,
    ToasterModule,
    PapaParseModule,
    Ng2FileInputModule.forRoot(
        {
         dropText:"",
         browseText:"Importar ASADAs",
         removeText:"Subir",
         invalidFileText:"No es un archivo .CSV .",
         invalidFileTimeout:8000,
         removable:true,
         multiple:false,
         showPreviews:true,
         extensions:['csv']
      }),
    ModalModule.forRoot(),
    BootstrapModalModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAXBn_MRcWzjZb_t63rkAy0_PCzC3spwjg'
    }),
     AngularFireModule.initializeApp(firebaseConfig),
     ModalGalleryModule.forRoot(),
     //DataTableModule  
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class AppModule { 

}

