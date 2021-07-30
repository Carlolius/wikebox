import { Component, OnInit, OnDestroy } from '@angular/core';
import { interval, Observable } from 'rxjs';

import { ApiService } from '../../services/api.service';  // Import the music service
import { PopoverController } from '@ionic/angular';
import { SearchresultpopComponent } from 'src/app/components/searchresultpop/searchresultpop.component';
import { PopmenuComponent } from 'src/app/components/popmenu/popmenu.component';
import { PopTokenComponent } from 'src/app/components/pop-token/pop-token.component';

@Component({
	selector: 'app-music',
	templateUrl: './music.page.html',
	styleUrls: ['./music.page.scss'],
})

export class MusicPage implements OnInit {
	results: Observable<any>
	playlists: any
	playlistSongs: any
	searchTerm: string
	searchedSong: any
	queueSongs: any
	devices: any
	deviceName:string = "Choose device"
	deviceId:string
	currentPlaying:any
	userName:string
	check5:any 
	check10:any
	/* Meter por aquí variables del tipo */
	/* limit_search: 50 */
	/* offset_search: 0 */
	/* limit_playlists: 50 */
	/* offset_playlists: 0 */

	constructor(
		private apiService: ApiService,
		private searchPopover: PopoverController,
		private popMenu: PopoverController,
		private popToken: PopoverController,
	) { }

	ngOnInit() {
		this.userName = localStorage.getItem("username")
		this.currentSong();
		this.addToQueue();
		this.popTop();
		this.showQueue();
		this.spotifyareToken();
		// Necessary checks for the backend
		// Subscribe to an observable to get the data
		this.check5 = interval(5000).subscribe(() => {
			this.getDevices();
			this.currentSong();
			this.popTop();
			this.showQueue();
		})
		this.check10 = interval(10000).subscribe(() => {
			this.addToQueue();
		})
	}

	ngOnDestroy() {
		// When the page is closed unsubscribe to the checks
		this.check5.next()
		this.check5.complete()
		this.check10.next()
		this.check10.complete()
	}

	// Shows the obtain token popover
	async tokenPopover(){
		const popover = await this.popToken.create({
			component: PopTokenComponent,
		});
		await popover.present();
	}
				
	// Check to obtain the Spotify token
	spotifyareToken(){
		this.apiService.spotifyareToken().subscribe(data => {
			if(data != true){
				// If there aren't token, stop the checks and ask to login in Spotify
				this.check5.complete()
				this.check10.complete()
				this.tokenPopover()
			}
		});
	}

	// When click in a search result
	clickSearchSong( songUri:string ) {
		this.searchedSong = this.apiService.spotifyClickSeachedSong(songUri);
		this.showQueue();
	}
	
	// Vote positive for a song
	voteP(uri:string){
		this.apiService.voteP(uri);
		this.showQueue();
	}

	// Vote negative for a song
	voteN(uri:string){
		this.apiService.voteN(uri)
		this.showQueue();
	}

	// Necessary checks every 5 seconds
	/* check5(){
		interval(5000)
			.subscribe((x) => {
				this.getDevices();
				this.currentSong();
				this.popTop();
				this.showQueue();
			});
	}

	// Necessary checks every 10 seconds
	check10(){
		interval(10000)
			.subscribe((x) => {
				this.addToQueue();
			});
	} */
	
	showQueue(){
		this.apiService.queueSongs().subscribe(data => {
			if (JSON.stringify(this.queueSongs) != JSON.stringify(data)) {
				this.queueSongs = data
			}});
	}

	// Add playlist songs to LocalPlaylist
	/* Aquí también hay que pasar el limit y el offset para ver todas las canciones */
	addToLocalPlaylist( playlistId:string ) {
		this.playlistSongs = this.apiService.spotifyAddToLocalPlaylist( playlistId )
	}

	popTop(){
		this.apiService.popTop()
	}

	addToQueue(){
		this.apiService.addToQueue().subscribe();
	}
	
	async showPopMenu(ev: any){
		 const popover = await this.popMenu.create({
			 component: PopmenuComponent,
			 event: ev
		 });
		 await popover.present();
		 await popover.onDidDismiss();
	}

	// Popover that shows results of search
	async searchShowpop( ev: any ) {
		const popover = await this.searchPopover.create({
			component: SearchresultpopComponent, 
			event: ev,
			componentProps: {
				results: this.results,
			},
		});
		// If the search field it's empty don't show the popover
		if (this.searchTerm != "") {
			await popover.present();
		}
		const { data } = await popover.onWillDismiss();
		// Check if there are data
		if (data) {
			this.clickSearchSong( data.item)
		}
	}

	// Infinite scroll of songs
	infinitesongs( event ){
		console.log( "Cargando siguientes..." )
	}

	chooseDevice( device:any ){
		this.deviceName = device.value.name
		this.deviceId = device.value.id
	}

	getDevices(){
		this.apiService.spotifyChooseDevice().subscribe(data => {
			if (data.length = 1) { // engadir que o device non pode ser "ningún"
				this.devices = data
				this.deviceName = data[0].value.name
				this.deviceId = data[0].value.id
			} else {
				this.devices = data
			}
		});
	}

	// Get the user playlists
	/* Hay que pasar el limit y el offset para poder recibir todas las listas */
	/* Pode ser que falle con conexións lentas a internet? */
	getPlaylists() {
		this.playlists = this.apiService.spotifyGetPlaylists();
		/* console.log("playlists", this.playlists) */
	}

	// When something is written in search bar
	searchChanged() {
		this.results = this.apiService.spotifySearch( this.searchTerm );
	}

	playButton(){
		this.apiService.spotifyPlay(this.deviceId)
	}

	showPlayingNow() {
		this.apiService.playingNow().subscribe(data => this.currentPlaying = data);
	}

	currentSong(){
		this.apiService.spotifyCurrentSong();
		this.showPlayingNow();
	}

}
