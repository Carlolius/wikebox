/* import { Component } from '@angular/core'; */

/* @Component({ */
/*   selector: 'app-home', */
/*   templateUrl: 'home.page.html', */
/*   styleUrls: ['home.page.scss'], */
/* }) */
/* export class HomePage { */

/*   constructor() {} */

/* } */

/* import { Component } from '@angular/core'; */
/* import { NavController } from '@ionic/angular'; */
/* import { ApiserviceService } from '../services/apiservice.service'; //importamos nuestro service */

/* @Component({ */
/*   selector: 'page-home', */
/*   templateUrl: 'home.page.html' */
/* }) */
/* export class HomePage { */

/*   arraySongs:any; //Creamos la variable donde guardaremos los datos que nos retorna el servicio */

/*   constructor(public navCtrl: NavController, public songsServices:ApiserviceService) { */
/*   /1* public songsServices:ApiserviceService; *1/ */
    
/*   } */
/*   ionViewDidLoad() { */
/*     this.getSongs(); //Llamamos a la función getPost cuando la vista se cargue */
/*   } */

/*   getSongs() { //llamamos a la funcion getPost de nuestro servicio. */
/*     this.songsServices.getSongs() */
/*     .then(data => { */
/*       this.arraySongs = data; */
/*     }); */
/*   } */
/* } */


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
  ngOnInit(){
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
