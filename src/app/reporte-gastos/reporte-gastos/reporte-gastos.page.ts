import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { AlertOptions } from '@ionic/core';
import { PedidosGetService } from 'src/app/services/pedidos-get.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ReporteDeGastosService } from 'src/app/services/reporte-de-gastos/reporte-de-gastos.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-reporte-gastos',
  templateUrl: './reporte-gastos.page.html',
  styleUrls: ['./reporte-gastos.page.scss'],
})
export class ReporteGastosPage implements OnInit {

  monedas = [];
  mediosDePago = [];
  showSplash:boolean = false;

  //id_moneda:string
  //tipo_cambio:string
  //motivo:string
  //monto_gasto:number
  //nom_formaPago:string
  //observaciones:string

  moneda:string = "CRC";
  tarifaDeCambio = 1;
  motivo = "";
  monto = 0;
  medioDePago:string = "caja x efectivo";
  observaciones:string = "";

  medioDePagoDisplay = "";
  nombreMonedaSelec = "";

  constructor(private navCtrl: NavController,
              private pedidosGetServ: PedidosGetService,
              public localStorageServ: LocalStorageService,
              private alertCtrl: AlertController,
              private reporteServ: ReporteDeGastosService,
              private toastServ: ToastService) { }

  ngOnInit() {

    this.pedidosGetServ.selectMonedas().then((monedas:any)=>{
      monedas.splice(0 , 1)
      this.monedas = monedas;
      let data = {
        "id_wolk":this.localStorageServ.localStorageObj.dataUser.idUser,
      }
      this.reporteServ.selectCuentasFormasdePagoActivas(data).subscribe((mediosDePago:any)=>{
        console.log(mediosDePago)
        mediosDePago.splice(0 , 1)
        this.mediosDePago = mediosDePago;
      })
    })
  }
  dismiss(){
    this.navCtrl.navigateBack("/menu");
  }

  selectMedioDePago(){


    if(this.medioDePagoDisplay == 'Otro'){
      let header = 'Ingrese el medio de pago';
      let subHeader = 'Elija un cliente de la lista';
      let inputs = [
        {
          name: 'medioPago',
          placeholder: 'Medio de pago',
        }
      ];
      let buttons = [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceptar',
          handler: data => {
            this.medioDePago = data['medioPago'];

          }
        }
      ];
      this.localStorageServ.presentAlert(header, subHeader, inputs, buttons);
    }else{
      this.medioDePago = this.medioDePagoDisplay;

    }
  }

  buscarTarifaDeCambio(){
    this.showSplash = true;
    let indexMoneda = this.monedas.findIndex((element)=> {return element.id_moneda == this.moneda});
    this.pedidosGetServ.buscarTarifa(this.localStorageServ.localStorageObj["dataUser"].idUser,this.monedas[indexMoneda].id_moneda).then((data)=>{
      this.showSplash = false;
      this.tarifaDeCambio = data[0]['tarifa'];
      this.nombreMonedaSelec = data[0]['codigo'];
    })
  }

    procesarGasto(){
      if(this.monto < 0 ){
        this.toastServ.toastMensajeDelServidor("No se permiten valores negativos en el monto", "error");
        return;
      }
      this.showSplash = true;
      let user:ObjUserData = this.localStorageServ.localStorageObj.dataUser;
      let data:any = {
        "id_cliente_ws": user.idUser,
        "sucursal": user.sucursal,
        "nro_terminal": user.nro_terminal,
        "nom_localizacion": user.nom_localizacion,
        "Usuario": user.usuario
      }
      data.id_moneda = this.moneda;
      data.tipo_cambio = this.tarifaDeCambio;
      data.motivo = this.motivo;
      data.monto_gasto = this.monto;
      data.nom_formaPago = this.medioDePago;
      data.observaciones = this.observaciones;


      this.reporteServ.procesoGastos(data).subscribe((resp)=>{
        this.showSplash = false;
        if(resp){
          this.toastServ.toastMensajeDelServidor("Se procesó el gasto con éxito" , "success");
          this.navCtrl.navigateBack("/menu");
        }
      })
    }


}
