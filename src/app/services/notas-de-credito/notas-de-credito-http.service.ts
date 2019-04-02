import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { URL_SERVICES } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class NotasDeCreditoHttpService {

  constructor(private http: HttpService) { }

  buscarFacturas(data: {
    id_cliente_ws: number
    Fecha_ini: string
    Fecha_fin: string
    Moneda: string
    FiltroCodiPro: string
    CondicionVenta: string
    UsuarioUbicacion: string
  }) {
    let url = URL_SERVICES + "SelecthistoricoVentasXLocalizacion?id_cliente_ws=" + data["id_cliente_ws"] + "&Fecha_ini=" + data["Fecha_ini"] + "&Fecha_fin=" + data["Fecha_fin"] + "&Moneda=" + data["Moneda"] + "&CondicionVenta=" + data["CondicionVenta"] + "&UsuarioUbicacion=" + data["UsuarioUbicacion"] + "&FiltroCodiPro=" + data["FiltroCodiPro"];
    return this.http.httpGet(url);
  }

  procesoNCClientes(data: {
    id_cliente_ws: number,
    id_facturaPV: number,
    sucursal: string,
    nro_terminal: string,
    nom_localizacion: string,
    nom_formaPago: string,
    id_codigo_referencia: string,
    observaciones_nc: string,
    ZonaHoraria: string,
    Usuario: string
  }) {
    let url = URL_SERVICES + "ProcesoNCClientes";
    return this.http.httpPost(url, data);
  }

  selectMotivos() {
    let url = URL_SERVICES + "SelectMotivosNC";
    return this.http.httpGet(url);
  }


  procesoNCParcial(data: {
    id_cliente_ws: number
    id_facturaPV: number
    id_DocumentoPV: number // 0 si es nueva SINO interno asignado
    consecutivoMH: string // 0 en string si no fue enviada a hacienda
    id_tipo_identificacion: string // primera vez se envía ""
    identificacion_cliente: string //
    sucursal: string
    nro_terminal: string
    nom_localizacion: string
    cliente: string // primera vez ""
    nom_formaPago: string
    id_codigo_referencia: string //
    id_condicion_venta: string //primera vez ""
    plazo_credito: number
    id_medio_pago: string
    id_moneda: string
    tipo_cambio: number
    observaciones: string
    isguardado: string
    pCodigoAfiliado?: String
    ZonaHoraria?: string
    Usuario: string
  }) {
    data.ZonaHoraria = "Central America Standard Time";
    data.pCodigoAfiliado = "";
    let url = URL_SERVICES + "procesoNCParciales";
    return this.http.httpPost(url, data);
  }

  agregarProducto(data: {
    id_cliente_ws,
    id_facturaPV,
    codigo_producto,
    nom_localizacion,
    cant,
    descuentonew,
    precio,
    isexonerado,
    ZonaHoraria?,
    Usuario
  }
  ) {
    data.ZonaHoraria = "Central America Standard Time";
    let url = URL_SERVICES + "ProcesoDetalleNCClientes";
    return this.http.httpPost(url, data);
  }

  eliminarProducto(data:{
    id_cliente_ws,
    id_facturaPV,
    id_documento,
    codigo_producto,
    nom_localizacion,
    cant,
    Usuario,
    ZonaHoraria?
  }){
    data.ZonaHoraria = "Central America Standard Time";
    let url = URL_SERVICES + "EliminarLineaNCCliente";
    return this.http.httpPost(url, data);
  }

  selectNCTotales(data:{
    id_cliente_ws:number
    UsuarioUbicacion:string
    documento:string
    txtDocu:number
    }) {

    let url = URL_SERVICES + 'SelectNCTotales?id_cliente_ws=' + data["id_cliente_ws"] + '&UsuarioUbicacion=' + data["UsuarioUbicacion"] + '&id_documento=' + data["documento"] + "&txtDocu=" + data["txtDocu"];
    return this.http.httpGet(url);
  }

  selectProductosTotales(data:{
    id_cliente_ws:number
    UsuarioUbicacion:string
    documento:string
    }){
    let url = URL_SERVICES + 'SelectProductosNCCLIENTESUbicaGrid?id_cliente_ws=' + data["id_cliente_ws"] + '&ubicacion=' + data["UsuarioUbicacion"] + '&num_documento=' + data["documento"];
    return this.http.httpGet(url);
  }

  eliminarNotaDeCredito(data:{
    id_cliente_ws:number
    id_facturaPV:number
    id_documento:number
    sucursal:string
    nro_terminal:string
    nom_localizacion:string
    Usuario:string
    ZonaHoraria?
  }){
    data.ZonaHoraria = "Central America Standard Time";
    let url = URL_SERVICES + "EliminarNCCLIENTESTemporal";
    return this.http.httpPost(url, data);
  }

  insertDocumentoReferenciaNC(data:{
    id_cliente_ws:number
    pIdNotaCredito:number
    pIdTipoDocumento:string // ticket o factura
    pClave:string
    pFechaEmision:string
    pIdCodigoReferencia:string
    pRazon:string
    Usuario:string
    ZonaHoraria:string
  }){
    let url = URL_SERVICES + "InsertDocumentoReferenciaNC";
    return this.http.httpPost(url, data);
  }

  buscarNotasDeCredito(data:{
    id_cliente_ws:number
    Fecha_ini:string
    Fecha_fin:string
    UsuarioUbicacion:string
    FiltroCodiPro:string
    CondicionVenta?:string
    Moneda?:string
  }){
    data.Moneda = "-";
    data.CondicionVenta = "-"

    let url = URL_SERVICES + "SelecthistoricoNCClientesXLocalizacion?id_cliente_ws=" +data["id_cliente_ws"] + "&Fecha_ini=" +data["Fecha_ini"] + "&Fecha_fin=" +data["Fecha_fin"] + "&CondicionVenta=" +data["CondicionVenta"] + "&Moneda=" +data["Moneda"] + "&UsuarioUbicacion=" +data["UsuarioUbicacion"] + "&FiltroCodiPro=" +data["FiltroCodiPro"];
    return this.http.httpGet(url);
  }

  enviarEmail(data:{
    pTipoDocumento:string //“01” FACTURA / “03” NC
    pCorreos:string /// SE ENVIA LOS CORREOS INDICADOS EN EL INPUT + EL DEL CLIENTE REGISTRADO SI ASI FUERA
    pIdDocumento:number //ID DEL DOCUMENTO INTERNO SI FUERA FACTURA O ID DE NC
    pNombreReceptor:string // NOMBRE DEL CLIENTE IGUAL QUE EN FACTURA
    pNombreReporte:string // si el tipo TipoDocumento == "01" > "RPTDocumento" si no ""RPTNotaCredito
    id_cliente_ws:number
    ZonaHoraria:string
    Usuario:string
    id_codigo_referencia:string

  }){
    let url = URL_SERVICES + "NotificationMail";
    return this.http.httpPost(url, data);
  }

  buscarPrintString(data:{
    id_cliente_ws:number
    id_facturaPV:number
    nombreUsuario:string
    sePagaCon:number
    vuelto:number
    clave:string
    reImpresion:boolean
  }){
    let url = URL_SERVICES + "PrintTicketNC?id_cliente_ws=" + data["id_cliente_ws"] + "&vid_facturaPV=" + data["id_facturaPV"] + "&NombreUsuario=" + data["nombreUsuario"] + "&pPagaCon=" + data["sePagaCon"] + "&pVuelto=" + data["vuelto"] + "&pClave=" + data["clave"] + "&pReimpresion=" + data["reImpresion"];
    return this.http.httpGet(url);
  }


}
