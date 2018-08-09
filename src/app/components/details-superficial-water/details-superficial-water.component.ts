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
import { FirebaseImg } from '../../common/model/FirebaseImg';

/*    Modules     */
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

@Component({
	selector: 'app-details-superficial-water',
	templateUrl: './details-superficial-water.component.html',
	styleUrls: ['./details-superficial-water.component.scss'],
	providers: [AngularFireService, GeolocationService, ToasterService, UserService, ExportService]
})
export class DetailsSuperficialWaterComponent implements OnInit {
	/* 		FORM	variables		*/
	// radio button options
	public cleaningFrec: RadioOption[] = [{ display: 'Mensual', value: 'Mensual' }, { display: 'Semanal', value: 'Semanal' }, { display: 'Diara', value: 'Diara' }, { display: 'Nunca', value: 'Nunca' }, { display: 'Otro', value: 'Otro' }];

	// Object contains the values input
	private newSuperficialW: SuperficialForm = new SuperficialForm();
	public otherValue;

	public readOnlyMode: boolean;

	// the object that handles the form
	public detailsSuperficialWForm: FormGroup;

	/*		DB 	variables		*/
	public infraDB: SuperficialWater;

	//Images
	private imageFile;
	private storageRef;
	public imgMarkedDel: FirebaseImg;
	public imgMarkedEdit: FirebaseImg;

	/*  routing variables   */
	private sub: any;
	private infrastructureId: string;


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
		private userService: UserService,
		@Inject(FirebaseApp) firebaseApp: any,
		private route: ActivatedRoute,
		private router: Router,
		private angularFireService: AngularFireService,
		private geoLocation: GeolocationService,
		private fb: FormBuilder,
		private toasterService: ToasterService,
		private exportService: ExportService
	) {
		this.storageRef = firebaseApp.storage().ref();
	}
	export() {
		this.exportService.exportInfrastructure(this.infraDB);
	}
	ngOnInit() {
		this.sub = this.route.params
			.subscribe((params: Params) => {
				this.infrastructureId = params['id'];

				this.readOnlyMode = params['action'] == 'edit' ? false : true;
				this.buildForm();

				this.getInfrastuctures(this.infrastructureId);
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

						if (this.userAccessRol.asada && this.userAccessRol.asada == this.infraDB.asada.id && (this.userAccessRol.rol == "Administración" || this.userAccessRol.rol == "Edición")) {
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
		this.newSuperficialW = this.detailsSuperficialWForm.value;

		this.infraDB.name = this.newSuperficialW.superficialWName;
		this.infraDB.lat = this.newSuperficialW.latitude;
		this.infraDB.long = this.newSuperficialW.longitude;

		this.infraDB.details.aqueductName = this.newSuperficialW.aqueductName;
		this.infraDB.details.aqueductInCharge = this.newSuperficialW.superficialWName;
		this.infraDB.details.registerMINAE = this.newSuperficialW.registerMINAE;
		this.infraDB.details.registerARS = this.newSuperficialW.registerARS;
		this.infraDB.details.inCharge = this.newSuperficialW.inCharge;
		this.infraDB.details.cleaningFrec = this.newSuperficialW.cleaningFrec;
		this.infraDB.details.otherCleaning = this.newSuperficialW.otherCleaning;

		this.infraDB.tags = 'CaptacionSuperficial ' +
			this.newSuperficialW.superficialWName + ' ' +
			this.newSuperficialW.aqueductName + ' ' +
			this.newSuperficialW.aqueductInCharge + ' ' +
			this.infraDB.asada.id;

		this.updateInfrastructure(this.infrastructureId, this.infraDB);

		this.reload();
	}

	/*    DB methods    */

	getInfrastuctures(pId): void {
		this.angularFireService.getInfrastructure(pId)
			.subscribe(
			results => {

				this.infraDB = results;
				if (this.infraDB && this.infraDB.details) {
					this.buildFormSuperficialW();

					if (this.infraDB.img) {
						this.createImgList();
					}
				}
			}
			);
	}


	updateInfrastructure(pId, pInfra): void {
		var newInfra = {
			tags: pInfra.tags,
			name: pInfra.name,
    		risk: pInfra.risk,
    		img: ((pInfra.img == undefined) ? [] : pInfra.img),
    		type: pInfra.type,
    		asada:{
        		name: pInfra.asada.name,
        		id: pInfra.asada.id,
    		},
    		lat: pInfra.lat,
    		long: pInfra.long,
    		details:{
        		aqueductName: pInfra.details.aqueductName,
        		aqueductInCharge: pInfra.details.aqueductInCharge,
        		inCharge: pInfra.details.inCharge,
        		registerMINAE: pInfra.details.registerMINAE,
        		registerARS: pInfra.details.registerARS,
        		cleaningFrec: pInfra.details.cleaningFrec,
        		otherCleaning: ((pInfra.details.otherCleaning == undefined) ? '' : pInfra.details.otherCleaning)
    		},
    		riskNames: pInfra.riskNames,
    		riskValues: pInfra.riskValues,
    		siNumber: pInfra.siNumber,
    		riskLevel: pInfra.riskLevel,
    		dateCreated: pInfra.dateCreated
		};
		this.angularFireService.updateInfrastructure(pId, newInfra);
	}

	delete() {
		this.deleteAllImages();
		this.angularFireService.deleteInfrastructure(this.infrastructureId);
		this.router.navigate(["/asadaDetails", this.infraDB.asada.id]);
	}

	getGeoLocation() {
		this.geoLocation.getCurrentPosition().subscribe(
			result => {
				if (result) {
					this.detailsSuperficialWForm.patchValue({ 'latitude': result.coords.latitude });
					this.detailsSuperficialWForm.patchValue({ 'longitude': result.coords.longitude });
				}

			}
		);
	}

	uploadFile(event) {
		let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
		let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
		let files: FileList = target.files;
		this.imageFile = files[0];


		if (this.imageFile) {
			this.uploadImage();
		}

	}


	uploadImage() {
		//Upload the imageFile

		if ((this.infraDB.img && this.infraDB.img.length < 3) || !(this.infraDB.img)) {
			//Upload massage
			this.popInfoToast("Cargando imagen");
			const newFilename = Date.now() + this.imageFile.name;
			const uploadTask: firebase.storage.UploadTask = this.storageRef.child('infrastructure/' + newFilename).put(this.imageFile);
			let downloadURL: string;
			uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
				(snapshot) => {
					//console.log('Transfered: ' + snapshot.bytesTransferred + ' Total: ' + snapshot.totalBytes)
				},
				(error) => { },
				() => {
					downloadURL = uploadTask.snapshot.downloadURL;

					const newImage: FirebaseImg = { fileName: newFilename, url: downloadURL, description: '' };

					if (this.infraDB.img) {
						this.infraDB.img.push(newImage);
					} else {
						this.infraDB.img = [newImage];
					}

					this.updateInfrastructure(this.infrastructureId, this.infraDB);
				}
			);

		} else
			this.popErrorToast("Solo se permite un maximo de 3 imagenes");

	}
	deleteAllImages(){
		while (this.infraDB.img){
			this.markForDelete(this.infraDB.img[0]);
			this.deleteImage();
		}
		 
	}

	markForDelete(pImage: FirebaseImg){
		this.imgMarkedDel = pImage;
	}



	deleteImage() {
		if (this.imgMarkedDel && this.infraDB.img) {
			var index = 0;
			for (let image of this.infraDB.img) {
				if (image == this.imgMarkedDel) {

					const fileName = this.imgMarkedDel.fileName;
					//Delete on the list
					this.infraDB.img.splice(index, 1)
					this.updateInfrastructure(this.infrastructureId, this.infraDB);

					//Delete on DB
					this.storageRef.child('infrastructure/' + fileName).delete();

					this.popSuccessToast('Imagen eliminada correctamente');
					this.imgMarkedDel = null;

				}
				index++;
			}
		}

	}
	cancelDeleteImg() {
		this.imgMarkedDel = null;
	}

	markForEdition(pImage: FirebaseImg) {
		this.imgMarkedEdit = pImage;
	}

	saveDescription(pDescription: string) {
		if (this.imgMarkedEdit && this.infraDB.img) {
			var index = 0;
			for (let image of this.infraDB.img) {
				if (image.fileName == this.imgMarkedEdit.fileName) {

					image.description = pDescription;
					this.updateInfrastructure(this.infrastructureId, this.infraDB);
					this.popSuccessToast('Descripción agregada');
					this.imgMarkedEdit = null;

				}

			}
		}

	}

	cancelEditImg() {
		this.imgMarkedEdit = null;
	}

	popSuccessToast(pMesage: string) {
		var toast = {
			type: 'success',
			title: pMesage
		};
		this.toasterService.pop(toast);
	}

	popInfoToast(pMesage: string) {
		var toast = {
			type: 'info',
			title: pMesage
		};
		this.toasterService.pop(toast);
	}


	popErrorToast(pMessage: string) {
		var toast = {
			type: 'error',
			title: pMessage
		};
		this.toasterService.pop(toast);
	}

	changeToEdit() {
		this.readOnlyMode = false;
	}

	reload() {
		this.router.navigate(['/' + this.infraDB.type + 'Details', this.infrastructureId]);
		this.ngOnInit();
	}

	checkOther(pRadioValue: String) {
		if (pRadioValue == "Otro") {
			this.otherValue = true;
		} else {
			this.otherValue = false;
			this.detailsSuperficialWForm.patchValue({ 'otherCleaning': null });

		}
	}

	openEvaluation() {
		this.router.navigate(['/evalSERSA', this.infraDB.type, this.infrastructureId]);
	}

	buildFormSuperficialW() {
		this.detailsSuperficialWForm.patchValue({ 'superficialWName': this.infraDB.name });
		this.detailsSuperficialWForm.patchValue({ 'aqueductName': this.infraDB.details.aqueductName });
		this.detailsSuperficialWForm.patchValue({ 'aqueductInCharge': this.infraDB.details.aqueductInCharge });
		this.detailsSuperficialWForm.patchValue({ 'inCharge': this.infraDB.details.inCharge });
		this.detailsSuperficialWForm.patchValue({ 'registerMINAE': this.infraDB.details.registerMINAE });
		this.detailsSuperficialWForm.patchValue({ 'registerARS': this.infraDB.details.registerARS });
		this.detailsSuperficialWForm.patchValue({ 'cleaningFrec': this.infraDB.details.cleaningFrec });
		this.detailsSuperficialWForm.patchValue({ 'latitude': this.infraDB.lat });
		this.detailsSuperficialWForm.patchValue({ 'longitude': this.infraDB.long });
		this.detailsSuperficialWForm.patchValue({ 'asadaName': this.infraDB.asada.name });
		this.detailsSuperficialWForm.patchValue({ 'risk': this.infraDB.risk });

		if (this.infraDB.details.otherCleaning) {
			this.detailsSuperficialWForm.patchValue({ 'otherCleaning': this.infraDB.details.otherCleaning });
			this.otherValue = true;
		} else
			this.otherValue = false;
	}

	buildForm(): void {
		this.detailsSuperficialWForm = this.fb.group({
			'aqueductName': ['', Validators.required],
			'aqueductInCharge': ['', Validators.required],
			'registerMINAE': ['', Validators.required],
			'inCharge': ['', Validators.required],
			'superficialWName': ['', Validators.required],
			'registerARS': ['', Validators.required],
			'cleaningFrec': [this.cleaningFrec[0].value],
			'otherCleaning': [''],
			'latitude': ['', Validators.required],
			'longitude': ['', Validators.required],
			'asadaName': [''],
			'risk': ['']
		});
		this.detailsSuperficialWForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}


	onValueChanged(data?: any) {
		if (!this.detailsSuperficialWForm) { return; }
		const form = this.detailsSuperficialWForm;
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
		'superficialWName': '',
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
		'superficialWName': {
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

	/* 		IMAGE GALLERY METHODS 		*/


	private imagesArray: Array<Image> = [];
	public imagesObservable: Observable<Array<Image>>;

	createImgList(): void {

		this.imagesArray = [];

		for (let image of this.infraDB.img) {
			this.imagesArray.push(new Image(
				image.url,
				image.url, // thumb
				image.description, // description
				image.url //url
			));
		}

		this.imagesObservable = Observable.of(this.imagesArray);
	}

}
