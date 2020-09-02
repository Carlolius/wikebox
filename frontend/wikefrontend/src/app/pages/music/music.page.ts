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

	constructor(
		private apiService: ApiService,
	) { }

	ngOnInit() {
		this.getPlaylists()
	}

	// When click in a search result
	clickSearchSong(item) {
		console.log(item)
		// Cola playlist?¿
		// Crear unha lista, despois meter as cancións de algún modo
	}

	// Load the songs from a selected playlist
	getPlaylistSongs(playlistId:string) {
		this.playlistSongs = this.apiService.spotifyGetPlaylistSongs(playlistId)
		console.log(playlistId)
		console.log(this.playlistSongs)
	}

	// Get the user playlists
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
