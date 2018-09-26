import { Component, OnInit, OnDestroy, Inject, Input } from '@angular/core';
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
import { PapaParseService } from 'ngx-papaparse';

/*		Services		*/
import { AngularFireService } from 'app/common/service/angularFire.service';
import { ExportService } from "app/common/service/export.service";
import { UserService } from "app/common/service/user.service";
import { SearchService } from './search.service';
import { filterConfig, filterParam,LocationsService, locaciones, location, provincia, canton, distrito } from '../filter/filter.component';


@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	providers: [SearchService, ExportService, UserService, AngularFireService,LocationsService]
})
export class SearchComponent implements OnInit, OnDestroy {
	@Input() type: string;
	@Input() sort: string;

	private sub: any;
	private searchFirebase: any;
	public searchType: string;
	private allList: any[];
	private allAsadas: any[];
	private allIncidentes: any[];
	private allInfraList: any[];
	private allRolAccess: any[];
	private allUsuarios: any[];
	public filteredList: any[];
	public selectedResult: any;
	public allSelection: boolean;
	public selections: number;
	public userAccess;
	private user;
	private optionsAllowed: boolean;
	public isLoggedIn: boolean;
	private inputFile: File;
	private parsedResults: any;
	public selectedItem: any;
	public uploadInfraestructuraElement: any;
	public storageRef;

	public filterConfiguration: filterConfig;

	//public paging = [2, 3, 4, 5];

	constructor(
		@Inject(FirebaseApp) firebaseApp: any,
		private searchService: SearchService,
		private route: ActivatedRoute,
		private location: Location,
		private router: Router,
		private userService: UserService,
		private exportService: ExportService,
		private af: AngularFire,
		private angularFireService: AngularFireService,
		private papa: PapaParseService,
		private locationService:LocationsService) {

		this.storageRef = firebaseApp.storage().ref();

	}

	ngOnInit(): void {
		this.loadLocalAttributes();
		this.loadUserPermissions();

	}
	loadUserPermissions() {
		this.userAccess = {};
		this.af.auth.subscribe(user => {
			if (user) {
				this.isLoggedIn = true;
				this.userService.getRolAccess(user.uid).subscribe(
					results => {
						this.userAccess = results;
						//this.userAccess.asada
					}
				)
			}
			this.loadParameters();
		});
	}


	loadLocalAttributes() {
		this.filteredList = [];
		this.allList = [];
		this.allAsadas=[];
		this.allSelection = false;

	}
	private loadParameters() {
		if (this.type != null) {
			this.searchType = this.type;
			this.getResult(this.searchType);
		} else {
			this.sub = this.route.params.subscribe((params: Params) => {
				this.loadLocalAttributes();
				this.searchType = params['id'];
				this.getResult(this.searchType);
			});
		}

	}
	selectAll(): void {
		this.filteredList.forEach(element => {
			element.isActive = this.allSelection && element.allowedToEdit == true;
		});
	}

	ngOnDestroy(): void {
		if (this.sub != null)
			this.sub.unsubscribe();
		this.filteredList = [];
		this.allList = [];
	}

	onSelect(elem: any): void {
		this.selectedResult = elem;
	}
	modifyInfo(elem: any): void {
		this.router.navigate(['/' + elem.type + 'Details', elem.$key, 'edit']);
	}
	evaluate(elem: any): void {
		this.router.navigate(['/evalSERSA', elem.type, elem.$key]);
	}
	openDetails(elem: any) {

		this.router.navigate(['/' + elem.type + 'Details', elem.$key]);
		this.selectedItem = elem.$key;

	}

	filterNotity(filConf: filterConfig) {
		this.filterConfiguration = filConf;
		this.updateFiltersVisibilty();
	}

	updateFiltersVisibilty() {
		var filteredListTemp: any[] = [];

		if (this.filterConfiguration) {
			var filtLoc: provincia[] = this.filterConfiguration.locaciones.provincias;
			var filtCat: filterParam[] = this.filterConfiguration.categorias;
			var filtRie: filterParam[] = this.filterConfiguration.riesgos;

			for (let element of this.filteredList) {
				var showElement = true;
				var asada: any;//Funciona como pivot para realizar el filtro de busqueda por locacion
				if (element && this.searchType == 'infraestructura' && element.type != 'asada') {
					if (showElement && filtRie) {
						for (let param of filtRie) {
							if (element.riskLevel && param.value.toLowerCase() == element.riskLevel.toLowerCase()) {
								showElement = param.active;
								break;
							}
						}
					}
					if (showElement && filtCat) {
						filtCat.forEach(param => {
							if ((element.type && param.value.toLowerCase() == element.type.toLowerCase())) {
								showElement = showElement && param.active;
							}
						});
					}
					asada = this.findAsada(element.asada.id);
				} else {// no es infraestructura
					asada = element;
				}

				if (showElement && asada && filtLoc) {
					filtLoc.forEach(prov => {
						if (prov.name.toLowerCase() == asada.locacion.province.toLowerCase()) {
							showElement = showElement && prov.active;
							prov.cantones.forEach(cant => {
								if (cant.name.toLowerCase() == asada.district.toLowerCase()) {
									showElement = showElement && cant.active;
									cant.distritos.forEach(dist => {
										if (dist.name.toLowerCase() == asada.subDistrict.toLowerCase()) {
											showElement = showElement && dist.active;
										}
									});
								}
							});
						}
					});
				}
				if (showElement) {
					filteredListTemp.push(element);
				}
			}
			this.filteredList = filteredListTemp;
			// if(this.filteredList.length<75){
			// 	console.log(this.filteredList);
			// 	console.log(filtCat);
			// 	console.log(filtRie);
			// }
		}

	}
	findInfraestructurasFromAsada(id): any[] {
		var infraAsada: any[] = [];
		this.allList.forEach(element => {
			if (element.type != 'asada' && element.asada.id == id) {
				infraAsada.push(element);
			}
		});
		return infraAsada;
	}

	findAsada(id) {
		var element:any;
		for(let asada of this.allAsadas){
			if (asada.type && asada.type == 'asada' && asada.$key == id) {
				element= asada;
				break;
			}
		}
		return element;
	}


	getResult(searchType: string): void {
		this.allList = this.filteredList = [];
		
		this.searchFirebase = this.searchService.search('asadas');
		this.searchFirebase.subscribe(
			results => {
				this.allAsadas=results;
				console.log("------->asadas  ");
				console.log(this.allAsadas);
			}
		);

		this.searchFirebase = this.searchService.search(searchType);
		this.searchFirebase.subscribe(
			results => {
				this.allList = this.filteredList = results;
				
				if (this.sort != null) {
					this.search(this.sort);
				}
				this.setOptions(this.filteredList);
				console.log("------->infraes  ");
				console.log(this.allList);

			}
		);

		this.getInfras();
		this.getRoles();
		this.getAllUsers();
		this.getAllIncidentes();
	}
	IsAsadaPermission() {

	}

	// Creo un objeto Agua Superficial y lo agrego a la lista si no esta vacia.
	pushSuperficialWaterToList(res, index, tipo, risksNames, superficialWatersList) {

		var Obj = {
			tags: "CaptacionSuperficial" + " " + tipo + " " +
				res[index + 1] + " " + this.selectedItem.name + " "
				+ this.selectedItem.id,
			name: res[index + 1],
			risk: 0,
			mainImg:undefined,
			img: [],
			type: "CaptacionSuperficial",
			asada: {
				name: this.selectedItem.name,
				id: this.selectedItem.id
			},
			lat: Number(res[index + 17]),
			long: Number(res[index + 16]),
			details: {
				aqueductName: res[index + 1],
				aqueductInCharge: "",
				inCharge: "",
				registerMINAE: res[index + 2],
				registerARS: res[index + 3],
				cleaningFrec: res[index + 4],
				otherCleaning: ""
			},
			//New data by Luis
			riskNames: [risksNames[index + 5], risksNames[index + 6], risksNames[index + 7], risksNames[index + 8],
			risksNames[index + 9], risksNames[index + 10], risksNames[index + 11], risksNames[index + 12], risksNames[index + 13],
			risksNames[index + 14]],
			riskValues: [res[index + 5], res[index + 6], res[index + 7], res[index + 8],
			res[index + 9], res[index + 10], res[index + 11], res[index + 12], res[index + 13],
			res[index + 14]],
			siNumber: res[index + 15],
			riskLevel: res[index + 18],
			dateCreated: res[index]
		};

		if (res[index] == "" && res[index + 1] == "" && res[index + 2] == "" && res[index + 3] == "" &&
			res[index + 4] == "" && res[index + 5] == "" && res[index + 6] == "" && res[index + 7] == "" &&
			res[index + 8] == "" && res[index + 8] == "" && res[index + 10] == "" && res[index + 11] == "" &&
			res[index + 12] == "" && res[index + 13] == "" && res[index + 14] == "" && res[index + 16] == ""
			&& res[index + 17] == "" && res[index + 18] == "") {
			return superficialWatersList;
		}
		else {
			superficialWatersList.push(<SuperficialWater>Obj);
			return superficialWatersList;
		}
	}

	// Creo un objeto Nacientes y lo agrego a la lista si no esta vacío.
	pushNascentToList(res, index, tipo, risksNames, nascentWatersList) {
		var Obj = {
			tags: "CaptacionNaciente" + " " + tipo + " " +
				res[index] + " " + this.selectedItem.name + " "
				+ this.selectedItem.id,
			name: res[index],
			risk: 0,
			img: [],
			type: "CaptacionNaciente",
			asada: {
				name: this.selectedItem.name,
				id: this.selectedItem.id
			},
			lat: Number(res[index + 16]),
			long: Number(res[index + 15]),
			details: {
				aqueductName: res[index],
				aqueductInCharge: "",
				inCharge: "",
				registerMINAE: res[index + 1],
				nascentType: res[index + 3],
				registerARS: res[index + 2]
			},
			//New data by Luis
			riskNames: [risksNames[index + 4], risksNames[index + 5], risksNames[index + 6], risksNames[index + 7],
			risksNames[index + 8], risksNames[index + 9], risksNames[index + 10], risksNames[index + 11], risksNames[index + 12],
			risksNames[index + 13]],
			riskValues: [res[index + 4], res[index + 5], res[index + 6], res[index + 7],
			res[index + 8], res[index + 9], res[index + 10], res[index + 11], res[index + 12],
			res[index + 13]],
			siNumber: res[index + 14],
			riskLevel: res[index + 17],
			dateCreated: ""
		};

		if (res[index] == "" && res[index + 1] == "" && res[index + 2] == "" && res[index + 3] == "" &&
			res[index + 4] == "" && res[index + 5] == "" && res[index + 6] == "" && res[index + 7] == "" &&
			res[index + 8] == "" && res[index + 8] == "" && res[index + 10] == "" && res[index + 11] == "" &&
			res[index + 12] == "" && res[index + 13] == "" && res[index + 15] == "" && res[index + 16] == ""
			&& res[index + 17] == "") {

			return nascentWatersList;
		}
		else {

			nascentWatersList.push(<Nascent>Obj);
			return nascentWatersList;
		}
	}

	// Creo un objeto Tanque y lo agrego a la lista si no esta vac�o.
	pushTankToList(res, index, tipo, risksNames, tankList) {
		var Obj = {
			tags: "Tanque" + " " + tipo + " " +
				res[index] + " " + this.selectedItem.name + " "
				+ this.selectedItem.id,
			name: res[index],
			risk: 0,
			img: [],
			type: "Tanque",
			asada: {
				name: this.selectedItem.name,
				id: this.selectedItem.id
			},
			lat: Number(res[index + 17]),
			long: Number(res[index + 16]),
			details: {
				aqueductName: res[index],
				cleaning: res[index + 3],
				inCharge: "",
				material: res[index + 2],
				registerNo: "",
				tankType: res[index + 1],
				direction: res[index + 16],
				volume: {
					amount: 0,
					unit: ""
				},
				creationDate: {
					day: 1,
					month: 1,
					year: 1971
				}
			},
			riskNames: [risksNames[index + 4], risksNames[index + 5], risksNames[index + 6], risksNames[index + 7],
			risksNames[index + 8], risksNames[index + 9], risksNames[index + 10], risksNames[index + 11], risksNames[index + 12],
			risksNames[index + 13]],
			riskValues: [res[index + 4], res[index + 5], res[index + 6], res[index + 7],
			res[index + 8], res[index + 9], res[index + 10], res[index + 11], res[index + 12], res[index + 13]],
			siNumber: res[index + 14],
			riskLevel: res[index + 15],
			sector: res[index + 18],
			dateCreated: ""
		};

		if (res[index] == "" && res[index + 1] == "" && res[index + 2] == "" && res[index + 3] == "" &&
			res[index + 4] == "" && res[index + 5] == "" && res[index + 6] == "" && res[index + 7] == "" &&
			res[index + 8] == "" && res[index + 8] == "" && res[index + 10] == "" && res[index + 11] == "" &&
			res[index + 12] == "" && res[index + 13] == "" && res[index + 15] == "" && res[index + 16] == "" &&
			res[index + 17] == "" && res[index + 18] == "") {

			return tankList;
		}
		else {

			tankList.push(<Tank>Obj);
			return tankList;
		}
	}

	// Creo un objeto Tanque Quiebra gradiente y lo agrego a la lista si no esta vac�o.
	pushTankQGToList(res, index, tipo, risksNames, tankList) {
		var Obj = {
			tags: "TanqueQG" + " " + tipo + " " +
				res[index] + " " + this.selectedItem.name + " "
				+ this.selectedItem.id,
			name: res[index],
			risk: 0,
			mainImg:undefined,
			img: [],
			type: "TanqueQG",
			asada: {
				name: this.selectedItem.name,
				id: this.selectedItem.id
			},
			lat: Number(res[index + 15]),
			long: Number(res[index + 14]),
			details: {
				aqueductName: res[index],
				cleaning: res[index + 2],
				inCharge: "",
				material: res[index + 1],
				registerNo: "",
				tankType: "",
				direction: "",
				volume: {
					amount: 0,
					unit: ""
				},
				creationDate: {
					day: 1,
					month: 1,
					year: 1971
				}
			},
			//New data by Luis
			cleaningFrec: res[index + 2],
			riskNames: [risksNames[index + 3], risksNames[index + 4], risksNames[index + 5], risksNames[index + 6],
			risksNames[index + 7], risksNames[index + 8], risksNames[index + 9], risksNames[index + 10], risksNames[index + 11],
			risksNames[index + 12]],
			riskValues: [res[index + 3], res[index + 4], res[index + 5], res[index + 6],
			res[index + 7], res[index + 8], res[index + 9], res[index + 10], res[index + 11],
			res[index + 12]],
			siNumber: res[index + 13],
			riskLevel: res[index + 16],
			sector: "",
			dateCreated: ""
		};

		if (res[index] == "" && res[index + 1] == "" && res[index + 2] == "" && res[index + 3] == "" &&
			res[index + 4] == "" && res[index + 5] == "" && res[index + 6] == "" && res[index + 7] == "" &&
			res[index + 8] == "" && res[index + 8] == "" && res[index + 10] == "" && res[index + 11] == "" &&
			res[index + 12] == "" && res[index + 14] == "" && res[index + 15] == "" && res[index + 16] == "") {

			return tankList;
		}
		else {

			tankList.push(<Tank>Obj);
			return tankList;
		}
	}

	// Creo un objeto DistributionLine gradiente y lo agrego a la lista si no esta vac�o.
	pushDistributionList(res, index, tipo, risksNames, distributionList, tag) {
		var Obj = {
			tags: tag + " " + tipo + " " +
				res[index] + " " + this.selectedItem.name + " "
				+ this.selectedItem.id,
			name: "",
			risk: 0,
			img: [],
			type: tag,
			asada: {
				name: this.selectedItem.name,
				id: this.selectedItem.id
			},
			lat: Number(res[index + 15]),
			long: Number(res[index + 14]),
			details: {
				lineMaterial: res[index + 2],
				repairsPerMonth: res[index]
			},
			//New data by Luis
			riskNames: [risksNames[index + 3], risksNames[index + 4], risksNames[index + 5], risksNames[index + 6],
			risksNames[index + 7], risksNames[index + 8], risksNames[index + 9], risksNames[index + 10], risksNames[index + 11],
			risksNames[index + 12]],
			riskValues: [res[index + 3], res[index + 4], res[index + 5], res[index + 6],
			res[index + 7], res[index + 8], res[index + 9], res[index + 10], res[index + 11],
			res[index + 12]],
			siNumber: res[index + 13],
			riskLevel: res[index + 16],

			creationDate: res[index + 1]
		};

		if (res[index] == "" && res[index + 1] == "" && res[index + 2] == "" && res[index + 3] == "" &&
			res[index + 4] == "" && res[index + 5] == "" && res[index + 6] == "" && res[index + 7] == "" &&
			res[index + 8] == "" && res[index + 8] == "" && res[index + 10] == "" && res[index + 11] == "" &&
			res[index + 12] == "" && res[index + 14] == "" && res[index + 15] == "" && res[index + 16] == "") {

			return distributionList;
		}
		else {

			distributionList.push(<DistributionLine>Obj);
			return distributionList;
		}
	}

	// Creo un objeto Chlorination y lo agrego a la lista si no esta vac�o.
	pushChlorinationToList(res, index, tipo, risksNames, chlorinationList) {

		var dateNumbers = [1, 1, 1971];
		if (res[index + 1] != "") {
			dateNumbers = res[index + 1].split();
		}

		var Obj = {
			tags: "SistemaCloracion" + " " + tipo + " " +
				res[index] + " " + this.selectedItem.name + " "
				+ this.selectedItem.id,
			name: "",
			risk: 0,
			img: [],
			type: "SistemaCloracion",
			asada: {
				name: this.selectedItem.name,
				id: this.selectedItem.id
			},
			lat: Number(res[index + 16]),
			long: Number(res[index + 15]),
			details: {
				inCharge: "",
				aqueductName: res[index],
				aqueductInCharge: "",
				ubication: res[index],
				chlorinType: res[index + 2],
				dosageType: res[index + 3],
				installationDate: {
					day: dateNumbers[0],
					month: dateNumbers[1],
					year: dateNumbers[2]
				},
				AqueductCreationDate: {
					day: dateNumbers[0],
					month: dateNumbers[1],
					year: dateNumbers[2]
				}
			},
			//New data by Luis
			location: res[index],
			dateInstalled: res[index + 1],
			riskNames: [risksNames[index + 4], risksNames[index + 5], risksNames[index + 6], risksNames[index + 7],
			risksNames[index + 8], risksNames[index + 9], risksNames[index + 10], risksNames[index + 11], risksNames[index + 12],
			risksNames[index + 13]],
			riskValues: [res[index + 4], res[index + 5], res[index + 6], res[index + 7],
			res[index + 8], res[index + 9], res[index + 10], res[index + 11], res[index + 12],
			res[index + 13]],
			siNumber: res[index + 14],
			riskLevel: res[index + 17],
			dateCreated: res[index + 1],
		};

		if (res[index] == "" && res[index + 1] == "" && res[index + 2] == "" && res[index + 3] == "" &&
			res[index + 4] == "" && res[index + 5] == "" && res[index + 6] == "" && res[index + 7] == "" &&
			res[index + 8] == "" && res[index + 8] == "" && res[index + 10] == "" && res[index + 11] == "" &&
			res[index + 12] == "" && res[index + 13] == "" && res[index + 15] == "" && res[index + 16] == "" &&
			res[index + 17] == "") {

			return chlorinationList;
		}
		else {


			chlorinationList.push(<Chlorination>Obj);
			return chlorinationList;
		}
	}

	/* Creo una lista con las infraestructuras que van a
	 ser subidas a un Asada */
	infraestructurasParsing(res) {
		var tipos = res[0].slice();
		//console.log("Tipos tiene: ",tipos);
		var risksNames = res[1].slice();
		var superficialWaters = new Array<SuperficialWater>();
		var nascents = new Array<Nascent>();
		var tanks = new Array<Tank>();
		var lines = new Array<DistributionLine>();
		var chlorinations = new Array<Chlorination>();
		var infraValue: any;
		res.splice(0, 2);
		//console.log("Res222222",res);
		var j = 1;
		for (var i = 0; i < res.length; i++) {

			j = 1;
			while (j < res[i].length) {

				if (tipos[j] == "Toma de agua superficial") {
					// Hasta j + 19 
					superficialWaters = this.pushSuperficialWaterToList(res[i], j, tipos[j], risksNames, superficialWaters);
					j += 19;



				}
				else if (tipos[j] == "Captacion de nacientes o manantiales") {
					// Hasta j + 18
					nascents = this.pushNascentToList(res[i], j, tipos[j], risksNames, nascents);
					j += 18;

				}
				else if (tipos[j] == "Tanques de almacenamiento") {
					// Hasta j + 19
					tanks = this.pushTankToList(res[i], j, tipos[j], risksNames, tanks);
					j += 19;


				}
				else if (tipos[j] == "Tanques quiebra gradiente") {
					//Hasta j + 17
					tanks = this.pushTankQGToList(res[i], j, tipos[j], risksNames, tanks);
					j += 17;

				}
				else if (tipos[j] == "Linea de conduccion y sistema de distribucion") {
					//Hasta j + 17
					lines = this.pushDistributionList(res[i], j, tipos[j], risksNames, lines, "SistemaDistribucion");
					j += 17;

				}
				else if (tipos[j] == "Linea de distribucion") {
					//Hasta j + 17
					lines = this.pushDistributionList(res[i], j, tipos[j], risksNames, lines, "LineaDistribucion");
					j += 17;

				}
				else if (tipos[j] == "Sistema de cloracion") {
					//Hasta j + 18
					chlorinations = this.pushChlorinationToList(res[i], j, tipos[j], risksNames, chlorinations);
					j += 18;

				}
				else {

					console.log("No existe el tipo", tipos[j]);
				}
			}


		}

		return [superficialWaters, nascents, tanks, lines, chlorinations];
	}

	//Creo una lista con las asadas que van a ser subidas.
	asadasParsing(res) {

		res.splice(0, 1);
		var asadas = new Array<Asada>();
		var asada = new Asada();

		for (let asadaCSV of res) {
 
			asada = new Asada();

			if (asadaCSV[0] != "") {
				asada.date = asadaCSV[0];
				asada.name = asadaCSV[1];
				asada.inCharge = asadaCSV[2];
				asada.phoneNumber = asadaCSV[3];
				asada.legalResponsableWorkersName = asadaCSV[4];
				asada.legalResponsablePhone = asadaCSV[5];
				asada.location={
					province:{code:asadaCSV[7],
						name:this.locationService.getProvinciaName(asadaCSV[7])},
					canton:{code: asadaCSV[9],
						name:this.locationService.getCantonName(asadaCSV[7],asadaCSV[9])},
					district:{code: asadaCSV[11],
						name:this.locationService.getDistritoName(asadaCSV[7],asadaCSV[9],asadaCSV[11])},
					address:asadaCSV[12]
				}

				asada.zoneType = asadaCSV[15];
				asada.adminEntity = asadaCSV[16];
				asada.adminEntityName = asadaCSV[17];
				asada.waterProgram = asadaCSV[18];
				asada.numberSubscribed = asadaCSV[19];
				asada.population = asadaCSV[20];
				asada.fountains = asadaCSV[21];
				asada.nascent = asadaCSV[22];
				asada.superficial = asadaCSV[23];
				asada.waterWells = asadaCSV[24];
				asada.conductionMaterial = asadaCSV[25];
				asada.tanksNumber = asadaCSV[26];
				asada.supplyMechanisms = asadaCSV[27];
				asada.desinfection = asadaCSV[28];
				asada.systemType = asadaCSV[29];

				if (asada.date != "") {
					var parts = asada.date.split('/');
					asada.concessionDue = {
						day: Number(parts[0]),
						month: Number(parts[1]),
						year: Number(parts[2])
					};
				}
				else {
					asada.concessionDue = {
						day: 1,
						month: 1,
						year: 1971
					};
				}


				asada.office = {
					lat: Number(asadaCSV[14]),
					long: Number(asadaCSV[13])
				};
				asada.type = 'asada';
				asada.tags = asada.name + " " + asada.location.province.name + " "
					+ asada.numberSubscribed + " Asada";
				asada.idAsada = 'ASA' + this.allList.length;
				asadas.push(asada);
			}
		}
		//console.log('El resultado es: ',asadas);
		return asadas;
	}


	fullCsvParsing(typeFile) {

		if (typeFile == 1) {

			var asadas = this.asadasParsing(this.parsedResults);
			//console.log('El resultado es: ',this.parsedResults);
			for (let asada of asadas) {
				asada.idAsada = 'ASA' + this.allList.length;
				this.angularFireService.addNewAsada(asada);
			}

		}
		else {


			var infraestructuras = this.infraestructurasParsing(this.parsedResults);



			if (infraestructuras[0].length != 0) { // Aguas superficiales

				for (let infra of infraestructuras[0]) {

					this.angularFireService.addNewInfrastructure(infra);

				}

			}
			if (infraestructuras[1].length != 0) { // Nascientes

				for (let infra of infraestructuras[1]) {

					this.angularFireService.addNewInfrastructure(infra);

				}

			}
			if (infraestructuras[2].length != 0) { // Tanques

				for (let infra of infraestructuras[2]) {

					this.angularFireService.addNewInfrastructure(infra);

				}

			}
			if (infraestructuras[3].length != 0) { // Lineas de Distribucion

				for (let infra of infraestructuras[3]) {

					this.angularFireService.addNewInfrastructure(infra);

				}

			}
			if (infraestructuras[4].length != 0) { //Sistema de cloracion

				for (let infra of infraestructuras[4]) {

					this.angularFireService.addNewInfrastructure(infra);

				}

			}




		}


	}

	parseAsadaData(asada, ele) {
		asada.date = ele.date;
		asada.name = ele.name;
		asada.inCharge = ele.inCharge;
		asada.phoneNumber = ele.phoneNumber;
		asada.legalResponsableWorkersName = ele.legalResponsableWorkersName;
		asada.legalResponsablePhone = ele.legalResponsablePhone;
		asada.location = ele.location;
		asada.zoneType = ele.zoneType;
		asada.adminEntity = ele.adminEntity;
		asada.adminEntityName = ele.adminEntityName;
		asada.waterProgram = ele.waterProgram;
		asada.numberSubscribed = ele.numberSubscribed;
		asada.population = ele.population;
		asada.fountains = ele.fountains;
		asada.nascent = ele.nascent;
		asada.superficial = ele.superficial;
		asada.waterWells = ele.waterWells;
		asada.conductionMaterial = ele.conductionMaterial;
		asada.tanksNumber = ele.tanksNumber;
		asada.supplyMechanisms = ele.supplyMechanisms;
		asada.desinfection = ele.desinfection;
		asada.systemType = ele.systemType;
		asada.date = ele.date;
		asada.concessionDue = {
			day: ele.concessionDue.day,
			month: ele.concessionDue.month,
			year: ele.concessionDue.year
		};
		asada.office = {
			lat: ele.office.lat,
			long: ele.office.long
		};
		asada.type = ele.type;
		asada.tags = ele.tags;
		asada.idAsada = ele.idAsada;
		return asada
	}

	parseTankData(infra) {

		var tanque = new Tank();
		tanque.tags = infra.tags;
		tanque.name = infra.name;
		tanque.risk = infra.risk;
		tanque.type = infra.type;
		tanque.asada = {
			name: infra.asada.name,
			id: infra.asada.id
		};
		tanque.lat = infra.lat;
		tanque.long = infra.long;
		tanque.details = {
			aqueductName: infra.details.aqueductName,
			cleaning: infra.details.cleaning,
			inCharge: infra.details.inCharge,
			material: infra.details.material,
			registerNo: infra.details.registerNo,
			tankType: infra.details.tankType,
			direction: infra.details.direction,
			volume: {
				amount: infra.details.volume.amount,
				unit: infra.details.volume.unit
			},
			creationDate: {
				day: 1,
				month: 1,
				year: 1971
			}
		};

		tanque.riskNames = infra.riskNames;
		tanque.riskValues = infra.riskValues;
		tanque.siNumber = infra.siNumber;
		tanque.riskLevel = infra.riskLevel;
		tanque.sector = infra.sector;
		tanque.dateCreated = infra.dateCreated;
		return tanque;
	}

	parseSuperficialData(infra) {

		var superficial = new SuperficialWater();

		superficial.tags = infra.tags;
		superficial.name = infra.name;
		superficial.risk = infra.risk;
		superficial.type = infra.type;
		superficial.asada = {
			name: infra.asada.name,
			id: infra.asada.id
		};
		superficial.lat = infra.lat;
		superficial.long = infra.long;
		superficial.details = {
			aqueductName: infra.details.aqueductName,
			aqueductInCharge: infra.details.aqueductInCharge,
			inCharge: infra.details.inCharge,
			registerMINAE: infra.details.registerMINAE,
			registerARS: infra.details.registerARS,
			cleaningFrec: infra.details.cleaningFrec,
			otherCleaning: infra.details.otherCleaning
		};
		//New data by Luis
		superficial.riskNames = infra.riskNames;
		superficial.riskValues = infra.riskValues;
		superficial.siNumber = infra.siNumber;
		superficial.riskLevel = infra.riskLevel;
		superficial.dateCreated = infra.dateCreated;
		return superficial;
	}

	parseNascentData(infra) {
		var naciente = new Nascent();

		naciente.tags = infra.tags;
		naciente.name = infra.name;
		naciente.risk = infra.risk;
		naciente.type = infra.type;
		naciente.asada = {
			name: infra.asada.name,
			id: infra.asada.id
		};
		naciente.lat = infra.lat;
		naciente.long = infra.long;
		naciente.details = {
			aqueductName: infra.details.aqueductName,
			aqueductInCharge: infra.details.aqueductInCharge,
			inCharge: infra.details.inCharge,
			registerMINAE: infra.details.registerMINAE,
			nascentType: infra.details.nascentType,
			registerARS: infra.details.registerARS,
		};

		//New data by Luis
		naciente.dateCreated = infra.dateCreated;
		naciente.riskNames = infra.riskNames;
		naciente.riskValues = infra.riskValues;
		naciente.siNumber = infra.siNumber;
		naciente.riskLevel = infra.riskLevel;
		return naciente;
	}

	parseChlorinationData(infra) {

		var cloro = new Chlorination();

		if (infra.installationDate == undefined) {
			infra.installationDate = {
				day: 1,
				month: 1,
				year: 1971
			};

		}

		if (infra.AqueductCreationDate == undefined) {
			infra.AqueductCreationDate = {
				day: 1,
				month: 1,
				year: 1971
			};
		}

		cloro.tags = infra.tags;
		cloro.name = infra.name;
		cloro.risk = infra.risk;
		cloro.type = infra.type;
		cloro.asada = {
			name: infra.asada.name,
			id: infra.asada.id
		};
		cloro.lat = infra.lat;
		cloro.long = infra.long;
		cloro.details = {
			inCharge: infra.details.inCharge,
			aqueductName: infra.details.aqueductName,
			aqueductInCharge: infra.details.aqueductInCharge,
			ubication: infra.details.ubication,
			chlorinType: infra.details.chlorinType,
			dosageType: infra.details.dosageType,
			installationDate: {
				day: infra.installationDate.day,
				month: infra.installationDate.month,
				year: infra.installationDate.year
			},
			AqueductCreationDate: {
				day: infra.AqueductCreationDate.day,
				month: infra.AqueductCreationDate.month,
				year: infra.AqueductCreationDate.year
			}
		};

		cloro.location = infra.location;
		cloro.dateInstalled = infra.dateInstalled;
		cloro.riskNames = infra.riskNames;
		cloro.riskValues = infra.riskValues;
		cloro.siNumber = infra.siNumber;
		cloro.riskLevel = infra.riskLevel;
		cloro.dateCreated = infra.dateCreated;
		return cloro;
	}

	parseDistributionLineData(infra) {

		var linea = new DistributionLine();

		linea.tags = infra.tags;
		linea.name = infra.name;
		linea.risk = infra.risk;
		linea.type = infra.type;
		linea.asada = {
			name: infra.asada.name,
			id: infra.asada.id
		};
		linea.lat = infra.lat;
		linea.long = infra.long;
		linea.details = {
			lineMaterial: infra.details.lineMaterial,
			repairsPerMonth: infra.details.repairsPerMonth

		};

		return linea;
	}

	createHistorial(historial) {
		var asadasToFire = new Array<Asada>();
		var cloraciones = new Array<Chlorination>();
		var nascientes = new Array<Nascent>();
		var tanques = new Array<Tank>();
		var superficiales = new Array<SuperficialWater>();
		var distribuciones = new Array<DistributionLine>();
		var newAsadaId = 0;
		for (let ele of this.allList) {

			var asada = new Asada();
			asada = this.parseAsadaData(asada, ele);
			var largo = asadasToFire.push(asada);
			for (let infra of this.allInfraList) {



				if (infra.asada.id == ele.$key) {

					infra.asada.id = newAsadaId;

					if (infra.type == 'CaptacionSuperficial') {

						superficiales.push(this.parseSuperficialData(infra));

					}
					else if (infra.type == 'CaptacionNaciente') {

						nascientes.push(this.parseNascentData(infra));

					}
					else if (infra.type == 'Tanque' || infra.type == 'TanqueQG') {

						tanques.push(this.parseTankData(infra));

					}
					else if (infra.type == 'SistemaCloracion') {

						cloraciones.push(this.parseChlorinationData(infra));

					}
					else {

						distribuciones.push(this.parseDistributionLineData(infra));

					}

				}


			}
			newAsadaId++;
		}

		if (cloraciones.length == 0) {
			historial.dataInfraChlorination = [];
		}
		else {
			historial.dataInfraChlorination = cloraciones;

		}

		if (distribuciones.length == 0) {
			historial.dataInfraDistributionLine = [];

		}
		else {
			historial.dataInfraDistributionLine = distribuciones;

		}
		if (nascientes.length == 0) {
			historial.dataInfraNascent = [];


		}
		else {
			historial.dataInfraNascent = nascientes;

		}
		if (superficiales.length == 0) {
			historial.dataInfraSuperficialWater = [];

		}
		else {
			historial.dataInfraSuperficialWater = superficiales;

		}
		if (tanques.length == 0) {
			historial.dataInfraTank = [];

		}
		else {
			historial.dataInfraTank = tanques;

		}

		historial.dataAsadas = asadasToFire;
		return historial;

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

	getRoles() {
		this.searchFirebase = this.searchService.search('rolAccess');
		this.searchFirebase.subscribe(
			results => {
				this.allRolAccess = results;
			}
		);
	}

	getAllUsers() {
		this.searchFirebase = this.searchService.search('usuarios');
		this.searchFirebase.subscribe(
			results => {
				this.allUsuarios = results;
			}
		);
	}


	deleteAllStorage() { // Esto se hace debido a que en este momento 11/2/2017 Firebase no puede eliminar una carpeta entera.

		for (let infra of this.allInfraList) {

			for (let img of ((infra.img == undefined) ? [] : infra.img)) {
				this.storageRef.child('infrastructure/' + img.fileName).delete();
			}
		}

		for (let incidente of this.allIncidentes) {

			this.storageRef.child('incidentes/' + incidente.img.fileName).delete();
		}
	}


	//Subo los datos de las ASADAs
	onRemoved2($event) {
		this.fullCsvParsing(2);
	}


	onRemoved($event) {
		//Historial
		this.getInfras();

		var historial = new Historial();

		var fecha = new Date();
		historial.date = "" + fecha.getDate() + "/" + (fecha.getMonth() + 1) + "/" + fecha.getFullYear();

		historial = this.createHistorial(historial);
		//console.log("El historial tiene: " + historial.data[0].name);
		this.angularFireService.addNewHistorial(historial);

		// Elimino archivos de imagenes del storage de Firebase
		this.deleteAllStorage();
		//EliminoActual
		this.angularFireService.deleteAllDB();
		this.deleteUserRelations();


		this.fullCsvParsing(1);


	}

	deleteUserRelations() {
		for (let rolUser of this.allRolAccess) {

			if (rolUser.rol == "Administración" || rolUser.rol == "Fontanero") {
				/*	this.af.auth.deleteUser(rolUser.$key)
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

	onAdded2($event, ele) {
		this.selectedItem = {
			name: ele.name,
			id: ele.$key
		};
		this.inputFile = $event.currentFiles[0];
		this.papa.parse(this.inputFile, {
			encoding: "utf8",
			complete: (results, file) => {
				this.parsedResults = results.data.slice();
				this.parsedResults.splice(0, 1);
			}

		});

	}

	onAdded($event) {

		this.inputFile = $event.currentFiles[0];

		this.papa.parse(this.inputFile, {
			encoding: "utf8",
			complete: (results, file) => {
				this.parsedResults = results.data.slice();
				this.parsedResults.splice(0, 1);
			}

		});

	}

	IsInfrastrcuturePermission() {

	}

	setOptions(filteredList) {
		filteredList.forEach(element => {
			//Check the edition permission
			if (this.userAccess.rol == "Super Administrador"
				|| (element.$key == this.userAccess.asada &&
					this.userAccess.rol == "Administración") //its an asada
				|| (element.asada && element.asada.id == this.userAccess.asada)  //its an infrastructure
			) {
				element.allowedToEdit = true;
				this.optionsAllowed = true;

			} else {
				element.allowedToEdit = false;
			}
			//check the evaluations permission
			if (this.userAccess.rol == "Super Administrador"
				|| (element.asada && element.asada.id == this.userAccess.asada)
			) {
				element.allowedToEvaluate = true;
			} else {
				element.allowedToEvaluate = false;
			}
		});
	}
	search(search: string) {
		this.filteredList = this.allList.filter(
			elem => elem.tags.toUpperCase().includes(search.toUpperCase())
		);
		this.updateFiltersVisibilty();
	}

	export() {
		var data = [];
		data.push({ "Tipo de busqueda:": this.searchType });
		switch (this.searchType) {
			case 'infraestructura':
				this.exportService.exportInfraestructures(this.filteredList);
				break;
			case 'asadas':
				this.exportService.exportAsadas(this.filteredList);
				break
		}

	}

	// Function that sets the global variable indicating the ASADA the user
	// wants to upload infraestructuras to
	uploadInfraestructura(element) {
		this.uploadInfraestructuraElement = element;
	}

}


