import { Component, OnInit } from '@angular/core';
import { Router } from  "@angular/router";
import { ApiService } from '../../services/api.service'

@Component({
  selector: 'app-instance',
  templateUrl: './instance.page.html',
  styleUrls: ['./instance.page.scss'],
})
export class InstancePage implements OnInit {

  constructor(
		private  apiService: ApiService,
		private  router:  Router
	) { }

  ngOnInit() {
  }

	instance(form) {
    this.apiService.registerInstance(form.value.instance).subscribe((res)=>{
			this.router.navigateByUrl(res + '/register');
		});
	}

	login(){
			this.router.navigateByUrl('login');
	}
}
