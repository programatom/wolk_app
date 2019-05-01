import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ObjUserData } from "../../../interfaces/interfaces"

import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { PrintService } from 'src/app/services/print.service';
import { NotasDeCreditoService } from 'src/app/services/notas-de-credito/notas-de-credito.service';
import { PedidosGetService } from 'src/app/services/pedidos-get.service';
import { FacturaLogicService } from 'src/app/services/factura-logic/factura-logic.service';

@Component({
  selector: 'app-factura-visual-hacienda-nc',
  templateUrl: './factura-visual-hacienda-nc.page.html',
  styleUrls: ['./factura-visual-hacienda-nc.page.scss'],
})
export class FacturaVisualHaciendaNCPage implements OnInit {


    fecha: string;
    factura: any;
    key: string;
    productos: any;
    showSplash: boolean = false;

    subTotal: any;
    monoDescuento: any;
    subTotalDesc: any;
    monImpuesto: any;
    totalFinal: any;

    selectedPrinter;
    user:ObjUserData;

    /*
    ,{
      text:"Parcial",
      handler:()=>{
        this.NCLogic.facturaElegida = new Object ();
        this.NCLogic.facturaElegida = factura;
        this.NCLogic.inicializarFacturaElegida();
        this.navCtrl.navigateForward("/parcial-page");
      }
    },{
      text:"Anular factura",
      handler:(()=>{
        this.NCLogic.facturaElegida = new Object ();
        this.NCLogic.facturaElegida = factura;
        this.NCLogic.inicializarFacturaElegida();
        this.navCtrl.navigateForward("/anular-factura");
      })

    */

    constructor(public navCtrl: NavController,
      public localStorageServ: LocalStorageService,
      private toastServ: ToastService,
      private printServ: PrintService,
      private NCLogic: NotasDeCreditoService,
      private pedidosGetServ: PedidosGetService,
      private facturaLogic: FacturaLogicService) {

      this.user = this.localStorageServ.localStorageObj['dataUser'];
      this.factura = this.NCLogic.facturaElegida

      this.fecha = this.factura["Fechas Creación"];
      this.showSplash = true;
      this.NCLogic.getTotalesAndProductosFromFactura(
        this.factura["N° Factura"]
      ).then((data:any)=>{
        if (data.subtotales.SUBTOTAL != null) {
          this.subTotal = data.subtotales.SUBTOTAL;
          this.monoDescuento = data.subtotales.MONDESCUENTO;
          this.subTotalDesc = data.subtotales.SUBTOTALDESC;
          this.monImpuesto = data.subtotales.MONIMPUESTO;
          this.totalFinal = data.subtotales.TOTALFINAL;
        }

        this.productos = data.productos
        this.showSplash = false;

      })

    }

    irAAnularPage(){
      this.NCLogic.facturaElegida = this.factura;
      this.NCLogic.backURL = "/factura-visual-hacienda-nc";
      this.navCtrl.navigateForward("/anular-factura");
    }

    irAParcialPage(){
      this.NCLogic.facturaElegida = this.factura;
      this.NCLogic.backURL = "/factura-visual-hacienda-nc";
      this.navCtrl.navigateForward("/parcial-page");
    }

    eventFN(mensaje) {
      this.toastServ.toastMensajeDelServidor(mensaje, "error" , 10000);
      this.showSplash = false;
      return;
    }

    verMasProducto(i) {
      if (this.productos[i]['verMas'] == true) {
        this.productos[i]['icono'] = 'add-circle';
        this.productos[i]['verMas'] = false;
      } else {
        this.productos[i]['icono'] = 'remove-circle';
        this.productos[i]['verMas'] = true;
      }
    }

    procesar(tipoDoc) {
      this.showSplash = true;
      this.NCLogic.searchClienteAndInsertDisAndEmOnFactura(this.factura["N° Identificación"],this.factura).then(()=>{
        console.log(this.factura);
        this.facturaLogic.procesarDocumentoHaciendaYGuardar(
          this.factura["N° Factura"],
          this.factura.correoCliente,
          this.factura["Clientes"],
          tipoDoc,
          {
            "id_tipo_identificacion": this.factura["Tipo Identificacíon"],
            "identificacion_cliente": this.factura["N° Identificación"],
            "id_medio_pago": this.factura["Medios de Pago"],// CHECKEAR TEMA ID
            "id_moneda": this.factura["Monedas"],// CHECKEAR TEMA ID
            "isguardado": "S",
            "observaciones": this.factura["Observaciones"],
            "tipo_cambio": this.factura["Tipo de Cambio"],
            "cliente":this.factura["Clientes"],
            "id_condicion_venta": this.factura["Condicion Venta"], // CHECKEAR TEMA ID
            "plazo_credito": this.factura.plazo_credito,

          }
        ).then((data:any)=>{
            console.log(data);
            this.showSplash = false;
            if(data.isProcesada){
              this.factura["Consecutivo Hacienda"] = data.clave;
            }else{
            }
        })

      })
    }


    imprimir(reimpresion) {
      this.showSplash = true;
      this.pedidosGetServ.buscarTextoImpresion(
        this.user.idUser,
        this.factura["N° Factura"],
        this.user.NombreUsuario,
        -1,
        -1,
        this.factura["Consecutivo Hacienda"],
        reimpresion
      ).then((printString)=>{
        this.showSplash = false;
        console.log(printString)
        this.printService(printString);
      })
    }

    printService(printString) {

      this.printServ.printFN(this.localStorageServ.localStorageObj.impresora, printString).then(() => {
      })
        .catch((err) => {
          if (err == "No hay impresora") {
            this.printServ.buscarImpresora("/factura-visual-hacienda-nc").then(() => {
            })
              .catch(() => {
              })
          }
        })
    }

    ngOnInit() {
    }

}
