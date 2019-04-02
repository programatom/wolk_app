import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { URL_SERVICES } from 'src/app/config/config';


/*
% Desc Fijo: 0
Activo: "1"
Apellidos: " Brenes"
Empresa: "Super JVC"
Fecha Actualizacíon: "2019-02-07 15:07:38.3366667 -06:00"
Fecha Creacíon: "2018-09-21 08:22:15.0000000 -06:00"
IdTipoIdentificación: "01"
Nombre: "jkjkjkjk"
N° Identificacíon: "101230478"
Tipo Identificacíon: "Cédula Física"
Usuario Actualizacíon: "ROMERO"
Usuario Creacíon: "williamqm"
correo: "maucer07@hotmail.es"
*/

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  clienteNav:any;
  newBackUrl:string;
  clienteNewStatus = new Object() as {
    "isProcesado":boolean
    "hasDireccion":boolean
    "hasCorreo":boolean
    "hasTelefono":boolean
  };

  constructor(private http: HttpService) {

    }

    selectProvincias(){
      let url = URL_SERVICES + "SelectProvincias";
      return this.http.httpGet(url);
    }

    selectCantones(data: {
      "id_provincia":string
    }){
      let url = URL_SERVICES + "SelectCantones?id_provincia=" + data.id_provincia;
      console.log(url)
      return this.http.httpGet(url);
    }

    selectDistritos(data: {
      "id_provincia":string
      "id_canton":string
    }){
      let url = URL_SERVICES + "SelectDistritos?id_provincia=" + data.id_provincia + "&id_canton=" + data.id_canton;
      return this.http.httpGet(url);
    }

    selectBarrios(data: {
      "id_provincia":string
      "id_canton":string
      "id_distrito":string
    }){
      let url = URL_SERVICES + "SelectBarrios?id_provincia=" + data.id_provincia + "&id_canton=" + data.id_canton + "&id_distrito=" + data.id_distrito;
      return this.http.httpGet(url);
    }

    selectClientes(data: {
      id_cliente: number,
      busqueda: string
    }){
      let url = URL_SERVICES + "SelectClientesdeClientesWSFiltro?id_cliente_ws=" + data["id_cliente"] + "&busqueda=" + data["busqueda"]
      return this.http.httpGet(url);
    }

    selectTiposIdentificacion(){
      let url = URL_SERVICES + "SelectTipoIdentificacion"
      return this.http.httpGet(url);
    }

    cargarClientesPadron(data: {
      num_identificacion: string
    }){

      let url = URL_SERVICES + "CargarClientesPADRON?TipoIdentifica=" + 0 + "&num_identificacion=" + data["num_identificacion"];
      return this.http.httpGet(url);
    }



    selectDireccionesClientes(data:{
      id_cliente_ws: number,
      id_tipo_identificacion: string,
      identificacion_cliente: string,
    }){

      let url = URL_SERVICES + "SelectDireccionesClientes?id_cliente_ws=" + data["id_cliente_ws"]+ "&id_tipo_identificacion=" + data["id_tipo_identificacion"]
      + "&identificacion_cliente=" +
      data["identificacion_cliente"] +
      "&pEsClienteWolk=" + "N";
      return this.http.httpGet(url);
    }

    selectTelefonosClientes(data:{
      id_cliente_ws: number,
      id_tipo_identificacion: string,
      identificacion_cliente: string,
    }){

      let url = URL_SERVICES + "SelecttelefonosClientes?id_cliente_ws=" + data["id_cliente_ws"]+ "&id_tipo_identificacion=" + data["id_tipo_identificacion"]
      + "&identificacion_cliente=" +
      data["identificacion_cliente"] +
      "&pEsClienteWolk=" + "N";
      return this.http.httpGet(url);
    }

    selectCorreosClientes(data:{
      id_cliente_ws: number,
      id_tipo_identificacion: string,
      identificacion_cliente: string,
    }){

      let url = URL_SERVICES + "SelectCorreosClientes?id_cliente_ws=" + data["id_cliente_ws"]+ "&id_tipo_identificacion=" + data["id_tipo_identificacion"]
      + "&identificacion_cliente=" +
      data["identificacion_cliente"] +
      "&pEsClienteWolk=" + "N";
      return this.http.httpGet(url);
    }

    procesoClientesC(data: {
      id_cliente_ws: number,
      nombre: string,
      apellidos: string,
      nombre_empresa: string,
      id_tipo_identificacion: string,
      identificacion_cliente: string,
      Activo: string,
      Desc_cliente: number,
      Usuario: string,
      ZonaHoraria?: string
    }) {
      data.ZonaHoraria = "Central America Standard Time";
      let url = URL_SERVICES + "ProcesoClientesC";
      return this.http.httpPost(url, data);
    }

    procesoDirecciones(data: {
      id_cliente_ws:number
      id_tipo_identificacion:string
      identificacion_cliente:string

      id_provincia:string
      id_canton:string
      id_distrito:string
      id_barrio:string
      sennas:string

      ind_principal:string
      EsClienteWolk:string
      Usuario:string
      ZonaHoraria:string
    }) {
      console.log(data);

      data.ZonaHoraria = "Central America Standard Time";
      data.EsClienteWolk = "N";
      let url = URL_SERVICES + "Procesodirecciones";
      return this.http.httpPost(url, data);
    }

    procesoTelefonos(data: {
      id_cliente_ws:number
      id_tipo_identificacion:string
      identificacion_cliente:string

      id_tipo_telefono:number
      id_pais:string
      telefono:number

      ind_principal:string
      EsClienteWolk:string
      Usuario:string
      ZonaHoraria:string
    }) {
      data.ZonaHoraria = "Central America Standard Time";
      data.EsClienteWolk = "N";
      console.log(data)
      let url = URL_SERVICES + "Procesotelefonos";
      return this.http.httpPost(url, data);
    }

    procesoCorreos(data: {
      id_cliente_ws:number
      id_tipo_identificacion:string
      identificacion_cliente:string

      correo:string

      ind_principal:string
      EsClienteWolk:string
      Usuario:string
      ZonaHoraria:string
    }) {
      data.ZonaHoraria = "Central America Standard Time";
      data.EsClienteWolk = "N";
      console.log(data)
      let url = URL_SERVICES + "Procesocorreos";
      return this.http.httpPost(url, data);
    }

    selectTiposTelefono(){
      let url = URL_SERVICES + "SelectTiposTelefono"
      return this.http.httpGet(url);
    }

    selectPaises(){
      let url = URL_SERVICES + "SelectPaises"
      return this.http.httpGet(url);
    }


}
