import { Injectable } from '@angular/core';
import {AngularFire, FirebaseListObservable} from "angularfire2/index"


@Injectable()
export class MapGoogleService {
	constructor(private af: AngularFire){
	}
	 getInfrastructures():FirebaseListObservable<any>  {
		 const Obj$: FirebaseListObservable<any> = this.af.database.list('infraestructura');
	 	return Obj$;
	 }
	 getASADAS():FirebaseListObservable<any>  {
		 const Obj$: FirebaseListObservable<any> = this.af.database.list('asadas');
	 	return Obj$;
	 }
}