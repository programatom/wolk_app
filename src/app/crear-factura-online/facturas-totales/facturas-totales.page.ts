import { Component, OnInit } from '@angular/core';
import { NavController, Events, ModalController, AlertController } from '@ionic/angular';

import { PagoPage } from '../pago/pago.page';

// Providers
import { LocalStorageService } from '../../services/local-storage.service';
import { PedidosGetService } from '../../services/pedidos-get.service';
import { ToastService } from '../../services/toast.service';
import { DataFacturaService } from '../../services/data-factura.service';
import { PrintService } from '../../services/print.service';
import { ProcesoFacturasService } from '../../services/proceso-facturas.service';
import { AlertOptions } from '@ionic/core';

@Component({
  selector: 'app-facturas-totales',
  templateUrl: './facturas-totales.page.html',
  styleUrls: ['./facturas-totales.page.scss'],
})
export class FacturasTotalesPage implements OnInit {


  dataTotales: any = [];
  subTotal: any;
  monoDescuento: any;
  subTotalDesc: any;
  monImpuesto: any;
  totalFinal: any;

  subTotalOtraMoneda: any;
  monoDescuentoOtraMoneda: any;
  subTotalDescOtraMoneda: any;
  monImpuestoOtraMoneda: any;
  totalFinalOtraMoneda: any;

  monedaNombre: string;
  monedaSegment: string = 'CRC';
  tarifaDeCambio: number;
  otraMoneda: boolean = false;
  totales: any;

  showSplash: boolean = false;

  selectedPrinter: any = [];

  cliente: any;
  email: string = "";

  user: any;


  constructor(private alertCtrl: AlertController,
    private event: Events,
    public localStorageServ: LocalStorageService,
    private pedidosGetServ: PedidosGetService,
    private toastServ: ToastService,
    public dataFacturaServ: DataFacturaService,
    private printServ: PrintService,
    private procesoFacturasServ: ProcesoFacturasService,
    private modalCtrl: ModalController,
    private navCtrl: NavController) {
    console.log("La factura lista para ser enviada a hacienda, paga y procesada: ", this.dataFacturaServ.dataFactura)
    this.event.subscribe('errorServidor', () => {
      this.showSplash = false;
    })
    this.showSplash = true;


    if (this.localStorageServ.localStorageObj.impresora != undefined) {
      this.selectedPrinter = this.localStorageServ.localStorageObj.impresora;
    }

    this.user = this.localStorageServ.localStorageObj['dataUser'];

    this.pedidosGetServ.selectTotales(this.user.idUser, this.user.nom_localizacion, this.dataFacturaServ.dataFactura.id_facturaPV)
      .then((data: any) => {
        this.showSplash = false;

        this.subTotal = data.SUBTOTAL;
        this.monoDescuento = data.MONDESCUENTO;
        this.subTotalDesc = data.SUBTOTALDESC;
        this.monImpuesto = data.MONIMPUESTO;
        this.totalFinal = data.TOTALFINAL;

        if (typeof data.TOTALFINAL == "string") {
          let stringForFloat = data.TOTALFINAL.replace(",", "");
          var total = parseFloat(stringForFloat);
        }
        let factura = this.dataFacturaServ.dataFactura;
        if (factura.pagoOfflineData.pendiente == undefined) {
          factura.pagoOfflineData.pendiente = total;
        }
        factura.subTotales.total = total;

        this.monedaNombre = factura.id_moneda;
        this.tarifaDeCambio = factura.tipo_cambio;

        if (this.monedaNombre != "CRC") {
          this.otraMoneda = true;
          console.log(data);

          this.subTotalOtraMoneda = (parseInt(data.SUBTOTAL.replace(/\,/g, '')) / this.tarifaDeCambio).toFixed(2);
          this.monoDescuentoOtraMoneda = (parseInt(data.MONDESCUENTO.replace(/\,/g, '')) / this.tarifaDeCambio).toFixed(2);
          this.subTotalDescOtraMoneda = (parseInt(data.SUBTOTALDESC.replace(/\,/g, '')) / this.tarifaDeCambio).toFixed(2);
          this.monImpuestoOtraMoneda = (parseInt(data.MONIMPUESTO.replace(/\,/g, '')) / this.tarifaDeCambio).toFixed(2);
          this.totalFinalOtraMoneda = (parseInt(data.TOTALFINAL.replace(/\,/g, '')) / this.tarifaDeCambio).toFixed(2);
        }

      })
  }

  procesarDocumentoHacienda(tipoDoc) {


    let factura = this.dataFacturaServ.dataFactura;
    let pTipoDocumento = tipoDoc;

    let RecNoDoc = "";
    let RecTipoDoc = "";


    if(factura.emailCliente == ""){
      var pCorreos = this.email;
    }else if (this.email == ""){
      var pCorreos = factura.emailCliente
    }else{
      var pCorreos = factura.emailCliente + "," +  this.email;
    }

    var pNombreReceptor = factura.cliente;
    let UsuarioSucursal = this.user.sucursal;
    let UsuarioTerminal = this.user.nro_terminal;
    let Usuario = this.user.usuario;
    let ClaveFactura = ""
    let ZonaHoraria = "Central America Standard Time";

    this.showSplash = true;
    this.procesoFacturasServ.procesarDocumentoHacienda(
      this.user.idUser,
      factura.id_facturaPV,
      pTipoDocumento,
      RecNoDoc,
      RecTipoDoc,
      pCorreos,
      pNombreReceptor,
      UsuarioSucursal,
      UsuarioTerminal,
      ClaveFactura,
      ZonaHoraria,
      Usuario,
    ).then((data) => {
      console.log(data);
      this.toastServ.toastMensajeDelServidor("TEST MSG: EL ESTADO ES :" + data["Estado"]);
      if (data["Estado"] == "ERROR") {
        this.toastServ.toastMensajeDelServidor(data["Mensaje"], "error");
        this.showSplash = false;
      } else if (data["Estado"] == "ACEPTADO") {
        this.toastServ.toastMensajeDelServidor(data["Mensaje"], "success");
        this.dataFacturaServ.dataFactura.isProcesada = true;
        this.dataFacturaServ.dataFactura.claveDocHacienda = data["Clave"];
        this.guardarEmitir(data["Clave"]);
      } else {
        this.toastServ.toastMensajeDelServidor(data["Mensaje"], "error", 10000);
        this.dataFacturaServ.dataFactura.isProcesada = true;
        this.dataFacturaServ.dataFactura.claveDocHacienda = data["Clave"];
        this.guardarEmitir(data["Clave"]);
      }
    });
  }

  //----------------------------------------------------------------------------------------------------------------


  guardarEmitir(consecutivo?) {
    this.showSplash = true;

    let factura = this.dataFacturaServ.dataFactura;

    let id_cliente_ws = this.user.idUser;
    let id_facturaPV = factura.id_facturaPV;
    let consecutivoMH;
    if (consecutivo != undefined) {
      consecutivoMH = consecutivo;
    } else {
      consecutivoMH = factura.consecutivoMH;
    }
    let id_tipo_identificacion = factura.id_tipo_identificacion;
    let identificacion_cliente = factura.identificacion_cliente;
    let sucursal = this.user.sucursal;
    let nro_terminal = this.user.nro_terminal;
    let nom_localizacion = this.user.nom_localizacion;
    let cliente = factura.cliente;
    let id_condicion_venta = factura.id_condicion_venta;
    let plazo_credito = factura.plazo_credito;
    let id_medio_pago = factura.id_medio_pago;
    let id_moneda = factura.id_moneda;
    let tipo_cambio = factura.tipo_cambio;
    var observaciones = factura.observaciones;
    let isguardado = factura.isguardado;
    let pCodigoAfiliado = "";
    let Usuario = this.user.usuario;

    this.procesoFacturasServ.procesoFacturaFn(
      id_cliente_ws,
      id_facturaPV,
      consecutivoMH,
      id_tipo_identificacion,
      identificacion_cliente,
      sucursal,
      nro_terminal,
      nom_localizacion,
      cliente,
      id_condicion_venta,
      plazo_credito,
      id_medio_pago,
      id_moneda,
      tipo_cambio,
      observaciones,
      isguardado,
      pCodigoAfiliado,
      Usuario,
    ).then((resp) => {
      this.showSplash = false;
      if (resp == 0) {
        if (consecutivo == undefined && this.dataFacturaServ.dataFactura.isProcesadaInterno == false) {
          this.dataFacturaServ.dataFactura.isProcesadaInterno = true;
          this.dataFacturaServ.dataFactura.pagoOfflineData.pendiente = this.dataFacturaServ.dataFactura.subTotales.total;
          this.pago();
        } else if (this.dataFacturaServ.dataFactura.noPaga == true && this.dataFacturaServ.dataFactura.isProcesadaInterno == true) {
          this.dataFacturaServ.dataFactura.pagoOfflineData.pendiente = this.dataFacturaServ.dataFactura.subTotales.total;
          this.pago();
        } else if(consecutivo == undefined) {
          this.pago();
        } else {
          this.showSplash = false;
          console.log("No se va a la pantalla de pago")
        }
      } else if (resp == -1) {
        this.toastServ.toastMensajeDelServidor("Error de comunicación");

      }
    })
  }


  //----------------------------------------------------------------------------------------------------------------

  buscarPrintString(reimpresion) {
    this.showSplash = true;
    if (this.dataFacturaServ.dataFactura.claveDocHacienda == undefined) {
      var clave = "0";
    } else {
      var clave = this.dataFacturaServ.dataFactura.claveDocHacienda;
    }
    this.pedidosGetServ.buscarTextoImpresion(
      this.user.idUser,
      this.dataFacturaServ.dataFactura.id_facturaPV,
      this.user.NombreUsuario,
      -1,
      -1,
      clave,
      reimpresion).then((stringPrint) => {
        this.showSplash = false;
        console.log(stringPrint)

        this.printServ.printFN(this.localStorageServ.localStorageObj.impresora, stringPrint).then(() => {
        }).catch((error) => {
          if (error == "No hay impresora") {
            this.printServ.buscarImpresora("/facturas-totales").then(() => {
            }).catch(() => {
            })
          }
        })
      })
  }

  //----------------------------------------------------------------------------------------------------------------

  async presentModalPage() {

    return this.modalCtrl.create({
      component: PagoPage,
    });
  }

  //----------------------------------------------------------------------------------------------------------------

  async pago() {


    const modal = await this.presentModalPage()
    modal.present();
  }

  //----------------------------------------------------------------------------------------------------------------

  facturaNuevaEliminando() {
    let objAlert = {
      title: "Confirmación",
      subTitle: "Volverá al menu de facturas eliminando la factura actual",
      buttons: [{
        text: "Cancelar",
        role: "cancel"
      }, {
        text: "Confirmar",
        handler: () => {

          this.navCtrl.navigateBack("/menu-crear-factura");
          /*
          this.event.publish("dismissAllViews");
          this.showSplash = true;
          setTimeout(()=>{
            this.showSplash = false;
            this.viewCtrl.dismiss();
          },3000)
          */
        }
      }]
    };
    this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);
  }

  //----------------------------------------------------------------------------------------------------------------


  facturaNueva() {
    let objAlert = {
      title: "Confirmación",
      subTitle: "Volvera al menu sin eliminar la factura actual",
      buttons: [{
        text: "Cancelar",
        role: "cancel"
      }, {
        text: "Confirmar",
        handler: () => {

          this.navCtrl.navigateRoot("/menu");
          /*
          this.event.publish("dismissAllViews");
          this.showSplash = true;
          setTimeout(()=>{
            this.showSplash = false;
            this.viewCtrl.dismiss();
          },3000)
          */
        }
      }]
    };
    this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);
  }



  ngOnInit() {
  }

}
