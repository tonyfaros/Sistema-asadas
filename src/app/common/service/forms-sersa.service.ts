import { Injectable } from '@angular/core';
import { FirebaseObjectObservable, AngularFire } from "angularfire2";

@Injectable()
export class FormsSersaService {

  constructor(private af: AngularFire) { }
  getEvaluations(id:string){
    const Obj$: any = this.af.database.list('evaluationsPerInfrastructure/'+id);
    return Obj$;
  }

}
