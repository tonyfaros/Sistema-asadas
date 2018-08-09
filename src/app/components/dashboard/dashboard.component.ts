import { Component, OnInit } from '@angular/core';
import { DashboardService} from './dashboard.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit {
  // General use variables
  public asadas: AsadaTotal[] = [];
  // General graphics variables
  colorScheme = {
    domain: [ '#2196F3', //blue
              '#4CAF50',  //green
              '#009688', //teal
              '#00BCD4', //cyan
              '#CDDC39', //lime
              '#03A9F4', //light blue
              '#8BC34A', //light green
            ]
  };
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
  barChartData: any[];
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
  doughnut2ChartData: any[];
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

  constructor(private ds: DashboardService) { 
    this.getNumberAsadas();
    this.getNumberInfraestructuras();
    this.getInfraestructurasData();
  }

  ngOnInit() {
    
  }

  private getNumberAsadas() {
    this.ds.getAsadas().subscribe((list) => {
      this.numberOfAsadas = list.length;
    });
  }

  private getNumberInfraestructuras() {
    this.ds.getInfraestructuras().subscribe((list)=> {
      this.numberOfInfraestructuras = list.length;
    });
  }

  private getInfraestructurasData() {
    this.ds.getInfraestructuras().subscribe((list)=> {
      //var asadas: AsadaTotal[] = [];
      var tipos: InfraTipo[] = [];

      var asada: AsadaTotal;
      var inf: InfraTipo;

      // Por cada infraestructura
      list.forEach(element => {
        // Clasificar asadas
        asada = this.asadas.find(x => x.id == element.asada.id); // Existe ese id en la lista?
        if (asada == null) { //Si no existe la asada
          asada = new AsadaTotal(element.asada.id, element.asada.name, 1);
          asada.idInfras.push(element.$key);
          this.asadas.push(asada);
        }
        else { // Ya existe
          asada.value++;
          asada.idInfras.push(element.$key);
        }
        // Clasificar tipos de infraestructuras
        inf = tipos.find(x => x.tipo == element.type);
        if (inf == null) {
          tipos.push(new InfraTipo(element.type, 1));
        }
        else {
          inf.cant++;
        }
      });
      // Clasificar incidentes
      var incidentes: IncidenteTotal[] = [];
      var asadaIncidente: IncidenteTotal;
      this.ds.getIncidentes().subscribe((list) => {
        // Por cada incidente
        list.forEach(element => {
          // Buscar la asada de este incidente
          var asadaNombre = this.getAsadaNombre(element.infraestructureID);
          asadaIncidente = incidentes.find(x => x.asada == asadaNombre);
          //console.log(asadaIncidente);
          var exists: boolean = true;
          if (asadaIncidente == null) { // No existe
            // Crear el objeto
            exists = false;
            asadaIncidente = new IncidenteTotal(asadaNombre, 0, 0, 0, 0);
          }
          // Clasificar Abierto / Cerrado
          if (element.state == "Abierto") asadaIncidente.countAbierto++;
          else asadaIncidente.countCerrado++;
          // Clasificar tipo de incidente
          if (element.type == "Accidente Natural") asadaIncidente.accidenteNatural++;
          else asadaIncidente.vandalismo++;
          if (!exists) { // No existe
            incidentes.push(asadaIncidente);
          }
        });
        // Gráfico de incidentes por asada y tipos de incidente
        this.iXALoaded = false;
        this.iXA2Loaded = false;
        this.iXADatos = [];
        this.iXA2Datos = [];
        incidentes.forEach(element => {
          this.iXADatos.push({"name": element.asada, "series":[
            {"name": "Abierto", "value": element.countAbierto},
            {"name": "Cerrado", "value": element.countCerrado}
          ]});
          this.iXA2Datos.push({"name": element.asada, "series": [
            {"name": "Vandalismo", "value": element.vandalismo},
            {"name": "Accidente natural", "value": element.accidenteNatural}
          ]});
        });
        this.iXALoaded = true;
        this.iXA2Loaded = true;
      });

      // Crear datos para el gráfico de barras
      this.doughnutLoaded = false;
      this.barChartData = [];
      this.asadas.forEach(element => {
        this.barChartData.push({"name": element.name, "value": element.value});
      });
      this.barChartData = this.barChartData
          .sort((a, b) => a.value < b.value ? -1 : a.value > b.value ? 1 : 0)
          .slice(0,5);
      this.doughnutLoaded = true;
      
      // Gráfico de pie
      this.doughnut2Loaded = false ;
      this.doughnut2ChartData = [];
      tipos.forEach(element => {
        this.doughnut2ChartData.push({"name": element.tipo, "value": element.cant});
      });
      this.doughnut2Loaded = true;

    });
  }

  private getAsadaNombre(infID: string): string {
    return this.asadas.find(x => x.idInfras.includes(infID)).name;
  }


}

class IncidenteTotal {
  asada: string;
  countAbierto: number;
  countCerrado: number;
  accidenteNatural: number;
  vandalismo: number;
  constructor(asada: string, countAbierto: number, countCerrado: number,
    accidenteNatrual: number, vandalismo: number){
    this.asada = asada;
    this.countAbierto = countAbierto;
    this.countCerrado = countCerrado;
    this.accidenteNatural = accidenteNatrual;
    this.vandalismo = vandalismo;
  }
}

class InfraTipo {
  tipo: string;
  cant: number;
  constructor(tipo:string, cant:number) {
    this.tipo = tipo;
    this.cant = cant;
  }
}

class AsadaTotal {
  id: string;
  name: string;
  value: number;
  idInfras: string[];
  constructor(id: string, name: string, total: number) {
    this.id = id;
    this.name = name;
    this.value = total;
    this.idInfras = [];
  }

}
