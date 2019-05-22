import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, AlertController } from '@ionic/angular';

// Serviders
import {ObjUserData, ObjProducto, ObjDatosEmisor, ObjFactura } from "../../../interfaces/interfaces";
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { DataFacturaService } from 'src/app/services/data-factura.service';
import { PrintService } from 'src/app/services/print.service';
import { NavigationParamsService } from 'src/app/services/navigation-params.service';
import { PagoPage } from '../pago/pago.page';
import { AlertOptions } from '@ionic/core';
import { PrintStringProcessService } from 'src/app/services/print-string-process/print-string-process.service';


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

  monedaNombre: string;
  monedaSegment: string = 'CRC';
  tarifaDeCambio: number;
  totales: any;

  showSplash: boolean = false;

  cliente: any;
  email: string = "";
  observaciones: string = "";

  datosEmisor:ObjDatosEmisor;

  hasConsecutive = false;
  constructor(public navCtrl: NavController,
    private modalCtrl: ModalController,
    public localStorageServ: LocalStorageService,
    public dataFacturaServ: DataFacturaService,
    private printServ: PrintService,
    private alertCtrl: AlertController,
    private navParams: NavigationParamsService,
    private printStringProcess: PrintStringProcessService) {
    console.log("La factura lista para ser enviada a hacienda, paga y procesada: ", this.dataFacturaServ.dataFacturaOffline)
    this.datosEmisor = this.localStorageServ.localStorageObj.datosEmisor;
    this.monedaNombre = this.navParams.clientData['moneda'];
    this.tarifaDeCambio = this.navParams.clientData['tarifa'];
    this.cliente = this.navParams.clientData["cliente"];

    let data = this.dataFacturaServ.dataFacturaOffline.subTotales;
    this.subTotal = data.subTotal;
    this.monoDescuento = data.monoDescuento;
    this.subTotalDesc = data.subTotalDesc;
    this.monImpuesto = data.monImpuesto;
    this.totalFinal = data.total;
  }



  //----------------------------------------------------------------------------------------------------------------


  async pago() {
    let factura = this.dataFacturaServ.dataFacturaOffline;
    if (factura.pagoOfflineData.pendiente == undefined) {
      factura.pagoOfflineData.pendiente = parseFloat(factura.subTotales.total);
    }else if(factura.noPaga == true){
      factura.pagoOfflineData.pendiente = parseFloat(factura.subTotales.total);
    }
    const modal = await this.presentPagoPage();
    modal.present();
  }

  //----------------------------------------------------------------------------------------------------------------

  async presentPagoPage() {

    return this.modalCtrl.create({
      component: PagoPage,
    });
  }


  //----------------------------------------------------------------------------------------------------------------


  guardarFactura() {
    let objAlert = {
      title: "Confirmación",
      subTitle: "Esta acción no puede deshacerse y solo se puede guardar una vez",
      buttons: [{
        text: "Cancelar",
        role: "cancel"
      }, {
        text: "Confirmar",
        handler: () => {

          // Se guardarán las facturas con el nombre factura_1
          // Antes checkeo que nro de factura hayç
          var factura = this.dataFacturaServ.dataFacturaOffline;
          if(factura.emailCliente == ""){
            factura.emails = this.email;
          }else if (this.email == ""){
            factura.emails = factura.emailCliente
          }else{
            factura.emails = factura.emailCliente + "," +  this.email;
          }

          let date = new Date();
          let mes = date.getMonth() + 1;
          let dia = date.getDate();
          let año = date.getFullYear();
          let hora = date.getHours();
          let minutos = date.getMinutes();
          let fechahora = dia + "_" + mes + "_" + año + "_" + hora + "_" + minutos;
          let nombre = "factura_" + fechahora;
          this.localStorageServ.insertAndInstantiateValue(nombre, this.dataFacturaServ.dataFacturaOffline);
          factura.isProcesadaInterno = true;
        }
      }]

    };
    this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);
  }

  volver(){
    this.navCtrl.navigateRoot("/menu");
  }
  //----------------------------------------------------------------------------------------------------------------

  facturaNueva() {
    let objAlert = {
      title: "Confirmación",
      subTitle: "¿Está seguro que quiere realizar una factura nueva? Guarde los datos para no perder la factura actual",
      buttons: [{
        text: "Cancelar",
        role: "cancel"
      }, {
        text: "Confirmar",
        handler: () => {
          this.dataFacturaServ.reInitView.bool = true;
          this.dataFacturaServ.reInitView.view = "offline";
          this.navCtrl.navigateBack("/menu-crear-factura").then(()=>{
          });
        }
      }]

    };
    this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);

  }

  //---------------------------------------------------------------------------------------------------------------------
  contadorLogic(){
    let date = new Date();
    let mes = (this.addCerosToNumber(date.getMonth() + 1)).toString();
    let dia = (this.addCerosToNumber(date.getDate())).toString()
    let año = (this.addCerosToNumber(date.getFullYear())).toString()
    let fecha = mes + "/" + dia + "/" + año;
    if(!this.hasConsecutive){
      this.hasConsecutive = true;
      if(this.localStorageServ.localStorageObj["contador"] == undefined){
        this.localStorageServ.insertAndInstantiateValue("contador",{
          "dia": fecha,
          "contador":1
        });
        return;
      }else{
        if(this.localStorageServ.localStorageObj.contador.dia == fecha){
          // Estamos en el mismo dia
          this.localStorageServ.localStorageObj.contador.contador++;

        }else{
          // Otro dia
          this.localStorageServ.localStorageObj.contador.dia = fecha;
          this.localStorageServ.localStorageObj.contador.contador = 1;
        }
      }
    }

  }

  imprimir() {

    this.contadorLogic();

    let printString = this.generarPrintString();
    console.log(printString)
    this.printServ.printFN(this.localStorageServ.localStorageObj.impresora, printString).then(() => {
    })
      .catch((err) => {
        if (err == "No hay impresora") {
          this.printServ.buscarImpresora("/crear-factura-offline/facturas-totales").then(() => {
          })
            .catch(() => {
            })
        }
      })
  }

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds + " " + ampm;
    return strTime;
  }

  addCerosToNumber(number){
    if(number < 10){
      return "0" + number;
    }else{
      return number;
    }
  }

  padLeft(number, length) {

    var my_string = '' + number;
    while (my_string.length < length) {
        my_string = '0' + my_string;
    }

    return my_string;

}

  generarPrintString() {
    console.log(new Date())
    let date = new Date();
    let mes = (this.addCerosToNumber(date.getMonth() + 1)).toString();
    let dia = (this.addCerosToNumber(date.getDate())).toString()
    let año = (this.addCerosToNumber(date.getFullYear())).toString()
    let fecha = mes + "/" + dia + "/" + año;
    let hora = this.formatAMPM(date);

    let user: ObjUserData = this.localStorageServ.localStorageObj.dataUser;
    let sucursal = user.sucursal;
    let usuario = user.usuario;
    let terminal = user.nro_terminal;

    let consecutivo = año + mes + dia + "-" +this.padLeft(this.localStorageServ.localStorageObj.contador.contador,4);
    let nombreCliente = this.dataFacturaServ.dataFacturaOffline.cliente;
    // Todas las lineas deben tener 40 caracteres.
    let direccionSplit = this.datosEmisor.direccion.split(",");
    let direccion = direccionSplit[1] + "," + direccionSplit[2];


    let printString1 = "        Comprobante provisional        \n" + this.printStringProcess.centeredString(this.datosEmisor.nombre_comercial_cliente)+"\n"
      +  this.printStringProcess.centeredString(this.datosEmisor.nombre_cliente)+"\n    Ced: "+ this.datosEmisor.identificacion_cliente+" | Tel: "+this.datosEmisor.telefono+"\n"
      + this.printStringProcess.centeredString(this.datosEmisor.correo)
      + "\n" + this.printStringProcess.centeredString(direccion)
      + "\n" + this.printStringProcess.centeredString(this.datosEmisor.sennas)
      + "\n\n             CONTINGENCIA\n\n"
      + "Consecutivo:" + this.printStringProcess.cutString(consecutivo, 28, "left", true) + "\n"
      + "Fecha " + fecha + this.printStringProcess.cutString(hora, 40 - "Fecha ".length - fecha.length, "left") + "\n"
      + "No CPU:MOVIL-854FD-3977\nSucursal:"
      + sucursal + "\nTerminal: "
      + terminal + "\nAtendido por: "
      + usuario + "\nCliente: "
      + nombreCliente + "\n\nDESCRIPCIÓN      CANTI             TOTAL"
      + "\n\n----------------------------------------\n\n";

    let productos = this.dataFacturaServ.dataFacturaOffline.arrayProductos;
    console.log(productos);
    let stringProductos = "";

    for (let i = 0; i < productos.length; i++) {
      let producto: ObjProducto = productos[i];
      let linea = this.printStringProcess.generateLineProduct(producto.nombre_producto, producto.cantidad, producto.subtotales.total_linea);
      stringProductos = stringProductos + linea;
    }


    let factura = this.dataFacturaServ.dataFacturaOffline;
    let subtotal = factura.subTotales.subTotal;
    let impuestos = factura.subTotales.monImpuesto;
    let descuento = factura.subTotales.monoDescuento;
    let total = factura.subTotales.total;
    let condicionVenta = factura.facturaOfflineVisualize[0].valor;
    let medioDePago = factura.facturaOfflineVisualize[1].valor;
    let pendiente = factura.pagoOfflineData.pendiente;
    let montoAbonado = factura.pagoOfflineData.montoAbonado;
    let vuelto = factura.pagoOfflineData.vuelto;
    let totalAbonado = Math.round((total - pendiente)*100)/100;

    var printString3 ="\n----------------------------------------\n"
    + "Monto Abonado" + this.printStringProcess.cutString(montoAbonado, 40 - 13, "left") + "\n"
    + "Total Abonado" + this.printStringProcess.cutString(totalAbonado, 40 - 13, "left") + "\n"
    + "Monto Pendiente" + this.printStringProcess.cutString(pendiente, 40 - 15, "left") + "\n"

    if(pendiente == 0){
      printString3 = "";
    }

    let printString2 = "\n----------------------------------------\n"
      + "SubTotal" + this.printStringProcess.cutString(subtotal, 32, "left") + "\n"
      + "Imp." + this.printStringProcess.cutString(impuestos, 36, "left") + "\n"
      + "Desc." + this.printStringProcess.cutString(descuento, 35, "left") + "\n"
      + "TOTAL" + this.printStringProcess.cutString(total, 35, "left") + "\n"
      + "\n----------------------------------------\n"
      + "Paga con" + this.printStringProcess.cutString(montoAbonado, 32, "left") + "\n"
      + "Su cambio" + this.printStringProcess.cutString(vuelto, 31, "left") + "\n"
      + printString3
      + "\n----------------------------------------\n"
      + "Factura de: " + condicionVenta + "\n"
      + "Medio de Pago: " + medioDePago + "\n"
      + "\n----------------------------------------\n"
      + "\n          Gracias por su compra\n\n  "
      + "  Autorizado mediante resolucion "
      + "\n  Nº DGT-R-48-2016 del 07 de octubre "
      + "\n        de 2016 de la DGTD v.4.2\n\n"
      + "Tiquete emitido utilizando Wolksoftware"
      + "\n           www.wolksoftcr.com\n\n     Este comprobante no puede ser      \n    utilizado para fines tributarios    \n   por lo cual, no se permitirá su uso   \n   para respaldo de créditos o gastos  \n\n\n\n\n\n\n";


    let printString = printString1 + stringProductos + printString2;
    return printString;

  }






  ngOnInit() {

  }

}
