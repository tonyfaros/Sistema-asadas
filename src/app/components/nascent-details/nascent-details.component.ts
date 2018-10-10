import { Component, OnInit, Inject, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
declare var $: any;

/*		Model-Entities		*/
import { RadioOption } from '../../common/model/radioOption-class';
import { pkAsada } from '../../common/model/peekAsada';
import { NascentForm } from '../../common/model/FormNascent';
import { Nascent } from '../../common/model/Nascent';
import { User } from '../../common/model/User';
import { RolAccess } from '../../common/model/RolAccess';
import { FirebaseImg } from '../../common/model/FirebaseImg';

/*		Modules		*/
import * as firebase from 'firebase';
import { FirebaseApp, AngularFire, FirebaseAuthState } from 'angularfire2';
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { Image, Action, ImageModalEvent, Description } from 'angular-modal-gallery';

import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/of';

/*		Services		*/
import { AngularFireService } from '../../common/service/angularFire.service';
import { GeolocationService } from '../../common/service/Geolocation.service';
import { UserService } from "app/common/service/user.service";
import { ExportService } from "app/common/service/export.service";
import { Chlorination } from '../../common/model/Chlorination';

@Component({
	selector: 'app-nascent-details',
	templateUrl: './nascent-details.component.html',
	styleUrls: ['./nascent-details.component.scss'],
	providers: [AngularFireService, GeolocationService, ToasterService, UserService, ExportService]
})
export class NascentDetailsComponent implements OnInit {

	/*    Html variables    */
	// radio button options
	public nascentType: RadioOption[] = [{ display: 'Caseta', value: 'Caseta' }, { display: 'A nivel', value: 'A nivel' }, { display: 'Enterrada', value: 'Enterrada' }, { display: 'Semi-enterrada', value: 'SemiEnterrada' }];

	// Object contains the values input
	private newNascent: NascentForm = new NascentForm();
	public readOnlyMode: boolean;

	// the object that handles the form
	public detailNascentForm: FormGroup;

	/*  DB variables   */
	public infraDB: Nascent;


	/*		access Mode 		*/
	public editmode = true;
	/*	      images		*/
	public showGallery=false;

	/*		Toast variables		*/
	public toastConfig: ToasterConfig = new ToasterConfig({
		positionClass: 'toast-bottom-center',
		limit: 5
	});

	/*  routing variables   */
	private sub: any;
	private infrastructureId: string;


	/*		Auth		*/
	private user: FirebaseAuthState;
	public isAdmin: boolean;
	private userAccessRol: RolAccess;

	constructor(
		private angularFire: AngularFire,
		private userService: UserService,
		@Inject(FirebaseApp) firebaseApp: any,
		private route: ActivatedRoute,
		private router: Router,
		private angularFireService: AngularFireService,
		private fb: FormBuilder,
		private geoLocation: GeolocationService,
		private toasterService: ToasterService,
		private exportService: ExportService
	) {}

	ngOnInit() {
		this.sub = this.route.params
			.subscribe((params: Params) => {
				this.infrastructureId = params['id'];

				this.readOnlyMode = params['action'] == 'edit' ? false : true;
				this.resetForm();

				this.getInfrastucture(this.infrastructureId);
			});

		//Gets the actual login
		this.angularFire.auth.subscribe(user => {
			if (user) {
				// user logged in
				this.user = user;

				var userDetails = this.userService.getRolAccess(this.user.uid);

				userDetails.subscribe(
					results => {
						this.userAccessRol = results;

						if (this.userAccessRol.asada && (this.userAccessRol.asada == this.infraDB.asada.id) && (this.userAccessRol.rol == "Administración" || this.userAccessRol.rol == "Edición")) {
							this.isAdmin = true;
						}
						else if (this.userAccessRol.rol && this.userAccessRol.rol == "Super Administrador") {
							this.isAdmin = true;
						}
						else {
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
	onSubmit() {
		this.newNascent = this.detailNascentForm.value;

		this.infraDB.name = this.newNascent.nascentName;
		this.infraDB.lat = this.newNascent.latitude;
		this.infraDB.long = this.newNascent.longitude;

		this.infraDB.details.aqueductName = this.newNascent.aqueductName;
		this.infraDB.details.aqueductInCharge = this.newNascent.aqueductInCharge;
		this.infraDB.details.registerMINAE = this.newNascent.registerMINAE;
		this.infraDB.details.registerARS = this.newNascent.registerARS;
		this.infraDB.details.inCharge = this.newNascent.inCharge;
		this.infraDB.details.nascentType = this.newNascent.nascentType;

		this.infraDB.tags = 'CaptacionNaciente ' +
			this.newNascent.nascentName + ' ' +
			this.newNascent.aqueductName + ' ' +
			this.newNascent.aqueductInCharge + ' ' +
			this.infraDB.asada.id;

		this.popInfoToast("Guardando...");
		this.updateInfrastructure(this.infrastructureId, this.infraDB);

		this.reload();

	}
	getInfrastucture(pId): void {
		this.angularFireService.getInfrastructure(pId)
			.subscribe(
			results => {

				this.infraDB = results;
				if (this.infraDB && this.infraDB.details) {
					this.fillForm();
				}
			}
			);
	}
	updateInfrastructure(pId, pInfra): void {
		var newInfra:Nascent={
			tags: pInfra.tags,
			name: pInfra.name,
			risk: pInfra.risk,
			mainImg: pInfra.mainImg?pInfra.mainImg:{url:"",description:"",fileName:"",filePath:""},
			img:((pInfra.imagen==undefined)?[]: pInfra.img),
			type: pInfra.type,
			asada:pInfra.asada,
			lat: pInfra.lat,
			long: pInfra.long,
		
			details:pInfra.details,
		
			//New data by Luis
			dateCreated: pInfra.dateCreated,
			riskNames: pInfra.riskNames,
			riskValues: pInfra.riskValues,
			siNumber: pInfra.siNumber,
			riskLevel: pInfra.riskLevel
		}
		this.angularFireService.updateInfrastructure(pId, pInfra);
	}
	fillForm() {
		console.log(this.infraDB);
		this.detailNascentForm.patchValue({ 'nascentName': this.infraDB.name });
		this.detailNascentForm.patchValue({ 'aqueductName': this.infraDB.details.aqueductName });
		this.detailNascentForm.patchValue({ 'aqueductInCharge': this.infraDB.details.aqueductInCharge });
		this.detailNascentForm.patchValue({ 'inCharge': this.infraDB.details.inCharge });
		this.detailNascentForm.patchValue({ 'registerMINAE': this.infraDB.details.registerMINAE });
		this.detailNascentForm.patchValue({ 'registerARS': this.infraDB.details.registerARS });
		this.detailNascentForm.patchValue({ 'nascentType': this.infraDB.details.nascentType });
		this.detailNascentForm.patchValue({ 'latitude': this.infraDB.lat });
		this.detailNascentForm.patchValue({ 'longitude': this.infraDB.long });
		this.detailNascentForm.patchValue({ 'asadaName': this.infraDB.asada.name });
		this.detailNascentForm.patchValue({ 'risk': this.infraDB.risk });
	}
	resetForm(): void {
		this.detailNascentForm = this.fb.group({
			'aqueductName': ['', Validators.required],
			'aqueductInCharge': ['', Validators.required],
			'registerMINAE': ['', Validators.required],
			'inCharge': ['', Validators.required],
			'nascentName': ['', Validators.required],
			'registerARS': ['', Validators.required],
			'nascentType': [this.nascentType[0].value],
			'latitude': ['', Validators.required],
			'longitude': ['', Validators.required],
			'asadaName': [''],
			'risk': ['']
		});
		this.detailNascentForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}
	onValueChanged(data?: any) {
		if (!this.detailNascentForm) { return; }
		const form = this.detailNascentForm;
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

	//Busca la ubicacion actual donde se encuentra el dispositivo
	//con el que se esta accediendo
	getGeoLocation() {
		this.popInfoToast("Obteniendo ubicación.");
		this.geoLocation.getCurrentPosition().subscribe(
			result => {
				if (result) {
					this.detailNascentForm.patchValue({ 'latitude': result.coords.latitude });
					this.detailNascentForm.patchValue({ 'longitude': result.coords.longitude });
					
					this.popSuccessToast("Ubicación cargada correctamente.");
				}
				else{
					this.popErrorToast("No se pudo obtener la ubicación.");
				}

			}
		);
	}

	//Toasters
	//Mensajes flotantes
	popSuccessToast(pMesage: string) {
		var toast = {
			type: 'success',
			body: pMesage
		};
		this.toasterService.pop(toast);
	}
	popInfoToast(pMesage: string) {
		var toast = {
			type: 'info',
			body: pMesage
		};
		this.toasterService.pop(toast);
	}
	popErrorToast(pMessage: string) {
		var toast = {
			type: 'error',
			body: pMessage
		};
		this.toasterService.pop(toast);
	}
	/*    Infrastructure methods    */
	//Borra la infraestructura
	delete() {
		// this.deleteAllImages();
		alert("Eliminado de Imagenes pendiente");
		this.angularFireService.deleteInfrastructure(this.infrastructureId);
		this.router.navigate(["/asadaDetails", this.infraDB.asada.id]);
	}
	//Exporta la infraestructura a un documento externo
	export() {
		this.exportService.exportInfrastructure(this.infraDB);
	}
	/*    HTML methods    */
	goBack(): void {
		setTimeout(() => {
			this.ngOnInit();
		},
			1500);

	}
	reload() {
		this.router.navigate(['/' + this.infraDB.type + 'Details', this.infrastructureId]);
		this.ngOnInit();
	}
	//Cambia el modo a edicion
	changeToEdit() {
		this.readOnlyMode = false;
	}
	/*    Gallery methods    */
	//Metodos escucha y interacciones con la galeria de evidencias
	mainImageChanged(event,modalID:string){
		this.showGallery=false;
		this.toggleGalleryModal(false);
		this.popSuccessToast("Imagen principal actualizada correctamente");
	}
	uploadingMainImage(image){
		this.popInfoToast("Cargando imagen principal");
	}
	error(error){
		if(error.content){
			this.popErrorToast(error.content);
		}
		else{
			if( (typeof error) == 'string'){
				this.popErrorToast(error);
			}
		}
	}
	toggleGalleryModal(toggle:boolean){
		this.showGallery=toggle;
		var state=toggle?"show":"hide";
		$('#gallery-modal').modal(state);
	}


}
