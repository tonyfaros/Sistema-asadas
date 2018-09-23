import { Injectable } from '@angular/core';
import { Angular2Csv } from "angular2-csv/Angular2-csv";
import { FormsSersaService } from "app/common/service/forms-sersa.service";
import { AngularFire } from "angularfire2";

@Injectable()
export class ExportService {


  constructor(private af: AngularFire) { }
  getEvaluations(id: string) {
    const Obj$: any = this.af.database.list('evaluationsPerInfrastructure/' + id);
    return Obj$;
  }
  exportInfraestructures(list) {
    var data = [];
    //Insert Header
    list.forEach(element => {
      if (element.isActive) {
        var Json = this.parseInfrastructure(element)
        data.push({})
        data.push(Json.header);
        data.push(Json.data);
      }
    });
    this.exportFile(data);

  }
  exportInfrastructure(element) {
    var json = this.parseInfrastructure(element);

    var evals = this.getEvaluations(element.$key).subscribe(elem => {
      var data = [];
      //Insert Header
      data.push({})
      data.push(json.header);
      data.push(json.data);
      if (elem.length != 0) {
        var evaluations = { "":"", "Evaluaciones": "Evaluaciones:" }
        data.push(evaluations);
        elem.forEach(element => {
          data.push({
            "":"",
            "Fecha": "Fecha",
            "FechaDato": element.dateTime,
            "riesgo": "Riesgo Calculado:",
            "riesgoA": element.riskCalculated
          })
        });
      }
      this.exportFile(data);
    });

  }
  parseInfrastructure(element) {
    var Json = { header: {}, data: {} };
    switch (element.type) {
      case 'SistemaCloracion':
        Json.header = this.headerChloration();
        Json.data = this.parseChloration(element);
        break;
      case 'Tanque':
        Json.header = this.headerTank();
        Json.data = this.parseTank(element);
        break;
      case 'CaptacionNaciente':
        Json.header = this.headerNascentPickup();
        Json.data = this.parseNascentPickup(element);
        break;
      case 'CaptacionSuperficial':
        Json.header = this.headerSurfacePickup();
        Json.data = this.parseSurfacePickup(element);
        break;
    }
    return Json;
  }
  export(Json) {
    var data = [];
    //Insert Header
    data.push({})
    data.push(Json.header);
    data.push(Json.data);
    this.exportFile(data);
  }

  exportAsadas(list) {
    var data = [];
    //Insert Header
    data.push({})
    data.push(this.headerAsada())
    list.forEach(element => {
      if (element.isActive) {
        data.push(this.parseAsada(element))
      }
    });
    this.exportFile(data);
  }
  exportAsada(asada) {
    var data = [];
    //Insert Header
    data.push({})
    data.push(this.headerAsada());
    data.push(this.parseAsada(asada));
    this.exportFile(data);
  }
  exportFile(data) {
    var dateTime = new Date();
    new Angular2Csv(data, `Reporte Sistema Asadas-${dateTime.getDate() + ' ' + dateTime.getTime()}`);
  }
  private parseAsada(element) {
    return {
      "1": " ",
      "Nombre": element.name,
      "Número de concesión": element.concessionNumber,
      "Fecha de concesión": element.concessionDue.day + element.concessionDue.month + element.concessionDue.year,
      "Registro del Minae": element.minaeRegistration,
      "Numero de subscripción": element.numberSubscribed,
      "Provincia": element.location.province.code,
      "Cantón": element.location.canton.code,
      "Distrito": element.location.district.code,
      "Código Postal": element.geoCode,
      "Encargado": element.inCharge,
      "Email": element.email,
      "Telefono": element.phoneNumber,
      "Latitud de la oficina": element.office.lat,
      "Longitud de la oficina": element.office.long,
      "Población": element.population,
      "Programa de Aguas": element.waterProgram,
      "Tipo de zona": element.zoneType
    };
  }
  private headerAsada() {
    return {
      "1": " ",
      "Nombre": "Nombre",
      "Número de concesión": "Número de concesión",
      "Fecha de concesión": "Fecha de concesión",
      "Registro del Minae": "Registro del Minae",
      "Numero de subscripción": "Numero de subscripción",
      "Provincia": "Provincia",
      "Cantón": "Cantón",
      "Distrito": "Distrito",
      "Código Postal": "Código Postal",
      "Encargado": "Encargado",
      "Email": "Email",
      "Telefono": "Telefono",
      "Latitud de la oficina": "Latitud de la oficina",
      "Longitud de la oficina": "Longitud de la oficina",
      "Población": "Población",
      "Programa de Aguas": "Programa de Aguas",
      "Tipo de zona": "Tipo de zona"
    }
  }
  private parseChloration(element) {
    return {
      "1": " ",
      "Nombre": element.name,
      "Asada": element.asada.name,
      "Fecha de creación del acueducto": element.details.AqueductCreationDate ? element.details.AqueductCreationDate.day +
        '/' + element.details.AqueductCreationDate.month + '/' + element.details.AqueductCreationDate.year : '',
      "Encargado del acueducto": element.details.aqueductInCharge,
      "Nombre del acueducto": element.details.aqueductName,
      "Tipo de cloración": element.details.chlorinType,
      "Tipo de desague": element.details.dosageType,
      "Encargado": element.details.inCharge,
      "Fecha de instalación": element.details.installationDate ? element.details.installationDate.day +
        '/' + element.details.installationDate.month + '/' + element.details.installationDate.year : '',
      "Ubicación": element.details.ubication,
      "Latitud": element.lat,
      "Longitud": element.long
    };
  }
  private headerChloration() {
    return {
      "1": " ",
      "Nombre": "Nombre",
      "Asada": "Asada",
      "Fecha de creación del acueducto": "Fecha de creación del acueducto",
      "Encargado del acueducto": "Encargado del acueducto",
      "Nombre del acueducto": "Nombre del acueducto",
      "Tipo de cloración": "Tipo de cloración",
      "Tipo de desague": "Tipo de desague",
      "Fecha de instalación": "Fecha de instalación",
      "Ubicación": "Ubicación",
      "Latitud": "Latitud",
      "Longitud": "Longitud"
    }
  }
  private parseTank(element) {
    return {
      "1": " ",
      "Nombre": element.name,
      "Asada": element.asada.name,
      "Fecha de creación del acueducto": element.details.AqueductCreationDate ?
        element.details.AqueductCreationDate.day +
        '/' + element.details.AqueductCreationDate.month + '/' + element.details.AqueductCreationDate.year : '',
      "Encargado del acueducto": element.details.aqueductInCharge,
      "Nombre del acueducto": element.details.aqueductName,
      "Encargado": element.details.inCharge,
      "Material": element.details.material,
      "Número de registro": element.details.registerNo,
      "Tipo de tanque": element.details.tankType,
      "Volumen": element.details.volume.amount + ' ' + element.details.volume.unit,
      "Latitud": element.lat,
      "Longitud": element.long,
    };
  }
  private headerTank() {
    return {
      "1": " ",
      "Nombre": "Nombre",
      "Asada": "Asada",
      "Fecha de creación del acueducto": "Fecha de creación del acueducto",
      "Encargado del acueducto": "Encargado del acueducto",
      "Nombre del acueducto": "Nombre del acueducto",
      "Encargado": "Encargado",
      "Material": "Material",
      "Número de registro": "Número de registro",
      "Tipo de tanque": "Tipo de tanque",
      "Volumen": "Volumen",
      "Latitud": "Latitud",
      "Longitud": "Longitud",
    }
  }
  private parseSurfacePickup(element) {
    return {
      "1": " ",
      "Nombre": element.name,
      "Nombre del acueducto": element.details.aqueductName,
      "Encargado del acueducto": element.details.aqueductInCharge,
      "Registro del Minae": element.details.registerMINAE,
      "Registro en dirección de ARS": element.details.registerARS,
      "Asada": element.asada.name,
      "Funcionario": element.details.inCharge,
      "Frecuencia de Limpieza": element.details.cleaningFrec,
      "Latitud de la oficina": element.lat,
      "Longitud de la oficina": element.long,
    };
  }
  private headerSurfacePickup() {
    return {
      "1": " ",
      "Nombre": "Nombre",
      "Nombre del acueducto": "Nombre del acueducto",
      "Encargado del acueducto": "Encargado del acueducto",
      "Registro del Minae": "Registro del Minae",
      "Registro en dirección de ARS": "Registro en dirección de ARS",
      "Asada": "Asada",
      "Funcionario": "Funcionario",
      "Frecuencia de Limpieza": "Frecuencia de Limpieza",
      "Latitud de la oficina": "Latitud de la oficina",
      "Longitud de la oficina": "Longitud de la oficina",
    }
  }
  private parseNascentPickup(element) {
    return {
      "1": " ",
      "Nombre": element.name,
      "Nombre del acueducto": element.details.aqueductName,
      "Encargado del acueducto": element.details.aqueductInCharge,
      "Registro del Minae": element.details.registerMINAE,
      "Registro en dirección de ARS": element.details.registerARS,
      "Asada": element.asada.name,
      "Funcionario": element.details.inCharge,
      "Tipo de nasciente": element.details.nascentType,
      "Latitud de la oficina": element.lat,
      "Longitud de la oficina": element.long,
    };
  }
  private headerNascentPickup() {
    return {
      "1": " ",
      "Nombre": "Nombre",
      "Nombre del acueducto": "Nombre del acueducto",
      "Encargado del acueducto": "Encargado del acueducto",
      "Registro del Minae": "Registro del Minae",
      "Registro en dirección de ARS": "Registro en dirección de ARS",
      "Asada": "Asada",
      "Funcionario": "Funcionario",
      "Tipo de nasciente": "Tipo de nasciente",
      "Latitud de la oficina": "Latitud de la oficina",
      "Longitud de la oficina": "Longitud de la oficina",
    }
  }

}
