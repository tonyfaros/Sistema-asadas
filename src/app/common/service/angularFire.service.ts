import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2/index"
import { Asada } from '../../common/model/Asada';
import { TomaDatos } from '../../common/model/TomaDatos';
import { TomaInfra } from '../../common/model/TomaInfra';
import { Infrastructure } from '../../common/model/Infrastructure';

import * as CryptoJS from 'crypto-js';
import { FirebaseImg } from '../model/FirebaseImg';

@Injectable()
export class AngularFireService {
	key = CryptoJS.enc.Utf8.parse('7061737323313233');
	iv = CryptoJS.enc.Utf8.parse('7061737323313233');


	constructor(private af: AngularFire){
	}

	

	encrypt(pEncrypt){
		
		var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(pEncrypt), this.key,
			{
				keySize: 128 / 8,
				iv: this.iv,
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7
			});
			return encrypted;
	}
	decrypt(encrypted){
		var decrypted = CryptoJS.AES.decrypt(encrypted, this.key, {
			keySize: 128 / 8,
			iv: this.iv,
			mode: CryptoJS.mode.CBC,
			padding: CryptoJS.pad.Pkcs7
		});
	/*
		console.log('Encrypted :' + encrypted);
		console.log('Key :' + encrypted.key);
		console.log('Salt :' + encrypted.salt);
		console.log('iv :' + encrypted.iv);
		console.log('Decrypted : ' + decrypted);
		console.log('utf8 = ' + decrypted.toString(CryptoJS.enc.Utf8));
		*/
	
		return decrypted.toString(CryptoJS.enc.Utf8);
	
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

	updateMainImage(pKey:string,image):FirebaseObjectObservable<any>  {
		var Obj$: FirebaseObjectObservable<any>;
		try{
			Obj$ = this.af.database.object('infraestructura/'+pKey+'/mainImg');
			if(Obj$){
				Obj$.update(image);
			}
			else{
				Obj$.set(image);
			}
			
			return Obj$;
		}
		catch(ex){
			return Obj$;
		}
	}
	
	updateInfrastructureImages(pKey:string,images:FirebaseImg[]):FirebaseObjectObservable<any>  {
		var Obj$: FirebaseObjectObservable<any>;
		try{
			Obj$ = this.af.database.object('infraestructura/'+pKey+"/img");
			if(Obj$){
				Obj$.update(images);
			}
			else{
				Obj$.set(images);
			}
			
			return Obj$;
		}
		catch(ex){
			return Obj$;
		}
	}

	updateEvaluationEvidences(tomaDatosKey:string,evaluation:TomaInfra,evidences:FirebaseImg[]){
		var Obj$: FirebaseObjectObservable<any>;
		try{
			Obj$ = this.af.database.object('tomaDatos/'+tomaDatosKey+'/'+evaluation.$key+'/evidences');
			
			if(Obj$){
				Obj$.update(evidences);
			}
			else{
				Obj$.set(evidences);
			}
			// TEMPORAL_BORRAR
			this.updateInfrastructureImages(evaluation.id,evaluation.evidences);
			return Obj$;
		}
		catch(ex){
			return Obj$;
		}
	}
	

	 updateInfrastructure(pKey: String, pInfra){
		const Obj$ = this.getInfrastructure(pKey);
		Obj$.update(pInfra).catch(error=>{console.log("Error actualizando datos " + error)});
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

	 getUsuarios():FirebaseListObservable<any>  {
		const Obj$: FirebaseListObservable<any> = this.af.database.list('usuarios');
		return Obj$;
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


	 getTomaDatos(pKey: String): FirebaseObjectObservable<any> {
		const Obj$: FirebaseObjectObservable<any> =
		  this.af.database.object('tomaDatos/'+pKey);
		return Obj$;
	  }


	 updateTomaDatosDetails(pKey: String, pInfra) {
		const Obj$ = this.getTomaDatos(pKey);
		Obj$.update(pInfra).catch((error) => console.log("Error actualizando datos " + error));
	  }

	  

	 updateTomaDatos(request,uid) {
		var isCalled = false;
		var subscription = this.getTomaDatos(uid).subscribe(
		  results => {
			if (!isCalled) {
			  this.updateTomaDatosDetails(results.$key, {

				dateCreated: request.dateCreated,
    			idToma: request.idToma,
    			nameAsada: request.nameAsada,
    			status: request.status,
    			idEstudiante: request.idEstudiante,
				infraestructuras: request.infraestructuras
				
			  });
			  isCalled = true;
			}
		  }
		);
	  }

	  


	 
}