import { Component, OnInit,Input } from '@angular/core';
import { TomaDatos } from '../../common/model/TomaDatos';
import { initDomAdapter } from '@angular/platform-browser/src/browser';
declare var $: any;


@Component({
  selector: 'app-toma-datos-results',
  templateUrl: './toma-datos-results.component.html',
  styleUrls: ['./toma-datos-results.component.scss']
})
export class TomaDatosResultsComponent implements OnInit {
  @Input() TomaDatos:TomaDatos;
  
  constructor() { }

  ngOnInit() {
    for(let i=0;i< 5;i++){
      this.barChartData.push({name:"name"+i,value:(i*450)%47,key:"val"+i})
    }
  }
  onSelect(event) {
    console.log(event);
  }
  prueba(){
    this.barChartData=[];
    for(let i=0;i< 5;i++){
      this.barChartData.push({name:"name"+i,value:(i*450)%47,key:"val"+i})
    }
    var v=$('#in').val();
    if(v){
      this.colorScheme=v;
      }
    else
      alert("none")
  }
   // General graphics variables
  colorScheme='aqua';
  colorScheme2 = {
    domain: [ '#F44336', //red
              '#4CAF50',  //green 
            ]
  };
  
  gradient = false;
  // Interface variables
  public numberOfAsadas: number;
  public numberOfInfraestructuras: number;
  // Infraestructuras por Asada
  doughnutLoaded: boolean = false;
  barChartData: any[]=[];
  doughnutView: any[] = [450, 250];
  barsView: any[] = [450, 250];
  showXAxis = true;
  showYAxis = true;
  showXAxisLabel = true;
  xAxisLabel = 'Cantidad de infraestructuras';
  showYAxisLabel = true;
  yAxisLabel = 'Asadas';
  // Tipos de infraestructuras
  doughnutShowLegend = false;
  doughnutShowLabels = true;
  doughnutExplodeSlices = false;
  doughnut = false;  
  doughnut2Loaded: boolean = false;
  doughnut2ChartData: any[]=[];
  // Incidentes por asada
  iXALoaded: boolean = false;
  iXAView: any[] = [500, 250];
  iXADatos: any[];
  iXAshowLegend = false;
  iXAshowXAxisLabel = true;
  iXAxAxisLabel = 'Asadas';
  iXAshowYAxisLabel = true;
  iXAyAxisLabel = 'Cantidad de incidentes';
  // Tipos de incidentes
  iXA2Loaded: boolean = false;
  iXA2Datos: any[];

  percentageFormatting(event){
    console.log(event);
    return "s";
    
  }

  infrasVarietyChartData(){
    
  }
  evaluatedInfrasChartData(){

  }
  riskResultsChartData(){

  }
  comparedRiskChartData(){

  }
  riskHistoryChartData(){

  }
  evidencesAmountChartData(){

  }
}
