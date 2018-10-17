import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FirebaseAuthState } from 'angularfire2/index';
import {AngularFireDatabase} from 'angularfire2/database';
import { AngularFireService } from '../../common/service/angularFire.service';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
import { UserService } from "app/common/service/user.service";
import { Infrastructure } from '../../common/model/Infrastructure';

import { User } from '../../common/model/User';



@Component({
  selector: 'app-calificar-toma',
  templateUrl: './calificar-toma.component.html',
  styleUrls: ['./calificar-toma.component.scss'],
  providers: [UserService,AngularFireService]

})
export class CalificarTomaComponent implements OnInit {
  infraestructureList: Infrastructure[];
  asadasList: any[];
  tomaDatosList: any[];
  User = '';
  usuarioAux = new User();

  constructor(private userService: UserService,
    db: AngularFireDatabase, 
    private af: AngularFire,
    private angularFireService: AngularFireService) { 
      this.infraestructureList = [];
      this.tomaDatosList = [];

      db.list('asadas')
    .subscribe(asadasList => {
      this.asadasList = asadasList;
      });

    db.list('infraestructura')
    .subscribe(infraestructureList => {
      this.infraestructureList = infraestructureList;
      });
  
  }

  user: FirebaseAuthState;
  

    async ngOnInit() {
      //this.tomaDatosList = [];
      //se obtiene el id del usuario en sesion
      this.af.auth.subscribe(user => {

        this.user = user;
        this.User = this.user.uid;
      });

      //se obtienen las tomas de datos
      this.getToma();
  }


  async getToma(){

    await this.getTomas();
    var TomaResults = new Array();
    TomaResults = this.tomaDatosList;
    this.tomaDatosList = [];
    

    for (var i = 0; i < TomaResults.length; i++){
      

      await this.getEstudiante(TomaResults[i]["idEstudiante"]);
      
      var toma_datos = {
        'key':'',
        'Estudiante':'',
        'Asada': '',
        'Fecha': '',
        'Estado': '',
        'Infraestructura': ''
      }
      if(TomaResults[i]["status"] == "Pendiente" && this.usuarioAux.profesor == this.User){
        
        toma_datos.key = TomaResults[i]["$key"];  
        toma_datos.Estudiante = this.usuarioAux.nombre;
        toma_datos.Asada = TomaResults[i]["nameAsada"];
        toma_datos.Fecha = TomaResults[i]["dateCreated"];
        toma_datos.Estado = TomaResults[i]["status"];
        toma_datos.Infraestructura = TomaResults[i]["infraestructuras"].length;
        this.tomaDatosList.push(toma_datos);
              
      }
    }
        
        
        
  }

  getTomas(){
    return new Promise<string>((resolve, reject) => {
        // note: could be written `$.get(url).done(resolve).fail(reject);`,
        //       but I expanded it out for clarity
        this.angularFireService.getAllTomaDatos().subscribe(TomaResults => 
          { 
            this.tomaDatosList = TomaResults;
            resolve(this.tomaDatosList[0]["status"]);
            
          });
        });
    
}

  getEstudiante(id){
    return new Promise<string>((resolve, reject) => {
        // note: could be written `$.get(url).done(resolve).fail(reject);`,
        //       but I expanded it out for clarity
        this.angularFireService.getUsuario(id).subscribe(
          results => {
            this.usuarioAux = results;
            resolve(this.usuarioAux.nombre);
            
          });
        });
    
}


}
