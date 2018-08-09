import { Component, OnInit, Inject, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

/*		Model-Entities		*/
import { RadioOption } from '../../common/model/radioOption-class';
import { TankForm } from '../../common/model/FormTank-class';
import { Tank } from '../../common/model/Tank';
import { pkAsada } from '../../common/model/peekAsada';
import { User } from '../../common/model/User';
import { RolAccess } from '../../common/model/RolAccess';

/*		Modules		*/
import * as firebase from 'firebase';
import { FirebaseApp, AngularFire, FirebaseAuthState } from 'angularfire2';
import { ToasterService, ToasterConfig } from 'angular2-toaster';

/*		Services		*/
import { AngularFireService } from '../../common/service/angularFire.service';
import { GeolocationService } from '../../common/service/Geolocation.service';
import { UserService } from "app/common/service/user.service";


@Component({
	selector: 'app-add-tank',
	templateUrl: './add-tank.component.html',
	styleUrls: ['./add-tank.component.scss'],
	providers: [AngularFireService, GeolocationService, ToasterService, UserService]
})
export class AddTankComponent implements OnInit {

	/* 		FORM	variables		*/
	// radio button options
	public tankType: RadioOption[] = [{ display: 'Elevado', value: 'Elevado' }, { display: 'A nivel', value: 'Nivel' }, { display: 'Enterrado', value: 'Enterrado' }, { display: 'Semi-enterrado', value: 'Semi' }];
	public tankMaterial: RadioOption[] = [{ display: 'Contreto', value: 'Contreto' }, { display: 'Metalico', value: 'Metalico' }, { display: 'Plastico', value: 'Plastico' }];
	public cleaningFrec: RadioOption[] = [{ display: 'Anual', value: 'Anual' }, { display: 'Semestral', value: 'Semestral' }, { display: 'Trimestral', value: 'Trimestral' }, { display: 'Mensual', value: 'Mensual' }, { display: 'Otra', value: 'Otra' }, { display: 'No se sabe/Nunca', value: 'NA' }];
	public measureUnit: RadioOption[] = [{display: 'metros cubicos', value: 'metro3'},{ display: 'litros', value: 'litro'}];

	// Object contains the values input
	private newTank: TankForm = new TankForm();
	public creationDate: Date;
	private asadaParent: pkAsada;

	// the object that handles the form
	public addTankForm: FormGroup;

	/*		DB 	variables		*/
	private infraDB;
	public asdadaDB;

	public imageFile;
	private storageRef;

	@Input() asadaId: string;

	/*			Toast variables		*/
	public toastConfig: ToasterConfig = new ToasterConfig({
		positionClass: 'toast-bottom-center',
		limit: 5
	});

	/*		Auth		*/
	private user: FirebaseAuthState;
	public isAdmin: boolean;
	private userAccessRol: RolAccess;

	constructor(
		private angularFire: AngularFire,
		private userService:UserService,
		@Inject(FirebaseApp) firebaseApp: any,
		private angularFireService: AngularFireService,
		private geoLocation: GeolocationService,
		private fb: FormBuilder,
		private router: Router,
		private toasterService: ToasterService
	) {
		
	}

	ngOnInit() {
		this.buildFormTank();

		this.getAsadas();

		//Gets the actual login
		this.angularFire.auth.subscribe(user => {
			if (user) {
				// user logged in
				this.user = user;

				var userDetails = this.userService.getRolAccess(this.user.uid);
		
				userDetails.subscribe(
					results => {
						this.userAccessRol = results;

						if(this.userAccessRol){
							this.isAdmin = true;
							this.setInCharge();

						}
						else{
							this.isAdmin = false;
						}

					}
				);

			} else {
				// user not logged in
				this.isAdmin = false;
			}
		});
	}

	setInCharge(){
		var userInfo = this.userService.getUser(this.user.uid);
		userInfo.subscribe(
			results => {
				var userD: User = results;
				this.addTankForm.patchValue({ 'inCharge': userD.nombre  + " " + userD.apellidos })
			});
	}

	onSubmit() {
		//Extracts the values from the forms
		this.newTank = this.addTankForm.value;

		const TankTags = 'Tanque ' + this.newTank.tankName + ' ' +
									this.newTank.aqueductName + ' ' +
									this.asadaParent.name + ' ' + 
									this.asadaId;
		const date = {
			day: this.creationDate.getDate(),
			month: this.creationDate.getMonth() + 1,
			year: this.creationDate.getFullYear()
		};

		const volumeInfo = {
			amount: Number(this.newTank.volumeAmount),
			unit: this.newTank.volumeUnit 
		};

		const detailsInfo = {
			aqueductName: this.newTank.aqueductName,
			registerNo: this.newTank.registerNo,
			inCharge: this.newTank.inCharge,
			volume : volumeInfo,
			creationDate: date,
			direction: this.newTank.direction,
			tankType: this.newTank.type,
			material: this.newTank.material,
			cleaning: this.newTank.cleaning
		};
		const infra : Tank = new Tank();
		//const infra : Tank = {
			infra.asada = {
				name: this.asadaParent.name,
				id: this.asadaParent.id
			};
			infra.img = []; 
			infra.lat = this.newTank.latitude;
			infra.long = this.newTank.longitude;
			infra.name = this.newTank.tankName;
			infra.risk = 0; 
			infra.tags = TankTags;
			infra.type = 'Tanque';
			infra.details = detailsInfo;
		//};
		this.addNewTank(infra);
		this.goToASADA();
	}

	/*		DB methods		*/

	getInfrastuctures(): void {
		this.angularFireService.getInfrastuctures().subscribe(
			results => {
				this.infraDB = results;
			}
		);
	}

	getAsadas(): void {
		this.angularFireService.getAsadas().subscribe(
			results => {
				this.asdadaDB = results;

				this.asadaValue();
			}
		);
	}

	addNewTank(pTank): void {
		this.angularFireService.addNewInfrastructure(pTank);
	}

	pdateInfrastructure(pId, pInfra): void {
		this.angularFireService.updateInfrastructure(pId, pInfra);
	}

	/*		Html methods		*/


	goToASADA(): void {
		this.popToast();
		setTimeout(() => {
			this.router.navigate(['/asadaDetails/'+this.asadaId]);
		},
			1500);

	}

	cancel() {
		this.router.navigate(['/asadaDetails/'+this.asadaId]);
	}

	popToast() {
		var toast = {
			type: 'success',
			title: 'Agregado correctamente',
			showCloseButton: true
		};
		this.toasterService.pop(toast);
	}

	getGeoLocation() {
		this.geoLocation.getCurrentPosition().subscribe(
			result => {
				if (result) {
					this.addTankForm.patchValue({ 'latitude': result.coords.latitude });
					this.addTankForm.patchValue({ 'longitude': result.coords.longitude });
				}

			}
		);
	}

	uploadFile(event) {
		let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
		let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
		let files: FileList = target.files;
		this.imageFile = files[0];

	}


	asadaValue() {

		this.asadaParent = new pkAsada();
		this.asadaParent.id = this.asadaId;


		for (let asadaLElem of this.asdadaDB) {
			if (asadaLElem.$key == this.asadaId) {
				this.asadaParent.name = asadaLElem.name;
			}
		}

		this.addTankForm.patchValue({ 'asada': this.asadaParent.name });
	}


	buildFormTank(): void {
		this.addTankForm = this.fb.group({
			'aqueductName': ['', Validators.required],
			'registerNo': ['', Validators.required],
			'tankName': ['', Validators.required],
			'inCharge': ['', Validators.required],
			'volumeAmount': ['', Validators.required],
			'volumeUnit': [this.measureUnit[0].value],
			'type': [this.tankType[0].value],
			'material': [this.tankMaterial[0].value],
			'cleaning': [this.cleaningFrec[0].value],
			'latitude': ['', Validators.required],
			'longitude': ['', Validators.required],
			'direction': ['', Validators.required],
			'asada': ['', Validators.required]
		});
		this.addTankForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}


	onValueChanged(data?: any) {
		if (!this.addTankForm) { return; }
		const form = this.addTankForm;
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

	public formErrors = {
		'aqueductName': '',
		'registerNo': '',
		'tankName': '',
		'inCharge': '',
		'volumeAmount': '',
		'latitude': '',
		'longitude': '',
		'direction':'',
		'asada':''
	};
	private validationMessages = {
		'aqueductName': {
			'required': 'Nombre requerido'
		},
		'registerNo': {
			'required': 'Numero de registro requerido'
		},
		'tankName': {
			'required': 'Nombre requerido'
		},
		'inCharge': {
			'required': 'Encargado requerido'
		},
		'volumeAmount': {
			'required': 'Volumen requerido'
		},
		'latitude': {
			'required': 'Latitud requerido'
		},
		'longitude': {
			'required': 'Longitud requerido'
		},
		'direction': {
			'required': 'Dirreción requerido'
		},
		'asada': {
			'required': 'ASADA requerido'
		}
	};


}


