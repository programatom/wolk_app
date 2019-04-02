import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ObjFactura, ObjProducto } from "../../interfaces/interfaces";
import { Events } from '@ionic/angular';

// Service
import { ProcesoFacturasService } from './proceso-facturas.service';
import { LocalStorageService } from './local-storage.service';
import { PedidosPostService } from './pedidos-post.service';
import { PedidosGetService } from './pedidos-get.service';
import { ToastService } from './toast.service';


@Injectable({
  providedIn: 'root'
})
export class ProcesarFacturaOfflineService {


  asyncProductIterator: number = 0;
  key: string;

  constructor(public http: HttpClient,
    private procesoFacturasServ: ProcesoFacturasService,
    private localStorageServ: LocalStorageService,
    private pedidosPostServ: PedidosPostService,
    private pedidosGetServ: PedidosGetService,
    private toastServ: ToastService,
    private events: Events) {
  }

  getFacturaID(factura: ObjFactura, key) {
    this.asyncProductIterator = 0 ;
    this.key = key;
    this.toastServ.toastMensajeDelServidor("Buscando id de la factura...");
    if(factura.id_facturaPV == undefined){
      this.procesoFacturasServ.procesoFacturaFn(this.localStorageServ.localStorageObj['dataUser'].idUser,
      0,
      0,
      "",
      "",
      this.localStorageServ.localStorageObj['dataUser'].sucursal,
      this.localStorageServ.localStorageObj['dataUser'].nro_terminal,
      this.localStorageServ.localStorageObj['dataUser'].nom_localizacion,
      "",
      "",
      0,
      "",
      "",
      0,
      "",
      "N",
      "",
      this.localStorageServ.localStorageObj['dataUser'].usuario).then((idFactura: any) => {
        factura.id_facturaPV = idFactura;
        factura.isguardado = "S";
        this.toastServ.toastMensajeDelServidor("Ingresando productos..");
        this.iterarProductos(factura);
      })
    }else{
      this.toastServ.toastMensajeDelServidor("Ingresando productos..");
      this.iterarProductos(factura);
    }
  }

  iterarProductos(factura: ObjFactura) {

    let productos = factura.arrayProductos;
    let productosLength = productos.length;

    this.agregarProducto(factura, productos[this.asyncProductIterator], productosLength);
  }



  agregarProducto(factura: ObjFactura, producto: ObjProducto, iteraciones) {


    if (this.asyncProductIterator == iteraciones) {
      this.toastServ.toastMensajeDelServidor("Enviando factura a hacienda antes del pago...");
      this.guardarEmitir(factura);
      return;
    }

    // EXONERA IMPUESTOS EN "1"
    console.log("Se envía el producto: ", producto)

    this.pedidosPostServ.agregarProducto(
      this.localStorageServ.localStorageObj['dataUser'].idUser,
      factura.id_facturaPV,
      producto.codigo_producto,
      this.localStorageServ.localStorageObj['dataUser'].nom_localizacion,
      producto.cantidad,
      producto.subtotales.descuento_para_procesar,
      producto.precio_venta_sin_imp,
      producto.isExonerado,
      this.localStorageServ.localStorageObj['dataUser'].usuario
    ).then((resp) => {
      if (resp['result'] == "EXITO") {
        this.pedidosGetServ.selectTotales(this.localStorageServ.localStorageObj['dataUser'].idUser, this.localStorageServ.localStorageObj['dataUser'].nom_localizacion, factura.id_facturaPV).then((data: any) => {
          if (data.SUBTOTAL != null) {
          }
          this.pedidosGetServ.selectTotalesUbicaGrid(this.localStorageServ.localStorageObj['dataUser'].idUser, this.localStorageServ.localStorageObj['dataUser'].nom_localizacion, factura.id_facturaPV).then((totalesLineas: any) => {
            this.asyncProductIterator = this.asyncProductIterator + 1;
            this.iterarProductos(factura);
          })
        });
      } else {

        // Debería volver atras, eliminando todos los productos porque en la proxima iteracion va
        // Meterlos devuelta

        this.events.publish("offlineProductFail", producto);
      }
    })
  }

  guardarEmitir(factura: ObjFactura, consecutivo?) {

    let user = this.localStorageServ.localStorageObj['dataUser'];
    let id_cliente_ws = user.idUser;
    let id_facturaPV = factura.id_facturaPV;

    // CLAVE HACIENDA QUE SE ENVÍA EN EL ÚLTIMO PASO

    let consecutivoMH;
    if (consecutivo == undefined) {
      consecutivoMH = 0;
    } else {
      consecutivoMH = consecutivo;
    }
    console.log(consecutivoMH)

    let id_tipo_identificacion = factura.id_tipo_identificacion;
    let identificacion_cliente = factura.identificacion_cliente;
    let sucursal = user.sucursal;
    let nro_terminal = user.nro_terminal;
    let nom_localizacion = user.nom_localizacion;
    let cliente = factura.cliente;
    let id_condicion_venta = factura.id_condicion_venta;
    let plazo_credito = factura.plazo_credito;
    let id_medio_pago = factura.id_medio_pago;
    let id_moneda = factura.id_moneda;
    let tipo_cambio = factura.tipo_cambio;
    let observaciones = factura.observaciones;

    let isguardado = factura.isguardado;
    let pCodigoAfiliado = "";
    let Usuario = user.usuario;

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
      if (resp == 0) {
        if (consecutivo == undefined) {
          this.toastServ.toastMensajeDelServidor("Realizando el pago...");
          this.procesoPagoFacturaCliente(factura, factura.pagoOfflineData.pendiente, factura.subTotales.total - factura.pagoOfflineData.pendiente);
        } else {
          console.log("PROCESO FINALIZADO");
          this.events.publish("end-loading");
        }
      } else if (resp == -1) {
        this.events.publish("offlineProcesoFacturaFail");
      }
    })
  }
  procesoPagoFacturaCliente(factura: ObjFactura, total_pendiente, total_ultimo_abonado) {

    let user = this.localStorageServ.localStorageObj['dataUser'];

    let cliente = factura.cliente;

    let id_cliente_ws = user.idUser;
    let id_facturaPV = factura.id_facturaPV;
    let id_tipo_identificacion = user.msg;
    let identificacion_cliente = factura.identificacion_cliente;
    let sucursal = user.sucursal;
    let nro_terminal = user.nro_terminal;
    let nom_localizacion = user.nom_localizacion;
    let nom_formaPago = factura.pagoOfflineData.formaDePago;
    let id_condicion_venta = factura.id_condicion_venta;
    let plazo_credito = factura.plazo_credito;
    let id_moneda = factura.id_moneda;
    let tipo_cambio = factura.tipo_cambio;
    let total_comprobante = factura.subTotales.total;
    let observaciones = factura.observaciones;
    let ZonaHoraria = "Central America Standard Time";
    let Usuario = user.usuario;


    this.procesoFacturasServ.procesoPagoFacturaCliente(id_cliente_ws,
      id_facturaPV,
      id_tipo_identificacion,
      identificacion_cliente,
      sucursal,
      nro_terminal,
      nom_localizacion,
      nom_formaPago,
      cliente,
      id_condicion_venta,
      plazo_credito,
      id_moneda,
      tipo_cambio,
      total_comprobante,
      total_pendiente,
      total_ultimo_abonado,
      observaciones,
      ZonaHoraria,
      Usuario,
    ).then((resp) => {
      if (factura.tiquet) {
        this.toastServ.toastMensajeDelServidor("Procesando el ticket en hacienda...");
        this.procesarDocumentoHacienda('04', factura);
      } else {
        this.toastServ.toastMensajeDelServidor("Procesando la factura electronica en hacienda...");
        this.procesarDocumentoHacienda('01', factura);
      }
    })
  }

  procesarDocumentoHacienda(tipoDoc, factura: ObjFactura, procesadaRetry?) {

    let pTipoDocumento = tipoDoc;

    let RecNoDoc = "";
    let RecTipoDoc = "";
    let pCorreos = factura.emails; //cliente.correo
    var pNombreReceptor = factura.cliente;

    let UsuarioSucursal = this.localStorageServ.localStorageObj['dataUser'].sucursal;
    let UsuarioTerminal = this.localStorageServ.localStorageObj['dataUser'].nro_terminal;
    let ClaveFactura = ""
    let ZonaHoraria = "Central America Standard Time";
    let Usuario = this.localStorageServ.localStorageObj['dataUser'].usuario;


    this.procesoFacturasServ.procesarDocumentoHacienda(
      this.localStorageServ.localStorageObj['dataUser'].idUser,
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
      if (data["Estado"] == "ACEPTADO") {

        factura.isProcesada = true;
        factura.claveDocHacienda = data["Clave"];
        factura.exceptionHacienda = data["Estado"];

        this.guardar(this.key, factura);
        this.events.publish("offlineProcesoFacturaSUCCESS", data["Mensaje"]);
        this.guardarEmitir(factura, data["Clave"]);
      } else if (data["Estado"] != "ERROR"){
        factura.claveDocHacienda = data["Clave"];
        factura.exceptionHacienda = data["Estado"];
        factura.isProcesada = true;
        this.guardar(this.key , factura);
        this.events.publish("offlineProcesoHaciendaOTHER" , data["Mensaje"]);
        this.guardarEmitir(factura, data["Clave"]);
      }else{
        factura.exceptionHacienda = data["Estado"];
        this.events.publish("offlineProcesoHaciendaOTHER" , data["Mensaje"]);
        this.events.publish("end-loading");
        this.guardar(this.key , factura);
      }
    });
  }


  buscarPrintString(reimpresion, factura: ObjFactura, key?) {

    return new Promise((resolve)=>{
      this.pedidosGetServ.buscarTextoImpresion(
        this.localStorageServ.localStorageObj['dataUser'].idUser,
        factura.id_facturaPV,
        this.localStorageServ.localStorageObj['dataUser'].NombreUsuario,
        -1,
        -1,
        factura.claveDocHacienda,
        reimpresion).then((stringPrint: string) => {
          console.log(stringPrint)
          factura.impresionString = stringPrint;
          resolve();
          console.log(stringPrint);
        })
    })

  }


  guardar(key, factura){

    this.localStorageServ.insertAndInstantiateValue(key, factura);
    return;

  }
}
