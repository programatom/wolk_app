import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { LocalStorageService } from '../local-storage.service';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Market } from '@ionic-native/market/ngx';

@Injectable({
  providedIn: 'root'
})
export class ActualizacionService {

  constructor(private plt: Platform,
              private localStorageServ: LocalStorageService,
              private version: AppVersion,
              private market: Market) { }

  buscarActualizacion(){
    var updatedVersion = "10003";
    if(false){
      this.version.getVersionCode().then((versionCode)=>{
        console.log("La version code es: " + versionCode)
        if(versionCode != updatedVersion){
          let header = "Hay una actualizacion disponible!";
          let subHeader = "Descargue la actualización para obtener una version libre de bugs y con las ultimas funciones implementadas";
          let buttons = [{
            text:"Mas tarde",
            role: "cancel"
          },{
            text:"Actualizar",
            handler: ()=>{
              this.market.open("wolkSoftware.App.com").then((market)=>{
                console.log("Respuesta del market: " + market);
              });
            }
          }]
          this.localStorageServ.presentAlert(header, subHeader, undefined, buttons)
        }
      })
    }
  }

}
