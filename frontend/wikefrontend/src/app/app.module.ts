import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

/* This import allow us to make http requests */
import { HttpClientModule } from '@angular/common/http';

/* This import the service we created to make the requests */
import { ApiserviceService } from  './services/apiservice.service';

/* Import the authenticator module*/
import { AuthModule } from './services/auth.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), HttpClientModule, AuthModule, AppRoutingModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ApiserviceService // The service that connects with Django
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
