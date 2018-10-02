import { Component, OnInit } from '@angular/core';
import { AngularFire, AuthProviders, AuthMethods } from 'angularfire2/index';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToasterService, ToasterConfig } from "angular2-toaster/angular2-toaster";
import { AngularFireService } from "app/common/service/angularFire.service";

import { FirebaseAuthState } from 'angularfire2/index';
import { User } from '../../common/model/User';
import { UserService } from "app/common/service/user.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [UserService,AngularFireService]
})
export class LoginComponent implements OnInit {
  usuariosDB;
  password: string;
  email: string;
  loginFrom: FormGroup;
  pass;
  userDb: User;
  error: Error;
  private error_ = '';
  public toastConfig: ToasterConfig = new ToasterConfig({
		positionClass: 'toast-bottom-center',
		limit: 5
	});
  constructor(private userService: UserService,
    private af: AngularFire,
    private router: Router,
    private fb: FormBuilder, 
    private toasterService: ToasterService,
  
    private angularFireService: AngularFireService) { }

  ngOnInit() {
    this.emptyForm();
    this.getUsuarios();
    
  }

  validate(pUser){
    for(var i = 0;i<this.usuariosDB.length;i++){
      
      if(pUser.email == this.usuariosDB[i]['correo']){
        if(this.angularFireService.decrypt(this.usuariosDB[i]['password']) == pUser.password){
          
          if(this.usuariosDB[i]['estado'] == "Pendiente"){
            this.formErrors.login = 'Esta cuenta sigue sin ser aprobada'
            return false;
          }
          else if(this.usuariosDB[i]['estado'] == "Aprobado"){
            this.pass = this.angularFireService.decrypt(this.usuariosDB[i]['passwordf']);
            return true;
          }
          else if(this.usuariosDB[i]['estado'] == "Preaprobado"){
            if(this.angularFireService.decrypt(this.usuariosDB[i]['password']) == pUser.password){
              this.pass = this.usuariosDB[i]['correo'];
              var newUser = this.usuariosDB[i];
              this.angularFireService.deleteUsuario(this.usuariosDB[i]['$key']);
              this.af.auth.createUser({
                email: newUser.correo,
                password: newUser.correo
              }).then(
                (success) => {
                  this.saveUserDetails(newUser,success.uid);
                  return false;
      
                }).catch(
                (error) => {
                  console.log(error);
                  this.error = error;
                  
                })
                return false;
            }
          }
        } 
      }
    }
    this.formErrors.login = 'Alguno de los datos es incorrecto'
      return false;
  }

  saveUserDetails(newUser,uid) {
    this.userDb = new User();
    
    this.userDb.$key = uid;
    this.userDb.apellidos = newUser.apellidos;
    this.userDb.nombre = newUser.nombre;
    this.userDb.rol = newUser.rol;
    this.userDb.password = newUser.password;
    this.userDb.estado = 'Aprobado';
    this.userDb.profesor = newUser.profesor;
    this.userDb.correo = newUser.correo;
    this.userDb.passwordf = newUser.passwordf;
  
    this.userService.addUser(this.userDb, uid);
    this.userService.updateUserNew(this.userDb);
    //this.ngOnInit();
    //document.getElementById("cerrar").click();
    
  }

  getUsuarios(): void {
    var profesoresList = new Array();
    this.angularFireService.getUsuarios().subscribe(
      results => {
        this.usuariosDB = results;

      }
    );
  }

  addNewUsuario(pUsuario) {
		this.angularFireService.addNewUsuario(pUsuario);
	}

  emptyForm(): void {
    this.loginFrom = this.fb.group({
      'email': ['', Validators.required],
      'password': ['', Validators.required],
    });
    this.loginFrom.valueChanges
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged(); // (re)set validation messages now
  }
  onValueChanged(data?: any) {
    if (!this.loginFrom) { return; }
    const form = this.loginFrom;
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
    'email': '',
    'password': '',
    'login':''
  };
  validationMessages = {
    'email': {
      'required': 'Correo requerido'
    },
    'password': {
      'required': 'Contraseña requerida'
    }
  };
  popToast(message) {
		var toast = {
			type: 'error',
			title: message,
			showCloseButton: true
		};
		this.toasterService.pop(toast);
  }
  
  user: FirebaseAuthState;

  onSubmit() {
    var userLogin = this.loginFrom.value;
    
    //this.router.navigate(['/'])
    if(this.validate(userLogin)){
      userLogin.password = this.pass;
      this.af.auth.login({
        email: userLogin.email,
        password: userLogin.password
        
      }, {
          provider: AuthProviders.Password,
          method: AuthMethods.Password,
        }).then(
        (success) => {
          this.router.navigate(['/']);
        }).catch(
        (err: firebase.FirebaseError) => {
          console.log('Error on Login');
          console.log(err);
          switch (err.code) {
            case 'auth/invalid-email':
              this.error_ = 'El formato del correo no es valido';
              break;
            case 'auth/network-request-failed':
              this.error_ = 'Revise su conexión a internet';
              break;
            case 'auth/user-not-found':
              this.error_ = 'El correo no corresponde a ningún usuario registrado en el sistema';
              break;
            default:
              this.error_ = 'Error al iniciar sesión';

          }
          this.popToast(this.error_);


        })
      }
  }

}
