import { Injectable } from '@angular/core';
import { distinct } from 'rxjs/operator/distinct';

@Injectable()
export class LocationsService {

  locations: locaciones;
  constructor() {
    this.readLocations();
  }
  readLocations() {
    var loc = require('assets/locations.json');
    this.locations = { 'provincias': loc };
  }

  getLocations(): locaciones {
    this.readLocations();
    return this.locations
  }

  activateLocations(loc: locaciones): locaciones {
    loc.provincias.forEach(prov => {
      prov.active = true;
      prov.cantones.forEach(cant => {
        cant.active = true;
        cant.distritos.forEach(dist => {
          dist.active = true;
        });
      });
    });
    return loc;
  }

  getListProvincias(): string[] {
    var provincias: string[] = [];
    try {
      this.locations.provincias.forEach(prov => {
        provincias.push(prov.name);
      });
    }
    catch (ex) {
      console.log("ErrorLocationsService: " + ex);
      provincias = [];
    }
    return provincias;
  }
  getProvinciaName(numProv: number): string {
    var prov = this.getProvincia(numProv);
    if (prov)
      return prov.name;
    return '';
  }

  getProvincia(numProv: number): provincia {
    try {
      return this.locations.provincias[numProv - 1];
    }
    catch (ex) {
      console.log("ErrorLocationsService: " + ex);
      return;
    }
  }

  getCantonName(numProv: number,numCant: number): string {
    var cant = this.getCanton(numProv,numCant);
    if (cant)
      return cant.name;
    return '';
  }
  getCanton(numProv: number, numCant: number): canton {
    try {
      return this.locations.provincias[numProv - 1].cantones[numCant - 1];
    }
    catch (ex) {
      console.log("ErrorLocationsService: " + ex);
      return;
    }
  }


  getCantones(numProv: number): canton[] {
    var cantones: canton[] = [];
    try {
      return this.getProvincia(numProv).cantones;
    }
    catch (ex) {
      console.log("ErrorLocationsService: " + ex);
      cantones = [];
    }
    return cantones;
  }

  getListCantones(numProv: number): string[] {
    var cantones: string[] = [];
    try {
      this.getCantones(numProv).forEach(canton => {
        cantones.push(canton.name);
      });
    }
    catch (ex) {
      console.log("ErrorLocationsService: " + ex);
      cantones = [];
    }
    return cantones;
  }


  getDistritoName(numProv: number,numCant: number,numDist: number): string {
    var dist = this.getDistrito(numProv,numCant,numDist);
    if (dist)
      return dist.name;
    return '';
  }
  
  getDistrito(numProv: number, numCant: number, numDist: number): distrito {
    try {
      return this.getCanton(numProv, numCant).distritos[numDist - 1];
    }
    catch (ex) {
      console.log("ErrorLocationsService: " + ex);
      return;
    }
  }

  getDistritos(numProv: number, numCant: number): distrito[] {
    var distritos: distrito[] = [];
    try {
      return this.getCanton(numProv, numCant).distritos;
    }
    catch (ex) {
      console.log("ErrorLocationsService: " + ex);
      distritos = [];
    }
    return distritos;
  }

  getListDistritos(numProv: number, numCant: number): string[] {
    var distritos: string[] = [];
    try {
      this.getDistritos(numProv, numCant).forEach(distrito => {
        distritos.push(distrito.name);
      });
    }
    catch (ex) {
      console.log("ErrorLocationsService: " + ex);
      distritos = [];
    }
    return distritos;
  }
  //La unica funcion de este metodo es de generar la identificacion para cada ubicacion, se usa principalmente para
  //actualizar el archivo json de locaciones que originalmente no poseia este dato.
  private keysGenerator() {
    let pc = 1;
    var loc = []
    this.locations.provincias.forEach(prov => {
      var p: provincia = { 'key': pc, "name": prov.name, "cantones": [] };
      loc.push(p);
      let cc = 1;
      prov.cantones.forEach(cant => {
        var c: canton = { 'key': cc, "name": cant.name, "distritos": [] };
        p.cantones.push(c);
        cant.key = cc;
        let dc = 1;
        cant.distritos.forEach(dist => {
          var d: distrito = { 'key': dc, "name": dist.name };
          c.distritos.push(d);
          dc++;
        });
        cc++;
      });
      pc++;
    });
    console.log(JSON.stringify(loc));
  }
}


export interface locaciones {
  provincias: provincia[];
}

export interface provincia extends location {
  cantones?: canton[];
}

export interface canton extends location {
  distritos?: distrito[];
}

export interface distrito extends location { }

export interface location {
  key?: number;
  active?: boolean;
  name: string
}
