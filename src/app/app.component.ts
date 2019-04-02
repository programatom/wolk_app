import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Network } from '@ionic-native/network/ngx';



import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ObjResponse } from "../interfaces/interfaces";

// Serviders
import { LocalStorageService } from './services/local-storage.service';
import { ActualizacionService } from './services/actualizacion/actualizacion.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {

  test: boolean = false;
  showSplash = true;


  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private keyboard: Keyboard,
    public localStorageServ: LocalStorageService,
    private navCtrl: NavController,
    private network: Network,
    private actualizacionServ: ActualizacionService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.internetSubscription();
      if (this.platform.is("cordova")) {
        this.test = false;
      } else {
        this.test = false;
      }
      if (this.test) {
        this.localStorageServ.searchAndInstantiateAllKeysInStorage().then(() => {
          console.log('MODO TEST!');
          this.localStorageServ.localStorageObj.dataUser.msg = "01";
          this.navCtrl.navigateRoot("/menu");
          this.statusBar.styleLightContent();
          this.splashScreen.hide();
          this.showSplash = false;
        })
      } else {
        this.keyboard.setResizeMode('false');
        this.localStorageServ.searchAndInstantiateKey("dataUser").then((resp: ObjResponse) => {
          if (resp.status == "success") {
            this.localStorageServ.searchAndInstantiateAllKeysInStorage().then(() => {
              console.log('Se encontró el objeto dataUser');
              this.statusBar.styleLightContent();
              this.navCtrl.navigateRoot("/menu").then(()=>{
                this.splashScreen.hide();
              });
              this.showSplash = false;
            })
          } else {
            console.log('No se encontró el dataUser, se define el root page como Login Page');
            this.statusBar.styleLightContent();
            this.navCtrl.navigateRoot("/login").then(()=>{
              this.splashScreen.hide();
            });
            this.showSplash = false;
          }
        }).catch(err => {
          console.log(err);
          this.showSplash = false;
        });
      }
    });
  }


  internetSubscription() {

    console.log("hasta aca llega")
    // watch network for a disconnection
    this.network.onDisconnect().subscribe(() => {
      if (this.network.type == "none") {
        this.localStorageServ.internetConnection = false;
      } else {
        this.localStorageServ.internetConnection = true;
      }
    });


    // watch network for a connection
    this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(() => {
        if (this.network.type == "none") {
          this.localStorageServ.internetConnection = false;
        } else {
          this.localStorageServ.internetConnection = true;
        }
      }, 3000);
    });

    return;

  }
}
