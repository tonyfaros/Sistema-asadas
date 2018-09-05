import { Component, OnInit } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database'
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2';
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
  

  
  constructor(db: AngularFireDatabase, private af: AngularFire) { 
    var usuarios = new Array();
    
    db.list('usuarios')
    .subscribe(filteredList2 => {
      this.filteredList2 = filteredList2;
      
      console.log(this.filteredList2);
    });
    
    db.list('rolAccess')
      .subscribe(filteredList => {
        this.filteredList = filteredList;
        
        for (var i = 0; i < this.filteredList.length; i++){
          var cont = 0;
          var usuario = {
            'nombre': '',
            'apellidos': '',
            'correo': '',
            'rol': ''
          }
          while(this.filteredList[i]["usuario"] != this.filteredList2[cont]["$key"])
            cont++;
  
          usuario.nombre = this.filteredList2[cont]["nombre"];
          usuario.apellidos = this.filteredList2[cont]["apellidos"];
          usuario.correo = this.filteredList2[cont]["correo"];
          usuario.rol = this.filteredList[i]["rol"];
  
          usuarios.push(usuario);
          console.log(usuarios);
        }
        this.filteredList = usuarios;

        
      });
     
      
    

  }

  ngOnInit() {
  }

  
 

}
