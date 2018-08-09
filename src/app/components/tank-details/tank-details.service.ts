import { Injectable } from '@angular/core';
import {AngularFire, FirebaseObjectObservable, FirebaseListObservable} from "angularfire2/index"


@Injectable()
export class TankDetailsService {
	constructor(private af: AngularFire){
	}
	  getInfrastructure(pKey: String):FirebaseObjectObservable<any>  {
       const Obj$: FirebaseObjectObservable<any> = 
	   	this.af.database.object('infraestructura/'+pKey);
       return Obj$;
	 }

    getAsadas():FirebaseListObservable<any>  {
		const Obj$: FirebaseListObservable<any> = this.af.database.list('asadas');
	 	return Obj$;
	 }

		deleteInfrastructure(objectId:string){
     this.af.database.object('/infraestructura/'+objectId).remove();
   }
}