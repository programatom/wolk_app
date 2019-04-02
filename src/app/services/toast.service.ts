import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

    constructor(public http: HttpClient,
                private toastCtrl: ToastController) {
    }

    toastUsuarioPasswordInvalidosFn(){
      let mensaje = 'El usuario o la contraseña son inválidos';
      this.presentToast(mensaje);
    }
    toastIDInvalidoFn(){
      let mensaje = 'El ID de cliente es inválido, si no tiene un ID de cliente debe registrarse';
      this.presentToast(mensaje);
    }

    toastEliminacionFacturaExitosa(){
      let mensaje = 'Se eliminó la factura con éxito.';
      this.presentToast(mensaje);
    }
    toastCamposNumericoIngresadoNoCero(){
      let mensaje = 'El campo cantidad no puede ser 0';
      this.presentToast(mensaje);
    }

    toastCamposInvalidosProducto(){
      let mensaje = 'Ha ingresado valores inválidos o le falta ingresar algún valor';
      this.presentToast(mensaje);
    }

    toastMensajeDelServidor(mensaje , status? , tiempo?){
      this.presentToast(mensaje, tiempo);
    }

    toastNoSeEncontroProducto(){
      this.presentToast('No se encontró ningún producto.');
    }

    async presentToast(mensaje, tiempo?) {
      if(tiempo == undefined){
        tiempo = 3000;
      }
      const toast = await this.toastCtrl.create({
        message: mensaje,
        position: 'top',
        duration: tiempo,
        showCloseButton: true,
        closeButtonText: 'Cerrar',
        cssClass: "success"
      });
      toast.present();
    }

    toastLargo(mensaje){
      this.presentToastLargo(mensaje);
    }

    async presentToastLargo(mensaje) {
      const toast = await this.toastCtrl.create({
        message: mensaje,
        position: 'top',
        duration: 15000,
        showCloseButton: true,
        closeButtonText: 'Cerrar',
        cssClass: "success"
      });
      toast.present();
    }
}
