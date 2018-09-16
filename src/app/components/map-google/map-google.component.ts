/* gabygarro (06/09/17): Esta página, junto con map-google.component y about-us.component
tienen un work around descrito en el issue https://github.com/angular/angular/issues/6595 */

import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AgmMap } from '@agm/core';
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
import { filterConfig, filterParam, locaciones, location, provincia, canton, distrito } from '../filter/filter.component';

import * as ol from 'openlayers';


@Component({
    selector: 'app-map-google',
    templateUrl: './map-google.component.html',
    styleUrls: ['./map-google.component.scss'],
    providers: [MapGoogleService, UserService],
    encapsulation: ViewEncapsulation.None,
})

export class MapGoogleComponent implements OnInit {


    //---------------------Atributos Generales
    private allList: Infrastructure[];
    private AsadasList: Asada[];
    private AsadasListTemp: Asada[];

    public AsadaId: string;
    public AsadaUser: string;
    public UserRol: string;
    public loadgraphic: boolean;

    public cantidadTanques = 0;
    public cantidadCaptaciones = 0;
    public cantidadCloracion = 0;
    public lastOpen: any;

    //---------------------Atributos Autenticacion
    private user: FirebaseAuthState;
    public isLoggedIn: boolean;

    //---------------------Atributos generales Mapas
    //START POSITION
    private centerLat: number = 9.852275;
    private centerLng: number = -83.9004535;
    //CURRENT POSITION
    private currentLat: number = this.centerLat;
    private currentLng: number = this.centerLng;
    //ZOOM LEVEL
    private mapZoom: number = 9;
    private mapMinZoom: number = 7;
    private currentZoom: number = this.mapZoom;

    //MAP MARKER SIZE
    private markerSize = 28;

    //MARKERS
    asadasmarkers: asadastructure[];
    infraestructuremarkers: genericInfraestructure[];

    //MAPS ACTIVATIONS TOGGLE
    private googleMapActivation: boolean = false;
    private snitMapActivation: boolean = false;

    //---------------------Atributos Mapas Snit
    private snitMap: ol.Map;
    private markerSource: ol.source.Vector;
    private capaDistrital: ol.layer.Tile;
    private capaCantonal: ol.layer.Tile;
    private capaProvincial: ol.layer.Tile;
    private capaDetalle: ol.layer.Tile;
    private capaOSM: ol.layer.Tile;
    private vectorIcon: ol.layer.Vector;
    private popupOverlay: ol.Overlay;
    private snitMapView: ol.View;

    public snitSelectedElement:any;

    //---------------------Atributos Mapas google
    @ViewChild('googleMap') googleMap: AgmMap;
    private isGoogleMapReady: boolean = false;

    //----------------------Atributos Filtrado de elementos
    public filterConfiguration: filterConfig;


    constructor(private mapService: MapGoogleService, private af: AngularFire, private userService: UserService, private router: Router, private route: ActivatedRoute) {
        this.allList = [];
        this.AsadasList = [];
        this.AsadasListTemp = [];
        this.infraestructuremarkers = [];
        this.asadasmarkers = [];
    }


    ngOnInit() {
        this.googleMapActivation = true;
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
        this.googleMapReady();
        this.generateSnitMap();
        //--------------------------------temporal
        this.activateSnitMap();
        //-----------------------------------
    }

    private scroll(id) {
        let el = document.getElementById(id);
        el.scrollIntoView();
    }

    googleMapReady() {
        if (this.googleMap) {
            this.googleMap.mapReady.subscribe(map => {
                this.isGoogleMapReady = true;
            });
        }
    }

    activateGoogleMap() {
        this.googleMapActivation = true;
        this.snitMapActivation = !this.googleMapActivation;
    }

    activateSnitMap() {
        if (this.googleMapActivation && this.googleMap && this.isGoogleMapReady) {
            this.currentLat = this.googleMap.latitude;
            this.currentLng = this.googleMap.longitude;
            this.currentZoom = this.googleMap.zoom;
            this.updateSnitMapCenter();
        }
        this.snitMapActivation = true;
        this.googleMapActivation = !this.snitMapActivation;
    }

    initSnitMapAssets() {

        this.markerSource = new ol.source.Vector();
        var format = "image/png";

        function markerStyle(feature) {
            var url = feature.get('url');

            var style = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 0.5],
                    scale: 0.33,
                    src: url,
                })
            });

            return style;
        }

        this.vectorIcon = new ol.layer.Vector({
            source: this.markerSource,
            style: markerStyle
        });
        this.capaDistrital = new ol.layer.Tile({
            source: new ol.source.TileWMS(({
                'url': 'http://geos.snitcr.go.cr/be/IGN_5/wms?',
                params: {
                    'LAYERS': 'limitedistrital_5k', 'VERSION': '1.1.1',
                    'TILED': true,
                    'FORMAT': format,
                    'TRANSPARENT': true,
                    'SRS': 'EPSG:5367',
                    'gridSet': 'CRTM05'
                }
            }))
        });
        this.capaCantonal = new ol.layer.Tile({
            source: new ol.source.TileWMS(({
                'url': 'http://geos.snitcr.go.cr/be/IGN_5/wms?',
                params: {
                    'LAYERS': ['limitecantonal_5k'], 'VERSION': '1.1.1',
                    'TILED': true,
                    'FORMAT': format,
                    'TRANSPARENT': true,
                    'SRS': 'EPSG:5367',
                    'gridSet': 'CRTM05'
                }
            }))
        });
        this.capaProvincial = new ol.layer.Tile({
            source: new ol.source.TileWMS(({
                'url': 'http://geos.snitcr.go.cr/be/IGN_5/wms?',
                params: {
                    'LAYERS': 'limiteprovincial_5k', 'VERSION': '1.1.1',
                    'TILED': true,
                    'FORMAT': format,
                    'TRANSPARENT': true,
                    'SRS': 'EPSG:5367',
                    'gridSet': 'CRTM05'
                }
            }))
        });
        this.capaDetalle = new ol.layer.Tile({
            source: new ol.source.TileWMS(({
                'url': 'http://geos.snitcr.go.cr/be/IGN_5/wms?',
                params: {
                    'LAYERS': 'limiteprovincial_5k', 'VERSION': '1.1.1',
                    'TILED': true,
                    'FORMAT': format,
                    'TRANSPARENT': true,
                    'SRS': 'EPSG:5367',
                    'gridSet': 'CRTM05'
                }
            }))
        });
        this.capaOSM = new ol.layer.Tile({
            source: new ol.source.OSM()
        });

        this.snitMapView = new ol.View({
            center: ol.proj.fromLonLat([this.centerLng, this.centerLat]),
            zoom: this.mapZoom,
            minZoom: this.mapMinZoom
        });
        this.clearSnitMarkers();
    }

    generateSnitMap() {
        var scope = this;

        var container: any = document.getElementById('popup');
        var closer = document.getElementById('popup-closer');
        var infoTag = document.getElementById('popup-info');
        var buttonTag = document.getElementById('popup-asadabutton');

        this.popupOverlay = new ol.Overlay({
            element: container,
            autoPan: true,
            positioning: 'top-center',
            //offset: [0, -10],
            stopEvent: false
        });

        closer.onclick = function () {
            scope.popupOverlay.setPosition(undefined);
            closer.blur();
            return false;
        };

        this.initSnitMapAssets()
        var layers = [
            new ol.layer.Group({
                layers: [
                    //capaDistrital,
                    this.capaOSM,
                    this.capaCantonal,
                    this.capaProvincial,
                    this.vectorIcon
                ]
            })]


        this.snitMap = new ol.Map({
            controls: ol.control.defaults().extend([
                new ol.control.ScaleLine({})
            ]),
            target: 'snitMap',
            overlays: [this.popupOverlay],
            layers: layers,
            view: this.snitMapView

        });

        var genericMap: any = this.snitMap;
        genericMap.on('singleclick', function (evt) {
            scope.snitSelectedElement=undefined;
            var feature = genericMap.forEachFeatureAtPixel(
                evt.pixel,
                function (ft, layer) { return ft; }
            );
            if (feature) {
                var element = feature.get('element');
                try {
                    scope.snitSelectedElement=element;
                    if (element && element.type) {
                        scope.popupOverlay.setPosition(ol.proj.fromLonLat([element.long, element.lat]));
                    }
                    else{
                        scope.popupOverlay.setPosition(undefined);
                    }
                } catch (ex) { alert(ex);scope.popupOverlay.setPosition(undefined); }
            }
            else {
                scope.popupOverlay.setPosition(undefined);
            }
        });

        this.snitMapView.on('change', function (e) {
            var zoom: number = scope.snitMapView.getZoom();
            var pos: [number, number] = ol.proj.toLonLat(scope.snitMapView.getCenter());
            scope.currentLng = pos[0];
            scope.currentLat = pos[1];
            scope.currentZoom = zoom;
        });

    }
    fillSnitPopup(elm) {
        try {
            if (elm && elm.type) {
                this.popupOverlay.setPosition(ol.proj.fromLonLat([elm.long, elm.lat]));
            }
            else{
                this.popupOverlay.setPosition(undefined);
            }
        } catch (ex) { alert(ex);this.popupOverlay.setPosition(undefined); }
    }

    updateSnitMapCenter() {
        if (this.snitMapView) {
            this.snitMapView.setCenter(ol.proj.fromLonLat([this.currentLng, this.currentLat]));
            this.snitMapView.setZoom(this.currentZoom);
        }
    }

    updateSnitMarkers() {
        this.clearSnitMarkers();
        this.addInfraSnitMarkers();
        this.addAsadaSnitMarkers();
    }
    clearSnitMarkers() {
        this.markerSource.clear();
        this.markerSource.refresh();
    }

    addInfraSnitMarkers() {
        this.infraestructuremarkers.forEach(element => {
            if (element.visible) {
                var iconFeature = this.createFeature(element.iconConfig.url, element.name, [element.long, element.lat], element);
                this.markerSource.addFeature(iconFeature);
            }
        });

    }

    addAsadaSnitMarkers() {
        this.asadasmarkers.forEach(element => {
            if (element.visible) {
                var iconFeature = this.createFeature(element.iconConfig.url, element.name, [element.long, element.lat], element);
                this.markerSource.addFeature(iconFeature);
            }
        });

    }

    createFeature(url: string, name: string, lngLatCoords: [number, number], element?: any): ol.Feature {
        var iconFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.transform(lngLatCoords, 'EPSG:4326',
                'EPSG:3857')),
            name: name,

        });
        iconFeature.set('url', url);
        if (element) {
            iconFeature.set('element', element);
        }
        return iconFeature;
    }

    filterNotify(filConf: filterConfig) {
        this.filterConfiguration = filConf;
        this.updateFiltersVisibilty();
        this.updateSnitMarkers();
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
                            showAsada = showAsada && prov.active;
                            prov.cantones.forEach(cant => {
                                if (cant.name.toLowerCase() == asada.state.toLowerCase()) {
                                    showAsada = showAsada && cant.active;
                                    cant.distritos.forEach(dist => {
                                        if (dist.name.toLowerCase() == asada.district.toLowerCase()) {
                                            showAsada = showAsada && dist.active;
                                        }
                                    });
                                }
                            });
                        }
                    });
                    this.getMarkersInfraestructurasAsada(asada).forEach(infra => {
                        if (infra) {
                            infra.visible = infra.visible && showAsada;
                        }
                    });
                }
                asada.visible = showAsada;
            }
        }

    }

    getMarkersInfraestructurasAsada(asada: asadastructure): genericInfraestructure[] {
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
                this.updateSnitMarkers();
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
                    this.updateSnitMarkers();
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
        switch (elem.type.toLowerCase()) {
            case "tanque": {
                this.router.navigate(["/TanqueDetails//" + elem.$key]);
                break;
            }
            case "captacionnaciente": {
                this.router.navigate(["/CaptacionNacienteDetails/" + elem.$key]);
                break;
            }
            case "captacionsuperficial": {
                this.router.navigate(["/CaptacionSuperficialDetails/" + elem.$key]);
                break;
            }
            case "naciente": {
                this.router.navigate(["/CaptacionSuperficialDetails/" + elem.$key]);
                break;
            }
        }
    }

    private visible: boolean = true;

    markerClick() {
        this.visible = !this.visible;
    }

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
                        },
                        anchor: { x: this.markerSize / 2, y: this.markerSize / 2 },
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
                    },
                    anchor: { x: this.markerSize / 2, y: this.markerSize / 2 },
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
                type:'Asada'
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
    type:string;
}

