import { Injectable } from '@angular/core';
import { AngularFire, FirebaseListObservable, FirebaseObjectObservable } from "angularfire2/index"
import { User } from '../../common/model/User';

@Injectable()
export class UserService {

  constructor(private af: AngularFire) { }
  
  updateUserDetails(pKey: String, pInfra) {
    const Obj$ = this.getUser(pKey);
    Obj$.update(pInfra).catch((error) => console.log("Error actualizando datos " + error));
  }
  updateAsadaRequest(pKey: String, request) {
    const Obj$ = this.getAsadasRequest(pKey);
    Obj$.update(request).catch((error) => console.log("Error actualizando datos " + error));
  }
  updateRolAccess(pKey: String, request) {
    const Obj$ = this.getRolAccess(pKey);
    //Obj$.update(request).catch((error) => console.log("Error actualizando datos " + error));
    Obj$.update({ 
      usuario: request.usuario,
      asada: request.asada,
      userName: request.userName,
      asadaName: request.asadaName,
      rol: request.rol      
    }).catch((error) => console.log("Error actualizando datos " + error));
  }

  getUsuarios():FirebaseListObservable<any>  {
		const Obj$: FirebaseListObservable<any> = this.af.database.list('usuarios');
		return Obj$;
  }
  
  getUser(pKey: String): FirebaseObjectObservable<any> {
    const Obj$: FirebaseObjectObservable<any> =
      this.af.database.object('usuarios/' + pKey);
    return Obj$;
  }
  getAsadasRequests(): FirebaseListObservable<any> {
    const Obj$: FirebaseListObservable<any> = this.af.database.list('asadaRequests');
    return Obj$;
  }
  getAllRolAccess(): FirebaseListObservable<any> {
    const Obj$: FirebaseListObservable<any> = this.af.database.list('rolAccess');
    return Obj$;
  }
  getAsadasRequest(pKey: String): FirebaseObjectObservable<any> {
    const Obj$: FirebaseObjectObservable<any> =
      this.af.database.object('asadaRequests/' + pKey);
    return Obj$;
  }
  getRolAccess(pKey: String): FirebaseObjectObservable<any> {
    const Obj$: FirebaseObjectObservable<any> =
      this.af.database.object('rolAccess/' + pKey);
    return Obj$;
  }

  addAsadaRequest(key, request) {
    const userRequest = this.af.database.object(`/asadaRequests/${key}`);
    userRequest.set(request);
  }
  addRolAccess(key, request) {
    let userRolAccess = this.af.database.object(`/rolAccess/${key}/`);
    userRolAccess.set({ 
      usuario: request.usuario,
      asada: request.asada,
      userName: request.userName,
      asadaName: request.asadaName,
      rol: request.rol      
    });
  }
  addUser(uid, request) {
    const user = this.af.database.object(`/usuarios/${uid.$key}`);
    user.set(request);
    
  }
  createAsadaRequest(userId: String, asadaId: String,
    userName: string, asadaName: string, rol: string) {
    //check if the user has already requested access
    var isCalled = false;
    var subscription = this.getAsadasRequests().subscribe(
      results => {
        if (!isCalled) {
          var key = ''
          results.forEach(element => {
            if (element.usuario == userId)
              key = element.$key;
          });

          var request = {
            'usuario': userId,
            'asada': asadaId,
            'userName': userName,
            'asadaName': asadaName,
            'rol': rol
          };
          //update if exists
          if (key != '') {
            this.updateAsadaRequest(key, request)
          } else { //add if not exists
            this.addAsadaRequest(userId, request);
          }
          isCalled = true;
        }
      });
  }
  createRolAccess(uid, request) {
    //check if the user has already requested access
    var isCalled = false;
    var subscription = this.getAllRolAccess().subscribe(
      results => {
        if (!isCalled) {
          var key = ''
          results.forEach(element => {
            if (element.usuario == request.usuario)
              key = element.$key;
          });
          //update if exists
          if (key != '') {
            this.updateRolAccess(key, request)
          } else { //add if not exists
            this.addRolAccess(uid, request);
          }
          isCalled = true;
        }

      });
  }

  updateUserNew(request){
    this.updateUserDetails(request.$key, {
      apellidos: request.apellidos,
      nombre: request.nombre,
      estado:request.estado,
      correo:request.correo,
      password:request.password,
      passwordf:request.passwordf,
      profesor:request.profesor,
      rol:request.rol
    });

  }

  

  updateUser(request,uid,pestado) {
    var isCalled = false;
    var subscription = this.getUser(uid).subscribe(
      results => {
        if (!isCalled) {
          this.updateUserDetails(results.$key, {
            apellidos: request.userLastName,
            nombre: request.userName,
            estado:pestado,
            correo:results.correo,
            password:request.password,
            passwordf:results.passwordf,
            profesor:request.profesor,
            rol:request.rol
          });
          isCalled = true;
        }
      }
    );
  }

  updateUserState(request,estado) {
    var isCalled = false;
    var subscription = this.getUser(request).subscribe(
      results => {
        if (!isCalled) {
          this.updateUserDetails(results.$key, {
            apellidos: results.apellidos,
            nombre: results.nombre,
            estado:estado,
            correo:results.correo,
            password:results.password,
            passwordf:results.passwordf,
            profesor:results.profesor,
            rol:results.rol
          });
          isCalled = true;
        }
      }
    );
  }
  deleteAccessRequest(key: String) {
    this.af.database.object('asadaRequests/' + key).remove();
  }
  /*
  acceptRequest(uid, request) {
    //delete the request
    //update the state in user details
    //update roles table
    //this.createRolAccess(uid, request);
    //var message = `Permiso de ${request.rol} de la asada.`;
    //var newRol = request.rol;
    this.updateUserState(uid);
    //this.deleteAccessRequest(request.$key);
  }*/

  declineRequest(request) {
    var message = 'Solicitud de asada denegada.'
    var newRol = ''
    //this.updateUserAsadaState(request, message, newRol);
    this.deleteAccessRequest(request.$key);
  }

  deleteUser(pKey: String){
    //this.af.database.object('rolAccess/' + pKey).remove();
    this.af.database.object('usuarios/' + pKey).remove();
   }

   

}
