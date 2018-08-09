import { Component, OnInit, Input } from '@angular/core';

import { AngularFireService } from '../../common/service/angularFire.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AngularFire, FirebaseAuthState } from 'angularfire2/index';
import { UserService } from "app/common/service/user.service";

@Component({

  selector: 'app-graphics',
  templateUrl: './graphics.component.html',
  styleUrls: ['./graphics.component.scss'],
  providers: [AngularFireService, UserService]
})
export class GraphicsComponent implements OnInit {


  @Input() type: string;
  @Input() sort: string;
  @Input() size: string;

  public graphicType: string;
  public graphicID: string;
  public changepermit: boolean = false;

  private AsadaUser = '';
  private UserPermits = '';

  public barChartLabels;
  public barChartData;
  public barChartOptions;

  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  private allList: Graphics[];
  private filterList: Graphics[];

  constructor(private angularFireService: AngularFireService, private router: Router, private af: AngularFire, private userService: UserService, ) {

    this.allList = [];
    this.filterList = [];

  }

  user: FirebaseAuthState;

  ngOnInit() {

    this.af.auth.subscribe(user => {
      if (user) {
        // user logged in
        this.user = user;
        var userDetails = this.userService.getRolAccess(this.user.uid);
        userDetails.subscribe(
          results => {
            this.AsadaUser = results.asada;
            this.UserPermits = results.rol;
            this.getGraphics();
            this.loadParameters();

          }
        );


      }
      else {
        // user not logged in
        this.getGraphics();
        this.loadParameters();
      }
    });

  }




  private loadParameters() {

    if (this.size == "big") {
      this.barChartOptions = { caleShowVerticalLines: false, responsive: true, maintainAspectRatio: true };
    }
    else {
      this.barChartOptions = { caleShowVerticalLines: false, responsive: true, maintainAspectRatio: false };
    }
    if (this.type != null) {
      this.graphicType = this.type;
      if (this.graphicType == 'GIRS') {

        this.barChartLabels = ['% Recolección', '% Limpieza de vías y zonas públicas', '% Ausencia RS en Rios o Lotes ', '% Recuperación de RS valorizables', '% Tratamiento'];
      }
      else {
        this.barChartLabels = ['% Cobertura alcantarillado sanitario', '% Tratamiento aguas grises y jabonosas', '% Viviendas con tratamiento de excretas con tanque séptico'];
      }
      this.barChartData = [{ data: [0, 0, 0, 0, 0, 0], label: 'Porcentaje %' }];
      
      if (this.allList.length == 0){
         if ( (this.AsadaUser == this.sort && this.UserPermits == "Administración") || (this.UserPermits == "Super Administrador" )) {
            this.changepermit = true;
          }
      }

      for (let entry of this.allList) {

        if (entry.type == this.graphicType && entry.type == "GIRS" && entry.asada == this.sort) {
          this.barChartData = [{ data: [entry.valor1, entry.valor2, entry.valor3, entry.valor4, entry.valor5, 0], label: 'Porcentaje %' }];
          this.graphicID = entry.$key;
          if ( (this.AsadaUser == entry.asada && this.UserPermits == "Administración") || (this.UserPermits == "Super Administrador" )) {
            this.changepermit = true;
          }
          break;
        }
        else if (entry.type == this.graphicType && entry.type == "GAR" && entry.asada == this.sort) {
          this.barChartData = [{ data: [entry.valor1, entry.valor2, entry.valor3, 0], label: 'Porcentaje %' }];
          this.graphicID = entry.$key;
          if ((this.AsadaUser == entry.asada && this.UserPermits == "Administración") || (this.UserPermits == "Super Administrador" )) {
            this.changepermit = true;
          }
          break;
        }

      }

    }


  }

  public getGraphics(): void {
    this.angularFireService.getGraphics()
      .subscribe(
      results => {
        this.allList = results;
        this.loadParameters();
      }
      );
  }


  public barChartColors: Array<any> = [
    { // dark grey
      backgroundColor: 'rgba(39, 124, 255, 0.8)',
      borderColor: 'rgba(39, 124, 255, 0.9)',
      pointBackgroundColor: 'rgba(39, 124, 255, 0.8)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(39, 124, 255, 0.9)'
    },
  ];

  // events
  public chartClicked(e: any): void {
  }

  public chartHovered(e: any): void {
  }

  public editGraphic(): void {

    if (this.graphicID) {
      this.router.navigate(['/GraphicDetails/' + this.sort + '/' + this.graphicType + '/' + this.graphicID]);
    } else {
      this.router.navigate(['/GraphicDetails/' + this.sort + '/' + this.graphicType]);

    }

  }

}


interface Graphics {
  $key: string;
  asada: string;
  type: string;
  valor1: number;
  valor2: number;
  valor3: number;
  valor4: number;
  valor5: number;
}