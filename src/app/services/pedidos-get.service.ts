import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Events } from '@ionic/angular';
import { ToastService } from './toast.service';
import { URL_SERVICES } from '../config/config';

@Injectable({
  providedIn: 'root'
})
export class PedidosGetService {

  constructor(public http: HttpClient,
    private event: Events,
    private toastServ: ToastService) {
  }



  httpGet(url) {
    let promesa = new Promise((resolve) => {
      this.http.get(url)
        .subscribe((data: any) => {
          resolve(data)
        },
          (error) => {
            console.log(error);
            this.toastServ.toastMensajeDelServidor('Hubo un timeout con el servidor, revise su conexión a internet e inténtelo nuevamente');
            this.event.publish('errorServidor');
          })
    })
    return promesa
  }

  obtenerDatosEmisor(id_cliente_ws){

    let promesa = new Promise((resolve) => {
      let url = URL_SERVICES + 'ObtenerDatosEmisor?id_cliente_ws=' + id_cliente_ws;
      this.httpGet(url).then((data) => {
        resolve(data);
      })
    })
    return promesa
  }


  selectProductosFull(id_cliente_ws, usuarioUbicacion) {

    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelectProductosPVXUBICACIONFULL?id_cliente_ws=' + id_cliente_ws + '&UsuarioUbicacion=' + usuarioUbicacion
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa

  }



  buscarTarifa(id_cliente_ws, codigo) {

    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelecttarifasTipoCambio?id_cliente_ws=' + id_cliente_ws + '&codigo=' + codigo
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa

  }

  selectMonedas() {

    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelectMonedas'
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa

  }

  selectMediosPagos() {

    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelectMediosPagos'
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa
  }

  selectCondicionVenta() {
    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelectCondicionVentas'
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa
  }

  buscarProducto(id_cliente_ws, busqueda, UsuarioUbicacion) {
    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelectProductosPVXFACTURAFiltro?id_cliente_ws=' + id_cliente_ws + '&busqueda=' + busqueda + '&UsuarioUbicacion=' + UsuarioUbicacion
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa
  }

  buscarTodosLosProductos(id_cliente_ws, UsuarioUbicacion) {
    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelectProductosPVXFACTURA?id_cliente_ws=' + id_cliente_ws + '&UsuarioUbicacion=' + UsuarioUbicacion
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa
  }

  buscarCliente(id_cliente_ws, busqueda) {
    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelectClientesdeClientesWSFiltro?id_cliente_ws=' + id_cliente_ws + '&busqueda=' + busqueda
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa
  }

  validarCaja(id_cliente_ws, usuario, ZonaHoraria) {
    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'ValidarCajaUsuario?id_cliente_ws=' + id_cliente_ws + '&usuario=' + usuario + '&ZonaHoraria=' + ZonaHoraria
      this.httpGet(url).then((data) => {
        resolve(data)
        console.log(data)
      })
    })
    return promesa
  }

  selectTotalesUbicaGrid(id_cliente_ws, ubicacion, documento) {

    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelectProductosFacturaUbicaGrid?id_cliente_ws=' + id_cliente_ws + '&ubicacion=' + ubicacion + '&num_documento=' + documento
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa

  }

  selectTotales(id_cliente_ws, ubicacion, documento) {

    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + 'SelectFacturaTotales?id_cliente_ws=' + id_cliente_ws + '&usuario_ubicacion=' + ubicacion + '&nro_documento=' + documento
      this.httpGet(url).then((data) => {
        resolve(data[0])
      })
    })
    return promesa

  }

  selectCuentasFormasdePagoActivas(id_cliente_ws) {

    let promesa = new Promise((resolve) => {

      let url = URL_SERVICES + "SelectCuentasFormasdePagoActivas?id_cliente_ws=" + id_cliente_ws;
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa;

  }

  buscarTextoImpresion(id_cliente_ws, id_facturaPV, nombreUsuario, sePagaCon, vuelto, clave, reImpresion) {
    let promesa = new Promise((resolve) => {
      let url = URL_SERVICES + "PrintTicket?id_cliente_ws=" + id_cliente_ws + "&vid_facturaPV= " + id_facturaPV + "&NombreUsuario=" + nombreUsuario + "&pPagaCon=" + sePagaCon + "&pVuelto=" + vuelto + "&pClave=" + clave + "&pReimpresion=" + reImpresion;
      console.log(url)
      console.log(url)
      this.httpGet(url).then((data) => {
        resolve(data)
      })
    })
    return promesa;

  }
}
