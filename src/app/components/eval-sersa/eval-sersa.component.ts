import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';

import 'rxjs/add/operator/switchMap';

import { GetEvalSersaService } from './get-eval-sersa.service'
import { ToasterService, ToasterConfig } from 'angular2-toaster';
import { FormularioSersa } from '../../common/model/FormularioSersa'
import { Infrastructure  } from '../../common/model/Infrastructure'
import { Evaluation } from '../../common/model/Evaluation'
import { UserService } from "app/common/service/user.service";
import { AngularFire } from "angularfire2";

@Component({
  selector: 'app-eval-sersa',
  templateUrl: './eval-sersa.component.html',
  styleUrls: ['./eval-sersa.component.scss'],
  providers: [GetEvalSersaService, ToasterService, UserService]
})
export class EvalSersaComponent implements OnInit, OnDestroy {
  private sub: any;
  private infrastructureId: string;
  public form: FormularioSersa[];
  private answers: Boolean[];
  private type: string;

  /*			Toast variables		*/
  public toastConfig: ToasterConfig = new ToasterConfig({
    positionClass: 'toast-bottom-center',
    limit: 5
  });

  constructor(private route: ActivatedRoute,
    private getFormService: GetEvalSersaService,
    private router: Router,
    private toasterService: ToasterService,
    private userService: UserService,
    private af: AngularFire) { }
  private user;

  ngOnInit() {
    this.loadUserPermissions();
    this.sub = this.route.params.subscribe((params: Params) => {
      this.infrastructureId = params['id'];
      this.type = params['type'];
    });
    this.getForm();
  }
  loadUserPermissions() {
    this.user = {};
    this.af.auth.subscribe(user => {
      if (user) {
        this.userService.getUser(user.uid).subscribe(
          results => {
            this.user = results;
          }
        )
      }
    });
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
      }
      );
  }
  saveAnswers() {
    if (this.arrayComplete(this.answers)) {
      let risk: number = this.calculateRisk();
      const infrastructure = this.getFormService.getInfrastructure(this.infrastructureId);
      this.pushAnswers(risk);
      infrastructure.update({ risk: risk });

      this.popSuccessToast("Se guardo la evaluacion.");
      setTimeout(() => {
        this.goBack();
      },
        2000);

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
  pushAnswers(risk) {
    let evaluations = this.getFormService.getEvaluations(this.infrastructureId);
    var currentdate = new Date();
    var datetime = currentdate.getDate() + "/"
      + (currentdate.getMonth() + 1) + "/"
      + currentdate.getFullYear() + " @ "
      + currentdate.getHours() + ":"
      + currentdate.getMinutes() + ":"
      + currentdate.getSeconds();
    var answer = {
      "questions": this.answers,
      "user": this.user,
      "dateTime": datetime,
      "riskCalculated":risk
    }
    evaluations.push(answer);
  }


  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/' + this.type + 'Details/' + this.infrastructureId]);
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

}
