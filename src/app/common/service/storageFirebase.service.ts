import { Injectable, Inject } from '@angular/core';
import { FirebaseApp } from 'angularfire2';
import { Infrastructure } from '../model/Infrastructure';

@Injectable()
export class StorageFirebaseService {

    private storageRef;

    constructor(@Inject(FirebaseApp) firebaseApp: any){
        this.storageRef = firebaseApp.storage().ref();
	}
	
	upload(image,keyInfra:string,keyTomaDatos:string){
		
	}

    uploadImage (pImage){
        const uploadTask: firebase.storage.UploadTask = this.storageRef.child('infrastructure/'+pImage.name+Date.now()).put(pImage);
		uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, 
			(snapshot) => {},
			(error) => {console.log('Error uploading the image')},
			() => {
				var downloadURL = uploadTask.snapshot.downloadURL;
                return downloadURL;
			}
		);
	}

}