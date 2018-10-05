import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database'
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

import { FirebaseAuthState } from 'angularfire2/index';
import { Observable } from 'rxjs';

import { Router } from '@angular/router';
import { AngularFireService } from '../../common/service/angularFire.service'; 
import { User } from '../../common/model/User';
import 'rxjs/add/operator/map';
import * as CryptoJS from 'crypto-js';
//import $ from "jquery";
import { GetUserDetailsService } from "app/components/profile-header/get-user-details.service";
import { UserService } from "app/common/service/user.service";
import { RolAccess } from '../../common/model/RolAccess';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-adm-usuarios',
  templateUrl: './adm-usuarios.component.html',
  styleUrls: ['./adm-usuarios.component.scss'],
  providers:[UserService,AngularFireService,GetUserDetailsService]
})
export class AdmUsuariosComponent implements OnInit {
  filteredList: any[];
  filteredList2: any[];
  usuariosDB;
  profesorDB;
  projects: Observable<any[]>;
  customers: FirebaseObjectObservable<any[]>;
  userDetailsForm: FormGroup;
  reescribir;
  userRol;
  userDb: User;
  error: Error;
  private User;
  private usuarioEliminar = '';
  
  
  
  constructor(private userService: UserService,
    db: AngularFireDatabase,
    private getUserDetailsService: GetUserDetailsService, 
    private af: AngularFire,
    private angularFireService: AngularFireService,
    private router: Router,
    private fb: FormBuilder) { 

    var usuarios = new Array(); 

    this.af.auth.subscribe(user => {
      this.user = user;
      this.User = this.user.uid;
  });
  var userDetails = this.userService.getUser(this.user.uid);
  userDetails.subscribe(
    results => {
      this.userRol = results.rol;


});
  }
  user: FirebaseAuthState;


  ngOnInit() {
    this.reescribir = '';
    this.emptyForm();
      
  if(this.userRol == "Super Administrador"){
    this.getProfesor();
  }
  else if(this.userRol != "Super Administrador" && this.userRol != "Profesor"){
    this.router.navigate(['/'])
  }

  this.angularFireService.getUsuarios().subscribe(
    results => {
      var usuariosList = new Array();
      this.usuariosDB = results;
      if(this.userRol == "Profesor"){
        for(var i = 0;i<results.length;i++){
          if(results[i]['profesor'] == this.user.uid){
            if(results[i]['estado'] == "Aprobado"){
              usuariosList.push(results[i]);
            }
          }	
        }
      }
      else{
        for(var i = 0;i<results.length;i++){
            if(results[i]['estado'] == "Aprobado" || results[i]['estado'] == "Preaprobado"){
              usuariosList.push(results[i]);
            }
        }
      }
      this.filteredList  = usuariosList;
    });
}
onSubmit(){
  
  var newUser = this.userDetailsForm.value;
  
  newUser.password = newUser.email;
  if(this.userRol == "Profesor"){
    newUser.rol="Estudiante";
    newUser.profesor = this.User;
  }
  //console.log(this.existeCorreo(newUser.email));
    if(this.reescribir!=''){
      console.log("existe pero no esta activo");
      newUser.password = ''+this.angularFireService.encrypt(newUser.email);
      console.log(newUser);
      this.userService.updateUser(newUser,this.reescribir,"Aprobado");
      
      
    }
    else{
      this.saveUserDetails(newUser,null);
      /*
      if (this.validateData(newUser)) {
        console.log("no existe");
        this.af.auth.createUser({
          email: newUser.email,
          password: newUser.password
        }).then(
          (success) => {
            //this.angularFireService.decrypt(this.angularFireService.encrypt(newUser.password));
            this.saveUserDetails(newUser,success.uid);

          }).catch(
          (error) => {
            console.log(error);
            this.error = error;
          })
      }*/
    }

  
}

saveUserDetails(newUser,uid) {
  this.userDb = new User();
  //if(uid!=null)
    //this.userDb.$key = uid;
  this.userDb.apellidos = newUser.userLastName;
  this.userDb.nombre = newUser.userName;
  this.userDb.rol = newUser.rol;
  this.userDb.password = ''+this.angularFireService.encrypt(newUser.email);
  this.userDb.estado = 'Preaprobado';
  this.userDb.profesor = newUser.profesor;
  this.userDb.correo = newUser.email;
  this.userDb.passwordf = ''+this.angularFireService.encrypt(newUser.email);

  //this.userService.addUser(this.userDb, uid);
  this.addNewUsuario(this.userDb);
  this.ngOnInit();
  document.getElementById("cerrar").click();
  
}

validateData(newUser) {
  if(this.existeCorreo(newUser.email)){
    
    this.formErrors.email = 'Este correo ya ha sido registrado anteriormente'
    return false;
  }
  if (newUser.rol == "") {
    
    this.formErrors.rol = 'Es necesario especificar el tipo de acceso';
    return false;
  }
  if (newUser.rol!= "Profesor" && !newUser.profesor) {
    this.formErrors.profesorSelected = 'Es necesario especificar el profesor encargado';
    return false;
  }
  this.formErrors.rol = null;
  this.formErrors.profesorSelected= null;
  return true;

}

existeCorreo(pCorreo){
  for(var i = 0;i<this.usuariosDB.length;i++){
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

  openModal(key){
    this.usuarioEliminar = key;
  }


  addNewUsuario(pUsuario) {
		this.angularFireService.addNewUsuario(pUsuario);
	}

  deleteUsuario(){
    this.userService.updateUserState(this.usuarioEliminar,"Borrado");

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

  emptyForm(): void {
    this.userDetailsForm = this.fb.group({
      'userLastName': ['', Validators.required],
      'userName': ['', Validators.required],
      'password': [''],
      'email': ['', Validators.required],
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
    'rol': {
      'required': 'Tipo de acceso requerido'
    },
    'profesorSelected': {
      'required': 'Profesor encargado requerido'
    }
    
  };
  
  
  /*
  delete(elem: any): void {
    var admin = require('firebase-admin');
      admin.auth().deleteUser(elem.id)
    .then(function() {
      console.log("Successfully deleted user");
    })
    .catch(function(error) {
      console.log("Error deleting user:", error);
    });
	}

  sendMail() {
    'use strict';
const nodemailer = require('nodemailer');

// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: 'marilau63@gmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});

}
  */

  
 

}


