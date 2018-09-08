/* gabygarro (06/09/17): Esta página, junto con map-google.component y about-us.component
tienen un work around descrito en el issue https://github.com/angular/angular/issues/6595 */

import { Component, OnInit } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { AgmCoreModule } from 'angular2-google-maps/core';

import { MapGoogleService } from './map-google.service';
import { Infrastructure  } from '../../common/model/Infrastructure';
import { Asada } from '../../common/model/Asada';
import { SebmGoogleMap } from 'angular2-google-maps/core';
import { AngularFire, FirebaseAuthState } from 'angularfire2/index';
import { UserService } from "app/common/service/user.service";
import { ActivatedRoute, Params, Router } from '@angular/router';

import {Subscription} from "rxjs/Subscription";
import { filterParams } from '../filter/filter.component';

@Component({
    selector: 'app-map-google',
    templateUrl: './map-google.component.html',
    styleUrls: ['./map-google.component.scss'],
    providers: [MapGoogleService,UserService]
})
export class MapGoogleComponent implements OnInit {

    private allList: Infrastructure[];
    private AsadasList: Asada[];
    private AsadasListTemp: Asada[];
    //public asadasmarkers: Asada[];
    private SingleList: any[];
    private agregado = false;
    public AsadaId: string;
    public AsadaUser: string;
    public UserRol: string;
    public loadgraphic: boolean;

    public filterQuery = "";

    public cantidadTanques = 0;
    public cantidadCaptaciones = 0;
    public cantidadCloracion = 0;
    public lastOpen: any;
    
    constructor(private mapService: MapGoogleService,private af: AngularFire,private userService: UserService,private router: Router, private route: ActivatedRoute) {

        //[iconUrl]="m.iconUrl"

        this.allList = [];
        //this.markers = [];
        this.AsadasList = [];
        this.AsadasListTemp = [];
        this.infraestTankmarkers = [];
        this.infraestCaptacionkmarkers = [];
        this.asadasmarkers = [];
        this.SingleList = [];

    }

    user: FirebaseAuthState;
    public isLoggedIn: boolean;

    private scrollExecuted: boolean = false;
    private fragment: string;

    ngOnInit() {
        //this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
        
        this.af.auth.subscribe(user => {
            if (user) {
                // user logged in
                this.user = user;
                this.isLoggedIn = true;
                var userDetails = this.userService.getRolAccess(this.user.uid);
                userDetails.subscribe(
                    results => {
                        this.AsadaUser = results.asada;
                        this.UserRol = results.rol;
                        this.getResultAsadasTemp();

                    }
                );


            }
            else {
                // user not logged in
                this.isLoggedIn = false;
                this.getResultAsadasTemp();

            }
        });


    }
    filterNotity(event:filterParams){
        
    }

    /*ngAfterViewChecked(): void {
    if (!this.scrollExecuted) {
        let routeFragmentSubscription: Subscription;
        routeFragmentSubscription = this.route.fragment.subscribe(fragment => {
          if (fragment) {
            let element = document.getElementById(fragment);
            if (element) {
              element.scrollIntoView();
              this.scrollExecuted = true;
              // Free resources
              setTimeout(
                () => {
                  console.log('routeFragmentSubscription unsubscribe');
                  routeFragmentSubscription.unsubscribe();
                }, 0);
            }
          }
        });
      }
    }*/

    getResultAsadas(): void {
        this.mapService.getASADAS()
            .subscribe(
                results => {
                    this.AsadasList = results;
                    this.addASADASMarkers();
                }
            );

    }

    getResultAsadasTemp(): void {
        this.mapService.getASADAS()
                .subscribe(
                results => {
                    this.AsadasListTemp = results;
                    this.getInfraestructures();
                }
            );

    }

    getInfraestructures(): void {
        this.mapService.getInfrastructures()
            .subscribe(
                results => {
                    this.allList = results;
                    this.addTankMarkers();
                    this.addCaptacionesSuperf();
                    this.getResultAsadas();
                }
            );

    }

    setDetails(elem: asadastructure) {
        
        if(this.loadgraphic){
             this.loadgraphic=false;
             
        }
        else{
            this.loadgraphic = true;
            this.AsadaId = elem.$key;
        }
    }

    cancelModal(){
         this.loadgraphic=false;
    }

    redirectASADA(elem: asadastructure){
        this.router.navigate(["/asadaDetails/"+ elem.$key]);

    }
    redirectTanque(elem:Infrastructure){
         this.router.navigate(["/TanqueDetails//"+ elem.$key]);
    }
    redirectCaptacion(elem:Infrastructure){
        if(elem.type == "CaptacionNaciente" ){
             this.router.navigate(["/CaptacionNacienteDetails/"+ elem.$key]);    
        }
        else{
            this.router.navigate(["/CaptacionSuperficialDetails/"+ elem.$key]);   
        }
       
    }

    private visible: boolean = true;

    markerClick() {
        this.visible = !this.visible;
    }

    //START POSITION
    lat: number = 9.852275;
    lng: number = -83.9004535;

    //ZOOM LEVEL
    zoom: number = 10;

    //VARIABLES
    markerName: string;
    markerLat: string;
    markerLong: string;

    asadasmarkers: asadastructure[];
    infraestTankmarkers: infraestructureTank[];
    infraestCaptacionkmarkers: infraestructureCaptacion[];

    addTankMarkers() {

        for (let entry of this.allList) {

            if (entry.type == "Tanque") {
                var idasada = entry.asada.id;

                var province;
                var phonenumber;
                for (let asadaElement of this.AsadasListTemp) {

                    if (asadaElement.$key == idasada) {

                        province = asadaElement.province;
                        phonenumber = asadaElement.phoneNumber;

                        break;
                    }
                }

                var iconUrl;

                //Tag para el marker del mapa
                if (entry.type == "Tanque") {

                    if (this.isLoggedIn){
                        
                        if (this.AsadaUser == entry.asada.id || this.UserRol == "Super Administrador"){
                            //Riesgo Nulo
                            //if (entry.riskLevel == "Nulo" || entry.risk == 0) {
                            if (entry.riskLevel == "Nulo") {
                                iconUrl = "../../../assets/icons/Storage-nulo.png";
                            }
                            //Riesgo Bajo
                            //else if ((entry.risk <= 2 && entry.risk > 0) || entry.riskLevel == "Bajo") {
                            else if (entry.riskLevel == "Bajo") {
                                iconUrl = "../../../assets/icons/Storage-bajo.png";

                            }
                            //Riesgo Intermedio
                            //else if ((entry.risk >= 3 && entry.risk <= 4) || entry.riskLevel == "Intermedio") {
                            else if (entry.riskLevel == "Intermedio") {
                                iconUrl = "../../../assets/icons/Storage-intermedio.png";

                            }
                            //Riesgo Alto
                            //else if ((entry.risk >= 5 && entry.risk <= 7) || entry.riskLevel == "Alto") {
                            else if (entry.riskLevel == "Alto") {
                                iconUrl = "../../../assets/icons/Storage-alto.png";

                            }
                            //Riesgo Muy alto
                            //else if ((entry.risk >= 8 && entry.risk <= 10) || entry.riskLevel == "Muy Alto") {
                            else if (entry.riskLevel == "Muy Alto") {
                                iconUrl = "../../../assets/icons/Storage-muyalto.png";

                            }
                        }
                         else{
                            iconUrl = "../../../assets/icons/Tanque-publico.png";
                         }
                    }
                    else{
                        iconUrl = "../../../assets/icons/Tanque-publico.png";

                    }
                }


                var infraestmarker = {
                    $key : entry.$key,
                    name: entry.name,
                    lat: entry.lat,
                    long: entry.long,
                    iconUrl: iconUrl,
                    asadaname: entry.asada.name,
                    risk: entry.risk,
                    riskLevel: entry.riskLevel,
                    province: province,
                    phonenumber: phonenumber,
                    asada : { id:entry.asada.id }
                }
                this.infraestTankmarkers.push(infraestmarker);
            }

        }
    }

    addASADASMarkers() {
        for (let asadaElement of this.AsadasList) {

            var key;
            var name;
            var lat;
            var long;
            var iconUrl;
            var province;
            var district;
            var state;
            var phonenumber;
            var population;
            var numbersubscribed;
            var zonetype;
            var cantTanques;
            var cantSuperficial;
            var cantCloraci;

            key = asadaElement.$key;
            name = asadaElement.name;
            lat = asadaElement.office.lat;
            long = asadaElement.office.long;
            province = asadaElement.province;
            district = asadaElement.subDistrict;
            state = asadaElement.district;
            phonenumber = asadaElement.phoneNumber;
            population = asadaElement.population;
            numbersubscribed = asadaElement.numberSubscribed;
            zonetype = asadaElement.zoneType;

            this.evalCantTanques(key);
            this.evalCantCaptacion(key);
            this.evalCantSistemasClr(key);
            cantTanques = this.cantidadTanques;
            cantSuperficial = this.cantidadCaptaciones;
            cantCloraci = this.cantidadCloracion;

             if (this.isLoggedIn){
                 if (this.AsadaUser == asadaElement.$key || this.UserRol == "Super Administrador"){
                    iconUrl = "../../../assets/icons/oficina.png";
                 }
                 else{
                    iconUrl = "../../../assets/icons/oficina.png";
                }
             }
             else{
                iconUrl = "../../../assets/icons/oficina.png";
             }
            var newAsadaMarker = {
                $key: key,
                name: name,
                lat: lat,
                long: long,
                iconUrl: iconUrl,
                province: province,
                state: state,
                district: district,
                population: population,
                phonenumber: phonenumber,
                zonetype: zonetype,
                numbersubscribed: numbersubscribed,
                cantTanques:cantTanques,
                cantSuperficial:cantSuperficial,
                cantCloraci:cantCloraci,
                showInfoWindow: false,
                zIndex: 100,
            }

            this.asadasmarkers.push(newAsadaMarker);
        }

    }

    evalCantTanques (asadaid: string ){
        
        this.cantidadTanques = 0;
        for (let entry of this.allList){
            if (entry.asada.id == asadaid && entry.type == "Tanque"){
                this.cantidadTanques = this.cantidadTanques+1;
            }

        }
    }

     evalCantCaptacion (asadaid: string ){
        
        this.cantidadCaptaciones = 0; 
        for (let entry of this.allList){
            if (entry.asada.id == asadaid && (entry.type == "CaptacionNaciente" || entry.type =="CaptacionSuperficial")){
                this.cantidadCaptaciones = this.cantidadCaptaciones+1;
            }

        }
    }

     evalCantSistemasClr (asadaid: string ){
        
        this.cantidadCloracion = 0;
        for (let entry of this.allList){
            if (entry.asada.id == asadaid && entry.type == "SistemaCloracion"){
                this.cantidadCloracion = this.cantidadCloracion+1;
            }

        }
    }

    addCaptacionesSuperf() {
        for (let entry of this.allList) {

            if (entry.type == "CaptacionSuperficial" || entry.type == "CaptacionNaciente" || entry.type == "Naciente") {
                var idasada = entry.asada.id;

                var province;
                var phonenumber;
                for (let asadaElement of this.AsadasListTemp) {

                    if (asadaElement.$key == idasada) {

                        province = asadaElement.province;
                        phonenumber = asadaElement.phoneNumber;

                        break;
                    }
                }

                var iconUrl;

                if (entry.type == "CaptacionSuperficial" || entry.type == "CaptacionNaciente" || entry.type == "Naciente") {
                    
                    if (this.isLoggedIn){

                        if (this.AsadaUser == entry.asada.id || this.UserRol == "Super Administrador"){
                            //Riesgo Nulo
                            if (entry.riskLevel == "Nulo") {
                                iconUrl = "../../../assets/icons/Naciente-nulo.png";
                            }
                            //Riesgo Bajo
                            else if (entry.riskLevel == "Bajo") {
                                iconUrl = "../../../assets/icons/Naciente-bajo.png";

                            }
                            //Riesgo Intermedio
                            else if (entry.riskLevel == "Intermedio") {
                                iconUrl = "../../../assets/icons/Naciente-intermedio.png";

                            }
                            //Riesgo Alto
                            else if (entry.riskLevel == "Alto") {
                                iconUrl = "../../../assets/icons/Naciente-alto.png";

                            }
                            //Riesgo Muy alto
                            else if (entry.riskLevel == "Muy Alto") {
                                iconUrl = "../../../assets/icons/Naciente-muyalto.png";

                            }

                        }
                        else{
                            iconUrl = "../../../assets/icons/Naciente-publico.png";
                        }
                    }
                    else{
                        iconUrl = "../../../assets/icons/Naciente-publico.png";
                    }
                }


                var infraestmarker = {
                    $key : entry.$key,
                    name: entry.name,
                    lat: entry.lat,
                    long: entry.long,
                    iconUrl: iconUrl,
                    asadaname: entry.asada.name,
                    risk: entry.risk,
                    riskLevel: entry.riskLevel,
                    province: province,
                    phonenumber: phonenumber,
                    asada : { id:entry.asada.id }
                }
                this.infraestCaptacionkmarkers.push(infraestmarker);
            }

        }

    }

}



interface asadastructure {
    $key: string;
    name: string;
    lat: number;
    long: number;
    iconUrl: string;
    province: string;
    state: string; //Canton
    district: string;
    population: number;
    phonenumber: string;
    //email: string;
    zonetype: string;
    numbersubscribed: number;
    cantTanques: number;
    cantSuperficial: number;
    cantCloraci: number;
    showInfoWindow: boolean;
}

interface infraestructureTank {
    $key?: string;
    name: string;
    lat: number;
    long: number;
    iconUrl: string;
    asadaname: string;
    risk: number;
    riskLevel: string;
    province: string;
    phonenumber: string;
    type?:string;
    asada:{
        id: string;
    };
}


interface infraestructureCaptacion {
    $key?: string;
    name: string;
    lat: number;
    long: number;
    iconUrl: string;
    asadaname: string;
    risk: number;
    riskLevel: string;
    province: string;
    phonenumber: string;
    type?:string;
    asada:{
        id: string;
    };
}
