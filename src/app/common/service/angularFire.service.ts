import { Injectable } from '@angular/core';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2/index"
import { Asada } from '../../common/model/Asada';

@Injectable()
export class AngularFireService {

	constructor(private af: AngularFire){
	}

	getUsuario(pKey: String):FirebaseObjectObservable<any>  {
		const Obj$: FirebaseObjectObservable<any> = 
			this.af.database.object('usuarios/'+pKey);
		return Obj$;
	  }

	getInfrastructure(pKey: String):FirebaseObjectObservable<any>  {
       const Obj$: FirebaseObjectObservable<any> = 
	   	this.af.database.object('infraestructura/'+pKey);
       return Obj$;
	 }
	 getInfrastuctures():FirebaseListObservable<any>  {

		const Obj$: FirebaseListObservable<any> = this.af.database.list('infraestructura');
	 	return Obj$;
	}

	 updateInfrastructure(pKey: String, pInfra){
		const Obj$ = this.getInfrastructure(pKey);
		Obj$.update(pInfra).catch((error)=>console.log("Error actualizando datos " + error));
	 }

	deleteInfrastructure(pKey:string){
     this.af.database.object('infraestructura/'+pKey).remove();
   	}

	getAsadas():FirebaseListObservable<any>  {
		 const Obj$: FirebaseListObservable<any> = this.af.database.list('asadas');
	 	return Obj$;
	 }

    getAsada(pKey: String):FirebaseObjectObservable<any>  {
       const Obj$: FirebaseObjectObservable<any> = 
	   	this.af.database.object('asadas/'+pKey);
       return Obj$;
	 }

	deleteAsada(pKey:string){
     	this.af.database.object('asadas/'+pKey).remove();
   	}

	 addNewInfrastructure(pInfa):void{
			this.af.database.list('infraestructura').push(pInfa).catch((error)=>console.log(error));;
	 }

    addNewAsada(pAsada):void{
			this.af.database.list('asadas').push(pAsada).catch((error)=>console.log(error));
	 }


	 addNewUsuario(pUsuario):void{
			this.af.database.list('usuarios').push(pUsuario).catch((error)=>console.log(error));
	 }

	 deleteUsuario(pKey:string){
     	this.af.database.object('usuarios/'+pKey).remove();
   	}

	addNewTomaDatos(tomaDatos):void{
		this.af.database.list('tomaDatos').push(tomaDatos).catch((error)=>console.log(error));
	}

	 updateAsada(pKey: String, pAsda){
		const Obj$ = this.getAsada(pKey);
		Obj$.update(pAsda).catch((error)=>console.log("Error actualizando datos " + error));
	 }

	 deleteNotification(pKey:string){
     	this.af.database.object('notifications/'+pKey).remove();
   	}

	addNewNotification(pNotif):void{
			this.af.database.list('notifications').push(pNotif).catch((error)=>console.log(error));;
	 }

	 getGraphics():FirebaseListObservable<any>  {
		 const Obj$: FirebaseListObservable<any> = this.af.database.list('graphics');
	 	return Obj$;
	 }

	 addNewGraphic(pGraphic):void{
			this.af.database.list('graphics').push(pGraphic).catch((error)=>console.log(error));
	 }
	 updateGraphic(pKey: String, pGraph){
		const Obj$ = this.getGraphic(pKey);
		Obj$.update(pGraph).catch((error)=>console.log("Error actualizando datos " + error));
	 }
	 getGraphic(pKey: String):FirebaseObjectObservable<any>  {
       const Obj$: FirebaseObjectObservable<any> = 
	   	this.af.database.object('graphics/'+pKey);
       return Obj$;
	 }

	 deleteAllDB(): void {
	 	this.af.database.list('asadas').remove();
	 	this.af.database.list('infraestructura').remove();
	 	this.af.database.list('incidentes').remove();
	 }

	 addNewHistorial(pHistorial): void {
	 	this.af.database.list('bitacora').push(pHistorial).catch((error)=>console.log(error));

	 }


	 
}