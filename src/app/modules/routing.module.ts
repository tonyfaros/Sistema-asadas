import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router'
import { ModuleWithProviders } from '@angular/core';


import { EvalSersaComponent } from '../components/eval-sersa/eval-sersa.component';

import { MapGoogleComponent } from '../components/map-google/map-google.component';
import { ProfileHeaderComponent } from '../components/profile-header/profile-header.component';
import { LoginComponent } from '../components/login/login.component';
import { SearchComponent } from '../components/search/search.component';
import { AddTankComponent } from '../components/add-tank/add-tank.component';
import { NotFoundComponentComponent } from '../components/not-found-component/not-found-component.component';
import { AboutUsComponent } from '../components/about-us/about-us.component';
import { SurfacePickupComponent } from '../components/surface-pickup/surface-pickup.component';
import { ProfileComponent } from '../components/profile/profile.component';
import { AddInfrastructureComponent } from '../components/add-infrastructure/add-infrastructure.component';
import { NewNotificationComponent } from '../components/new-notification/new-notification.component';
import { HomeComponent } from '../components/home/home.component';
import { GenerateReportComponent } from '../components/generate-report/generate-report.component';
import { PersmissionRequestsComponent } from '../components/persmission-requests/persmission-requests.component';
import { SignupComponent } from '../components/signup/signup.component';
import { TankDetailsComponent } from '../components/tank-details/tank-details.component';
import { AsadaDetailsComponent } from '../components/asada-details/asada-details.component';
import { AddAsadaComponent } from '../components/add-asada/add-asada.component';
import { AddChlorinSystemComponent } from '../components/add-chlorin-system/add-chlorin-system.component';
import { ChlorinDetailsComponent } from '../components/chlorin-details/chlorin-details.component';
import { NotificationsComponent } from '../components/notifications/notifications.component';
import { AddNascentComponent } from '../components/add-nascent/add-nascent.component';
import { NascentDetailsComponent } from '../components/nascent-details/nascent-details.component';
import { GraphicsComponent } from '../components/graphics/graphics.component';
import { DetailsSuperficialWaterComponent } from '../components/details-superficial-water/details-superficial-water.component';
import { GraphicdetailsComponent } from '../components/graphicdetails/graphicdetails.component';
import { TomaDatosInfraComponent } from '../components/toma-datos-infra/toma-datos-infra.component';
//Gaby
import { CompareAsadasComponent } from '../components/compare-asadas/compare-asadas.component'
import { DashboardComponent } from '../components/dashboard/dashboard.component'
//Luis' Components imports
import { BitacoraComponent } from '../components/bitacora/bitacora.component'
//Ricardo' Components imports
import { ReporteComponent } from '../components/reporte/reporte.component'
import { TomaDatosComponent } from '../components/toma-datos/toma-datos.component'
import { AdmUsuariosComponent } from '../components/adm-usuarios/adm-usuarios.component'
import { AuthGuard } from '../auth.service' 

//Gaby: agrego esto aquí por un bug de esta biblioteca
//import {DataTableModule} from "angular2-datatable";


const appRoutes: Routes = [
  { path: '', component: HomeComponent, canActivate:[AuthGuard] },
  { path: 'search/:id', component: SearchComponent },
  { path: 'LoginPage', component: LoginComponent },
  { path: 'evalSERSA/:type/:id/:idInfra', component: EvalSersaComponent },
  { path: 'addTank', component: AddTankComponent, canActivate:[AuthGuard] },
  { path: 'aboutus', component: AboutUsComponent },
  { path: 'surfacePickupComponent', component: SurfacePickupComponent },
  { path: 'profilePage', component: ProfileComponent,canActivate:[AuthGuard] },
  { path: 'addInfrastructure/:id', component: AddInfrastructureComponent, canActivate:[AuthGuard] },
  { path: 'newNotification', component: NewNotificationComponent  },
  { path: 'newNotification/:subject', component: NewNotificationComponent  },
  { path: 'HomePage', component: HomeComponent  },
  { path: 'MapPage', component: MapGoogleComponent },
  { path: 'RequestPage', component: PersmissionRequestsComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'TanqueDetails/:id', component: TankDetailsComponent },
  { path: 'TanqueDetails/:id/:action', component: TankDetailsComponent },
  { path: 'asadaDetails/:id', component: AsadaDetailsComponent },
  { path: 'asadaDetails/:id/:action', component: AsadaDetailsComponent },
  { path: 'addAsada', component: AddAsadaComponent,canActivate:[AuthGuard] },
  { path: 'addChlorination', component: AddChlorinSystemComponent,canActivate:[AuthGuard] },
  { path: 'SistemaCloracionDetails/:id', component: ChlorinDetailsComponent },
  { path: 'SistemaCloracionDetails/:id/:action', component: ChlorinDetailsComponent },
  { path: 'notifications', component: NotificationsComponent },
  { path: 'CaptacionNacienteDetails/:id', component: NascentDetailsComponent },
  { path: 'CaptacionNacienteDetails/:id/:action', component: NascentDetailsComponent },
  { path: 'graphics', component: GraphicsComponent },
  { path: 'CaptacionSuperficialDetails/:id', component: DetailsSuperficialWaterComponent },
  { path: 'CaptacionSuperficialDetails/:id/:action', component: DetailsSuperficialWaterComponent },
  { path: 'GraphicDetails/:id/:graphictype/:idgraphic', component: GraphicdetailsComponent },
  { path: 'GraphicDetails/:id/:graphictype', component: GraphicdetailsComponent },
  { path: 'tomaDatosInfra/:id', component: TomaDatosInfraComponent },
  //Gaby
  { path: 'compare-asadas', component: CompareAsadasComponent },
  { path: 'dashboard', component: DashboardComponent },
  //Luis' Component routes
  { path: 'bitacora', component: BitacoraComponent },
  //Luis' Component routes
  { path: 'reporte', component: ReporteComponent },
  { path: 'tomaDatos', component: TomaDatosComponent },
  { path: 'admUsuarios', component: AdmUsuariosComponent },
  { path: '**', component: NotFoundComponentComponent }

];
@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes), 
    //DataTableModule
  ],
  exports: [
    RouterModule
  ]
})
export class RoutingModule { }


export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);