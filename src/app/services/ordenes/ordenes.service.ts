import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { URL_SERVICES } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class OrdenesService {
  orden = new Object() as Orden;

  constructor(private http: HttpService) {
  }



  selectTiposMovimientosPV(data:{
    id_tipo_movimiento:string
  }){
    let url = URL_SERVICES + "SelectTipos_movimientospv?id_tipo_movimiento=" + data["id_tipo_movimiento"];
    return this.http.httpGet(url);
  }

  inicializarOrden(){
    let hoy = new Date();
    let fecha = this.addCeroToNumber(hoy.getDate());
    let mes = this.addCeroToNumber(hoy.getMonth() + 1);
    let anno = hoy.getFullYear();
    let fullFecha = fecha + "/" + mes + "/" + anno;
    this.orden.id_tipo_movimiento = "S";
    this.orden.Observaciones = "";
    this.orden.fecha = fullFecha;
    this.orden.isGenerada = false;
    return;
  }

  addCeroToNumber(number){
    if(number < 10 ){
      return "0" + number;
    }else{
      return number.toString();
    }
  }

  procesoEntradaSalidaInventarioPV(data:{
    id_cliente_ws:number
    num_documento:number
    fecha:string
    tipo_movimiento:string
    id_tipo_ajuste:number
    Usuario_acepta:string
    Usuario_origen:string
    Usuario_destino:string
    nom_localizacion_origen:string
    nom_localizacion_destino:string
    num_documento_relacionado:number
    Observaciones:string
    Activo:string
    Usuario:string
    ZonaHoraria:string
  }){
    let url = URL_SERVICES + "ProcesoEntradaSalidaInventarioPV";
    return this.http.httpPost(url, data);
  }

  procesoEntradaSalidaInventarioProductosPV(data:{
    id_cliente_ws: number
    num_documento: number
    codigo_producto:string
    nom_localizacion:string
    cant:number // decimal
    tipo_movimiento:string

    Usuario_acepta:string
    Usuario_origen:string
    Usuario_destino:string
    nom_localizacion_origen:string
    nom_localizacion_destino:string
    Activo:string
    Usuario:string
    ZonaHoraria:string
  }){
    let url = URL_SERVICES + "ProcesoEntradaSalidaInventarioProductosPV";
    return this.http.httpPost(url, data);
  }

  eliminarLineaOrdenES(data:{
    id_cliente_ws:number
    num_documento:number
    codigo_producto:string
    nom_localizacion:string
    cant:number
    tipo_movimiento:string
    Usuario:string
    ZonaHoraria:string
  }){
    let url = URL_SERVICES + "EliminarLineaOrdenES";
    return this.http.httpPost(url,data);
  }

  printOrdenesES(data:{
    id_cliente_ws:number
    num_documento:number
    TipoMovimiento:string
    Usuario:string
    ZonaHoraria:string
    pReimpresion:boolean
  }){
    let url = URL_SERVICES + "PrintOrdenesES?id_cliente_ws=" + data["id_cliente_ws"]+ "&num_documento="+ data["num_documento"] + "&TipoMovimiento="+ data["TipoMovimiento"] + "&Usuario="+ data["Usuario"] + "&ZonaHoraria="+ data["ZonaHoraria"] + "&pReimpresion="+ data["pReimpresion"];
    console.log(url)
    return this.http.httpGet(url);
  }

  selectProductosOrdenesGrid(data:{
    id_cliente_ws:number
    TipoAjuste:string
    txtnunOrden:number
  }){

    let url = URL_SERVICES + "SelectProductosOrdenesGrid";
    return this.http.httpPost(url,data);
  }
}

export interface Orden {
  num_documento:number
  id_tipo_movimiento:string
  Observaciones:string
  fecha:string
  id_tipo_ajuste:number
  isGenerada:boolean
}
