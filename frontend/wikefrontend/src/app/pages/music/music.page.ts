import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../../services/api.service';  // Import the music service

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
	/* Meter por aquí variables del tipo */
	/* limit_search: 50 */
	/* offset_search: 0 */
	/* limit_playlists: 50 */
	/* offset_playlists: 0 */

	constructor(
		private apiService: ApiService,
	) { }

	ngOnInit() {
	}

	// When click in a search result
	clickSearchSong(item) {
		console.log(item)
		/* Cola playlist?¿ */
		/* Crear unha lista, despois meter as cancións de algún modo */
	}

	// Load the songs from a selected playlist
	/* Aquí también hay que pasar el limit y el offset para ver todas las canciones */
	getPlaylistSongs(playlistId:string) {
		this.playlistSongs = this.apiService.spotifyGetPlaylistSongs(playlistId)
		console.log(playlistId)
		console.log(this.playlistSongs)
	}

	// Infinite scroll of songs
	infinitesongs(event){
		console.log("Cargando siguientes...")
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
		this.results = this.apiService.spotifySearch(this.searchTerm);
	}

}
