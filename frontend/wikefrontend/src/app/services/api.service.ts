import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest} from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from "rxjs";
import { map, catchError } from 'rxjs/operators';
/* import { catch } from 'rxjs/operators'; */
/* import { map } from 'rxjs/operators'; */


@Injectable()

export class ApiService {

	SERVER_ADDRESS: string = 'http://localhost:8000/';


	constructor(
		private httpClient: HttpClient,
		private router: Router
	) {}

	get() {
		return this.httpClient.get(this.SERVER_ADDRESS);
	}

	registerInstance(instance: String) {
		return this.httpClient.post(this.SERVER_ADDRESS + 'api/instanceregister/', {urlInstance: instance})
	}

	playingNow(){
		return this.httpClient.post(this.SERVER_ADDRESS + 'api/playingnow/', {request: Request}).subscribe((response) => {
			console.log("leresponse", response)
			/* return(response) */
		});

		/* return this.httpClient.post(this.SERVER_ADDRESS + 'api/playingnow/', {request: Request}).pipe( */
		/* map(results => Object.keys(results).map(key => ({value: results[key]})))) */
	}

	voteP(song:string){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/votep/', {'uri': song}).subscribe()
	}

	voteN(song:string){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/voten/', {'uri': song}).subscribe()
	}

	popTop(){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/poptop/', {request: Request}).subscribe()
	}

	addToQueue(){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/addtoqueue/', {request: Request}).subscribe()
	}

	queueSongs(){
		return this.httpClient.post(this.SERVER_ADDRESS + 'api/queuesongs/', {request: Request})
		/* return this.httpClient.get(this.SERVER_ADDRESS + 'api/queuesongs/').pipe( */
		/* 	map(results => Object.keys(results).map(key => ({value: results[key]})) */
		/* 		 ), */
		/* ); */
	}

	// Gets the Spotify api login url and open it in the same window
	spotifyLoginUrl() {
		this.httpClient.get(this.SERVER_ADDRESS + 'api/token/').subscribe((response) => {
			window.open(response[0].url, '_self');
		})
	}

	// Makes a request giving the url that contains the token info
	spotifyCallback() {
		this.httpClient.post(this.SERVER_ADDRESS + 'api/callback/', {'url': window.location.href }).subscribe((response) => {
			console.log(response)
		})
	}

	spotifyChooseDevice(){
		return this.httpClient
		.get(this.SERVER_ADDRESS + 'api/choosedevice/')
		.pipe(
			map(results => Object
					.keys(results)
					.map(key => ({value: results[key]}))
				 ),
		);
	}

	// Get the playlists of the user
	spotifyGetPlaylists(){
		return this.httpClient.get(this.SERVER_ADDRESS + 'api/playlists/').pipe(
			map(results => Object.keys(results).map(key => ({value: results[key]}))
				 ),
		);
	}

	// Search for songs in the spotify api
	// Get the results and map it to value result so it's printable in the html if empty search catches the error
	spotifySearch(searchTerm:string): Observable<any> {
		return this.httpClient.post(this.SERVER_ADDRESS + 'api/search/', {'search': searchTerm}).pipe(
			map(results => Object.keys(results).map(key => ({value: results[key]}))),
				catchError(err => ([]))
		);
		/* return this.httpClient.post(this.SERVER_ADDRESS + 'api/search/', {'search': searchTerm}).pipe( */
		/* 	map(results => { */
		/* 		if (results) { */
		/* 			const mapped = Object.keys(results).map(key => ({value: results[key]})); */
		/* 			map(mapped => mapped['value']) */
		/* 			console.log(mapped) */
		/* 		} */
		/* 		else { */
		/* 			console.log('Empty result') */
		/* 		} */
		/* 	}), */
		/* ); */
	}

	// Add a searched song to LocalPlaylist
	spotifyClickSeachedSong(songUri:string) {
		this.httpClient
			.post(this.SERVER_ADDRESS + 'api/searchtolocalplaylist/', {'songUri': songUri})
			.subscribe();
	}

	// Add songs to LocalPlaylist
	spotifyAddToLocalPlaylist(playlistId:string) {
		this.httpClient
			.post(this.SERVER_ADDRESS + 'api/playlisttolocalplaylist/', {'playlistId': playlistId})
			.subscribe();
	}

	// Start to play
	spotifyPlay(device:string){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/playmusic/', {'device': device}).subscribe();
	}

	// Song that is playing
	spotifyCurrentSong(){
		this.httpClient.post(this.SERVER_ADDRESS + 'api/currentplaying/', {'request': Request}).subscribe()
	}
	
}
