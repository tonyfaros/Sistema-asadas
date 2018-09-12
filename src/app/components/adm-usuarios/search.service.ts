import { Injectable } from '@angular/core';
import {AngularFire, FirebaseListObservable} from "angularfire2/index"


@Injectable()
export class SearchService {
	constructor(private af: AngularFire){
	}
	 search(searchType:string):FirebaseListObservable<any>  {
		const Obj$: FirebaseListObservable<any> = this.af.database.list(searchType);
	 	return Obj$;
	 }

}