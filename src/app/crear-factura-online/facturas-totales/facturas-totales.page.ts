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
import { ObjUserData } from 'src/interfaces/interfaces';

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

  user: ObjUserData;

  usuarioExceptionDifferentTerminalAndSucursal = false;
  constructor(
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

    this.getSubtotales();

  }

  dismiss(){
    this.navCtrl.navigateBack("/detalles-productos")
  }

  examineUserStatusAndReturn(returnvar){

    this.user = this.localStorageServ.localStorageObj['dataUser'];

    var userReturnValues;
    if(this.dataFacturaServ.dataFactura.usuarioExcepcionBool){

      let userA:ObjUserData = this.localStorageServ.localStorageObj['dataUser'];
      let userB = this.dataFacturaServ.dataFactura.usuarioExcepcion;
      userReturnValues = userB;

      let arraySucursalTerminalUserA = [userA.nro_terminal, userA.sucursal];

      if(!arraySucursalTerminalUserA.includes(userB.sucursal)
      || !arraySucursalTerminalUserA.includes(userB.nro_terminal)
      && !this.dataFacturaServ.dataFactura.isFacturaAbierta){
        this.usuarioExceptionDifferentTerminalAndSucursal = true;
      }

    }
    else
    {
      userReturnValues = this.user;
    }

    let objReturn = {
      "localizacion" : userReturnValues.nom_localizacion,
      "sucursal" : userReturnValues.sucursal,
      "terminal" : userReturnValues.nro_terminal
    }

    console.log(objReturn[returnvar]);

    return objReturn[returnvar];
  }

  getSubtotales(){

    let localizacion = this.examineUserStatusAndReturn("localizacion");
    this.pedidosGetServ.selectTotales(this.user.idUser, localizacion, this.dataFacturaServ.dataFactura.id_facturaPV)
      .then((data: any) => {
        console.log(data)
        this.showSplash = false;

        this.subTotal = data.SUBTOTAL;
        this.monoDescuento = data.MONDESCUENTO;
        this.subTotalDesc = data.SUBTOTALDESC;
        this.monImpuesto = data.MONIMPUESTO;
        this.totalFinal = data.TOTALFINAL;

        if (typeof data.TOTALFINAL == "string") {
          let stringForFloat = data.TOTALFINAL.replace(/,/g, "");
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
      if (data["Estado"] == "ERROR") {
        this.toastServ.toastMensajeDelServidor(data["Mensaje"], "error");
        this.showSplash = false;
      } else if (data["Estado"] == "ACEPTADO") {
        this.toastServ.toastMensajeDelServidor(data["Mensaje"], "success");
        this.dataFacturaServ.dataFactura.isProcesada = true;
        this.dataFacturaServ.dataFactura.claveDocHacienda = data["Clave"];
        this.guardarEmitir();
      } else {
        this.toastServ.toastMensajeDelServidor(data["Mensaje"], "error", 10000);
        this.dataFacturaServ.dataFactura.isProcesada = true;
        this.dataFacturaServ.dataFactura.claveDocHacienda = data["Clave"];
        this.guardarEmitir();
      }
    });
  }

  //----------------------------------------------------------------------------------------------------------------


  guardarEmitir(html?) {
    this.showSplash = true;

    let factura = this.dataFacturaServ.dataFactura;

    let id_cliente_ws = this.user.idUser;
    let id_facturaPV = factura.id_facturaPV;
    let claveDocHacienda = factura.claveDocHacienda;
    let id_tipo_identificacion = factura.id_tipo_identificacion;
    let identificacion_cliente = factura.identificacion_cliente;
    let sucursal = this.examineUserStatusAndReturn("sucursal");
    let nro_terminal = this.examineUserStatusAndReturn("terminal");
    let nom_localizacion = this.examineUserStatusAndReturn("localizacion");
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
      claveDocHacienda,
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
      console.log(resp)
      this.showSplash = false;
      if (resp == 0) {
        // SI NUNCA SE HABIA GUARDADO Y VIENE DESDE EL BOTON
        if (html != undefined && this.dataFacturaServ.dataFactura.isProcesadaInterno == false) {
          this.dataFacturaServ.dataFactura.isProcesadaInterno = true;
          this.dataFacturaServ.dataFactura.pagoOfflineData.pendiente = this.dataFacturaServ.dataFactura.subTotales.total;
          this.pago();
          // SE GUARDO PERO NO SE PAGO
        } else if (this.dataFacturaServ.dataFactura.noPaga == true && this.dataFacturaServ.dataFactura.isProcesadaInterno == true) {
          this.dataFacturaServ.dataFactura.pagoOfflineData.pendiente = this.dataFacturaServ.dataFactura.subTotales.total;
          this.pago();
        } else if(html != undefined) {
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

    console.log("MODALL")
    const modal = await this.presentModalPage()
    modal.present();
  }

  //----------------------------------------------------------------------------------------------------------------

  volver(textMsg, reInit = false) {
    let objAlert = {
      title: "Confirmación",
      subTitle: textMsg,
      buttons: [{
        text: "Cancelar",
        role: "cancel"
      }, {
        text: "Confirmar",
        handler: () => {

          if(reInit){
            this.dataFacturaServ.reInitView.bool = true;
            this.dataFacturaServ.reInitView.view = "online";
          }
          this.dataFacturaServ.dataFacturaTemporalCopy = JSON.parse(JSON.stringify(this.dataFacturaServ.dataFactura));

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



  ngOnInit() {

  }

  ngOnDestroy(){
    this.dataFacturaServ.facturasTotalesType = "";
  }

}
