import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseAuthState } from 'angularfire2/index';
import {AngularFireDatabase} from 'angularfire2/database';
import { AngularFireService } from '../../common/service/angularFire.service';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { UserService } from "app/common/service/user.service";

import { User } from '../../common/model/User';



@Component({
  selector: 'app-calificar-toma',
  templateUrl: './calificar-toma.component.html',
  styleUrls: ['./calificar-toma.component.scss'],
  providers: [UserService,AngularFireService]

})
export class CalificarTomaComponent implements OnInit {
  tomaDatosList: any[];
  User = '';

  constructor(private userService: UserService,
    db: AngularFireDatabase, 
    private af: AngularFire,
    private angularFireService: AngularFireService) { 

    db.list('/tomaDatos')
    .subscribe(tomaDatosList => {
      
      this.tomaDatosList = tomaDatosList;
      var tomaDatosList = new Array();
      for (var i = 0; i < this.tomaDatosList.length; i++){
        this.angularFireService.getUsuario(this.tomaDatosList[i]['idEstudiante']).subscribe(
          estudiante => {
        //Estudiante = this.userService.getUser(this.tomaDatosList[i]['idEstudiante']);
        
        var toma_datos = {
          'key':'',
          'Estudiante':'',
          'Asada': '',
          'Fecha': '',
          'Estado': '',
          'Infraestructura': ''
        }
        console.log("usuario");
        console.log(this.User);
        console.log(estudiante['profesor']);

        if(estudiante['profesor'] == this.User /*&& estudiante['estado'] == ""*/){
          toma_datos.key = this.tomaDatosList[i]["$key"];  
          toma_datos.Estudiante = estudiante['nombre']; 
          toma_datos.Asada = this.tomaDatosList[i]["nameAsada"];
          toma_datos.Fecha = this.tomaDatosList[i]["dateCreated"];
          toma_datos.Estado = this.tomaDatosList[i]["status"];
          toma_datos.Infraestructura = this.tomaDatosList[i]["infraestructuras"].length;
          tomaDatosList.push(toma_datos);

        }
      });
    }
    console.log("esto");
    console.log(tomaDatosList);
    });
  
  }

  user: FirebaseAuthState;

    ngOnInit() {
      this.af.auth.subscribe(user => {

        this.user = user;
        this.User = this.user.uid;
      });

  }

  getEstudiante(id){
    this.angularFireService.getUsuario(id).subscribe(
      results => {
        console.log(results);
        return results;
      });
  }


}
