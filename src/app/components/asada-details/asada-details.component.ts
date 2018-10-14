import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/*		Modules		*/
import { FirebaseApp, AngularFire, FirebaseAuthState } from 'angularfire2';


/*		Services		*/
import { AngularFireService } from '../../common/service/angularFire.service';
import { UserService } from "app/common/service/user.service";
import { GeolocationService } from '../../common/service/Geolocation.service';

/*		Model-Entities		*/
import { AsadaForm } from '../../common/model/FormAsada-class';
import { Asada } from '../../common/model/Asada';
import { RadioOption } from '../../common/model/radioOption-class';
import { RolAccess } from '../../common/model/RolAccess';
import { Infrastructure } from '../../common/model/Infrastructure';
import { ExportService } from "app/common/service/export.service";
import { LocationsService, provincia, canton, distrito } from 'app/common/service/locations.service';


@Component({
	selector: 'app-asada-details',
	templateUrl: './asada-details.component.html',
	styleUrls: ['./asada-details.component.scss'],
	providers: [AngularFireService, GeolocationService, UserService, ExportService,LocationsService]
})
export class AsadaDetailsComponent implements OnInit {

	/*   		 Html variables    */
	public adminEntity: RadioOption[] = [{ display: 'A y A', value: 'AYA' }, { display: 'Municipal', value: 'Minucipal' }, { display: 'Asada', value: 'ASADA' }, { display: 'Privado', value: 'Privado' }];
	public zoneType: RadioOption[] = [{ display: 'Urbana', value: 'Urbana' }, { display: 'Rural', value: 'Rural' }, { display: 'Urbano-Rural', value: 'Urbano-Rural' }];
	public WaterControlProgram: RadioOption[] = [{ display: 'Si', value: 'Si' }, { display: 'No', value: 'No' }];
	public locations:provincia[]=[];
	private selectedProvince:number;
	private selectedCanton:number;
	private selectedDistrict:number;

	public detailAsadaForm: FormGroup;
	public readOnlyMode: boolean = true;

	private newAsada: AsadaForm;
	public dueDate: Date;

	/* 		DB variables		*/

	private asadaDB: Asada;

	/* 		 routing variables   */
	private sub: any;
	public AsadaId: string;

	/*		Auth		*/
	private user: FirebaseAuthState;
	public isAdmin: boolean;
	public isEditor: boolean;
	private userAccessRol: RolAccess;


	constructor(
		private angularFire: AngularFire,
		private userService: UserService,
		private route: ActivatedRoute,
		private router: Router,
		private angularFireService: AngularFireService,
		private fb: FormBuilder,
		private exportService: ExportService,
		private locationService:LocationsService) {
		this.locations=this.locationService.locations.provincias;
	}

	

	ngOnInit() {
		this.resetForm();
		this.sub = this.route.params
			.subscribe((params: Params) => {
				this.AsadaId = params['id'];
				this.readOnlyMode = params['action'] == 'edit' ? false : true;

				this.getAsada(this.AsadaId);
			});

		this.angularFire.auth.subscribe(user => {
			if (user) {
				// user logged in
				this.user = user;

				var userDetails = this.userService.getRolAccess(this.user.uid);

				userDetails.subscribe(
					results => {
						this.userAccessRol = results;

						if (this.userAccessRol.asada && (this.userAccessRol.asada == this.AsadaId) && this.userAccessRol.rol == "Administración") {
							this.isAdmin = true;
							this.isEditor = false;
						}
						else if (this.userAccessRol.rol && this.userAccessRol.rol == "Super Administrador") {

							this.isAdmin = true;
							this.isEditor = false;
						}
						else if (this.userAccessRol.asada && (this.userAccessRol.asada == this.AsadaId) && this.userAccessRol.rol == "Edición") {
							this.isAdmin = false;
							this.isEditor = true;
						}
						else {
							this.isAdmin = false;
							this.isEditor = false;
						}

					}
				);

			} else {
				// user not logged in
				this.isAdmin = false;
				this.isEditor = false;
			}
		});
	}
	provinceSelectorChange(){
		this.selectedCanton=1;
		this.selectedDistrict=1;
	}
	cantonSelectorChange(){
		this.selectedDistrict=1;
	}

	export() {
		this.exportService.exportAsada(this.asadaDB);
	}


	onSubmit() {
		this.newAsada = this.detailAsadaForm.value;

		//this.asadaDB.concessionDue = String(this.dueDate);
		this.asadaDB.concessionDue.day = this.dueDate.getDate();
		this.asadaDB.concessionDue.month = this.dueDate.getMonth() + 1;
		this.asadaDB.concessionDue.year = this.dueDate.getFullYear();

		this.asadaDB.name = this.newAsada.asadaName;
		var provName=this.locationService.getProvinciaName(this.newAsada.province);
		var cantName=this.locationService.getCantonName(this.newAsada.province,this.newAsada.canton);
		var DistName=this.locationService.getDistritoName(this.newAsada.province,this.newAsada.canton,this.newAsada.district);
		this.asadaDB.location={
		    province: {code:this.newAsada.province,name:provName},
		    canton:  {code:this.newAsada.canton,name:cantName},
		    district:  {code:this.newAsada.district,name:DistName},
		    address: this.newAsada.address
		};
		this.asadaDB.geoCode = Number(this.newAsada.geoCode);
		this.asadaDB.inCharge = this.newAsada.inCharge;
		this.asadaDB.phoneNumber = this.newAsada.phoneNumber;
		this.asadaDB.email = this.newAsada.email;
		this.asadaDB.numberSubscribed = Number(this.newAsada.numberSubscribed);
		this.asadaDB.population = Number(this.newAsada.population);
		this.asadaDB.zoneType = this.newAsada.zoneType;
		this.asadaDB.concessionNumber = this.newAsada.concessionNumber;
		this.asadaDB.minaeRegistration = this.newAsada.minaeRegister;
		this.asadaDB.waterProgram = this.newAsada.waterProgram;
		this.asadaDB.adminEntity = this.newAsada.adminEntity;

		var asadaUpdatedItems = {
			concessionDue: {
				day: this.asadaDB.concessionDue.day,
				month: this.asadaDB.concessionDue.month,
				year: this.asadaDB.concessionDue.year
			},
			name: this.asadaDB.name,
			geoCode: this.asadaDB.geoCode,
			numberSubscribed: this.asadaDB.numberSubscribed,
			phoneNumber: this.asadaDB.phoneNumber,
			population: this.asadaDB.population,
			zoneType: this.asadaDB.zoneType,
			email: this.asadaDB.email,
			concessionNumber: this.asadaDB.concessionNumber,
			minaeRegistration: this.asadaDB.minaeRegistration,
			location: this.asadaDB.location,
			waterProgram: this.asadaDB.waterProgram,
			adminEntity: this.asadaDB.adminEntity,
			inCharge: this.asadaDB.inCharge,
			idAsada: this.asadaDB.idAsada
		};

		this.updateAsada(this.AsadaId, asadaUpdatedItems);
		this.goBack();
	}

	/*		DB METHODS		*/
	getAsada(pId): void {
		this.angularFireService.getAsada(pId).subscribe(
			results => {
				this.asadaDB = results;
				//console.log(results);
				//Avoid the error on elimination
				if (this.asadaDB && this.asadaDB.concessionDue) {
					this.dueDate = new Date(this.asadaDB.concessionDue.year, this.asadaDB.concessionDue.month - 1, this.asadaDB.concessionDue.day, 0, 0, 0, 0);

					this.fillForm();
				}

			}
		);
	}



	updateAsada(pId, pAsada): void {
		this.angularFireService.updateAsada(pId, pAsada);
	}

	deleteASADAInfra(pIdASADA: string) {
		this.angularFireService.getInfrastuctures()
			.subscribe(
			results => {
				var infraList: Infrastructure[] = results;
				for (let infra of infraList) {
					if (infra.asada.id == this.AsadaId) {
						this.angularFireService.deleteInfrastructure(infra.$key);
					}
				}

				//Delets the asada
				this.angularFireService.deleteAsada(this.AsadaId);
			}
			);

	}

	delete() {

		this.deleteASADAInfra(this.AsadaId);

		this.router.navigate(["/search/asadas"]);
	}


	goBack(): void {
		setTimeout(() => {
			this.ngOnInit();
		},
			1500);

	}

	changeToEdit() {
		this.readOnlyMode = false;
	}

	addInfra() {
		this.router.navigate(['/addInfrastructure/' + this.asadaDB.$key]);
	}

	reload() {
		this.router.navigate(['/asadaDetails', this.asadaDB.$key]);
		this.ngOnInit();
	}

	fillForm(): void {
		console.log(this.asadaDB);
		this.detailAsadaForm = this.fb.group({
			'asadaName': [this.asadaDB.name, Validators.required],
			'province': [this.asadaDB.location.province.code, Validators.required],
			'canton': [this.asadaDB.location.canton.code, Validators.required],
			'district': [this.asadaDB.location.district.code, Validators.required],
			'geoCode': [this.asadaDB.geoCode, Validators.required],
			'numberSubscribed': [this.asadaDB.numberSubscribed, Validators.required],
			'phoneNumber': [this.asadaDB.phoneNumber, Validators.required],
			'population': [this.asadaDB.population, Validators.required],
			'zoneType': [this.asadaDB.zoneType],
			'email': [this.asadaDB.email, Validators.required],
			'concessionNumber': [this.asadaDB.concessionNumber, Validators.required],
			'minaeRegister': [this.asadaDB.minaeRegistration, Validators.required],
			'address': [this.asadaDB.location.address, Validators.required],
			'waterProgram': [this.asadaDB.waterProgram],
			'adminEntity': [this.asadaDB.adminEntity],
			'inCharge': [this.asadaDB.inCharge, Validators.required],
			'concessionDue': [this.asadaDB.concessionDue.day + "/" + this.asadaDB.concessionDue.month + "/" + this.asadaDB.concessionDue.year],
			'officeLatitude': [this.asadaDB.office.lat, Validators.required],
			'officeLongitude': [this.asadaDB.office.long, Validators.required]
		});
		this.selectedProvince=this.asadaDB.location.province.code;
		this.selectedCanton=this.asadaDB.location.canton.code;
		this.selectedDistrict=this.asadaDB.location.district.code;
		this.detailAsadaForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now

	}


	resetForm(): void {
		this.detailAsadaForm = this.fb.group({
			'asadaName': ['', Validators.required],
			'province': [1, Validators.required],
			'canton': [1, Validators.required],
			'district': [1, Validators.required],
			'geoCode': ['', Validators.required],
			'numberSubscribed': ['', Validators.required],
			'phoneNumber': ['', Validators.required],
			'population': ['', Validators.required],
			'zoneType': [''],
			'email': ['', Validators.required],
			'concessionNumber': ['', Validators.required],
			'minaeRegister': ['', Validators.required],
			'address': ['', Validators.required],
			'waterProgram': [''],
			'adminEntity': [''],
			'inCharge': ['', Validators.required],
			'concessionDue': [''],
			'officeLatitude': ['', Validators.required],
			'officeLongitude': ['', Validators.required]
		});
		this.detailAsadaForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}

	onValueChanged(data?: any) {
		if (!this.detailAsadaForm) { return; }
		const form = this.detailAsadaForm;
		for (const field in this.formErrors) {
			// clear previous error message (if any)
			this.formErrors[field] = '';
			const control = form.get(field);
			if (control && control.dirty && !control.valid) {
				const messages = this.validationMessages[field];
				for (const key in control.errors) {
					this.formErrors[field] += messages[key] + ' ';
				}
			}
		}
	}

	formErrors = {
		'asadaName': '',
		'province': '',
		'canton': '',
		'district': '',
		'geoCode': '',
		'numberSubscribed': '',
		'phoneNumber': '',
		'population': '',
		'email': '',
		'concessionNumber': '',
		'minaeRegister': '',
		'address': '',
		'inCharge': '',
		'officeLatitude': '',
		'officeLongitude': ''
	};

	validationMessages = {
		'asadaName': {
			'required': 'Nombre requerido'
		},
		'province': {
			'required': 'Provincia requerido'
		},
		'canton': {
			'required': 'Canton requerido'
		},
		'district': {
			'required': 'Distrito requerido'
		},
		'geoCode': {
			'required': 'Codigo geografico requerido'
		},
		'inCharge': {
			'required': 'Encargado requerido'
		},
		'numberSubscribed': {
			'required': 'Numero de abonados requerido'
		},
		'phoneNumber': {
			'required': 'Numero de telefono requerido'
		},
		'population': {
			'required': 'Poblacion abastecida requerida'
		},
		'email': {
			'required': 'Correo electronico requerido'
		},
		'concessionNumber': {
			'required': 'Numero de consecion requerida'
		},
		'minaeRegister': {
			'required': 'Numero de registro requerido'
		},
		'address': {
			'required': 'Locacion requerida'
		}
	};

}
