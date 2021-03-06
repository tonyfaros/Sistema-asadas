import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { User } from '../../common/model/User';
import { FirebaseAuthState } from 'angularfire2/index';


import 'rxjs/add/operator/switchMap';

import { GetEvalSersaService } from './get-eval-sersa.service'
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { FormularioSersa } from '../../common/model/FormularioSersa'
import { Infrastructure  } from '../../common/model/Infrastructure'
import { Evaluation } from '../../common/model/Evaluation'
import { UserService } from "app/common/service/user.service";
import { AngularFire } from "angularfire2";
import {Location} from '@angular/common';
import { AngularFireService } from '../../common/service/angularFire.service'; 
import { TomaDatos } from '../../common/model/TomaDatos';
import { TomaInfra } from '../../common/model/TomaInfra';
import { EvidenceGalleryComponent } from '../infrastructure-gallery/evidence-gallery/evidence-gallery.component';

@Component({
  selector: 'app-eval-sersa',
  templateUrl: './eval-sersa.component.html',
  styleUrls: ['./eval-sersa.component.scss'],
  providers: [GetEvalSersaService, ToasterService, AngularFireService, UserService]
})
export class EvalSersaComponent implements OnInit, OnDestroy {
  filteredList: any[];
  private sub: any;
  private tomaDatosId: string;
  public form: FormularioSersa[];
  private answers: Boolean[];
  private type: string;
  riesgo_name:string;
  riesgo_num;
  idToma;
  idInfra;
  tomaDatosInfra: TomaDatos;
  disradio = null;

  public evaluation:TomaInfra;

  

  /*			Toast variables		*/
  public toastConfig: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-bottom-center',
    limit: 5
  });

  constructor(private _location: Location, private route: ActivatedRoute,
    private getFormService: GetEvalSersaService,
    private angularFireService: AngularFireService,
    private router: Router,
    private toasterService: ToasterService,
    private userService: UserService,
    private af: AngularFire
  ) { }
  

  User='';
  user: FirebaseAuthState;

  ngOnInit() {
    this.af.auth.subscribe(user => {

      this.user = user;
      this.User = this.user.uid;
    });

    this.filteredList=[];
    this.sub = this.route.params.subscribe((params: Params) => {
      this.tomaDatosId = params['id'];
      this.type = params['type'];
      this.idInfra = params['idInfra'];
    });



    this.getForm();

    this.angularFireService.getTomaDatos(this.tomaDatosId).subscribe(
      results => {
        this.tomaDatosInfra = results;
        for (var i = 0; i<(results.infraestructuras).length;i++){
          if(results.infraestructuras[i]['id'] == this.idInfra){
            this.idToma = i;
          }
        }
        this.evaluation=this.tomaDatosInfra.infraestructuras[this.idToma];
      });

      if(this.User == this.tomaDatosInfra.idEstudiante)
        this.disradio==true;
  }


  

  
  newAnswer(question: number, value: boolean): void {
    this.answers[question] = value;
  }


  
  getForm(): void {
    this.getFormService.getForm(this.type)
      .subscribe(
      results => {


        
        this.form = results;
        this.answers = new Array(this.form.length + 1);



        for(var i = 0; i<10; i++){
          var res = {
            'ans': ''  };
          
          res.ans=this.tomaDatosInfra.infraestructuras[this.idToma]["res"+(i+1)];
          this.answers[i+1] = res.ans == "0" ? false: res.ans=="1" ? true : null;
          this.filteredList.push(this.tomaDatosInfra.infraestructuras[this.idToma]["res"+(i+1)]);
        }

      }
      );
  }

  nombreRiesgo(){
    if(this.riesgo_num == 0)
    this.riesgo_name = "Nulo";
  else if(this.riesgo_num < 3)
    this.riesgo_name = "Bajo";
  else if(this.riesgo_num < 5)
    this.riesgo_name = "Intermedio";
  else if(this.riesgo_num < 8)
    this.riesgo_name = "Alto";
  else
    this.riesgo_name = "Muy Alto";

    return this.riesgo_name;


  }

  saveAnswers() {
    if (this.arrayComplete(this.answers)) {
      
      let risk: number = this.calculateRisk();
      
      //this.riesgo_name = "adios";
      
      this.riesgo_num = risk;
        
  
        document.getElementById("openModalButton").click();
    
      

    } else {
      this.popErrorToast("El formulario esta incompleto.");
    }

  }

  calculateRisk() {
    let risk: number = 0;
    for (let answer in this.answers) {
      if (this.answers[answer] == true)
        risk++;
    }
    return risk;
  }


  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  goBack() {
    this._location.back();
  }

  arrayComplete(pArray): Boolean {
    for (var i = 1; i < pArray.length; i++) {
      if (pArray[i] == null) {
        return false;
      }
    }
    return true;
  }

 

  popErrorToast(pMessage: string) {
    var toast = {
      type: 'error',
      title: pMessage
    };
    this.toasterService.pop(toast);


  }

  popSuccessToast(pMesage: string) {
    var toast = {
      type: 'success',
      title: pMesage
    };
    this.toasterService.pop(toast);
  }

  guardar(){

    var aux = this.tomaDatosInfra.infraestructuras[this.idToma];

    aux.res1 = ''+(this.answers[1] ? 1 : 0);
    aux.res2 = ''+(this.answers[2] ? 1 : 0);
    aux.res3 = ''+(this.answers[3] ? 1 : 0);
    aux.res4 = ''+(this.answers[4] ? 1 : 0);
    aux.res5 = ''+(this.answers[5] ? 1 : 0);
    aux.res6 = ''+(this.answers[6] ? 1 : 0);
    aux.res7 = ''+(this.answers[7] ? 1 : 0);
    aux.res8 = ''+(this.answers[8] ? 1 : 0);
    aux.res9 = ''+(this.answers[9] ? 1 : 0);
    aux.res10 = ''+(this.answers[10] ? 1 : 0);
    aux.estado = 'Completo';


    if(this.evidenceGallery && this.tomaDatosInfra && this.tomaDatosInfra.infraestructuras[this.idToma]){
      
      this.evidenceGallery.saveEvidenceChanges().then(result=>{
        
        this.tomaDatosInfra.infraestructuras[this.idToma] = aux;
        this.tomaDatosInfra.infraestructuras[this.idToma].evidences=result.evidences;
        this.angularFireService.updateEvaluation(this.tomaDatosInfra.$key, this.idToma,this.tomaDatosInfra.infraestructuras[this.idToma])
        .subscribe(()=>{
          this.popSuccessToast("Se ha guardado con exito");
        }).unsubscribe();
      });
    }
  }

  private evidenceGallery: EvidenceGalleryComponent;
  onGalleryReady(gallery){
    this.evidenceGallery=gallery;
  }
}
