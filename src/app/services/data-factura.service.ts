import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjFactura, ObjUserData } from "../../interfaces/interfaces";

//Service
import { PedidosGetService } from './pedidos-get.service';
import { LocalStorageService } from './local-storage.service';
import { ToastService } from './toast.service';



@Injectable({
  providedIn: 'root'
})
export class DataFacturaService {

  dataFactura = {} as ObjFactura;
  dataFacturaOffline = new Object() as ObjFactura;
  dataFacturaTemporalCopy = new Object() as ObjFactura;

  arrayProductos = [];
  ObjUserData = new Object() as ObjUserData;
  productosCXC = [];
  facturasTotalesType = "normal";

  reInitView = {
    "bool": false,
    "view":"online"
  }
  constructor(public http: HttpClient,
    private pedidosGetServ: PedidosGetService,
    private localStorageServ: LocalStorageService,
    private toastServ: ToastService) {
  }

  inicializarDataOnline(){
    this.dataFactura = new Object() as ObjFactura;
    this.arrayProductos = [];
    this.dataFactura.pagoOfflineData = new Object() as{
      pendiente:number
      formaDePago:string
    }
    this.dataFactura.isProcesadaInterno = false;
    this.dataFactura.noPaga = true;
    this.dataFactura.isProcesada = false;
    this.dataFactura.impresionString = "";
    this.dataFactura.observaciones = "";
    this.dataFactura.emailCliente = "";
    this.dataFactura.reimpresionString = "";
    this.dataFactura.isOffline = false;
    this.dataFactura.isFacturaAbierta = false;

    this.dataFactura.descuentoFijo = 0;
    this.dataFactura.consecutivoMH = "0";
    this.dataFactura.subTotales = {
      "subTotal": 0,
      "monoDescuento": 0,
      "subTotalDesc": 0,
      "monImpuesto": 0,
      "total": 0
    };
    this.dataFactura.pagoOfflineData.pendiente = undefined;
    this.dataFactura.pagoOfflineData.formaDePago = "Caja / Efectivo";
    this.dataFactura.subTotales.subTotal = "";
    this.dataFactura.subTotales.monoDescuento = "";
    this.dataFactura.subTotales.subTotalDesc = "";
    this.dataFactura.subTotales.monImpuesto = "";
    this.dataFactura.subTotales.total = "";
    this.dataFactura.usuarioExcepcionBool = false;
    this.dataFactura.usuarioExcepcion = new Object () as {
      idUser: any
      nom_localizacion:any
      nro_terminal:any
      sucursal:string
      usuario:string
    }
    return;
  }

  inicializarOfflineData() {

    return new Promise((resolve) => {
      this.plazos();
      this.ObjUserData = this.localStorageServ.localStorageObj["dataUser"];
      this.toastServ.toastMensajeDelServidor("Cargando datos para el modo offline, puede tardar unos minutos")
      this.mediosDePago().then(() => {
        this.condicionesDeVenta().then(() => {
          this.productos().then(() => {
            this.clientes().then(() => {
              this.formasDePagoActivas().then(() => {
                this.obtenerDatosEmisor().then(()=>{
                  this.localStorageServ.insertAndInstantiateValue("offlineOK" , true);
                  resolve("Se inicializaron todos los productos");
                })
              })
            })
          })
        })
      })
    })
  }

  formasDePagoActivas() {
    return new Promise((resolve) => {
      this.pedidosGetServ.selectCuentasFormasdePagoActivas(this.ObjUserData.idUser).then((formasDePago: any) => {
        formasDePago.splice(0, 1);
        this.localStorageServ.insertAndInstantiateValue("formasDePago", formasDePago);
        resolve();
      });
    });
  }

  plazos() {
    let plazos = new Array();
    let cantidadDeMeses = 48;
    for (let i = 1; i <= cantidadDeMeses; i++) {
      let sustantivo;
      if (i == 1) {
        sustantivo = 'Mes';
      } else {
        sustantivo = 'Meses'
      }
      plazos.push({ 'nroMeses': i + ' ' + sustantivo })
    }
    this.localStorageServ.insertAndInstantiateValue("plazos", plazos);
    return;
  }

  mediosDePago() {
    return new Promise((resolve) => {
      this.pedidosGetServ.selectMediosPagos().then((mediosDePago: any) => {
        mediosDePago.splice(0, 1);
        mediosDePago[mediosDePago.length - 1].medio_pago = 'Otro';
        this.localStorageServ.insertAndInstantiateValue("mediosDePago", mediosDePago);
        resolve();
      });
    });
  }

  condicionesDeVenta() {
    return new Promise((resolve) => {
      this.pedidosGetServ.selectCondicionVenta().then((condicionesVenta: any) => {
        condicionesVenta.splice(0, 1);
        this.localStorageServ.insertAndInstantiateValue("condicionesVenta", condicionesVenta);
        resolve();
      });
    })
  }

  obtenerDatosEmisor() {
    return new Promise((resolve) => {
      this.pedidosGetServ.obtenerDatosEmisor(this.ObjUserData.idUser).then((datosEmisor: any) => {
        console.log(datosEmisor)
        this.localStorageServ.insertAndInstantiateValue("datosEmisor", datosEmisor[0]);
        resolve();
      });
    })
  }

  productos() {
    return new Promise((resolve) => {
      this.pedidosGetServ.selectProductosFull(this.ObjUserData.idUser, this.ObjUserData.nom_localizacion).then((productosArray: any) => {
        this.localStorageServ.insertAndInstantiateValue("productos", productosArray);
        resolve();
      });
    })
  }

  clientes() {
    return new Promise((resolve) => {
      this.pedidosGetServ.buscarCliente(this.ObjUserData.idUser, "").then((clientesArray: any) => {
        this.localStorageServ.insertAndInstantiateValue("clientes", clientesArray);
        resolve();
      });
    })
  }

}
