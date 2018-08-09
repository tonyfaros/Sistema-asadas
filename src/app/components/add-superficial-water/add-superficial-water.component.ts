import { Component, OnInit, Inject, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

/*    Models    */
import { RadioOption } from '../../common/model/radioOption-class';
import { pkAsada } from '../../common/model/peekAsada';
import { SuperficialWater } from '../../common/model/SuperficialWater';
import { SuperficialForm } from '../../common/model/FormSuperficial';
import { User } from '../../common/model/User';
import { RolAccess } from '../../common/model/RolAccess';

/*    Modules     */
import * as firebase from 'firebase';
import { FirebaseApp, AngularFire, FirebaseAuthState } from 'angularfire2';
import { ToasterService, ToasterConfig } from 'angular2-toaster';

/*		Services		*/
import { AngularFireService } from '../../common/service/angularFire.service';
import { GeolocationService } from '../../common/service/Geolocation.service';
import { UserService } from "app/common/service/user.service";


@Component({
  selector: 'app-add-superficial-water',
  templateUrl: './add-superficial-water.component.html',
  styleUrls: ['./add-superficial-water.component.scss'],
  providers: [AngularFireService, GeolocationService, ToasterService, UserService]
})
export class AddSuperficialWaterComponent implements OnInit {
	/* 		FORM	variables		*/
	// radio button options
	public cleaningFrec: RadioOption[] = [{ display: 'Mensual', value: 'Mensual' }, { display: 'Semanal', value: 'Semanal' }, { display: 'Diara', value: 'Diara' }, { display: 'Nunca', value: 'Nunca' }, { display: 'Otro', value: 'Otro' }];

	// Object contains the values input
	private newSuperficialW: SuperficialForm = new SuperficialForm();
	private asadaParent: pkAsada;
  public otherValue;

	// the object that handles the form
	public addSuperficialWForm: FormGroup;

	/*		DB 	variables		*/
	private infraDB;
	public asdadaDB;

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
		private angularFireService: AngularFireService,
		private geoLocation: GeolocationService,
		private fb: FormBuilder,
		private router: Router,
		private toasterService: ToasterService 
  ) { }

  ngOnInit() {
    this.otherValue = false;

    this.buildFormSuperficialW();

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
				this.addSuperficialWForm.patchValue({ 'inCharge': userD.nombre  + " " + userD.apellidos })
			});
	}

  onSubmit(){
    		//Extracts the values from the forms
		this.newSuperficialW = this.addSuperficialWForm.value;


		const NascentTags = 'CaptacionSuperficial ' + 
						this.newSuperficialW.superficialWName + ' ' +
						this.newSuperficialW.aqueductName + ' ' +
						this.asadaParent.name + ' ' +
						this.asadaParent.id ;

          
    //Verifica si se escogio la opcion de otros
		var detailsInfo;
    if(this.otherValue == true){
      detailsInfo = {
        aqueductName: this.newSuperficialW.aqueductName,
        aqueductInCharge: this.newSuperficialW.aqueductInCharge,
        registerMINAE: this.newSuperficialW.registerMINAE,
        registerARS: this.newSuperficialW.registerARS,
        inCharge: this.newSuperficialW.inCharge,
        cleaningFrec: this.newSuperficialW.cleaningFrec,
        otherCleaning: this.newSuperficialW.otherCleaning
      };
    }else{
      detailsInfo = {
        aqueductName: this.newSuperficialW.aqueductName,
        aqueductInCharge: this.newSuperficialW.aqueductInCharge,
        registerMINAE: this.newSuperficialW.registerMINAE,
        registerARS: this.newSuperficialW.registerARS,
        inCharge: this.newSuperficialW.inCharge,
        cleaningFrec: this.newSuperficialW.cleaningFrec,
      };

    }

    
    	const infra: SuperficialWater = new SuperficialWater();
		//const infra: SuperficialWater = {
			infra.asada = {
				name: this.asadaParent.name,
				id: this.asadaParent.id
			};
			infra.img = [];
			infra.lat = this.newSuperficialW.latitude;
			infra.long = this.newSuperficialW.longitude;
			infra.name = this.newSuperficialW.superficialWName;
			infra.risk = 0; 
			infra.tags = NascentTags;
			infra.type = 'CaptacionSuperficial';
			infra.details = detailsInfo;
		//};
		this.addNewSuperficialW(infra);
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

	addNewSuperficialW(pSuperficialW): void {
		this.angularFireService.addNewInfrastructure(pSuperficialW);
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
					this.addSuperficialWForm.patchValue({ 'latitude': result.coords.latitude });
					this.addSuperficialWForm.patchValue({ 'longitude': result.coords.longitude });
				}

			}
		);
	}

  asadaValue() {

		this.asadaParent = new pkAsada();
		this.asadaParent.id = this.asadaId;

		for (let asadaLElem of this.asdadaDB) {
			if (asadaLElem.$key == this.asadaId) {
				this.asadaParent.name = asadaLElem.name;
			}
		}

		this.addSuperficialWForm.patchValue({ 'asada': this.asadaParent.name });
	}

  checkOther(pRadioValue: String){
    if(pRadioValue == "Otro"){
      this.otherValue = true;
    }else{
      this.otherValue = false;
    }
  }

  	buildFormSuperficialW(): void {
		this.addSuperficialWForm = this.fb.group({
			'aqueductName': ['', Validators.required],
			'aqueductInCharge': ['', Validators.required],
			'registerMINAE': ['', Validators.required],
			'registerARS': ['', Validators.required],
			'inCharge': ['', Validators.required],
			'superficialWName': ['', Validators.required],
			'cleaningFrec': [this.cleaningFrec[0].value],
      'otherCleaning': [''],
			'latitude': ['', Validators.required],
			'longitude': ['', Validators.required],
			'asada': ['']
		});
		this.addSuperficialWForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}


	onValueChanged(data?: any) {
		if (!this.addSuperficialWForm) { return; }
		const form = this.addSuperficialWForm;
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
    'registerARS': '',
		'superficialWName': '',
		'inCharge': '',
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
		'registerARS': {
			'required': 'Registro de ARS requerido'
		},
		'superficialWName': {
			'required': 'Nombre requerido'
		},
		'inCharge': {
			'required': 'Funcionario requerido'
		},
		'latitude': {
			'required': 'Latitud requerido'
		},
		'longitude': {
			'required': 'Longitud requerido'
		}
	};


}
