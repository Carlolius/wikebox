import { Component, OnInit } from '@angular/core';
import { interval, Observable } from 'rxjs';

import { ApiService } from '../../services/api.service';  // Import the music service
import { PopoverController } from '@ionic/angular';
import { SearchresultpopComponent } from 'src/app/components/searchresultpop/searchresultpop.component';

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
	/* Meter por aquí variables del tipo */
	/* limit_search: 50 */
	/* offset_search: 0 */
	/* limit_playlists: 50 */
	/* offset_playlists: 0 */

	constructor(
		private apiService: ApiService,
		private searchPopover: PopoverController,
	) { }

	ngOnInit() {
		this.showLocalPlaylist();
		this.currentSong();
		this.popTop();
		this.addToQueue();
		this.repeat()
	}

	// When click in a search result
	clickSearchSong( songUri:string ) {
		/* Para playlist mode, ten que haber unha playlist de spotify seleccionada e se van a ir engadindo na playlist as cancións que se seleccionen */
		/* Para queue mode, ten que gardar as cancións na bd de spotify. */
		this.searchedSong = this.apiService.spotifyClickSeachedSong( songUri )
	}

	// Vote positive for a song
	voteP(uri){
		this.apiService.voteP(uri)
	}

	// Vote negative for a song
	voteN(uri){
		this.apiService.voteN(uri)
	}

	// Necessary checks every 5 seconds
	repeat(){
		interval(5000)
			.subscribe((x) => {
				this.showLocalPlaylist();
				this.currentSong();
				this.popTop();
				this.addToQueue();
		});
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
		this.apiService.addToQueue()
	}
	
	showPlayingNow() {
		this.apiService.playingNow()
		console.log("currentplaying", this.currentPlaying)
	}

	showLocalPlaylist() {
		this.queueSongs = this.apiService.queueSongs()
	}

	// Popover that shows results of search
	async searchShowpop( event ) {
		const popover = await this.searchPopover.create({
			component: SearchresultpopComponent, 
			event: event,
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
		this.devices = this.apiService.spotifyChooseDevice();
		/* console.log("getDevices", Object.values(this.devices)) */
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

	currentSong(){
		this.apiService.spotifyCurrentSong();
		this.showPlayingNow();
	}

}
