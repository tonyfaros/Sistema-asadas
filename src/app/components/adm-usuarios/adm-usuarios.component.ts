import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database'
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

import { FirebaseAuthState } from 'angularfire2/index';
import { Observable } from 'rxjs';


import { AngularFireService } from '../../common/service/angularFire.service'; 
import { User } from '../../common/model/User';
import 'rxjs/add/operator/map';
import * as CryptoJS from 'crypto-js';
//import $ from "jquery";


@Component({
  selector: 'app-adm-usuarios',
  templateUrl: './adm-usuarios.component.html',
  styleUrls: ['./adm-usuarios.component.scss'],
  providers:[AngularFireService]
})
export class AdmUsuariosComponent implements OnInit {
  filteredList: any[];
  filteredList2: any[];
  
  
  projects: Observable<any[]>;
  customers: FirebaseObjectObservable<any[]>;


  private User = '';
  private usuarioEliminar = '';
  
  
  
  constructor(db: AngularFireDatabase, private af: AngularFire,private angularFireService: AngularFireService) { 
    var usuarios = new Array();
   
    db.list('usuarios')
    .subscribe(filteredList => {
      this.filteredList = filteredList;
      
      console.log(this.filteredList);
    });
    

  }
  user: FirebaseAuthState;


  ngOnInit() {
        this.af.auth.subscribe(user => {

      this.user = user;
      this.User = this.user.uid;
    });

    
  }

  encrypt(){
    var key = CryptoJS.enc.Utf8.parse('7061737323313233');
    var iv = CryptoJS.enc.Utf8.parse('7061737323313233');
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(Math.random().toString(36).substring(7)), key,
        {
            keySize: 128 / 8,
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    console.log('Encrypted :' + encrypted);
    console.log('Key :' + encrypted.key);
    console.log('Salt :' + encrypted.salt);
    console.log('iv :' + encrypted.iv);
    console.log('Decrypted : ' + decrypted);
    console.log('utf8 = ' + decrypted.toString(CryptoJS.enc.Utf8));

    return ''+encrypted;

  }

 //let r = Math.random().toString(36).substring(7);

  openModal(key){
    this.usuarioEliminar = key;
  }

  addUsuario(){
		const usuario: User = new User();

			usuario.nombre = (<HTMLInputElement>document.getElementById('nombre')).value; 
			usuario.apellidos = (<HTMLInputElement>document.getElementById('apellidos')).value; 
			usuario.correo = (<HTMLInputElement>document.getElementById('correo')).value; 
			usuario.rol = (<HTMLInputElement>document.getElementById('rol')).value; 
      usuario.password = this.encrypt();

     
      

			
		this.addNewUsuario(usuario);
  }

  addNewUsuario(pUsuario) {
		this.angularFireService.addNewUsuario(pUsuario);
	}

  deleteUsuario(){
    this.angularFireService.deleteUsuario(this.usuarioEliminar);
  }

  
  
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


