import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { RadioOption } from '../../common/model/radioOption-class';

import { GeolocationService } from '../../common/service/Geolocation.service';
import { AsadaForm } from '../../common/model/FormAsada-class';
import { Asada } from '../../common/model/Asada';
import { AngularFireService } from '../../common/service/angularFire.service';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { SearchService } from 'app/components/add-asada/search.service';
import { LocationsService, provincia, canton, distrito } from 'app/common/service/locations.service';

 
@Component({
	selector: 'app-add-asada',
	templateUrl: './add-asada.component.html',
	styleUrls: ['./add-asada.component.scss'],
	providers: [SearchService, AngularFireService, GeolocationService, ToasterService, LocationsService]
})
export class AddAsadaComponent implements OnInit {
	/*   		 Html variables    */
	// radio button options
	public adminEntity: RadioOption[] = [{ display: 'A y A', value: 'AYA' }, { display: 'Municipal', value: 'Minucipal' }, { display: 'Asada', value: 'Asada' }, { display: 'Privado', value: 'Privado' }];
	public zoneType: RadioOption[] = [{ display: 'Urbana', value: 'Urbana' }, { display: 'Rural', value: 'Rural' }];
	public WaterControlProgram: RadioOption[] = [{ display: 'Si', value: 'Si' }, { display: 'No', value: 'No' }];
	public locations:provincia[]=[];// ["San Jose", "Heredia", "Cartago", "Limon", "Alajuela", "Guanacaste", "Putarenas"];
	public selectedProvince:number=1;
	public selectedCanton:number=1;
	public selectedDistrict:number=1;
	
	private listAsadas: any[];
	// the object that handles the form
	public addAsadaForm: FormGroup;
	public newAsada: AsadaForm = new AsadaForm();
	public searchFirebase: any;
	public dueDate: Date;
	//public date;

	/*			Toast variables		*/
	public toastConfig: ToasterConfig = new ToasterConfig({
		positionClass: 'toast-bottom-center',
		limit: 5
	});


	constructor(
		private searchService: SearchService,
		private route: ActivatedRoute,
		private router: Router,
		private geoLocation: GeolocationService,
		private fb: FormBuilder,
		private angularFireService: AngularFireService,
		private toasterService: ToasterService,
		private locationService: LocationsService) { 
		this.locations=this.locationService.locations.provincias;

		}

	ngOnInit() {

		this.builForm();
		this.searchFirebase = this.searchService.search("asadas");
		this.searchFirebase.subscribe(results => {
			this.listAsadas = results;
		});

	}
	provinceSelectorChange(){
		this.selectedCanton=1;
		this.selectedDistrict=1;
	}
	cantonSelectorChange(){
		this.selectedDistrict=1;
	}

	ngOnDestroy(): void {

		this.listAsadas = [];
	}

	onSubmit() {

		this.newAsada = this.addAsadaForm.value;

		const office = { lat: this.newAsada.officeLatitude, long: this.newAsada.officeLongitude };
		const AsadaTags: string = this.newAsada.asadaName + " "
			+ this.newAsada.province + " " +
			this.newAsada.numberSubscribed + " Asada";
		const date = { day: this.dueDate.getDate(), month: this.dueDate.getMonth() + 1, year: this.dueDate.getFullYear() };
		const asada: Asada = new Asada();

		asada.name = this.newAsada.asadaName;
		asada.tags = AsadaTags;
		var provName = this.locationService.getProvinciaName(this.newAsada.province);
		var cantName = this.locationService.getCantonName(this.newAsada.province, this.newAsada.canton);
		var DistName = this.locationService.getDistritoName(this.newAsada.province, this.newAsada.canton, this.newAsada.district);

		asada.location = {
			province: { code: this.newAsada.province, name: provName },
			canton: { code: this.newAsada.canton, name: cantName },
			district: { code: this.newAsada.district, name: DistName },
			address: this.newAsada.address
		};
		asada.geoCode = Number(this.newAsada.geoCode);
		asada.inCharge = this.newAsada.inCharge;
		asada.phoneNumber = this.newAsada.phoneNumber;
		asada.email = this.newAsada.email;
		asada.office = office;
		asada.asadaInfras = [];
		asada.numberSubscribed = Number(this.newAsada.numberSubscribed);
		asada.population = Number(this.newAsada.population);
		asada.minaeRegistration = this.newAsada.minaeRegister;
		asada.concessionNumber = this.newAsada.concessionNumber;
		asada.concessionDue = date;
		asada.zoneType = this.newAsada.zoneType;
		asada.adminEntity = this.newAsada.adminEntity;
		asada.waterProgram = this.newAsada.waterProgram;
		asada.type = 'asada';
		asada.idAsada = 'ASA' + this.listAsadas.length;

		this.addNewAsada(asada);

		this.goToSearch();
	}

	/*		DB methods		*/

	addNewAsada(pAsada) {
		this.angularFireService.addNewAsada(pAsada);
	}

	/*    Html METHODS    */

	goToSearch(): void {
		this.popToast();
		setTimeout(() => {
			this.router.navigate(['/search/asadas']);
		},
			2250);

	}

	popToast() {
		var toast = {
			type: 'success',
			title: 'ASADA agregada correctamente',
			showCloseButton: true
		};
		this.toasterService.pop(toast);
	}


	cancel() {
		this.router.navigate(['/search/asadas']);
	}

	getGeoLocation() {
		this.geoLocation.getCurrentPosition().subscribe(
			result => {
				if (result) {
					this.addAsadaForm.patchValue({ 'officeLatitude': result.coords.latitude });
					this.addAsadaForm.patchValue({ 'officeLongitude': result.coords.longitude });
				}

			}
		);
	}

	builForm(): void {
		this.addAsadaForm = this.fb.group({
			'asadaName': ['', Validators.required],
			'province': [1, Validators.required],
			'canton': [1, Validators.required],
			'district': [1, Validators.required],
			'numberSubscribed': ['', Validators.required],
			'phoneNumber': ['', Validators.required],
			'email': ['', Validators.required],
			'population': ['', Validators.required],
			'zoneType': [this.zoneType[0].value, Validators.required],
			'concessionNumber': ['', Validators.required],
			'minaeRegister': ['', Validators.required],
			'address': ['', Validators.required],
			'geoCode': ['', Validators.required],
			'waterProgram': [this.WaterControlProgram[0].value, Validators.required],
			'adminEntity': [this.adminEntity[0].value, Validators.required],
			'inCharge': ['', Validators.required],
			'officeLatitude': ['', Validators.required],
			'officeLongitude': ['', Validators.required]
		});
		this.addAsadaForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}

	onValueChanged(data?: any) {
		if (!this.addAsadaForm) { return; }
		const form = this.addAsadaForm;
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
		'numberSubscribed': '',
		'phoneNumber': '',
		'population': '',
		'email': '',
		'concessionNumber': '',
		'minaeRegister': '',
		'address': '',
		'geoCode': '',
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
		},
		'geoCode': {
			'required': 'Codigo geofrico requerido'
		},
		'officeLatitude': {
			'required': ':Latitud de la oficina requerida'
		},
		'officeLongitude': {
			'required': 'Longitud de la ofincia requerida'
		}
	};

}
