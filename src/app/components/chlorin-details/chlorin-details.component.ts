import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

/*		Model-Entities		*/
import { RadioOption } from '../../common/model/radioOption-class';
import { FromChlorin } from '../../common/model/FormChlorin-class';
import { Chlorination } from '../../common/model/Chlorination';
import { User } from '../../common/model/User';
import { RolAccess } from '../../common/model/RolAccess';
import { FirebaseImg } from '../../common/model/FirebaseImg';

/*		Modules		*/
import * as firebase from 'firebase';
import { FirebaseApp, AngularFire, FirebaseAuthState } from 'angularfire2';
import { Image, Action, ImageModalEvent, Description, } from 'angular-modal-gallery';
import { ToasterService, ToasterConfig } from 'angular2-toaster';

import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/of';


/*		Services		*/
import { GeolocationService } from '../../common/service/Geolocation.service';
import { AngularFireService } from '../../common/service/angularFire.service';
import { UserService } from "app/common/service/user.service";
import { ExportService } from "app/common/service/export.service";
import { Infrastructure } from '../../common/model/Infrastructure';

@Component({
	selector: 'app-chlorin-details',
	templateUrl: './chlorin-details.component.html',
	styleUrls: ['./chlorin-details.component.scss'],
	providers: [AngularFireService, GeolocationService, ToasterService, UserService, ExportService]
})
export class ChlorinDetailsComponent implements OnInit {

	/* 		FORM	variables		*/


	public chlorinType: RadioOption[] = [{ display: 'Gas Cloro', value: 'GasCloro' }, { display: 'Electrolisis', value: 'Electrolisis' }, { display: 'Pastillas (Erosion)', value: 'Pastillas' }, { display: 'Otros', value: 'Otros' }];
	public dosageType: RadioOption[] = [{ display: 'Continua', value: 'Continua' }, { display: 'Tiempos programados', value: 'Programado' }];

	// the object that handles the form
	public detailChlorinForm: FormGroup;


	// Object contains the values input
	private newChlorin: FromChlorin;
	public readOnlyMode: boolean = true;


	public AqueductCreationDate: Date;
	public SistemInstallDate: Date;

	private asadaSelected;

	/*    DB varibles   */
	public infraDB: Chlorination;
	public asadaDB;
	//store the image
	private imageFile;
	public imageURL;
	private storageRef;
	public imgMarkedDel: FirebaseImg;
	public imgMarkedEdit: FirebaseImg;

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

	/*		validation variables		*/

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
		private exportService: ExportService) {
		this.storageRef = firebaseApp.storage().ref();
	}
	private editmode = true;


	ngOnInit() {
		this.sub = this.route.params
			.subscribe((params: Params) => {
				this.infrastructureId = params['id'];
				this.readOnlyMode = params['action'] == 'edit' ? false : true;
				this.buildForm();

				this.getInfrastuctures(this.infrastructureId);


			});
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
		this.newChlorin = this.detailChlorinForm.value;

		this.infraDB.name = this.newChlorin.chlorinName;
		this.infraDB.lat = this.newChlorin.latitude;
		this.infraDB.long = this.newChlorin.longitude;

		this.infraDB.details.AqueductCreationDate.day = this.AqueductCreationDate.getDate();
		this.infraDB.details.AqueductCreationDate.month = this.AqueductCreationDate.getMonth() + 1;
		this.infraDB.details.AqueductCreationDate.year = this.AqueductCreationDate.getFullYear();

		this.infraDB.details.installationDate.day = this.SistemInstallDate.getDate();
		this.infraDB.details.installationDate.month = this.SistemInstallDate.getMonth() + 1;
		this.infraDB.details.installationDate.year = this.SistemInstallDate.getFullYear();

		this.infraDB.details.aqueductName = this.newChlorin.aqueductName;
		this.infraDB.details.aqueductInCharge = this.newChlorin.aqueductInCharge;
		this.infraDB.details.chlorinType = this.newChlorin.chlorinType;
		this.infraDB.details.dosageType = this.newChlorin.dosageType;
		this.infraDB.details.inCharge = this.newChlorin.inCharge;
		this.infraDB.details.ubication = this.newChlorin.ubication;

		this.infraDB.tags = 'SistemaCloracion ' + this.newChlorin.chlorinName + ' ' + this.newChlorin.aqueductName + ' ' + this.infraDB.asada.name + ' ' + this.infraDB.asada.id;

		this.updateInfrastructure(this.infrastructureId, this.infraDB);
		this.reload();

	}
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


	getGeoLocation() {
		this.geoLocation.getCurrentPosition().subscribe(
			result => {
				if (result) {
					this.detailChlorinForm.patchValue({ 'latitude': result.coords.latitude });
					this.detailChlorinForm.patchValue({ 'longitude': result.coords.longitude });
				}

			}
		);
	}

	uploadFile(event) {
		let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
		let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
		let files: FileList = target.files;
		this.imageFile = files[0];
		this.uploadImage();
	}
	selectedImageChanged(event){
		alert("La imagen principal ha sido actualizada correctamente");
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

	deleteAllImages() {
		while (this.infraDB.img) {
			this.markForDelete(this.infraDB.img[0]);
			this.deleteImage();
		}

	}

	markForDelete(pImage: FirebaseImg) {
		this.imgMarkedDel = pImage;
	}



	deleteImage() {
		if (this.imgMarkedDel && this.infraDB.img) {
			var index = 0;
			for (let image of this.infraDB.img) {
				if (image == this.imgMarkedDel) {

					const fileName = this.imgMarkedDel.fileName;
					//Delete on the list
					this.infraDB.img.splice(index, 1);
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

	openEvaluation() {
		this.router.navigate(['/evalSERSA', this.infraDB.type, this.infrastructureId]);
	}


	buildForm(): void {
		this.detailChlorinForm = this.fb.group({
			'chlorinName': ['', Validators.required],
			'aqueductName': ['', Validators.required],
			'aqueductInCharge': ['', Validators.required],
			'inCharge': ['', Validators.required],
			'ubication': ['', Validators.required],
			'chlorinType': [this.chlorinType[0].value],
			'dosageType': [this.dosageType[0].value],
			'latitude': ['', Validators.required],
			'longitude': ['', Validators.required],
			'instalationDate': [''],
			'AqueductCreationDate': [''],
			'asadaName': [''],
			'risk': ['']
		});
		this.detailChlorinForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}

	onValueChanged(data?: any) {
		if (!this.detailChlorinForm) { return; }
		const form = this.detailChlorinForm;
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

	buildFormChlorin() {
		this.detailChlorinForm.patchValue({ 'chlorinName': this.infraDB.name });
		this.detailChlorinForm.patchValue({ 'aqueductName': this.infraDB.details.aqueductName });
		this.detailChlorinForm.patchValue({ 'aqueductInCharge': this.infraDB.details.aqueductInCharge });
		this.detailChlorinForm.patchValue({ 'inCharge': this.infraDB.details.inCharge });
		this.detailChlorinForm.patchValue({ 'ubication': this.infraDB.details.ubication });
		this.detailChlorinForm.patchValue({ 'chlorinType': this.infraDB.details.chlorinType });
		this.detailChlorinForm.patchValue({ 'dosageType': this.infraDB.details.dosageType });
		this.detailChlorinForm.patchValue({ 'latitude': this.infraDB.lat });
		this.detailChlorinForm.patchValue({ 'longitude': this.infraDB.long });
		this.detailChlorinForm.patchValue({
			'instalationDate':
				this.infraDB.details.installationDate.day + "/" + this.infraDB.details.installationDate.month + "/" + this.infraDB.details.installationDate.year
		});
		this.detailChlorinForm.patchValue({
			'AqueductCreationDate':
				this.infraDB.details.AqueductCreationDate.day + "/" + this.infraDB.details.AqueductCreationDate.month + "/" + this.infraDB.details.AqueductCreationDate.year
		});
		this.detailChlorinForm.patchValue({ 'asadaName': this.infraDB.asada.name });
		this.detailChlorinForm.patchValue({ 'risk': this.infraDB.risk });
	}



	/*    DB methods    */

	getInfrastuctures(pId): void {
		this.angularFireService.getInfrastructure(pId)
			.subscribe(
				results => {

					this.infraDB = results;
					if (this.infraDB && this.infraDB.details) {

						this.SistemInstallDate = new Date(this.infraDB.details.installationDate.year, this.infraDB.details.installationDate.month - 1, this.infraDB.details.installationDate.day, 0, 0, 0, 0);
						this.AqueductCreationDate = new Date(this.infraDB.details.AqueductCreationDate.year, this.infraDB.details.AqueductCreationDate.month - 1, this.infraDB.details.AqueductCreationDate.day, 0, 0, 0, 0);

						this.asadaSelected = { name: this.infraDB.asada.name, id: this.infraDB.asada.id };

						this.imageURL = this.infraDB.img;

						this.getAsada();

						this.buildFormChlorin();

						if (this.infraDB.img) {
							this.createImgList();
						}

					}

				}
			);
	}

	getAsada(): void {
		this.angularFireService.getAsadas().subscribe(
			results => {
				this.asadaDB = results;
			}
		);
	}

	updateInfrastructure(pId, pInfra: Chlorination): void {
		var updatedInfra: Chlorination = {
			tags: pInfra.tags,
			name: pInfra.name,
			risk: pInfra.risk,
			mainImg: pInfra.mainImg?pInfra.mainImg:{url:"",description:"",fileName:""},
			img: pInfra.img ? pInfra.img : [],
			type: pInfra.type,
			asada: pInfra.asada,
			lat: pInfra.lat,
			long: pInfra.long,
			details: pInfra.details,
			location: pInfra.location,
			dateInstalled: pInfra.dateInstalled,
			riskNames: pInfra.riskNames ? pInfra.riskNames : [],
			riskValues: pInfra.riskValues ? pInfra.riskValues : [],
			siNumber: pInfra.siNumber,
			riskLevel: pInfra.riskLevel,
			dateCreated: pInfra.dateCreated
		}
	}

	delete() {
		this.deleteAllImages();
		this.angularFireService.deleteInfrastructure(this.infrastructureId);
		this.router.navigate(["/asadaDetails", this.infraDB.asada.id]);
	}

	/* 		IMAGE GALLERY METHODS 		*/


	private imagesArray: Array<Image> = [];
	public imagesObservable: Observable<Array<Image>>;

	createImgList(): void {
		var img: ImageModalEvent;


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
