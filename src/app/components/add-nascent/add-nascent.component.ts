import { Component, OnInit, Inject, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

/*		Model-Entities		*/
import { RadioOption } from '../../common/model/radioOption-class';
import { pkAsada } from '../../common/model/peekAsada';
import { NascentForm } from '../../common/model/FormNascent';
import { Nascent } from '../../common/model/Nascent';
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
	selector: 'app-add-nascent',
	templateUrl: './add-nascent.component.html',
	styleUrls: ['./add-nascent.component.scss'],
	providers: [AngularFireService, GeolocationService, ToasterService, UserService]
})
export class AddNascentComponent implements OnInit {
	/* 		FORM	variables		*/
	// radio button options
	public nascentType: RadioOption[] = [{ display: 'Caseta', value: 'Caseta' }, { display: 'A nivel', value: 'Nivel' }, { display: 'Enterrada', value: 'Enterrada' }, { display: 'Semi-enterrada', value: 'SemiEnterrada' }];

	// Object contains the values input
	private newNascent: NascentForm = new NascentForm();
	private asadaParent: pkAsada;

	// the object that handles the form
	public addNascentForm: FormGroup;

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
		this.storageRef = firebaseApp.storage().ref();
	}

	ngOnInit() {
		this.buildFormNascent();

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
				this.addNascentForm.patchValue({ 'inCharge': userD.nombre  + " " + userD.apellidos })
			});
	}

	onSubmit() {
		//Extracts the values from the forms
		this.newNascent = this.addNascentForm.value;


		const NascentTags = 'CaptacionNaciente ' + 
						this.newNascent.nascentName + ' ' +
						this.newNascent.aqueductName + ' ' +
						this.asadaParent.name + ' ' +
						this.asadaParent.id ;

		const detailsInfo = {
			aqueductName: this.newNascent.aqueductName,
			aqueductInCharge: this.newNascent.aqueductInCharge,
			registerMINAE: this.newNascent.registerMINAE,
			inCharge: this.newNascent.inCharge,
			registerARS: this.newNascent.registerARS,
			nascentType: this.newNascent.nascentType,
		};
		const infra: Nascent = new Nascent();
		//const infra: Nascent = {
			infra.asada = {
				name: this.asadaParent.name,
				id: this.asadaParent.id
			};
			infra.img = [];
			infra.lat = this.newNascent.latitude;
			infra.long = this.newNascent.longitude;
			infra.name = this.newNascent.nascentName;
			infra.risk = 0; 
			infra.tags = NascentTags;
			infra.type = 'CaptacionNaciente';
			infra.details = detailsInfo;
		//};
		this.addNewNascent(infra);
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

	addNewNascent(pNascent): void {
		this.angularFireService.addNewInfrastructure(pNascent);
	}

	/*		Html methods		*/

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

	getGeoLocation() {
		this.geoLocation.getCurrentPosition().subscribe(
			result => {
				if (result) {
					this.addNascentForm.patchValue({ 'latitude': result.coords.latitude });
					this.addNascentForm.patchValue({ 'longitude': result.coords.longitude });
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

		this.addNascentForm.patchValue({ 'asada': this.asadaParent.name });
	}

	buildFormNascent(): void {
		this.addNascentForm = this.fb.group({
			'aqueductName': ['', Validators.required],
			'aqueductInCharge': ['', Validators.required],
			'registerMINAE': ['', Validators.required],
			'inCharge': ['', Validators.required],
			'nascentName': ['', Validators.required],
			'registerARS': ['', Validators.required],
			'nascentType': [this.nascentType[0].value],
			'latitude': ['', Validators.required],
			'longitude': ['', Validators.required],
			'asada': ['']
		});
		this.addNascentForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}


	onValueChanged(data?: any) {
		if (!this.addNascentForm) { return; }
		const form = this.addNascentForm;
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
		'aqueductInCharge': '',
		'registerMINAE': '',
		'nascentName': '',
		'inCharge': '',
		'registerARS': '',
		'latitude': '',
		'longitude': ''
	};
	private validationMessages = {
		'aqueductName': {
			'required': 'Nombre requerido'
		},
		'aqueductInCharge': {
			'required': 'Encargado requerido'
		},
		'registerMINAE': {
			'required': 'Numero de registro requerido'
		},
		'nascentName': {
			'required': 'Nombre requerido'
		},
		'inCharge': {
			'required': 'Funcionario requerido'
		},
		'registerARS': {
			'required': 'Registro de ARS requerido'
		},
		'latitude': {
			'required': 'Latitud requerido'
		},
		'longitude': {
			'required': 'Longitud requerido'
		}
	};

}
