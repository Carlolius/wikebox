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
	searchTerm: string

  constructor(
		private apiService: ApiService,
	) { }

  ngOnInit() {
  }

	// When something is written in search bar
	searchChanged() {
		this.results = this.apiService.spotifySearch(this.searchTerm);
	}

}
