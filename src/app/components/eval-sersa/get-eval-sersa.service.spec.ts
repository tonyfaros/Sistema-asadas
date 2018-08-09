import { TestBed, inject } from '@angular/core/testing';
import { GetEvalSersaService } from './get-eval-sersa.service';

import { AngularFireModule } from 'angularfire2';
import {firebaseConfig} from "environments/firebase.config";

describe('GetFormSersaTanqService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetEvalSersaService],
      imports: [AngularFireModule.initializeApp(firebaseConfig)]
    });
  });

  it('should ...', inject([GetEvalSersaService], (service: GetEvalSersaService) => {
    expect(service).toBeTruthy();
  }));
});
