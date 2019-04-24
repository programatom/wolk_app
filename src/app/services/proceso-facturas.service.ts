import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Events } from '@ionic/angular';
import { ToastService } from './toast.service';
import { URL_SERVICES } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class ProcesoFacturasService {


  constructor(public http: HttpClient,
    private event: Events,
    private toastServ: ToastService) {
  }

  procesoFacturaFn(id_cliente_ws,
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
    Usuario) {

    let promesa = new Promise((resolve) => {
      var data = {

        "id_cliente_ws": id_cliente_ws,
        "id_facturaPV": id_facturaPV,
        "consecutivoMH": consecutivoMH,
        "id_tipo_identificacion": id_tipo_identificacion,
        "identificacion_cliente": identificacion_cliente,
        "sucursal": sucursal,
        "nro_terminal": nro_terminal,
        "nom_localizacion": nom_localizacion,
        "cliente": cliente,
        "id_condicion_venta": id_condicion_venta,
        "plazo_credito": plazo_credito,
        "id_medio_pago": id_medio_pago,
        "id_moneda": id_moneda,
        "tipo_cambio": tipo_cambio,
        "observaciones": observaciones,
        "isguardado": isguardado,
        "pCodigoAfiliado": pCodigoAfiliado,
        "ZonaHoraria": "Central America Standard Time",
        "Usuario": Usuario
      };
      console.log("LA DATA GUARDADA EN EL SERVIDOR: " , data);
      let url = URL_SERVICES + 'ProcesoFacturasPV';
      this.httpPost(data, url).then((data) => {
        resolve(data);
      });
    })
    return promesa
  }

  procesarDocumentoHacienda(
    id_clientews,
    id_documento,
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
  ) {


    let promesa = new Promise((resolve) => {
      var data: any = {
        "id_clientews": id_clientews,
        "id_documento": id_documento,
        "pTipoDocumento": pTipoDocumento,
        "RecNoDoc": RecNoDoc,
        "RecTipoDoc": RecTipoDoc,
        "pCorreos": pCorreos,
        "pNombreReceptor": pNombreReceptor,
        "UsuarioSucursal": UsuarioSucursal,
        "UsuarioTerminal": UsuarioTerminal,
        "ZonaHoraria": ZonaHoraria,
        "Usuario": Usuario
      }
      if(ClaveFactura != undefined){
        data.ClaveFactura = ClaveFactura;
      };
      console.log("LA DATA ENVIADA A HACIENDA: ", data);
      let url = URL_SERVICES + 'ProcesarDocumentoHacienda'
      this.httpPost(data, url).then((data) => {
        resolve(data);
      });
    })
    return promesa
  }

  procesoPagoFacturaCliente(id_cliente_ws,
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
    Usuario, ) {

    let promesa = new Promise((resolve) => {

      var data = {
        "id_cliente_ws": id_cliente_ws,
        "id_facturaPV": id_facturaPV,
        "id_tipo_identificacion": id_tipo_identificacion,
        "identificacion_cliente": identificacion_cliente,
        "sucursal": sucursal,
        "nro_terminal": nro_terminal,
        "nom_localizacion": nom_localizacion,
        "nom_formaPago": nom_formaPago,
        "cliente": cliente,
        "id_condicion_venta": id_condicion_venta,
        "plazo_credito": plazo_credito,
        "id_moneda": id_moneda,
        "tipo_cambio": tipo_cambio,
        "total_comprobante": total_comprobante,
        "total_pendiente": total_pendiente,
        "total_ultimo_abonado": total_ultimo_abonado,
        "observaciones": observaciones,
        "ZonaHoraria": ZonaHoraria,
        "Usuario": Usuario,
      }
      console.log(data);
      let url = URL_SERVICES + 'ProcesoPagoFacturaCliente'
      this.httpPost(data, url).then((data) => {
        resolve(data);
      });
    })
    return promesa

  }

  httpPost(data, url) {
    let promesa = new Promise((resolve) => {
      this.http.post(url, JSON.stringify(data), { headers: { 'Content-Type': "application/json" } })
        .subscribe((data: any) => {
          resolve(data)
        },
          (error) => {
            let mensaje = 'Hubo un timeout con el servidor, revise su conexión a internet e inténtelo nuevamente';
            this.toastServ.toastMensajeDelServidor(mensaje);
            this.toastServ.toastLargo("P Factura: " + JSON.stringify(error));
            console.log(error);
            this.event.publish('errorServidor');
          })
    })
    return promesa
  }
}
