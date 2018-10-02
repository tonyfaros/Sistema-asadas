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

	public userName: string;
	public userLastName: string;
	public userRol: string;
	public userRole: string;
	/*  DB variables   */
	public userDb: User;
	public rol:string;
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

	getUserDetails() {
		var userDetails = this.getUserDetailsService.getUserDetails(this.user.uid);
		userDetails.subscribe(
			results => {
				this.userDb = results;
				this.userName = results.nombre;
				this.userRol = results.rol;
				this.userLastName = results.apellidos;
			
				this.buildForm();
			});
	}
	
	updateUser(): void {
		if(this.userDb.rol != "Estudiante")
			this.userDb.profesor = '';

		this.userService.updateUserDetails(this.userDb.$key, {
            apellidos: this.userDb.apellidos,
            nombre: this.userDb.nombre,
            estado:this.userDb.estado,
            correo:this.userDb.correo,
            password:this.userDb.password,
            passwordf:this.userDb.passwordf,
            profesor:this.userDb.profesor,
            rol:this.userDb.rol
          });
	}

	cambiarPass(){
		var newUser = this.userDetailsForm.value;
		
		if (this.verifyForm(newUser)) {
			this.userDb.password = ''+this.angularFireService.encrypt(newUser.newpassword);
			this.updateUser();
			this.ngOnInit();
			document.getElementById("cerrar").click();
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


		
			this.updateUser();
			this.ngOnInit();
		
	}

	verifyForm(newUser) {
		if(this.angularFireService.encrypt(newUser.password)+'' != this.userDb.password){
			this.formErrors.password = 'Contraseña incorrecta.'
			return false;
		  }
		if((newUser.newpassword).length<6){
			this.formErrors.newpassword = 'La contraseña debe tener mínimo 6 caracteres'
			return false;
		  }
		  if (newUser.newpassword != newUser.passwordConfirmation) {
			this.formErrors.passwordConfirmation = 'La confirmación no coincide con la contraseña.'
			return false;
		  }
		  

		this.formErrors.passwordConfirmation = null;
		this.formErrors.password = null;
		this.formErrors.newpassword = null;

		return true;
	}

	buildForm(): void {
		this.userDetailsForm = this.fb.group({
			'userLastName': [this.userDb.apellidos, Validators.required],
			'userName': [this.userDb.nombre, Validators.required],
			'rol': [this.userDb.rol],
			'password':[''],
			'newpassword':[''],
			'passwordConfirmation':['']
		});
		
		this.userDetailsForm.valueChanges
			.subscribe(data => this.onValueChanged(data));
		this.onValueChanged(); // (re)set validation messages now
	}

	emptyForm(): void {
		this.userDetailsForm = this.fb.group({
			'userLastName': ['', Validators.required],
			'userName': ['', Validators.required],
			'rol': [''],
			'password':['',Validators.required],
			'newpassword':['',Validators.required],
			'passwordConfirmation':['',Validators.required]
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
		'rol': '',
		'password':'',
		'newpassword':'',
		'passwordConfirmation': ''
	};
	
	validationMessages = {
		'userName': {
			'required': 'Nombre requerido'
		},
		'userLastName': {
			'required': 'Apellidos requeridos'
		},
		'rol': {
			'required': 'Tipo de acceso requerido'
		},
		'password': {
			'required': 'Contraseña actual requerida'
		},
		'newpassword': {
			'required': 'Nueva contraseña requerida'
		},
		'passwordConfirmation': {
			'required': 'Confimación de contraseña requerida'
		  }
	};

}


















