import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { ToastService } from './toast.service';
import { URL_SERVICES } from '../config/config';


@Injectable({
  providedIn: 'root'
})
export class PedidosPostService {

    constructor(public http: HttpClient,
                private event: Events,
                private toastServ: ToastService) {
    }

    httpPost(data, url) {
      let promesa = new Promise((resolve,) => {
        this.http.post(url, JSON.stringify(data), { headers: { 'Content-Type': "application/json" } })
          .subscribe((data: any) => {
            resolve(data)
          },
            (error) => {
              this.toastServ.toastMensajeDelServidor('Hubo un timeout con el servidor, revise su conexión a internet e inténtelo nuevamente');
              this.event.publish('errorServidor');
            })
      })
      return promesa
    }

    login(id_cliente_ws = 0, cedula, password){

    let promesa = new Promise((resolve)=>{
      var data ={

    	"id_cliente_ws": id_cliente_ws,
    	"cedula": cedula,
    	"password":password,
    	"zonahoraria" :"Central America Standard Time"

    };
      let url = URL_SERVICES + 'ProcesoLoginPVWolk'
      this.httpPost(data,url).then((data)=>{
        resolve(data)
      })
    })
    return promesa
    }

    cerrarSesion( id_cliente_ws, usuario ){
      let promesa = new Promise((resolve)=>{
        var data ={

        "id_cliente_ws": id_cliente_ws,
        "cedula": usuario,
        "ZonaHoraria" :"Central America Standard Time"

      };
        let url = URL_SERVICES + 'ProcesoCERRARLoginPVWolk'
        this.httpPost(data,url).then((data)=>{
          resolve(data);
        })
      })
      return promesa
    }

    eliminarProducto(
  id_cliente_ws,
  id_facturaPV,
  codigo_producto,
  nom_localizacion,
  cant,
  Usuario
  ){

    let promesa = new Promise((resolve)=>{
      var data ={
        "id_cliente_ws": parseInt(id_cliente_ws),
        "id_facturaPV": id_facturaPV,
        "codigo_producto":codigo_producto,
        "nom_localizacion":nom_localizacion,
        "cant": cant,
        "Usuario":Usuario,
        "ZonaHoraria":"Central America Standard Time"
    };
    console.log(data);
      let url = URL_SERVICES + 'EliminarLineaFacturaPV'
      this.httpPost(data,url).then((data)=>{
        resolve(data)
      })
    })
    return promesa
    }

    eliminarFacturaTemporal(id_cliente_ws, id_facturaPV, sucursal, nro_terminal, nom_localizacion, Usuario){

    let promesa = new Promise((resolve)=>{
      var data ={

      "id_cliente_ws": parseInt(id_cliente_ws),
      "id_facturaPV": parseInt(id_facturaPV),
      "sucursal":sucursal,
      "nro_terminal":nro_terminal,
      "nom_localizacion":nom_localizacion,
      "Usuario":Usuario,
      "ZonaHoraria":"Central America Standard Time"

    };
    console.log(data)
      let url = URL_SERVICES + 'EliminarFacturaTemporalPV'
      this.httpPost(data,url).then((data)=>{
        resolve(data)
      })
    })
    return promesa
    }

    agregarProducto(
  id_cliente_ws,
  id_facturaPV,
  codigo_producto,
  nom_localizacion,
  cant,
  descuentonew,
  precio,
  isexonerado,
  Usuario
  ){
    let promesa = new Promise((resolve)=>{
      var data ={
        "id_cliente_ws": parseInt(id_cliente_ws),
        "id_facturaPV": id_facturaPV,
        "codigo_producto":codigo_producto,
        "nom_localizacion":nom_localizacion,
        "cant": cant,
        "descuentonew": parseFloat(descuentonew),
        "precio": precio,
        "isexonerado":isexonerado,
        "Usuario":Usuario,
        "ZonaHoraria":"Central America Standard Time"
    };
    console.log("El producto envíado: ", data);
      let url = URL_SERVICES + 'ProcesoDetalleFacturasPV'
      this.httpPost(data,url).then((data)=>{
        resolve(data)
      })
    })
    return promesa
    }

    abrirCaja(id_cliente_ws:number, sucursal, nro_terminal, nom_localizacion, monto_apertura, usuario ){
      let promesa = new Promise((resolve)=>{
        var data ={
          "id_cliente_ws": id_cliente_ws,
          "nom_localizacion": nom_localizacion,
          "sucursal": sucursal,
          "nro_terminal":nro_terminal,
          "monto_apertura":monto_apertura,
          "Usuario": usuario,
          "ZonaHoraria":"Central America Standard Time"
      };
      console.log(data);
        let url = URL_SERVICES + 'ProcesoAperturaCaja'
        this.httpPost(data,url).then((data)=>{
          resolve(data)
          console.log(data);
        })
      })
      return promesa
    }


}
