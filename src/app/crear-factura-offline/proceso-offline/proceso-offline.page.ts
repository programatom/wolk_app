import { Component, OnInit } from '@angular/core';
import { NavController, Events } from '@ionic/angular';
import { ObjFactura, ObjProducto } from "../../../interfaces/interfaces"

import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProcesarFacturaOfflineService } from 'src/app/services/procesar-factura-offline.service';
import { ToastService } from 'src/app/services/toast.service';
import { PrintService } from 'src/app/services/print.service';
import { NavigationParamsService } from 'src/app/services/navigation-params.service';

@Component({
  selector: 'app-proceso-offline',
  templateUrl: './proceso-offline.page.html',
  styleUrls: ['./proceso-offline.page.scss'],
})
export class ProcesoOfflinePage implements OnInit {


  fecha: string;
  factura: ObjFactura;
  key: string;
  productos: any;
  showSplash: boolean = false;

  subTotal: any;
  monoDescuento: any;
  subTotalDesc: any;
  monImpuesto: any;
  totalFinal: any;

  selectedPrinter;

  constructor(public navCtrl: NavController, public navParams: NavigationParamsService,
    public localStorageServ: LocalStorageService,
    private procesarFacturaOfflineServ: ProcesarFacturaOfflineService,
    private event: Events,
    private toastServ: ToastService,
    private printServ: PrintService) {

    if (this.localStorageServ.localStorageObj.impresora != undefined) {
      this.selectedPrinter = this.localStorageServ.localStorageObj.impresora;
    } else {
      this.selectedPrinter = new Object();
      this.selectedPrinter.name = "No ha seleccionado una impresora";
    }

    this.fecha = this.navParams.procesoOfflineData.fecha
    this.factura = this.navParams.procesoOfflineData.factura
    this.key = this.navParams.procesoOfflineData.key

    let data = this.factura.subTotales;
    this.subTotal = data.subTotal;
    this.monoDescuento = data.monoDescuento;
    this.subTotalDesc = data.subTotalDesc;
    this.monImpuesto = data.monImpuesto;
    this.totalFinal = data.total;

    this.productos = this.factura.arrayProductos;

    this.event.subscribe("offlineProductFail", (producto: ObjProducto) => {
      this.eventFN("Ocurrió un error con el producto: " + producto.nombre_producto + " checkee el estado del producto e inténtelo nuevamente");
    })
    this.event.subscribe("offlineProcesoFacturaFail", () => {
      this.eventFN("Ocurrió un error en el envío a hacienda.. inténtelo nuevamente.");
    });

    this.event.subscribe("offlineProcesoFacturaSUCCESS", (mensaje) => {
      this.toastServ.toastMensajeDelServidor(mensaje, "success" , 10000);

    });

    this.event.subscribe("offlineProcesoHaciendaOTHER", (mensaje) => {
      this.toastServ.toastMensajeDelServidor(mensaje, "error" , 10000);
    });

    this.event.subscribe("end-loading", (mensaje) => {
      this.showSplash = false;
    });

  }

  eventFN(mensaje) {
    this.toastServ.toastMensajeDelServidor(mensaje, "error" , 10000);
    this.showSplash = false;
    return;
  }

  verMasProducto(i) {
    if (this.productos[i].html['verMas'] == true) {
      this.productos[i].html['icono'] = 'add-circle';
      this.productos[i].html['verMas'] = false;
    } else {
      this.productos[i].html['icono'] = 'remove-circle';
      this.productos[i].html['verMas'] = true;
    }
  }

  procesar(type) {
    this.factura.tiquet = type;
    this.showSplash = true;
    if (this.factura.exceptionHacienda != "ERROR") {
      this.procesarFacturaOfflineServ.getFacturaID(this.factura, this.key);
    } else {
      this.procesarFacturaOfflineServ.procesarDocumentoHacienda(type, this.factura);
    }
  }


  imprimir(reimpresion) {
    this.showSplash = true;
    this.procesarFacturaOfflineServ.buscarPrintString(reimpresion, this.factura, this.key).then(()=>{
      this.showSplash = false;
      this.printService(this.factura.impresionString);
    });
  }

  printService(printString) {

    this.printServ.printFN(this.localStorageServ.localStorageObj.impresora, printString).then(() => {
    })
      .catch((err) => {
        if (err == "No hay impresora") {
          this.printServ.buscarImpresora("/crear-factura-offline/proceso-offline").then(() => {
          })
            .catch(() => {
            })
        }
      })
  }

  ngOnInit() {
  }

}
