import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { RadioOption } from '../../common/model/radioOption-class';
import { User } from '../../common/model/User';
import { TankForm } from '../../common/model/FormTank-class';
import { Asada } from '../../common/model/Asada';
import { AngularFire, FirebaseAuthState } from 'angularfire2/index';
import { GetUserDetailsService } from "app/components/profile-header/get-user-details.service";
import { UserService } from "app/common/service/user.service";
import { AngularFireService } from "app/common/service/angularFire.service";
@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss'],
	providers: [UserService, AngularFireService, GetUserDetailsService]
})
export class ProfileComponent implements OnInit, OnDestroy {
	private user: FirebaseAuthState;
	private isLoggedIn: boolean;
	private userId: string;

	public readOnlyMode: boolean = true;
	public userDetailsForm: FormGroup;

	public asadaSelected;
	public userName: string;
	public userLastName: string;
	public userRol: string;
	public userRole: string;
	public isAsada: boolean
	/*  DB variables   */
	public userDb: User;
	public rol:string;
	public asadaDB;//: Asada[]; 
	constructor(
		private userService: UserService,
		private fb: FormBuilder,
		private af: AngularFire,
		private getUserDetailsService: GetUserDetailsService,
		private angularFireService: AngularFireService) { }

	ngOnInit() {
		this.rol = ''
		this.emptyForm();
		this.af.auth.subscribe(user => {
			if (user) {
				// user logged in
				this.user = user;
				this.userId = user.uid;
				this.isLoggedIn = true;
				this.getUserDetails();
				this.getRolAccess(user.uid);

			}
			else {
				// user not logged in
				this.isLoggedIn = false;

			}
		});
		this.readOnlyMode = true;



	}
	
	ngOnDestroy(): void {
	}
	getRolAccess(uid){
		this.userService.getRolAccess(uid).subscribe(
			results => {
				this.rol = results.rol;
				this.userRol = results.rol;
			}
		)
	}
	getUserDetails() {
		var userDetails = this.getUserDetailsService.getUserDetails(this.user.uid);
		userDetails.subscribe(
			results => {
				this.userDb = results;
				this.userName = results.nombre;

				this.userLastName = results.apellidos;
				if (this.userDb.asada != null) {
					this.isAsada = true;
					this.asadaSelected = this.userDb.asada;
				}
				else {
					this.isAsada = false;
					this.asadaSelected = { name: 'Sin asada' };
				}

				this.getAsada();
				this.buildForm();
			});
	}
	getAsada(): void {
		this.angularFireService.getAsadas().subscribe(
			results => {
				this.asadaDB = results;
				for (let asadaLElem of this.asadaDB) {
					if (asadaLElem.$key == this.asadaSelected.id) {
						this.asadaSelected = asadaLElem;
					}
				}
			}
		);
	}
	updateUser(): void {
		this.userService.updateUserDetails(this.user.uid, this.userDb);
	}

	changeAsadaValue(pAsada) {
		this.asadaSelected.name = pAsada;

		for (let asadaLElem of this.asadaDB) {
			if (asadaLElem.name == pAsada) {
				this.asadaSelected.id = asadaLElem.$key;
			}
		}
	}
	changeToEdit() {
		this.readOnlyMode = false;
	}
	cancelChanges() {
		this.ngOnInit();
	}
	onSubmit() {
		var newUser = this.userDetailsForm.value;
		this.userDb.apellidos = newUser.userLastName;
		this.userDb.nombre = newUser.userName;
		if (this.verifyForm()) {
			if (this.userDb.asada && this.userDb.asada.id != this.asadaSelected.$key ||
				(this.userDb.asada == null && this.asadaSelected.$key != null)
			) {
				this.generateAsadaRequest();
				this.userDb.asada = {
					name: this.asadaSelected.name,
					id: this.asadaSelected.$key,
					state: `Solicitando permiso para ${this.rol} de la asada.`,
					rol: this.rol
				}

			}
			this.updateUser();
			this.ngOnInit();
		}
	}
	verifyForm() {
		if (this.asadaSelected.$key != null && this.rol == ''){
			this.formErrors.rol = 'Es necesario especificar el tipo de acceso que se quiere para la asada';
			return false;
		}
		return true;
	}
	generateAsadaRequest() {
		this.userService.createAsadaRequest(this.userId, this.asadaSelected.$key,
			this.userDb.nombre, this.asadaSelected.name, this.rol);
	}
	buildForm(): void {
		this.userDetailsForm = this.fb.group({
			'userLastName': [this.userDb.apellidos, Validators.required],
			'userName': [this.userDb.nombre, Validators.required],
			'asadaName': [this.asadaSelected.name],
			'asadaState': [this.isAsada == true ? this.userDb.asada.state : ''],
			'rol': [this.isAsada == true ? this.userDb.asada.rol : '']
		});
		if (this.isAsada == true)
			this.asadaSelected = this.userDb.asada;
		this.userDetailsForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}
	emptyForm(): void {
		this.userDetailsForm = this.fb.group({
			'userLastName': ['', Validators.required],
			'userName': ['', Validators.required],
			'asadaName': [''],
			'rol': ['']
		});
		this.userDetailsForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}
	onValueChanged(data?: any) {
		if (!this.userDetailsForm) { return; }
		const form = this.userDetailsForm;
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
		'userName': '',
		'userLastName': '',
		'asadaName': '',
		'rol': ''
	};
	validationMessages = {
		'userName': {
			'required': 'Nombre requerido'
		},
		'userLastName': {
			'required': 'Apellidos requeridos'
		},
		'asadaName': {
			'required': 'Asada requerida'
		},
		'rol': {
			'required': 'Tipo de acceso requerido'
		},

	};

}


















