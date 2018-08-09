import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';

/*		Modules		*/
import { AngularFire, FirebaseListObservable } from 'angularfire2';

/*		Services		*/
import { AngularFireService } from 'app/common/service/angularFire.service';
import { SearchService } from 'app/components/search/search.service';
import { UserService } from 'app/common/service/user.service';


@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.component.html',
  styleUrls: ['./reporte.component.scss'],
  providers: [SearchService, UserService, AngularFireService]
})

export class ReporteComponent implements OnInit {
  private searchFirebase: any;  
  public incidentes:any[];
  public myIncidentes:any[];
  public myInfraestructuras:any[];
  public infraestructuras:any[];
  public userAccess;
  public isLoggedIn: boolean;
  private user;
  private sub: any;
  
  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private userService: UserService,
    private af: AngularFire,
    private angularFireService: AngularFireService) { 

}

  ngOnInit() {
    this.loadLocalAttributes();
    this.loadUserPermissions();
    /*this.getMyIncidentes();*/
  }

  loadLocalAttributes() {
    this.incidentes = [];
    this.infraestructuras = [];
}

getMyIncidentes() {
  
  this.myIncidentes=[];
  this.myInfraestructuras=[];
  
  for(let infra of this.infraestructuras){
    if(this.userAccess.asada==infra.asada.id){
      this.myInfraestructuras.push(infra);
    }
  }

  for(let incidente of this.incidentes){
    for(let infra of this.myInfraestructuras){
      if (incidente.infraestructureID==infra.$key){
        this.myIncidentes.push(incidente);
      }
    }
  }
}



loadUserPermissions() {
  this.userAccess = {};
  this.af.auth.subscribe(user => {
      if (user) {
          this.isLoggedIn = true;
          this.userService.getRolAccess(user.uid).subscribe(
              results => {
                  this.userAccess = results;
                  // this.userAccess.asada
              }
          );
      }
      this.loadParameters();
  });
}


private loadParameters() {
  this.incidentes = [];	
  this.infraestructuras = [];	
  this.myIncidentes=[];
  this.myInfraestructuras=[];
  this.searchFirebase = this.searchService.search('incidentes');
  this.searchFirebase.subscribe(
      results => {
          this.incidentes = results;
        

          this.searchFirebase = this.searchService.search('infraestructura');
          this.searchFirebase.subscribe(
              results => {
                  this.infraestructuras = results;
                  
                  
                  
                  for(let infra of this.infraestructuras){
                    if(this.userAccess.asada==infra.asada.id){
                      this.myInfraestructuras.push(infra);
                    }
                  }
                
                  for(let incidente of this.incidentes){
                    for(let infra of this.myInfraestructuras){
                      if (incidente.infraestructureID==infra.$key){
                        
                        this.myIncidentes.push(incidente);
                        
                      }
                    }
                  }
                  
              }
          );
          
      }
  );

  
  
}

ngOnDestroy(): void {
  if (this.sub != null) {
      this.sub.unsubscribe();
  }
  this.incidentes = [];
  this.infraestructuras = [];
}



}
