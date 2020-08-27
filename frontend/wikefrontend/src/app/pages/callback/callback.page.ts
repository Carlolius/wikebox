import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';  // Import the music service

@Component({
  selector: 'app-callback',
  templateUrl: './callback.page.html',
  styleUrls: ['./callback.page.scss'],
})
export class CallbackPage implements OnInit {

  constructor(
		private apiService: ApiService,
	) { }

  ngOnInit() {
		this.apiService.spotifyCallback();
  }

	getSpotifyToken() {
		this.apiService.spotifyCallback()
	}
}
