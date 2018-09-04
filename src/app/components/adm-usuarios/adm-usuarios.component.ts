import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/*		Model-Entities		*/
import { User } from '../../common/model/User';

/*		Modules		*/
import { FirebaseApp, AngularFire, FirebaseListObservable } from 'angularfire2';

/*		Services		*/
import { AngularFireService } from 'app/common/service/angularFire.service';
import { ExportService } from "app/common/service/export.service";
import { UserService } from "app/common/service/user.service";
import { SearchService } from './search.service';

@Component({
  selector: 'app-adm-usuarios',
  templateUrl: './adm-usuarios.component.html',
  styleUrls: ['./adm-usuarios.component.scss'],
  providers: [SearchService, UserService, AngularFireService]
})
export class AdmUsuariosComponent implements OnInit {

  private sub: any;
  public filteredList: any[];
  private allList: any[];
  public allSelection: boolean;
  private searchFirebase: any;
	private searchFirebase2: any;
  public userAccess;
	private user;
	public isLoggedIn: boolean;

  constructor(
    private searchService: SearchService,
		private angularFire: AngularFire,
		private userService: UserService,
		private route: ActivatedRoute,
    private router: Router,
    private af: AngularFire,
		private angularFireService: AngularFireService,
		private fb: FormBuilder,
		private exportService: ExportService) {
  }
  
  

  ngOnInit(): void{
    this.loadLocalAttributes();
  }

  
  ngOnDestroy(): void {
		if (this.sub != null)
			this.sub.unsubscribe();
		this.filteredList = [];
		this.allList = [];
  }
  
  loadUserPermissions() {
		this.userAccess = {};
		this.af.auth.subscribe(user => {
			if (user) {
				this.isLoggedIn = true;
				this.userService.getRolAccess(user.uid).subscribe(
					results => {
						this.userAccess = results;
						//this.userAccess.asada
					}
				)
			}
			this.getResult();
			
		});
  }
  
  loadLocalAttributes() {
		this.filteredList = [];
		this.allList = [];
		this.allSelection = false;

  }

  getResult(): void {
		this.allList = this.filteredList = [];	
		this.searchFirebase = this.searchService.search("usuarios");
		this.searchFirebase.subscribe(
			results => {
				this.filteredList = results;
			}
		);
	}


}
