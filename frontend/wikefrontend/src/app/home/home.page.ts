import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiserviceService } from '../services/apiservice.service';  // Import the service

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  songs:any; // Array to hold the songs

  constructor(public navCtrl: NavController, public apiservice: ApiserviceService) {
  }

  ngOnInit(){  // After load the site
		this.getLivePlaylist();
  }

	getLivePlaylist(){
		this.apiservice.get()  // Call the api and get the songs
		.subscribe((songs) => console.log(songs));
	}

	getPlayingNow(){
		/* this.apiservice.get() */
	}

}
