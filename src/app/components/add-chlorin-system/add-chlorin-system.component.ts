import { Component, OnInit, Inject, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';


/*		Model		*/
import { RadioOption } from '../../common/model/radioOption-class';
import { pkAsada } from '../../common/model/peekAsada';
import { FromChlorin } from '../../common/model/FormChlorin-class';
import { Chlorination } from '../../common/model/Chlorination';
import { User } from '../../common/model/User';
import { RolAccess } from '../../common/model/RolAccess';

/*		Service 		*/
import { AngularFireService } from '../../common/service/angularFire.service';
import { GeolocationService } from '../../common/service/Geolocation.service';
import { UserService } from "app/common/service/user.service";

/*		Module 		*/
import * as firebase from 'firebase';
import { FirebaseApp, AngularFire, FirebaseAuthState } from 'angularfire2';
import { ToasterService, ToasterConfig } from 'angular2-toaster';


@Component({
	selector: 'app-add-chlorin-system',
	templateUrl: './add-chlorin-system.component.html',
	styleUrls: ['./add-chlorin-system.component.scss'],
	providers: [AngularFireService, GeolocationService, UserService]
})
export class AddChlorinSystemComponent implements OnInit {

	/* 		FORM	variables		*/

	public chlorinType: RadioOption[] = [{ display: 'Gas Cloro', value: 'GasCloro' }, { display: 'Electrolisis', value: 'Electrolisis' }, { display: 'Pastillas (Erosion)', value: 'Pastillas' }, { display: 'Otros', value: 'Otros' }];
	public dosageType: RadioOption[] = [{ display: 'Continua', value: 'Continua' }, { display: 'Tiempos programados', value: 'Programado' }];


	// Object contains the values input
	private newChlorin: FromChlorin = new FromChlorin();

	public AqueductCreationDate: Date;
	public SistemInstallDate: Date;
	private asadaParent: pkAsada;


	// the object that handles the form
	public addChlorinForm: FormGroup;

	/*    DB varibles   */
	public asadaDB;

	//store the image
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
		private toasterService: ToasterService)
	{ this.storageRef = firebaseApp.storage().ref(); }

	ngOnInit() {
		this.buildFormChlorin();

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

						if(this.userAccessRol ){
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
				this.addChlorinForm.patchValue({ 'inCharge': userD.nombre  + " " + userD.apellidos })
			});
	}


	onSubmit() {
		//Extracts the values from the forms
		this.newChlorin = this.addChlorinForm.value;



		const ChlorinTags = 'SistemaCloracion ' + this.newChlorin.chlorinName + ' ' + this.newChlorin.aqueductName + ' ' + this.asadaParent.name + ' ' + this.asadaParent.id;
		const systemDate = { day: this.SistemInstallDate.getDate(), month: this.SistemInstallDate.getMonth() + 1, year: this.SistemInstallDate.getFullYear() };
		const aqueductDate = { day: this.AqueductCreationDate.getDate(), month: this.AqueductCreationDate.getMonth() + 1, year: this.AqueductCreationDate.getFullYear()};
		const detailsInfo = { 
			aqueductName: this.newChlorin.aqueductName, 
			aqueductInCharge : this.newChlorin.aqueductInCharge,
			ubication: this.newChlorin.ubication, 
			inCharge: this.newChlorin.inCharge, 
			chlorinType: this.newChlorin.chlorinType, 
			dosageType: this.newChlorin.dosageType, 
			installationDate: systemDate,
			AqueductCreationDate: aqueductDate };
		
		const infra : Chlorination = new Chlorination();
		//const infra : Chlorination = { 
			infra.asada = { name: this.asadaParent.name,
				id: this.asadaParent.id }; 
			infra.img = []; 
			infra.lat = this.newChlorin.latitude; 
			infra.long = this.newChlorin.longitude; 
			infra.name = this.newChlorin.chlorinName; 
			infra.risk = 0; 
			infra.tags = ChlorinTags; 
			infra.type = 'SistemaCloracion'; 
			infra.details = detailsInfo; 
			//};


		this.addNewChlorin(infra);
		this.	goToASADA();


	}

	/*		DB methods		*/

	getAsadas(): void {
		this.angularFireService.getAsadas().subscribe(
			results => {
				this.asadaDB = results;

				this.asadaValue();
			}
		);
	}

	addNewChlorin(pChlorin): void {
		this.angularFireService.addNewInfrastructure(pChlorin);
	}

	/*    HTML METHODS    */

	goToASADA(): void {
		this.popToast();
		setTimeout(() => {
			this.router.navigate(['/asadaDetails/'+this.asadaId]);
		},
			2250);

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

	asadaValue() {

		this.asadaParent = new pkAsada();
		this.asadaParent.id = this.asadaId;


		for (let asadaLElem of this.asadaDB) {
			if (asadaLElem.$key == this.asadaId) {
				this.asadaParent.name = asadaLElem.name;
			}
		}

		this.addChlorinForm.patchValue({ 'asada': this.asadaParent.name });
	}

	getGeoLocation() {
		this.geoLocation.getCurrentPosition().subscribe(
			result => {
				if (result) {
					this.addChlorinForm.patchValue({ 'latitude': result.coords.latitude });
					this.addChlorinForm.patchValue({ 'longitude': result.coords.longitude });
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

	buildFormChlorin(): void {
		this.addChlorinForm = this.fb.group({
			'chlorinName': ['', Validators.required],
			'aqueductName': ['', Validators.required],
			'aqueductInCharge': ['', Validators.required],
			'inCharge': ['', Validators.required],
			'ubication': ['', Validators.required],
			'chlorinType': [this.chlorinType[0].value],
			'dosageType': [this.dosageType[0].value],
			'latitude': ['', Validators.required],
			'longitude': ['', Validators.required],
			'asada': ['']
		});
		this.addChlorinForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}


	onValueChanged(data?: any) {
		if (!this.addChlorinForm) { return; }
		const form = this.addChlorinForm;
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
		'chlorinName': '',
		'aqueductName': '',
		'aqueductInCharge': '',
		'inCharge': '',
		'ubication': '',
		'latitude': '',
		'longitude': '',

	};
	private validationMessages = {
		'chlorinName': {
			'required': 'Nombre del sistema de cloracion requerido'
		},
		'aqueductName': {
			'required': 'Nombre requerido'
		},
		'aqueductInCharge': {
			'required': 'Encargado del acueducto requerido'
		},
		'inCharge': {
			'required': 'Encargado requerido'
		},
		'ubication': {
			'required': 'Ubicacion requerida'
		},
		'latitude': {
			'required': 'Latitud requerida'
		},
		'longitude': {
			'required': 'Longitud requerida'
		}
	};


}
