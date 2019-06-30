import { Injectable } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { NavigationParamsService } from './navigation-params.service';
import { ModalPrintPage } from '../crear-factura-online/modal-print/modal-print.page';
import { LocalStorageService } from './local-storage.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class PrintService {


  constructor(private btSerial: BluetoothSerial,
    private plt: Platform, private navParams: NavigationParamsService,
    private modalCtrl: ModalController,
    private localStorageServ: LocalStorageService,
    private toastServ: ToastService) {

  }

  searchBt() {
    return this.btSerial.list();
  }

  connectBT(address) {
    return this.btSerial.connect(address);

  }

  print(address, printData) {
    return new Promise((resolve, reject) => {
      let xyz = this.connectBT(address).subscribe((data) => {
        this.btSerial.write(printData).then(dataz => {
          console.log("WRITE SUCCESS", dataz);
          let objAlert = {
            title: "Se imprimió la factura con éxito!",
            buttons: ['Dismiss']
          };
          this.toastServ.toastMensajeDelServidor(objAlert["title"], "success");
          xyz.unsubscribe();
          resolve();

        }, errx => {
          console.log("WRITE FAILED", errx);
          let objAlert = {
            title: "Ocurrió un error con la impresión! ",
            subTitle: errx,
          };
          this.toastServ.toastMensajeDelServidor(objAlert["title"] + errx, "error");
          reject();
        });
      }, err => {
        console.log("CONNECTION ERROR", err);
        let objAlert = {
          title: "Ocurrió un error de conexión ",
          subTitle: err,
        };
        this.toastServ.toastMensajeDelServidor(objAlert["title"] + err, "error");
        reject();
      });
    })
  }

  printFN(selectedPrinter, dataPrint) {
    return new Promise((resolve, reject) => {
      if (selectedPrinter == undefined) {
        let objAlert = {
          title: "No se seleccionó ninguna impresora",
          buttons: ['Entendido!']
        };
        this.toastServ.toastMensajeDelServidor(objAlert["title"], "error");
        reject("No hay impresora");
      } else {
        var id = selectedPrinter.id;
        if (id == null || id == "" || id == undefined) {
          //nothing happens, you can put an alert here saying no printer selected
          let objAlert = {
            title: "No se seleccionó ninguna impresora",
            buttons: ['Entendido!']
          };
          this.toastServ.toastMensajeDelServidor(objAlert["title"], "error");
          reject("No hay impresora");
        }
        else {
          this.print(id, dataPrint).then(() => {
            resolve();
          })
            .catch((err) => {
              reject();
            });
        }
      }
    })
  }

  async buscarImpresora(backUrl) {
    return new Promise(async (resolve, reject) => {
      if (this.plt.is("cordova")) {
        this.searchBt().then(async datalist => {

          //1. Open printer select modal

          this.navParams.dataPrint.data = datalist;
          this.navParams.dataPrint.backUrl = backUrl;

          const modal = await this.presentModalPrint();
          modal.present();
          console.log(modal);

          await modal.onDidDismiss();
          this.printerSelected();
          //0. Present Modal
          resolve();

        }, err => {
          console.log("ERROR", err);
          let objAlert = {
            title: "ERROR " + err,
            buttons: ['Dismiss']
          };
          this.toastServ.toastMensajeDelServidor(objAlert["title"], "error");
          reject();
        });

      } else {
        //1. Open printer select modal

        this.navParams.dataPrint.data = [{ "name": "impresora", "id": 1 }];
        this.navParams.dataPrint.backUrl = backUrl;

        const modal = await this.presentModalPrint();
        modal.present();

        await modal.onDidDismiss();
        this.printerSelected()
        resolve();
      }
    });

  }


  printerSelected() {
    let data = this.navParams.selectedPrinter;
    if (data != null) {
      this.localStorageServ.insertAndInstantiateValue("impresora", data);
      this.toastServ.toastMensajeDelServidor("Seleccionó la impresora " + data.name);
    }
    return;
  }



  async presentModalPrint() {

    return this.modalCtrl.create({
      component: ModalPrintPage
    });
  }

}
