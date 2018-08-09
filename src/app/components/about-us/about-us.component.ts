/* gabygarro (06/09/17): Esta página, junto con map-google.component y about-us.component
tienen un work around descrito en el issue https://github.com/angular/angular/issues/6595 */

import { Component, OnInit } from '@angular/core';

import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss']
})
export class AboutUsComponent {
  private scrollExecuted: boolean = false;
  private fragment: string;

  constructor(private route: ActivatedRoute) { }

  /*ngAfterViewChecked(): void {
  if (!this.scrollExecuted) {
      let routeFragmentSubscription: Subscription;
      routeFragmentSubscription = this.route.fragment.subscribe(fragment => {
        if (fragment) {
          let element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView();
            this.scrollExecuted = true;
            // Free resources
            setTimeout(
              () => {
                console.log('routeFragmentSubscription unsubscribe');
                routeFragmentSubscription.unsubscribe();
              }, 0);
          }
        }
      });
    }
  }*/

}
