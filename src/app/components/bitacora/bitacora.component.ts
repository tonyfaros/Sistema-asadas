import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';

/*		Model-Entities		*/
import { Infrastructure } from '../../common/model/Infrastructure';
import { SuperficialWater } from '../../common/model/SuperficialWater';
import { Nascent } from '../../common/model/Nascent';
import { Tank } from '../../common/model/Tank';
import { DistributionLine } from '../../common/model/DistributionLine';
import { Chlorination } from '../../common/model/Chlorination';
import { Asada } from '../../common/model/Asada';
import { Historial } from '../../common/model/Historial';

/*		Modules		*/
import { FirebaseApp, AngularFire, FirebaseListObservable } from 'angularfire2';

/*		Services		*/
import { AngularFireService } from 'app/common/service/angularFire.service';
import { SearchService } from 'app/components/search/search.service';
import { UserService } from 'app/common/service/user.service';

@Component({
    selector: 'app-bitacora',
    templateUrl: './bitacora.component.html',
    styleUrls: ['./bitacora.component.scss'],
    providers: [SearchService, UserService, AngularFireService]
})
export class BitacoraComponent implements OnInit {

    private searchFirebase: any;
    private searchFirebase2: any;
    public searchType: string;
    private allList: any[];
    private allInfraList: any[];
    private allIncidentes: any[];
    private allRolAccess: any[];
    public filteredList: any[];
    public asadasList: any[];
    public userAccess;
    public register: any;
    private user;
    public isLoggedIn: boolean;
    public allSelection: boolean;
    private sub: any;
    public storageRef;

    constructor(
        @Inject(FirebaseApp) firebaseApp: any,
        private searchService: SearchService,
        private route: ActivatedRoute,
        private location: Location,
        private router: Router,
        private userService: UserService,
        private af: AngularFire,
        private angularFireService: AngularFireService) { 

        this.storageRef = firebaseApp.storage().ref();
    }

    ngOnInit() {
        this.loadLocalAttributes();
        this.loadUserPermissions();
        this.searchFirebase2 = this.searchService.search('asadas');
        this.searchFirebase2.subscribe(
        results => {
                this.asadasList = results;
        });

        this.getRoles();
        this.getInfras();
        this.getAllIncidentes();
    }

    getInfras() {
        this.searchFirebase = this.searchService.search('infraestructura');
        this.searchFirebase.subscribe(
            results => {
                this.allInfraList = results;
            }
        );
    }

    getAllIncidentes() {
        this.searchFirebase = this.searchService.search('incidentes');
        this.searchFirebase.subscribe(
            results => {
                this.allIncidentes = results;
            }
        );
    }

    ngOnDestroy(): void {
        if (this.sub != null) {
            this.sub.unsubscribe();
        }
        this.filteredList = [];
        this.allList = [];
    }

    loadUserPermissions() {
        this.userAccess = {};
        this.af.auth.subscribe(user => {
            if (user) {
                this.isLoggedIn = true;
                this.userService.getRolAccess(user.uid).subscribe(
                    results => {
                        this.userAccess = results;
                        // this.userAccess.asada
                    }
                );
            }
            this.loadParameters();
        });
    }
    loadLocalAttributes() {
        this.filteredList = [];
        this.allList = [];
        this.allSelection = false;


    }

    private loadParameters() {
        this.filteredList = [];	
        this.searchFirebase = this.searchService.search('bitacora');
        this.searchFirebase.subscribe(
            results => {
                this.filteredList = results;

                for (var i = 0; i < this.filteredList.length; i++) {
            if (this.filteredList[i].dataInfraChlorination == undefined) {
                this.filteredList[i].dataInfraChlorination = [];
            }

            if (this.filteredList[i].dataInfraDistributionLine == undefined) {
                this.filteredList[i].dataInfraDistributionLine = [];
            }

            if (this.filteredList[i].dataInfraNascent == undefined) {
                this.filteredList[i].dataInfraNascent = [];
            }

            if (this.filteredList[i].dataInfraSuperficialWater == undefined) {
                this.filteredList[i].dataInfraSuperficialWater = [];
            }

            if (this.filteredList[i].dataInfraTank == undefined) {
                this.filteredList[i].dataInfraTank = [];
            }

        }
            }
        );

    }

    getRoles() {
        this.searchFirebase = this.searchService.search('rolAccess');
        this.searchFirebase.subscribe(
            results => {
                this.allRolAccess = results;
            }
        );
    }

    uploadRegister(element) {
        this.register = element;
    }

    deleteUserRelations() {

        for(let rolUser of this.allRolAccess) {

            if(rolUser.rol == "Administración" || rolUser.rol == "Fontanero") {
               /* this.af.auth.deleteUser(rolUser.$key)
                    .then(function() {
                        console.log("Successfully deleted user");
                    })
                    .catch(function(error) {
                        console.log("Error deleting user:", error);
                    });*/
                this.userService.deleteUser(rolUser.$key);
            }
        }
    }

    updateSystem(register) {
        this.deleteAllStorage();
        this.angularFireService.deleteAllDB();
        this.deleteUserRelations();
        for (let asada of register.dataAsadas) {

            this.angularFireService.addNewAsada(asada);
            var ultimaAsada = this.asadasList.length - 1;

            for (let infraestructura of register.dataInfraChlorination) {

                if (infraestructura.asada.name == this.asadasList[ultimaAsada].name) {
                    infraestructura.asada.id = this.asadasList[ultimaAsada].$key;
                    infraestructura.tags = 'SistemaCloracion' + ' ' + 'Sistema de cloracion' + ' ' +
                        infraestructura.ubication + ' ' + infraestructura.asada.name + ' '
                        + infraestructura.asada.id;
                    this.angularFireService.addNewInfrastructure(infraestructura);
                }

            }
            for (let infraestructura of register.dataInfraDistributionLine) {

                if (infraestructura.asada.name == this.asadasList[ultimaAsada].name) {
                    infraestructura.asada.id = this.asadasList[ultimaAsada].$key;
                    infraestructura.tags = 'LineaDistribucion' + ' ' + 'Linea de distribucion' + ' ' +
                        infraestructura.ubication + ' ' + infraestructura.asada.name + ' '
                        + infraestructura.asada.id;
                    this.angularFireService.addNewInfrastructure(infraestructura);
                }

            }
            for (let infraestructura of register.dataInfraNascent) {

                if (infraestructura.asada.name == this.asadasList[ultimaAsada].name) {
                    infraestructura.asada.id = this.asadasList[ultimaAsada].$key;
                    infraestructura.tags = 'CaptacionNaciente' + ' ' + 'Captacion de nacientes o manantiales' + ' ' +
                        infraestructura.ubication + ' ' + infraestructura.asada.name + ' '
                        + infraestructura.asada.id;
                    this.angularFireService.addNewInfrastructure(infraestructura);
                }
            }
            for (let infraestructura of register.dataInfraSuperficialWater) {

                if (infraestructura.asada.name == this.asadasList[ultimaAsada].name) {
                    infraestructura.asada.id = this.asadasList[ultimaAsada].$key;
                    infraestructura.tags = 'CaptacionSuperficial' + ' ' + 'Toma de agua superficial' + ' ' +
                        infraestructura.ubication + ' ' + infraestructura.asada.name + ' '
                        + infraestructura.asada.id;
                    this.angularFireService.addNewInfrastructure(infraestructura);
                }
            }
            for (let infraestructura of register.dataInfraTank) {

                if (infraestructura.asada.name == this.asadasList[ultimaAsada].name) {

                    infraestructura.asada.id = this.asadasList[ultimaAsada].$key;
                    infraestructura.tags = 'Tanque' + ' ' + 'Tanques de almacenamiento o quiebra gradiente' + ' ' +
                        infraestructura.ubication + ' ' + infraestructura.asada.name + ' '
                        + infraestructura.asada.id;
                    this.angularFireService.addNewInfrastructure(infraestructura);
                }
            }
        }
    }

    deleteAllStorage() { // Esto se hace debido a que en este momento 11/2/2017 Firebase no puede eliminar una carpeta entera.

        for(let infra of this.allInfraList) {

            for(let img of ((infra.img == undefined) ? [] : infra.img)) {
                this.storageRef.child('infrastructure/'+img.fileName).delete();
            }
        }

        for(let incidente of this.allIncidentes) {

            this.storageRef.child('incidentes/'+incidente.img.fileName).delete();           
        }
    }

    search(element) {
    }
}
