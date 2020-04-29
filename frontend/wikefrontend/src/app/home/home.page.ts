import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiserviceService } from '../services/apiservice.service';  // Import the service

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public navCtrl: NavController, public apiservice: ApiserviceService) {
  }

  songs:any; // Array to hold the songs

  ngOnInit(){  // After load the site
   this.apiservice.getSongs();  // Call the api and get the songs
  }
  /* ionViewDidLoad(){                    // The things here are loaded only once */
  /*   this.apiservice.getSongs() */
  /*   .subscribe( */
  /*     (data) => { // Success */
  /*       this.songs = data['results']; */
  /*     }, */
  /*     (error) =>{ */
  /*       console.error(error); */
  /*     } */
  /*   ) */
  /* } */
  
}
