import { Component, OnInit } from '@angular/core';

import {
  AlertController,
  Platform, Events, NavController
} from '@ionic/angular';

// Providers

import { LocalStorageService } from '../../services/local-storage.service';
import { PedidosPostService } from '../../services/pedidos-post.service';
import { ToastService } from '../../services/toast.service';
import { DataFacturaService } from '../../services/data-factura.service';
import { AlertOptions } from '@ionic/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-datos-de-venta',
  templateUrl: './datos-de-venta.page.html',
  styleUrls: ['./datos-de-venta.page.scss'],
})
export class DatosDeVentaPage implements OnInit {

  // NG model
  ubicacion: string;
  sucursal: string;
  terminal: string;
  urlFoto: string;

  // Variables operativas
  showSplash: boolean = false;
  dataUser: any;

  constructor(private alertCtrl: AlertController,
    private plt: Platform,
    private event: Events,
    public localStorageServ: LocalStorageService,
    private pedidosPostServ: PedidosPostService,
    private toastServ: ToastService,
    public dataFacturaServ: DataFacturaService,
    private navCtrl: NavController,
    private router: Router

  ) {

    this.event.subscribe('errorServidor', () => {
      this.showSplash = false;
    })

    this.dataUser = this.localStorageServ.localStorageObj["dataUser"];
    if (this.dataUser != null) {
      this.ubicacion = this.dataUser.nom_localizacion;
      this.sucursal = this.dataUser.sucursal;
      this.terminal = this.dataUser.nro_terminal;
      if (this.plt.is('cordova')) {
        if (this.plt.is('ios')) {
          this.urlFoto = this.dataUser.logo;
        } else {
        }
      } else {
        this.urlFoto = this.dataUser.logo;
      }
    } else {
      this.navCtrl.navigateRoot('/login');
    }

  }

  dismiss() {
    this.navCtrl.navigateBack("/menu-crear-factura")
  }

  ngOnDestroy(){
    // Puedo llegar acá desde la factura esta misma voliendo para tras
    // Siempre que voy a menu crear factura, la estoy eliminando
    if(this.router.url == "/menu-crear-factura" && this.dataFacturaServ.dataFactura.isProcesadaInterno == false){

      this.showSplash = true;
      this.toastServ.toastMensajeDelServidor("Eliminando factura... " , "success")
      this.pedidosPostServ.eliminarFacturaTemporal(
        this.dataUser.idUser, this.dataFacturaServ.dataFactura.id_facturaPV, this.sucursal, this.terminal, this.ubicacion, this.dataUser.usuario
      ).then((data: any) => {
        if (data[0]['ErrorMessage'] == 'EXITO') {
          this.dataFacturaServ.arrayProductos = [];
          this.showSplash = false;
          this.toastServ.toastMensajeDelServidor("Se eliminó la factura con éxito" , "success")
        }
      })
    }else{
      console.log("Se vuelve sin eliminar la factura");
    }
  }
  ngOnInit() {
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

}
