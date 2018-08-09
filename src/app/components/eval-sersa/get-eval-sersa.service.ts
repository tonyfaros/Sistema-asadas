import { Injectable } from '@angular/core';
import {AngularFire, FirebaseListObservable} from "angularfire2/index"

@Injectable()
export class GetEvalSersaService {
  constructor(private af: AngularFire) { }
  getForm(type:String):FirebaseListObservable<any>  {
    const Obj$: FirebaseListObservable<any> = this.af.database.list('SERSA'+type);
    return Obj$;
  }
  getInfrastructure(id:string){
    const Obj: any = this.af.database.object('infraestructura/'+id);
    return Obj;
  }
  getEvaluations(id:string){
    const Obj$: any = this.af.database.list('evaluationsPerInfrastructure/'+id);
    return Obj$;
  }

}
