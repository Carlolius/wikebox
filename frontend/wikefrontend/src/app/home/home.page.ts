import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ApiserviceService } from '../services/apiservice.service';

@Component({
  selector: 'page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  songs: any;

  constructor(public navCtrl: NavController, public apiservice: ApiserviceService) {
  }
  ngOnInit(){  // After load the site
    this.apiservice.getSongs();
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
