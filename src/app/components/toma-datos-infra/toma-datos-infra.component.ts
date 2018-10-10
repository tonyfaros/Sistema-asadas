import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router} from '@angular/router';
import { AngularFireService } from '../../common/service/angularFire.service';
import {AngularFireDatabase} from 'angularfire2/database';
import { MapGoogleService } from '../map-google/map-google.service';

@Component({
  selector: 'app-toma-datos-infra',
  templateUrl: './toma-datos-infra.component.html',
  styleUrls: ['./toma-datos-infra.component.scss'],
  providers: [AngularFireService,MapGoogleService]
})
export class TomaDatosInfraComponent implements OnInit {
  private id: string;


  tomaDatosList: any[] = [];
  infraestructureList: any[] = [];
  infraFiltered: any[] = [];
  nameAsada: string;
  //tomaDatos: TomaDatos;

  constructor(private mapService: MapGoogleService, private _Activatedroute:ActivatedRoute, db: AngularFireDatabase,private router: Router, ) {

    this.id=this._Activatedroute.snapshot.params['id'];
    db.list('/tomaDatos')
    .subscribe(tomaDatosList => {
      this.tomaDatosList = tomaDatosList;
      this.getInfraestructures();
     /* for (let tomaDato of this.tomaDatosList){
        if(tomaDato.$key == this.id)
      }*/
      
    });
   }

   

  ngOnInit() {
    
  }

  setInfraOfTomaDatos(){
    for(let tomaDatos of this.tomaDatosList){
      
      if(tomaDatos.$key == this.id){
        this.nameAsada = tomaDatos.nameAsada;
        
        for(let infra of tomaDatos.infraestructuras){
          this.checkInfra(infra.id);
        }
      }
    }
  }

  checkInfra(id){
    for(let infra of this.infraestructureList){
      if(infra.$key == id){

        this.infraFiltered.push(infra);
      }
    }
  }

  getInfraestructures(): void {
    this.mapService.getInfrastructures()
        .subscribe(
            results => {
                this.infraestructureList = results;
                this.setInfraOfTomaDatos();
              
            }
        );
    
}

evaluate(elem: any): void {

  this.router.navigate(['/evalSERSA', elem.type, this.id, elem.$key]);
}

}
