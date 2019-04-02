import { Component, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';

import { LocalStorageService } from 'src/app/services/local-storage.service';
import { DataFacturaService } from 'src/app/services/data-factura.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationParamsService } from 'src/app/services/navigation-params.service';
import { CommonOperationsService } from 'src/app/services/common-operations/common-operations.service';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
})
export class PagoPage implements OnInit {

  montoTotal:number;
  montoCliente:number;
  pendiente:number = 0;
  vuelto:number = 0;
  cliente:any;
  pagarDisabled:boolean = true;

  formasPago:Array<any>;
  formaSeleccionada:string = "caja x efectivo";
  showSplash: boolean = false;

  constructor(public navCtrl: NavController,
              public localStorageServ: LocalStorageService,
              public dataFacturaServ: DataFacturaService,
              private toastServ: ToastService,
              private navParams: NavigationParamsService,
              private modalCtrl: ModalController,
              private common: CommonOperationsService) {


  }


  changeMontoCliente(){

    this.pagarDisabled = false;
    this.pendiente = this.dataFacturaServ.dataFacturaOffline.pagoOfflineData.pendiente;
    let pendienteMenosMonto:number = this.common.aproxXDecimals(this.pendiente - this.montoCliente, 2)

    if(pendienteMenosMonto < 0){
      this.pendiente = 0;
      this.vuelto =  - pendienteMenosMonto;
    }else{
      this.vuelto = 0;
      this.pendiente = pendienteMenosMonto;
    }
  }

  //---------------------------------------------------------------------------------------------------------

  ngOnInit(){

    this.pendiente = this.dataFacturaServ.dataFacturaOffline.pagoOfflineData.pendiente;
    this.montoTotal = parseFloat(this.dataFacturaServ.dataFacturaOffline.subTotales.total);
    this.cliente = this.navParams.clientData.cliente;
    this.formasPago = this.localStorageServ.localStorageObj.formasDePago;
    this.formaSeleccionada = "caja x efectivo";

  }

  //---------------------------------------------------------------------------------------------------------

  guardarPago(tipo){
    if(tipo == "completo"){
      this.montoCliente = this.pendiente;
      this.pendiente = 0;
    }else if ( tipo == "credito"){
      this.montoCliente = 0;
      this.pendiente = this.montoTotal;
    }else{
      if(isNaN(this.montoCliente) || this.montoCliente < 0 ){
        this.toastServ.toastMensajeDelServidor("Debe ingresar un numero válido en el monto cliente" , "error")
        return;
      }
    }
    
    this.dataFacturaServ.dataFacturaOffline.noPaga = false;
    this.dataFacturaServ.dataFacturaOffline.pagoOfflineData = {
      "pendiente": this.pendiente,
      "formaDePago": this.formaSeleccionada,
      "montoAbonado": this.montoCliente,
      "vuelto":this.vuelto
    }
    this.toastServ.toastMensajeDelServidor("Se realizó el pago con éxito" , "error");
    this.dismissModal();
  }


  //---------------------------------------------------------------------------------------------------------


  dismissModal(resp?){
    this.modalCtrl.dismiss();
  }


}
