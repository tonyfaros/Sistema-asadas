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
  usuariosDB;
  profesorDB;
  profesorSelected;
  userDetailsForm: FormGroup;
  userDb: User;
  reescribir;
  public rol;
  constructor(private af: AngularFire,
    private router: Router,
    private userService: UserService,
    private angularFireService: AngularFireService,
    private fb: FormBuilder,
  ) {
  }

  ngOnInit() {
    this.reescribir = '';
    this.getProfesor();
    this.emptyForm();
  }


  onSubmit(): void {
    console.log(this.userDetailsForm.value);
    var newUser = this.userDetailsForm.value;
    this.existeCorreo(newUser.email);
    if(this.reescribir!=''){
      this.userService.updateUser(newUser,this.reescribir);
      this.router.navigate(['/LoginPage']);
      
    }
    else{
      if (this.validateData(newUser)) {
       
        this.af.auth.createUser({
          email: newUser.email,
          password: newUser.password
        }).then(
          (success) => {
            this.angularFireService.decrypt(this.angularFireService.encrypt(newUser.password));
            this.saveUserDetails(newUser,success.uid);
            this.router.navigate(['/LoginPage']);
          }).catch(
          (error) => {
            console.log(error);
            this.error = error;
          })
      }}
  
  }

  existeCorreo(pCorreo){
    for(var i = 0;i<this.usuariosDB.length;i++){
      console.log(this.usuariosDB[i]['correo']);
      if(pCorreo == this.usuariosDB[i]['correo']){
        if(this.usuariosDB[i]['estado'] == "Rechazado" || this.usuariosDB[i]['estado'] == "Borrado"){
          this.reescribir = this.usuariosDB[i]['$key'];
          return false;
        }
        return true;
      }
    }
    return false;
  }

  validateData(newUser) {
    console.log(newUser.profesor);
    if(this.existeCorreo(newUser.email)){
      
      this.formErrors.email = 'Este correo ya ha sido registrado anteriormente'
      return false;
    }
    if((newUser.password).length<6){
      this.formErrors.password = 'La contraseña debe tener mínimo 6 caracteres'
      return false;
    }
    if (newUser.password != newUser.passwordConfirmation) {
      this.formErrors.passwordConfirmation = 'La confirmación no coincide con la contraseña.'
      return false;
    }
    if (newUser.rol == "") {
      
      this.formErrors.rol = 'Es necesario especificar el tipo de acceso';
      return false;
    }
    if (newUser.rol!= "Profesor" && !newUser.profesor) {
      console.log("prueba");
      this.formErrors.profesorSelected = 'Es necesario especificar el profesor encargado';
      return false;
    }
    this.formErrors.passwordConfirmation = null;
    this.formErrors.rol = null;
    this.formErrors.profesorSelected= null;
    return true;

  }

  

  getProfesor(): void {
    
    this.angularFireService.getUsuarios().subscribe(
      results => {
        var profesoresList = new Array();
        this.usuariosDB = results;

        for(var i = 0; i<Object.keys(results).length;i++){
          if(results[i]["rol"] == "Profesor" && results[i]["estado"] == "Aprobado")
            profesoresList.push(results[i]);
        }
        this.profesorDB  = profesoresList;
      }
    );
  }

  

  saveUserDetails(newUser,uid) {
    this.userDb = new User();
    this.userDb.$key = uid;
    this.userDb.apellidos = newUser.userLastName;
    this.userDb.nombre = newUser.userName;
    this.userDb.rol = newUser.rol;
    this.userDb.password = ''+this.angularFireService.encrypt(newUser.password);
    this.userDb.estado = 'Pendiente';
    this.userDb.profesor = newUser.profesor;
    this.userDb.correo = newUser.email;
    this.userDb.passwordf = ''+this.angularFireService.encrypt(newUser.password);

    this.userService.addUser(this.userDb, uid);
    this.userService.updateUserNew(this.userDb);
    //this.addNewUsuario(this.userDb);
    
    this.ngOnInit();
  }

  addNewUsuario(pUsuario) {
		this.angularFireService.addNewUsuario(pUsuario);
	}

  emptyForm(): void {
    this.userDetailsForm = this.fb.group({
      'userLastName': ['', Validators.required],
      'userName': ['', Validators.required],
      'email': ['', Validators.required],
      'password': ['', Validators.required],
      'passwordConfirmation': ['', Validators.required],
      'rol': ['',Validators.required],
      'profesor':['',Validators.required]
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
    'email': '',
    'password': '',
    'passwordConfirmation': '',
    'rol': '',
    'profesorSelected':''
  };
  validationMessages = {
    'userName': {
      'required': 'Nombre requerido'
    },
    'userLastName': {
      'required': 'Apellidos requeridos'
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
    'profesorSelected': {
      'required': 'Profesor encargado requerido'
    }
  };

}
