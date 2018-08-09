import { Injectable } from '@angular/core';
import { FirebaseObjectObservable, AngularFire } from "angularfire2";

@Injectable()
export class DashboardService {

  constructor(private af: AngularFire) { }

  public getAsadas() {
    return this.af.database.list('asadas' );
  }

  public getInfraestructuras() {
    return this.af.database.list('infraestructura' );
  }

  public getIncidentes() {
    return this.af.database.list('incidentes');
  }

}
