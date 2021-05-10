import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../services/api.service';  // Import the music service
import { PopoverController } from '@ionic/angular';
import { SearchresultpopComponent } from 'src/app/components/searchresultpop/searchresultpop.component';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.page.html',
	styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {
	results: Observable<any>
	playlists: any
	playlistSongs: any
	searchTerm: string
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
	}

	// When click in a search result
	clickSearchSong( item ) {
		console.log( item )
		/* Cola playlist?¿ */
		/* Crear unha lista, despois meter as cancións de algún modo */
	}

	// Load the songs from a selected playlist
	/* Aquí también hay que pasar el limit y el offset para ver todas las canciones */
	getPlaylistSongs( playlistId:string ) {
		this.playlistSongs = this.apiService.spotifyGetPlaylistSongs( playlistId )
		console.log( playlistId )
		console.log( this.playlistSongs )
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
			this.clickSearchSong( data.item )
			/* Meter aquí a función de que cando clicke na canción a engada a playlist */

		}
	}

	// Infinite scroll of songs
	infinitesongs( event ){
		console.log( "Cargando siguientes..." )
	}

	// Get the user playlists
	/* Hay que pasar el limit y el offset para poder recibir todas las listas */
	getPlaylists() {
		this.playlists = this.apiService.spotifyGetPlaylists();
	}

	generatePlaylist() {
	}

	// When something is written in search bar
	searchChanged() {
		this.results = this.apiService.spotifySearch( this.searchTerm );
	}

}
