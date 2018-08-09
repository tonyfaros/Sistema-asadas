import { Component, OnInit } from '@angular/core';
import { UserService } from "app/common/service/user.service";

@Component({
  selector: 'app-persmission-requests',
  templateUrl: './persmission-requests.component.html',
  styleUrls: ['./persmission-requests.component.scss'],
  providers: [UserService]

})
export class PersmissionRequestsComponent implements OnInit {

  constructor(private userService: UserService) { }
  public requests;
  ngOnInit() {
    this.getRequests();

  }
  getRequests() {
    this.userService.getAsadasRequests().subscribe(
      results => {
        this.requests = results;
      }
    )
  }
  approve(request) {
    var uid = request.usuario;
    this.userService.acceptRequest(uid,request);
  }
  denyRequest(request) {
    var uid = request.usuario;
    this.userService.declineRequest(request);
  }

}
