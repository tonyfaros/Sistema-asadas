import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params, Router }   from '@angular/router';

@Component({
  selector: 'app-add-infrastructure',
  templateUrl: './add-infrastructure.component.html',
  styleUrls: ['./add-infrastructure.component.scss']
})
export class AddInfrastructureComponent implements OnInit {

    AsadaID: string;

  	/* 		 routing variables   */
    private sub: any;


  constructor(	 
    private route: ActivatedRoute, 
	  private router: Router) {  }

  ngOnInit() {

    	this.sub = this.route.params
                  .subscribe((params: Params) => {
                  this.AsadaID = params['id'];
                });
  }

}
