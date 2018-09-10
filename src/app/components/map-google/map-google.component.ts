/* gabygarro (06/09/17): Esta página, junto con map-google.component y about-us.component
tienen un work around descrito en el issue https://github.com/angular/angular/issues/6595 */

import { Component, OnInit } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { AgmCoreModule } from 'angular2-google-maps/core';

import { MapGoogleService } from './map-google.service';
import { Infrastructure } from '../../common/model/Infrastructure';
import { Asada } from '../../common/model/Asada';
import { SebmGoogleMap } from 'angular2-google-maps/core';
import { AngularFire, FirebaseAuthState } from 'angularfire2/index';
import { UserService } from "app/common/service/user.service";
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Subscription } from "rxjs/Subscription";
import { filterConfig, filterParam } from '../filter/filter.component';
import { locaciones, provincia } from '../../common/service/locations.service';

/*
import Map from 'ol/map';
import Control from 'ol/control';
import View from 'ol/View';
import Proj from 'ol/proj';
import OSM from 'ol/source/OSM.js';
import TileWMS from 'ol/source/TileWMS';
import TileLayer from 'ol/layer/Tile.js';

import XYZ from 'ol/source/XYZ';
*/
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import TileWMS from 'ol/source/TileWMS.js';

import * as ol from 'openlayers';



@Component({
    selector: 'app-map-google',
    templateUrl: './map-google.component.html',
    styleUrls: ['./map-google.component.scss'],
    providers: [MapGoogleService, UserService]
})
export class MapGoogleComponent implements OnInit {

    private allList: Infrastructure[];
    private AsadasList: Asada[];
    private AsadasListTemp: Asada[];

    public AsadaId: string;
    public AsadaUser: string;
    public UserRol: string;
    public loadgraphic: boolean;

    public filterConfiguration: filterConfig;


    public cantidadTanques = 0;
    public cantidadCaptaciones = 0;
    public cantidadCloracion = 0;
    public lastOpen: any;

    constructor(private mapService: MapGoogleService, private af: AngularFire, private userService: UserService, private router: Router, private route: ActivatedRoute) {
        this.allList = [];
        this.AsadasList = [];
        this.AsadasListTemp = [];
        this.infraestructuremarkers = [];
        this.asadasmarkers = [];
    }

    user: FirebaseAuthState;
    public isLoggedIn: boolean;
    hidden = true;

    ngOnInit() {
        this.af.auth.subscribe(user => {
            if (user) {
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
                this.isLoggedIn = false;
                this.getResultAsadasTemp();
            }
        });

        this.generateSnitMap();
    }
    private scroll(id) {
        let el = document.getElementById(id);
        el.scrollIntoView();

    }
    
    generateSnitMap() {

        var WGS84 =  ("EPSG:4326");
        var WGS84_Claro =  ("EPSG:3857");
        var CRTM05 =  ("EPSG:5367");
        
        // WGS84 Google Mercator projection (meters)
        var WGS84_google_mercator =  ("EPSG: 5367");
        var format ="image/png";

        var layers = [
            new TileLayer({
              //source: new OSM()
              

              source: new TileWMS(({
                'url': 'http://geos.snitcr.go.cr/be/IGN_5/wms?',
                params: {'LAYERS': 'limiteprovincial_5k', 'VERSION': '1.1.1',
                    'TILED': true,
                    'FORMAT': format,
                    'TRANSPARENT':false,
                    'SRS': 'EPSG:5367',
                    'gridSet': 'CRTM05'
                }
            }))
            })
          ];
          var map = new Map({
            layers: layers,
            target: 'snitMap',
            view: new View({
              center: [-10997148, 4569099],
              zoom: 4
            })
          });





        /*var map = new OpenLayers.OpenLayers.Map("snitMap");
        map.addLayer(new OpenLayers.OpenLayers.Layer.OSM());
        var lonLat = new OpenLayers.OpenLayers.LonLat( -0.1279688 ,51.5077286 )
        .transform(
          new OpenLayers.OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
          map.getProjectionObject() // to Spherical Mercator Projection
        );
        
            var zoom=16;

            var markers = new OpenLayers.OpenLayers.Layer.Markers( "Markers" );
            map.addLayer(markers);
            
            markers.addMarker(new OpenLayers.OpenLayers.Marker(lonLat));
            
            map.setCenter (lonLat, zoom);*/
/*
        var layers = [
            new TileLayer({
                source: new TileWMS({
                    url: 'http://geos.snitcr.go.cr/be/IGN_1/wms',//'http://geos0.snitcr.go.cr/cgi-bin/web',
                    params: {
                        'LAYERS ': 'indice_1000'
                    }
                })
            })
        ];
        var map = new Map({
            layers: layers,
            target: 'snitMap',
            view: new View({
                center: ol.proj.fromLonLat([-84.139406, 9.999912]),
                zoom: 6
            })
        });*/
    }


    filterNotity(filConf: filterConfig) {
        this.filterConfiguration = filConf;
        this.updateFiltersVisibilty();
    }

    updateFiltersVisibilty() {
        if (this.filterConfiguration) {
            var filtLoc: provincia[] = this.filterConfiguration.locaciones.provincias;
            var filtCat: filterParam[] = this.filterConfiguration.categorias;
            var filtRie: filterParam[] = this.filterConfiguration.riesgos;

            for (let infra of this.infraestructuremarkers) {
                var showInfra = true;
                if (showInfra && filtRie) {
                    for (let param of filtRie) {
                        if (param.value.toLowerCase() == infra.riskLevel.toLowerCase()) {
                            showInfra = param.active;
                            break;
                        }
                    }
                }
                if (showInfra && filtCat) {
                    filtCat.forEach(param => {
                        if (param.value.toLowerCase() == infra.type.toLowerCase()) {
                            showInfra = showInfra && param.active;
                        }
                    });
                }
                infra.visible = showInfra;
            }
            for (let asada of this.asadasmarkers) {
                var showAsada = true;
                var filtLoc: provincia[] = this.filterConfiguration.locaciones.provincias;
                var filtCat: filterParam[] = this.filterConfiguration.categorias;
                if (showAsada && filtCat) {
                    filtCat.forEach(param => {
                        if (param.value.toLowerCase() == "asada") {
                            showAsada = param.active;
                        }
                    });
                }
                if (showAsada && filtLoc) {
                    filtLoc.forEach(prov => {
                        if (prov.name.toLowerCase() == asada.province.toLowerCase()) {
                            showAsada = prov.active;
                            this.getMarckersInfraestructurasAsada(asada).forEach(infra => {
                                if (infra) {
                                    infra.visible = infra.visible && showAsada;
                                }
                            });
                        }
                    });
                }
                asada.visible = showAsada;
            }
        }
    }

    getMarckersInfraestructurasAsada(asada: asadastructure): genericInfraestructure[] {
        var infraAsada: genericInfraestructure[] = [];
        this.infraestructuremarkers.forEach(param => {
            if (param.asada.id == asada.$key) {
                infraAsada.push(param);
            }
        });
        return infraAsada;
    }

    getResultAsadas(): void {
        this.mapService.getASADAS()
            .subscribe(results => {
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
                    this.addInfraestructureMarker();
                    this.getResultAsadas();
                }
            );
    }

    setDetails(elem: asadastructure) {

        if (this.loadgraphic) {
            this.loadgraphic = false;

        }
        else {
            this.loadgraphic = true;
            this.AsadaId = elem.$key;
        }
    }

    cancelModal() {
        this.loadgraphic = false;
    }

    redirectASADA(elem: asadastructure) {
        this.router.navigate(["/asadaDetails/" + elem.$key]);

    }

    redirectInfraestructure(elem: Infrastructure) {
        console.log(elem.type);
        switch (elem.type) {
            case "Tanque": {
                this.router.navigate(["/TanqueDetails//" + elem.$key]);
                break;
            }
            case "CaptacionNaciente": {
                this.router.navigate(["/CaptacionNacienteDetails/" + elem.$key]);
                break;
            }
            case "CaptacionSuperficial": {
                this.router.navigate(["/CaptacionSuperficialDetails/" + elem.$key]);
                break;
            }
            case "Naciente": {
                this.router.navigate(["/CaptacionSuperficialDetails/" + elem.$key]);
                break;
            }
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

    //MAP MARKER SIZE
    private markerSize = 28;

    //VARIABLES
    markerName: string;
    markerLat: string;
    markerLong: string;

    asadasmarkers: asadastructure[];
    infraestructuremarkers: genericInfraestructure[];


    addInfraestructureMarker() {

        for (let entry of this.allList) {

            var iconType = "";
            var isInfraestructure: boolean = false;
            if (entry.type == "Tanque") {
                iconType = "Tanque"
                isInfraestructure = true;
            }
            else {
                if (entry.type == "CaptacionSuperficial" || entry.type == "CaptacionNaciente" || entry.type == "Naciente") {
                    iconType = "Naciente"
                    isInfraestructure = true;
                }
            }
            if (isInfraestructure) {
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
                if (this.isLoggedIn) {

                    if (this.AsadaUser == entry.asada.id || this.UserRol == "Super Administrador") {
                        switch (entry.riskLevel) {
                            case "Nulo": {
                                iconUrl = "../../../assets/icons/" + iconType + "-nulo.png";
                                break;
                            }
                            case "Bajo": {
                                iconUrl = "../../../assets/icons/" + iconType + "-bajo.png";
                                break;
                            }
                            case "Intermedio": {
                                iconUrl = "../../../assets/icons/" + iconType + "-intermedio.png";
                                break;
                            }
                            case "Alto": {
                                iconUrl = "../../../assets/icons/" + iconType + "-alto.png";
                                break;
                            }
                            case "Muy Alto": {
                                iconUrl = "../../../assets/icons/" + iconType + "-muyalto.png";
                                break;
                            }
                            default: {
                                iconUrl = "../../../assets/icons/" + iconType + ".png";
                            }
                        }
                    }
                    else {
                        iconUrl = "../../../assets/icons/" + iconType + "-publico.png";
                    }
                }
                else {
                    iconUrl = "../../../assets/icons/" + iconType + "-publico.png";
                }
                var infraestmarker = {
                    $key: entry.$key,
                    name: entry.name,
                    lat: entry.lat,
                    long: entry.long,
                    iconConfig: {
                        url: iconUrl,
                        scaledSize: {
                            height: this.markerSize,
                            width: this.markerSize
                        }
                    },
                    risk: entry.risk,
                    riskLevel: entry.riskLevel,
                    province: province,
                    phonenumber: phonenumber,
                    type: entry.type,
                    visible: true,
                    asada: {
                        id: entry.asada.id,
                        name: entry.asada.name
                    }
                }
                this.infraestructuremarkers.push(infraestmarker);
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

            if (this.isLoggedIn) {
                if (this.AsadaUser == asadaElement.$key || this.UserRol == "Super Administrador") {
                    iconUrl = "../../../assets/icons/oficina.png";
                }
                else {
                    iconUrl = "../../../assets/icons/oficina.png";
                }
            }
            else {
                iconUrl = "../../../assets/icons/oficina.png";
            }


            var newAsadaMarker = {
                $key: key,
                name: name,
                lat: lat,
                long: long,
                iconConfig: {
                    url: iconUrl,
                    scaledSize: {
                        height: this.markerSize,
                        width: this.markerSize
                    }
                },
                visible: true,
                province: province,
                state: state,
                district: district,
                population: population,
                phonenumber: phonenumber,
                zonetype: zonetype,
                numbersubscribed: numbersubscribed,
                cantTanques: cantTanques,
                cantSuperficial: cantSuperficial,
                cantCloraci: cantCloraci,
                showInfoWindow: false,
                zIndex: 100,
            }

            this.asadasmarkers.push(newAsadaMarker);
        }

    }

    evalCantTanques(asadaid: string) {

        this.cantidadTanques = 0;
        for (let entry of this.allList) {
            if (entry.asada.id == asadaid && entry.type == "Tanque") {
                this.cantidadTanques = this.cantidadTanques + 1;
            }

        }
    }

    evalCantCaptacion(asadaid: string) {

        this.cantidadCaptaciones = 0;
        for (let entry of this.allList) {
            if (entry.asada.id == asadaid && (entry.type == "CaptacionNaciente" || entry.type == "CaptacionSuperficial")) {
                this.cantidadCaptaciones = this.cantidadCaptaciones + 1;
            }

        }
    }

    evalCantSistemasClr(asadaid: string) {

        this.cantidadCloracion = 0;
        for (let entry of this.allList) {
            if (entry.asada.id == asadaid && entry.type == "SistemaCloracion") {
                this.cantidadCloracion = this.cantidadCloracion + 1;
            }

        }
    }
}


interface genericInfraestructure {
    $key?: string;
    name: string;
    lat: number;
    long: number;
    iconConfig: {
        url: string,
        scaledSize: {
            height: number,
            width: number
        }
    };
    visible: boolean;
    province: string;
    //asadaname: string;
    risk: number;
    riskLevel: string;
    phonenumber: string;
    type?: string;
    asada: {
        id: string;
        name: string;
    };
}


interface asadastructure {
    $key: string;
    name: string;
    lat: number;
    long: number;
    iconConfig: {
        url: string,
        scaledSize: {
            height: number,
            width: number
        }
    };
    visible: boolean,
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

