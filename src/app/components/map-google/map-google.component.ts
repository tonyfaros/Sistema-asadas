/* gabygarro (06/09/17): Esta página, junto con map-google.component y about-us.component
tienen un work around descrito en el issue https://github.com/angular/angular/issues/6595 */

import { Component, OnInit, ViewChild, ViewEncapsulation, group } from '@angular/core';
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
import { filterConfig, filterParam,LocationsService, locaciones, location, provincia, canton, distrito } from '../filter/filter.component';

import * as ol from 'openlayers';


@Component({
    selector: 'app-map-google',
    templateUrl: './map-google.component.html',
    styleUrls: ['./map-google.component.scss'],
    providers: [MapGoogleService, UserService,LocationsService]//,
    // encapsulation: ViewEncapsulation.None,
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

    // public cantidadTanques = 0;
    // public cantidadCaptaciones = 0;
    // public cantidadCloracion = 0;
    public lastOpen: any;

    //---------------------Atributos Autenticacion
    private user: FirebaseAuthState;
    public isLoggedIn: boolean;

    //---------------------Atributos generales Mapas
    //START POSITION
    public centerLat: number = 9.852275;
    public centerLng: number = -83.9004535;
    //CURRENT POSITION
    public currentLat: number = this.centerLat;
    public currentLng: number = this.centerLng;
    //ZOOM LEVEL
    public mapZoom: number = 9;
    public mapMinZoom: number = 7;
    public currentZoom: number = this.mapZoom;

    //MAP MARKER SIZE
    private markerSize = 28;

    //MARKERS
    asadasmarkers: asadastructure[];
    infraestructuremarkers: genericInfraestructure[];

    //MAPS ACTIVATIONS TOGGLE
    public googleMapActivation: boolean = false;
    public snitMapActivation: boolean = false;
    public dataLoaded: boolean = false;

    //---------------------Atributos Mapas Snit
    private snitMap: ol.Map;
    private markerSource: ol.source.Vector;

    private capaDistrital: snitMapLayer;
    private capaCantonal: snitMapLayer;
    private capaProvincial: snitMapLayer;
    private capaDetalle: snitMapLayer;
    private capaUrbana: snitMapLayer;
    private capaOSM: snitMapLayer;

    public layersGroupList: snitMapLayerGroup[];

    private vectorIcon: ol.layer.Vector;
    private popupOverlay: ol.Overlay;
    private snitMapView: ol.View;

    public snitSelectedElement: any;

    private layerData: any = {
        'capaDistrital': {
            'url': 'http://geos.snitcr.go.cr/be/IGN_5/wms?',
            params: {
                'LAYERS': 'limitedistrital_5k', 'VERSION': '1.1.1',
                'TILED': true,
                'FORMAT': 'image/png',
                'TRANSPARENT': true,
            }
        },
        'capaCantonal': {
            'url': 'http://geos.snitcr.go.cr/be/IGN_5/wms?',
            params: {
                'LAYERS': ['limitecantonal_5k'], 'VERSION': '1.1.1',
                'TILED': true,
                'FORMAT': 'image/png',
                'TRANSPARENT': true,
            }
        },
        'capaProvincial': {
            'url': 'http://geos.snitcr.go.cr/be/IGN_5/wms?',
            params: {
                'LAYERS': 'limiteprovincial_5k', 'VERSION': '1.1.1',
                'TILED': true,
                'FORMAT': 'image/png',
                'TRANSPARENT': true,
            }
        },
        'capaDetalle': {
            url: 'http://geos0.snitcr.go.cr/cgi-bin/web?map=hojas50.map&SERVICE=WMS&version=1.1.1&request=GetCapabilities',
            params: {
                'LAYERS': 'hojas_50', 'TILED': true,
            },
            serverType: 'geoserver',
            transition: 0
        },
        'capaUrbana': {
            url: 'http://geos.snitcr.go.cr/be/IGN_5/wms?',
            params: { 'LAYERS': 'urbano_5000', 'TILED': true },
            serverType: 'geoserver',
            transition: 0
        }
    };

    //---------------------Atributos Mapas google
    @ViewChild('googleMap') googleMap: AgmMap;
    private isGoogleMapReady: boolean = false;

    //----------------------Atributos Filtrado de elementos
    public filterConfiguration: filterConfig;

    constructor(private mapService: MapGoogleService, private af: AngularFire, private userService: UserService, private router: Router, private route: ActivatedRoute,private locationService:LocationsService) {
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
        this.googleOnMapReady();
        this.generateSnitMap();
        this.updateLocalStorageInfo();
        //--------------------------------temporal
        //this.activateSnitMap();
        //-----------------------------------
    }
    updateLocalStorageInfo() {
        var initialMap = localStorage["initialMap"];
        switch (initialMap) {
            case 'snitMap': {
                this.activateSnitMap(); break
            }
            case 'googleMap': {
                this.activateGoogleMap(); break
            }
            default:{
                localStorage["initialMap"] = 'googleMap';break;
            }
        }
    }

    googleOnMapReady() {
        if (this.googleMap) {
            this.googleMap.mapReady.subscribe(map => {
                this.isGoogleMapReady = true;
            });
        }
    } 

    activateGoogleMap() {
        localStorage["initialMap"]='googleMap';
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
        localStorage["initialMap"]='snitMap';
        this.snitMapActivation = true;
        this.googleMapActivation = !this.snitMapActivation;
    }

    initSnitMapAssets() {
        var scope = this;
        this.markerSource = new ol.source.Vector();

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

        var container: any = document.getElementById('popup');
        var closer = document.getElementById('popup-closer');
        closer.onclick = function () {
            scope.popupOverlay.setPosition(undefined);
            closer.blur();
            return false;
        };
        this.popupOverlay = new ol.Overlay({
            element: container,
            autoPan: true,
            autoPanMargin:20,
            positioning: 'top-center'
        });

        this.capaDistrital = {
            keyName: 'capaDistrital',
            name: 'Capa Distrital',
            active: false,
            description: 'Capa de división distrital',
            layer: undefined
        };
        this.capaCantonal = {
            keyName: 'capaCantonal',
            name: 'Capa Cantonal',
            active: true,
            description: 'Capa de división cantonal',
            layer: undefined
        };
        this.capaProvincial = {
            keyName: 'capaProvincial',
            name: 'Capa Provincial',
            active: true,
            description: 'Capa de división provincial',
            layer: undefined
        };
        this.capaDetalle = {
            keyName: 'capaDetalle',
            name: 'Capa de detalle',
            active: false,
            description: 'Capa de Mosaicos Topográficos',
            layer: undefined
        };
        this.capaUrbana = {
            keyName: 'capaUrbana',
            name: 'Capa Urbana',
            active: true,
            description: 'Capa de detalle urbano',
            layer: undefined
        };
        this.capaOSM = {
            keyName: 'capaOSM',
            name: 'Capa Urbana',
            active: true,
            description: 'Capa de detalle urbano',
            layer: undefined
        };
        this.initLayer(this.capaDistrital);
        this.initLayer(this.capaCantonal);
        this.initLayer(this.capaProvincial);
        this.initLayer(this.capaDetalle);
        this.initLayer(this.capaUrbana);
        this.initLayer(this.capaOSM);

        this.layersGroupList = [
            { keyName: "grupoDetalle", name: "Capa Detalle", active: this.capaDetalle.active, layers: [this.capaDetalle] },
            { keyName: "grupoBase", name: "Capa Base", active: true, layers: [this.capaOSM, this.capaUrbana] },
            { keyName: "grupoDistrital", name: "Capa Distrital", active: this.capaDistrital.active, layers: [this.capaDistrital] },
            { keyName: "grupoCantonal", name: "Capa Cantonal", active: this.capaCantonal.active, layers: [this.capaCantonal] },
            { keyName: "grupoProvincial", name: "Capa Provincial", active: this.capaProvincial.active, layers: [this.capaProvincial] }
        ];
        this.snitMapView = new ol.View({
            projection: 'EPSG:4326',
            center: [this.currentLng, this.currentLat],
            zoom: this.currentZoom,
            minZoom: this.mapMinZoom
        });

        this.clearSnitMarkers();
    }

    initLayer(layer: snitMapLayer) {
        try {
            if (layer && !layer.layer) {
                var source = this.layerData[layer.keyName];
                if (layer.keyName == "capaOSM") {
                    layer.layer = new ol.layer.Tile({
                        source: new ol.source.OSM()
                    }); return;
                }
                if (source) {
                    layer.layer = new ol.layer.Tile({
                        source: new ol.source.TileWMS(source)
                    });
                }
                layer.layer.setVisible(layer.active);
            }
        } catch (ex) { console.log("error0--->" + ex) }
    }
    generateSnitMap() {
        var scope = this;

        this.initSnitMapAssets()
        var layers = [];
        try {
            this.layersGroupList.forEach(group => {
                group.layers.forEach(layer => {
                    if (layer.layer) {
                        layers.push(layer.layer)
                    }
                });
            });

        } catch (ex) { console.log("error1--->" + ex) }

        layers.push(this.vectorIcon);

        try {
            this.snitMap = new ol.Map({
                controls: ol.control.defaults().extend([
                    new ol.control.ScaleLine({ units: 'metric' })
                ]),
                target: 'snitMap',
                overlays: [this.popupOverlay],
                layers: layers,
                view: this.snitMapView

            });
        } catch (ex) { console.log("error2--->" + ex) }

        var genericMap: any = this.snitMap;
        genericMap.on('singleclick', function (evt) {
            scope.snitSelectedElement = undefined;
            var feature = genericMap.forEachFeatureAtPixel(
                evt.pixel,
                function (ft, layer) { return ft; }
            );
            if (feature) {
                var element = feature.get('element');
                try {
                    scope.snitSelectedElement = element;
                    scope.openSnitElementPopUp(element)
                } catch (ex) { alert(ex); scope.popupOverlay.setPosition(undefined); }
            }
            else {
                scope.popupOverlay.setPosition(undefined);
            }
        });

        this.snitMapView.on('change', function (e) {
            var zoom: number = scope.snitMapView.getZoom();
            var pos: [number, number] = scope.snitMapView.getCenter();
            scope.currentLng = pos[0];
            scope.currentLat = pos[1];
            scope.currentZoom = zoom;
        });

    }
    toggleLayerGroup(event, group: snitMapLayerGroup) {
        var active: boolean = event.target.checked
        if (group) {
            group.active = active;
            group.layers.forEach(layer => {
                if (layer.layer) {
                    layer.active = group.active;
                    layer.layer.setVisible(layer.active);
                }
            });
        }
    }

    fillSnitPopup(elm) {
        try {
            if (elm && elm.type) {
                this.popupOverlay.setPosition([this.currentLng, this.currentLat]);//ol.proj.fromLonLat([elm.long, elm.lat]));
            }
            else {
                this.popupOverlay.setPosition(undefined);
            }
        } catch (ex) { alert(ex); this.popupOverlay.setPosition(undefined); }
    }

    centerMapOnMarker(element: any) {
        if (element) {
            this.currentLng = element.long;
            this.currentLat = element.lat;
        }
        this.updateSnitMapCenter();
    }

    updateSnitMapCenter() {
        if (this.snitMapView) {
            this.snitMapView.setCenter([this.currentLng, this.currentLat]),//ol.proj.fromLonLat([this.currentLng, this.currentLat]));
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
            geometry: new ol.geom.Point(lngLatCoords),//ol.proj.transform(lngLatCoords, 'EPSG:4326',
            //'EPSG:3857')),
            name: name,

        });
        iconFeature.set('url', url);
        if (element) {
            iconFeature.set('element', element);
        }
        return iconFeature;
    }

    openSnitElementPopUp(element: any) {
        this.snitSelectedElement = element;

        if (this.popupOverlay && element && element.type) {
            this.popupOverlay.setPosition([element.long, element.lat]);//ol.proj.fromLonLat([element.long, element.lat]));
        }
        else {
            this.popupOverlay.setPosition(undefined);
        }
    }

    showInfoWindow(asada: any) {
        asada.showInfoWindow = true
        this.openSnitElementPopUp(asada);
        this.centerMapOnMarker(asada);
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
                        if((!infra.riskLevel && (param.value.toLowerCase() == "noinfo")) ||
                            (infra.riskLevel && (param.value.toLowerCase() == infra.riskLevel.toLowerCase()))
                        ){
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
                if (showAsada && filtLoc) {
                    filtLoc.forEach(prov => {
                        if (prov.key == asada.location.province.code) {
                            showAsada = prov.active;
                            prov.cantones.forEach(cant => {
                                if (cant.key == asada.location.canton.code) {
                                    showAsada = showAsada && cant.active;
                                    cant.distritos.forEach(dist => {
                                        if (dist.key == asada.location.district.code) {
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
                if (showAsada && filtCat) {
                    filtCat.forEach(param => {
                        if (param.value.toLowerCase() == "asada") {
                            showAsada = param.active;
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
                    this.dataLoaded = true;
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

    scrollTop() {
        var cosParameter = window.scrollY / 2,
            scrollCount = 0,
            oldTimestamp = performance.now();
        function step(newTimestamp) {
            scrollCount += Math.PI / (500 / (newTimestamp - oldTimestamp));
            if (scrollCount >= Math.PI) window.scrollTo(0, 0);
            if (window.scrollY === 0) return;
            window.scrollTo(0, Math.round(cosParameter + cosParameter * Math.cos(scrollCount)));
            oldTimestamp = newTimestamp;
            window.requestAnimationFrame(step);
        }
        window.requestAnimationFrame(step);
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

                        province = asadaElement.location.province.name;
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
            var iconUrl = "";
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
            var newAsadaMarker:asadastructure = {
                $key: asadaElement.$key,
                name: asadaElement.name,
                lat: asadaElement.office.lat,
                long: asadaElement.office.long,
                iconConfig: {
                    url: iconUrl,
                    scaledSize: {
                        height: this.markerSize,
                        width: this.markerSize
                    },
                    anchor: { x: this.markerSize / 2, y: this.markerSize / 2 },
                },
                visible: true,
                
                location:asadaElement.location,
                population: asadaElement.population,
                phonenumber: asadaElement.phoneNumber,
                zonetype: asadaElement.zoneType,
                numbersubscribed: asadaElement.numberSubscribed,
                cantTanques: this.evalCantTanques(asadaElement.$key),
                cantSuperficial: this.evalCantCaptacion(asadaElement.$key),
                cantCloracion: this.evalCantSistemasClr(asadaElement.$key),
                showInfoWindow: false,
                zIndex: 100,
                type: 'Asada'
            }
            
            this.asadasmarkers.push(newAsadaMarker);
        }
    }

    evalCantTanques(asadaid: string) {
        var list = this.allList.filter(element =>
            (element.asada.id == asadaid && element.type == "Tanque"));
        return list.length;
    }

    evalCantCaptacion(asadaid: string) {

        var list = this.allList.filter(element =>
            (element.asada.id == asadaid && (element.type == "CaptacionNaciente" || element.type == "CaptacionSuperficial")));
        return list.length;
    }

    evalCantSistemasClr(asadaid: string) {
        var list = this.allList.filter(element =>
            (element.asada.id == asadaid && element.type == "SistemaCloracion"));
        return list.length;
    }
}
interface snitMapLayerGroup {
    keyName: string,
    name: string,
    active: boolean,
    description?: string,
    layers: snitMapLayer[];
}
interface snitMapLayer {
    keyName: string,
    name: string,
    active: boolean,
    description?: string,
    layer: ol.layer.Tile;
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
        },
        anchor:{x:any,y:any}
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
        },
        anchor:{x:any,y:any}
    };
    visible: boolean,
    location:{
        province: {code:number,name:string};
        canton:  {code:number,name:string};
        district:  {code:number,name:string};
        address: string;
    }
    population: number;
    phonenumber: string;
    //email: string;
    zonetype: string;
    numbersubscribed: number;
    cantTanques: number;
    cantSuperficial: number;
    cantCloracion: number;
    showInfoWindow: boolean;
    type: string;
    zIndex:number;
}

