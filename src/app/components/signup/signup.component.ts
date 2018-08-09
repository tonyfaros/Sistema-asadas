import { Component, OnInit } from '@angular/core';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2/index';
import { Router } from '@angular/router';
import { UserService } from "app/common/service/user.service";
import { AngularFireService } from "app/common/service/angularFire.service";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from "app/common/model/User";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [UserService, AngularFireService]
})
export class SignupComponent implements OnInit {
  passwordConfirmation: string;
  error: Error;
  asadaDB;
  asadaSelected;
  userDetailsForm: FormGroup;
  userDb: User;
  public rol;
  constructor(private af: AngularFire,
    private router: Router,
    private userService: UserService,
    private angularFireService: AngularFireService,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.getAsada();
    this.emptyForm();
    this.rol = '';
  }

  onSubmit(): void {
    var newUser = this.userDetailsForm.value;
    if (this.validateData(newUser)) {
      this.af.auth.createUser({
        email: newUser.email,
        password: newUser.password
      }).then(
        (success) => {
          this.saveUserDetails(success.uid, newUser);
          this.router.navigate(['/LoginPage'])
        }).catch(
        (error) => {
          console.log(error);
          this.error = error;
        }
        )
    }
  }
  validateData(newUser) {

    if (newUser.password != newUser.passwordConfirmation) {
      this.formErrors.passwordConfirmation = 'La confirmación no coincide con la contraseña.'
      return false;
    }
    if (this.asadaSelected && this.asadaSelected.$key != null && this.rol == '') {
      this.formErrors.rol = 'Es necesario especificar el tipo de acceso que se quiere para la asada';
      return false;
    }
    this.formErrors.passwordConfirmation = null;
    this.formErrors.rol = null;
    return true;

  }
  getAsada(): void {
    this.angularFireService.getAsadas().subscribe(
      results => {
        this.asadaDB = results;
      }
    );
  }

  saveUserDetails(uid, newUser) {
    this.userDb = new User();
    this.userDb.apellidos = newUser.userLastName;
    this.userDb.nombre = newUser.userName;
    this.createUser(uid);
    if (this.asadaSelected && this.asadaSelected.$key != null) {
      this.generateAsadaRequest(uid);
      this.userDb.asada = {
        name: this.asadaSelected.name,
        id: this.asadaSelected.$key,
        state: `Solicitando permiso para ${this.rol} de la asada.`,
        rol: this.rol
      }
    }
    this.updateUser(uid);
    this.ngOnInit();
  }
  createUser(uid) {
    this.userService.addUser(this.userDb, uid);
  }
  updateUser(uid): void {
    this.userService.updateUserDetails(uid, this.userDb);
  }
  generateAsadaRequest(uid) {
    this.userService.createAsadaRequest(uid, this.asadaSelected.$key,
      this.userDb.nombre, this.asadaSelected.name, this.rol);
  }
  emptyForm(): void {
    this.userDetailsForm = this.fb.group({
      'userLastName': ['', Validators.required],
      'userName': ['', Validators.required],
      'asadaName': ['', Validators.required],
      'email': ['', Validators.required],
      'password': ['', Validators.required],
      'passwordConfirmation': ['', Validators.required],
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
    'email': '',
    'password': '',
    'passwordConfirmation': '',
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
    'email': {
      'required': 'Correo requerido'
    },
    'password': {
      'required': 'Contraseña requerida'
    },
    'passwordConfirmation': {
      'required': 'Confimación de contraseña requerida'
    },
    'rol': {
      'required': 'Tipo de acceso requerido'
    },
  };

}
