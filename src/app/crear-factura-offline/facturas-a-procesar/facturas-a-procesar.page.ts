import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NavigationParamsService } from 'src/app/services/navigation-params.service';
import { AlertOptions } from '@ionic/core';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-facturas-a-procesar',
  templateUrl: './facturas-a-procesar.page.html',
  styleUrls: ['./facturas-a-procesar.page.scss'],
})
export class FacturasAProcesarPage implements OnInit {

  facturas:Array<any> = [];
  @ViewChild('dynamicList') dynamicList;

  constructor(public navCtrl: NavController, public navParams: NavigationParamsService,
              public localStorageServ: LocalStorageService,
              private alertCtrl: AlertController,
              private toastServ: ToastService) {


  }

  visualizarFactura(factura, fecha, key){

    this.navParams.procesoOfflineData.key = key;
    this.navParams.procesoOfflineData.factura = factura;
    this.navParams.procesoOfflineData.fecha = fecha;

    this.navCtrl.navigateForward("/crear-factura-offline/proceso-offline");
  }
  ngOnInit() {
    let keys = Object.keys(this.localStorageServ.localStorageObj);
    let keysLength = keys.length;
    for(let i = 0; i < keysLength; i ++){
      let key = keys[i];
      let split = key.split("_");
      if( split[0] == "factura"){
        let fecha = split[1] + "/" + split[2] + "/" + split[3] + "   " + split[4] + ":" + split[5] + " HRS.";
        console.log(this.facturas)
        this.facturas.push({
          "key":key,
          "factura": this.localStorageServ.localStorageObj[key],
          "fecha": fecha
        });
      }
      this.facturas.reverse();
    }
  }

  eliminarFactura(factura ,index, slidingItem){
    if(factura.factura.isProcesada == false){
      this.toastServ. presentToast("No se puede eliminar una factura sin procesar!");
      return;
    }
    let header = '¿Está seguro que desea eliminar esta factura?';
    let buttons = [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Aceptar',
        handler: async () => {
          this.localStorageServ.eliminateOneValueInStorage(factura.key);

          await slidingItem.close();
          this.facturas.splice(index, 1);
        }
      }
    ];
    this.presentAlert(header, undefined, undefined, buttons)
  }

  async presentAlert(header?, subHeader?, inputs?, buttons?) {

    let alertOptions = new Object() as AlertOptions;

    if (header != undefined) {
      alertOptions.header = header
    }
    if (subHeader != undefined) {
      alertOptions.subHeader = subHeader
    }
    if (inputs != undefined) {
      alertOptions.inputs = inputs
    }
    if (buttons != undefined) {
      alertOptions.buttons = buttons
    }

    const alert = await this.alertCtrl.create(alertOptions);
    return await alert.present();
  }
  ngOnDestroy(){
  }

}
