import { Injectable } from '@angular/core';
import { ToastService } from '../toast.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { LocalStorageService } from '../local-storage.service';
import { ProcesoFacturasService } from '../proceso-facturas.service';

@Injectable({
  providedIn: 'root'
})
export class FacturaLogicService {
  user: ObjUserData;

  constructor(private toastServ: ToastService,
              private localStorageServ:LocalStorageService,
              private procesoFacturasServ: ProcesoFacturasService) {
                this.user = this.localStorageServ.localStorageObj.dataUser;

              }

  procesarDocumentoHaciendaYGuardar(idFactura,emailCliente, cliente, tipoDoc, dataGuardado:{
    id_tipo_identificacion
    identificacion_cliente
    cliente
    id_condicion_venta
    plazo_credito
    id_medio_pago
    id_moneda
    tipo_cambio
    observaciones
    isguardado
  },email = "") {

    return new Promise((resolve)=>{
      let pTipoDocumento = tipoDoc;

      let RecNoDoc = "";
      let RecTipoDoc = "";

      let pCorreos = ""
      if(emailCliente == ""){
        pCorreos = email;
      }else if (email == ""){
        pCorreos = emailCliente;
      }else{
        pCorreos = emailCliente + "," +  email;
      }

      var pNombreReceptor = cliente;
      let UsuarioSucursal = this.user.sucursal;
      let UsuarioTerminal = this.user.nro_terminal;
      let Usuario = this.user.usuario;
      let ClaveFactura = ""
      let ZonaHoraria = "Central America Standard Time";


      this.procesoFacturasServ.procesarDocumentoHacienda(
        this.user.idUser,
        idFactura,
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
      ).then(async (data) => {
        console.log(data);
        this.toastServ.toastMensajeDelServidor("TEST MSG: EL ESTADO ES :" + data["Estado"]);
        if (data["Estado"] == "ERROR") {
          this.toastServ.toastMensajeDelServidor(data["Mensaje"], "error");

        } else if (data["Estado"] == "ACEPTADO") {
          this.toastServ.toastMensajeDelServidor(data["Mensaje"], "success");
          await this.guardarEmitir(data["Clave"], dataGuardado, idFactura);

          resolve({
            "isProcesada":true,
            "clave":data["Clave"]
          });

        } else {
          this.toastServ.toastMensajeDelServidor(data["Mensaje"], "error", 10000);
          await this.guardarEmitir(data["Clave"], dataGuardado, idFactura);
          resolve({
            "isProcesada":true,
            "clave":data["Clave"]
          });

        }
      });

    })


  }

  async guardarEmitir(consecutivo, dataGuardado, idFactura) {



    let id_cliente_ws = this.user.idUser;
    let id_facturaPV = idFactura;
    let consecutivoMH = consecutivo;
    let id_tipo_identificacion = dataGuardado.id_tipo_identificacion;
    let identificacion_cliente = dataGuardado.identificacion_cliente;
    let sucursal = this.user.sucursal;
    let nro_terminal = this.user.nro_terminal;
    let nom_localizacion = this.user.nom_localizacion;
    let cliente = dataGuardado.cliente;
    let id_condicion_venta = dataGuardado.id_condicion_venta;
    let plazo_credito = dataGuardado.plazo_credito;
    let id_medio_pago = dataGuardado.id_medio_pago;
    let id_moneda = dataGuardado.id_moneda;
    let tipo_cambio = dataGuardado.tipo_cambio;
    var observaciones = dataGuardado.observaciones;
    let isguardado = dataGuardado.isguardado;
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
      console.log(resp);
      if (resp == 0) {
        console.log("Se guardó con éxito")
        return;
      } else if (resp == -1) {
        this.toastServ.toastMensajeDelServidor("Error de comunicación");
        return;
      }
    })
  }


}
