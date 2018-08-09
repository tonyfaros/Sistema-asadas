import { RouterModule, Routes } from '@angular/router'
import { ModuleWithProviders } from '@angular/core';

import { HomeComponent } from '../../components/home/home.component';
import { NotFoundComponentComponent } from '../../components/not-found-component/not-found-component.component';

const appRoutes: Routes = [
    { path: '', component: HomeComponent},
    { path: '**', component: NotFoundComponentComponent }]

  export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);