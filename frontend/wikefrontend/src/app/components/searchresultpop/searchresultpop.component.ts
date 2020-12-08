import { Component, OnInit } from '@angular/core';
import {PopoverController} from '@ionic/angular';

@Component({
  selector: 'app-searchresultpop',
  templateUrl: './searchresultpop.component.html',
  styleUrls: ['./searchresultpop.component.scss'],
})
export class SearchresultpopComponent implements OnInit {

  constructor(
		private popoverController: PopoverController
	) { }

  ngOnInit() {}

}
