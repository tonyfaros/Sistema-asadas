import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';

/*		Model-Entities		*/
import { RadioOption } from '../../common/model/radioOption-class';
import { Tank } from '../../common/model/Tank';
import { TankForm } from '../../common/model/FormTank-class';
import { Asada } from '../../common/model/Asada';
import { User } from '../../common/model/User';
import { RolAccess } from '../../common/model/RolAccess';
import { FirebaseImg } from '../../common/model/FirebaseImg';

/*		Modules		*/
import * as firebase from 'firebase';
import { FirebaseApp, AngularFire, FirebaseAuthState } from 'angularfire2';
import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { Image, Action, ImageModalEvent, Description } from 'angular-modal-gallery';
import { ToasterService, ToasterConfig } from 'angular2-toaster';


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
    selector: 'app-tank-details',
    templateUrl: './tank-details.component.html',
    styleUrls: ['./tank-details.component.scss'],
    providers: [AngularFireService, GeolocationService, ToasterService, UserService, ExportService]
})
export class TankDetailsComponent implements OnInit, OnDestroy {
    ngOnDestroy(): void {
        this.sub.unsubscribe();
    }

    /*    Html variables    */
    // radio button options
    public tankType: RadioOption[] = [{ display: 'Elevado', value: 'Elevado' }, { display: 'A nivel', value: 'Nivel' }, { display: 'Enterrado', value: 'Enterrado' }, { display: 'Semi-enterrado', value: 'Semi' }];
    public tankMaterial: RadioOption[] = [{ display: 'Contreto', value: 'Contreto' }, { display: 'Metalico', value: 'Metalico' }, { display: 'Plastico', value: 'Plastico' }];
    public cleaningFrec: RadioOption[] = [{ display: 'Anual', value: 'Anual' }, { display: 'Semestral', value: 'Semestral' }, { display: 'Trimestral', value: 'Trimestral' }, { display: 'Mensual', value: 'Mensual' }, { display: 'Otra', value: 'Otra' }, { display: 'No se sabe/Nunca', value: 'NA' }];
    public measureUnit: RadioOption[] = [{ display: 'metros cubicos', value: 'metro3' }, { display: 'litros', value: 'litro' }];

    public valueUnit = '';

    public creationDate: Date;

    public detailTankForm: FormGroup;
    public readOnlyMode: boolean;

    public newTank: TankForm;

    /*		DB variables 	  */
    public infraDB: Tank;

    private imageFile;
    public imageURL;
    private storageRef;
    public imgMarkedDel: FirebaseImg;
    public imgMarkedEdit: FirebaseImg;

    /*		routing variables 	  */
    private sub: any;
    private infrastructureId: string;

    /*		Toast variables		*/
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
        private fb: FormBuilder,
        private geoLocation: GeolocationService,
        private toasterService: ToasterService,
        private exportService: ExportService
    ) {
        this.storageRef = firebaseApp.storage().ref();
    }


    ngOnInit() {
        //Loads the FormBuilder
        this.emptyForm();
        //Loads the infraestructure id
        this.sub = this.route.params
            .subscribe((params: Params) => {
                this.infrastructureId = params['id'];
                this.readOnlyMode = params['action'] == 'edit' ? false : true;
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

                        if (this.userAccessRol.asada && (this.userAccessRol.asada == this.infraDB.asada.id) && (this.userAccessRol.rol == 'Administración' || this.userAccessRol.rol == 'Edición')) {
                            this.isAdmin = true;
                        }
                        else if (this.userAccessRol.rol && this.userAccessRol.rol == 'Super Administrador') {
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

    /*    DB methods    */

    getInfrastuctures(pId): void {
        this.angularFireService.getInfrastructure(pId)
            .subscribe(
            results => {

                this.infraDB = results;

                if (this.infraDB && this.infraDB.details) {
                    this.creationDate = new Date(this.infraDB.details.creationDate.year, this.infraDB.details.creationDate.month
                        - 1, this.infraDB.details.creationDate.day, 0, 0, 0, 0);
                    this.buildForm();

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
            details: {
                aqueductName: pInfra.details.aqueductName,
                cleaning: pInfra.details.cleaning,
                inCharge: pInfra.details.inCharge,
                material: pInfra.details.material,
                registerNo: pInfra.details.registerNo,
                tankType: pInfra.details.tankType,
                direction:pInfra.details.direction,
                volume: {
                    amount: pInfra.details.volume.amount,
                    unit: pInfra.details.volume.unit
                },
                creationDate: {
                    day: pInfra.details.creationDate.day,
                    month: pInfra.details.creationDate.month,
                    year: pInfra.details.creationDate.year
                }
            },
            riskNames: pInfra.riskNames,
            riskValues: pInfra.riskValues,
            siNumber: pInfra.siNumber,
            riskLevel: pInfra.riskLevel,
            sector: pInfra.sector,
            dateCreated: pInfra.dateCreated
        };
        this.angularFireService.updateInfrastructure(pId, newInfra);
    }

    delete() {
        this.deleteAllImages();
        this.angularFireService.deleteInfrastructure(this.infrastructureId);
        this.router.navigate(['/asadaDetails', this.infraDB.asada.id]);
    }



    /*    HTML methods    */

    goBack(): void {
        setTimeout(() => {
            this.ngOnInit();
        },
            1500);

    }
    export() {
        this.exportService.exportInfrastructure(this.infraDB)
    }

    onSubmit() {

        this.newTank = this.detailTankForm.value;
        this.infraDB.details.creationDate.day = this.creationDate.getDate();
        this.infraDB.details.creationDate.month = this.creationDate.getMonth() + 1;
        this.infraDB.details.creationDate.year = this.creationDate.getFullYear();
        this.infraDB.name = this.newTank.tankName;
        this.infraDB.lat = this.newTank.latitude;
        this.infraDB.long = this.newTank.longitude;
        this.infraDB.details.aqueductName = this.newTank.aqueductName;
        this.infraDB.details.registerNo = this.newTank.registerNo;
        this.infraDB.details.inCharge = this.newTank.inCharge;
        this.infraDB.details.volume.amount = ((this.newTank.volumeAmount == undefined) ? 0 : Number(this.newTank.volumeAmount));
        this.infraDB.details.volume.unit = this.newTank.volumeUnit;
        this.infraDB.details.tankType = this.newTank.type;
        this.infraDB.details.material = this.newTank.material;
        this.infraDB.details.cleaning = this.newTank.cleaning;
        this.infraDB.details.direction = this.newTank.direction;

        this.infraDB.tags = 'Tanque ' + this.newTank.tankName + ' ' +
            this.newTank.aqueductName + ' ' +
            this.infraDB.asada.name + ' ' +
            this.infraDB.asada.id;

        this.updateInfrastructure(this.infrastructureId, this.infraDB);
        this.goBack();
    }

    reload() {
        this.router.navigate(['/' + this.infraDB.type + 'Details', this.infrastructureId]);
        this.ngOnInit();
    }

    getGeoLocation() {
        this.geoLocation.getCurrentPosition().subscribe(
            result => {
                if (result) {
                    this.detailTankForm.patchValue({ 'latitude': result.coords.latitude });
                    this.detailTankForm.patchValue({ 'longitude': result.coords.longitude });
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

    uploadImage() {
        // Upload the imageFile

        if ((this.infraDB.img && this.infraDB.img.length < 3) || !(this.infraDB.img)) {
            // Upload message
            this.popInfoToast('Cargando imagen');
            const newFilename = Date.now() + this.imageFile.name;
            const uploadTask: firebase.storage.UploadTask = this.storageRef.child('infrastructure/' + newFilename).put(this.imageFile);
            let downloadURL: string;
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
                (snapshot) => {
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

        }
        else {
            this.popErrorToast('Solo se permite un maximo de 3 imagenes');
        }

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
                    // Delete on the list
                    this.infraDB.img.splice(index, 1)
                    this.updateInfrastructure(this.infrastructureId, this.infraDB);

                    // Delete on DB
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

    openEvaluation() {
        this.router.navigate(['/evalSERSA', this.infraDB.type, this.infrastructureId]);
    }


    buildForm(): void {
        for (let unitM of this.measureUnit) {
            if (this.infraDB.details.volume.unit == unitM.value) {
                this.valueUnit = unitM.display;
            }
        }

        this.detailTankForm.patchValue({ 'aqueductName': this.infraDB.details.aqueductName });
        this.detailTankForm.patchValue({ 'registerNo': this.infraDB.details.registerNo });
        this.detailTankForm.patchValue({ 'tankName': this.infraDB.name });
        this.detailTankForm.patchValue({ 'inCharge': this.infraDB.details.inCharge });
        this.detailTankForm.patchValue({ 'volumeAmount': this.infraDB.details.volume.amount });
        this.detailTankForm.patchValue({ 'volumeUnit': this.infraDB.details.volume.unit });
        this.detailTankForm.patchValue({ 'type': this.infraDB.details.tankType });
        this.detailTankForm.patchValue({ 'material': this.infraDB.details.material });
        this.detailTankForm.patchValue({ 'cleaning': this.infraDB.details.cleaning });
        this.detailTankForm.patchValue({ 'latitude': this.infraDB.lat });
        this.detailTankForm.patchValue({ 'longitude': this.infraDB.long });
        this.detailTankForm.patchValue({ 'creationDate': this.infraDB.details.creationDate.day + '/'
            + this.infraDB.details.creationDate.month + '/' + this.infraDB.details.creationDate.year });
        this.detailTankForm.patchValue({ 'asadaName': this.infraDB.asada.name });
        this.detailTankForm.patchValue({ 'risk': this.infraDB.risk });
        this.detailTankForm.patchValue({ 'direction': this.infraDB.details.direction });
    }


    emptyForm(): void {
        this.detailTankForm = this.fb.group({
            'aqueductName': ['', Validators.required],
            'registerNo': ['', Validators.required],
            'tankName': ['', Validators.required],
            'inCharge': ['', Validators.required],
            'volumeAmount': ['', Validators.required],
            'volumeUnit': [''],
            'type': [''],
            'material': [''],
            'cleaning': [''],
            'latitude': ['', Validators.required],
            'longitude': ['', Validators.required],
            'creationDate': [''],
            'direction': ['', Validators.required],
            'asadaName': [''],
            'risk': ['']
        });
        this.detailTankForm.valueChanges
            .subscribe(data => this.onValueChanged(data));
        this.onValueChanged(); // (re)set validation messages now
    }


    onValueChanged(data?: any) {
        if (!this.detailTankForm) { return; }
        const form = this.detailTankForm;
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
        'aqueductName': '',
        'registerNo': '',
        'tankName': '',
        'inCharge': '',
        'volumeAmount': '',
        'latitude': '',
        'longitude': '',
        'direction': ''
    };
    validationMessages = {
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
            'required': 'Latitud correcta requerida',
            'pattern': 'Ingresar solo numeros'
        },
        'longitude': {
            'required': 'Longitud correcta requerido',
            'pattern': 'Ingresar solo numeros'
        },
        'direction': {
            'required': 'Dirreción requerido'
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
