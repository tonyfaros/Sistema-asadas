import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database'
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';

import { FirebaseAuthState } from 'angularfire2/index';
import { Observable } from 'rxjs';


import { User } from '../../common/model/User';
import 'rxjs/add/operator/map';


@Component({
  selector: 'app-adm-usuarios',
  templateUrl: './adm-usuarios.component.html',
  styleUrls: ['./adm-usuarios.component.scss']
})
export class AdmUsuariosComponent implements OnInit {
  filteredList: any[];
  filteredList2: any[];
  
  projects: Observable<any[]>;
  customers: FirebaseObjectObservable<any[]>;

  private User = '';
  
  
  
  constructor(db: AngularFireDatabase, private af: AngularFire) { 
    var usuarios = new Array();
   
    db.list('usuarios')
    .subscribe(filteredList2 => {
      this.filteredList2 = filteredList2;
      
      //console.log(this.filteredList2);
    });
    
    db.list('rolAccess')
      .subscribe(filteredList => {
        this.filteredList = filteredList;
        
        for (var i = 0; i < this.filteredList.length; i++){
          var cont = 0;
          var usuario = {
            'id':'',
            'nombre': '',
            'apellidos': '',
            'correo': '',
            'rol': ''
          }
          while(this.filteredList[i]["usuario"] != this.filteredList2[cont]["$key"])
            cont++;
          usuario.id = this.filteredList[i]["usuario"];
          usuario.nombre = this.filteredList2[cont]["nombre"];
          usuario.apellidos = this.filteredList2[cont]["apellidos"];
          usuario.correo = this.filteredList2[cont]["correo"];
          usuario.rol = this.filteredList[i]["rol"];
  
          usuarios.push(usuario);
          //console.log(usuarios);
        }
        this.filteredList = usuarios;
        
      });
    
      
    

  }
  user: FirebaseAuthState;
  ngOnInit() {
    this.af.auth.subscribe(user => {
      this.user = user;
      this.User = this.user.uid;
      
    });
    
  }
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
  
 

}
