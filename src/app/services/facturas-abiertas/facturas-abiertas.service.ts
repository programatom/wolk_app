import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { URL_SERVICES } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class FacturasAbiertasService {

  facturas = [];

  constructor(private http: HttpService) { }

  selectfacturascreditoFiltro(data:{
    id_cliente_ws:number
    Fecha_ini:string
    Fecha_fin:string
    Moneda:string
    FiltroCodiPro:string
  }){
    let url = URL_SERVICES + "SelectfacturascreditoFiltro?id_cliente_ws=" + data["id_cliente_ws"] +"&Fecha_ini=" + data["Fecha_ini"] + "&Fecha_fin=" + data["Fecha_fin"] +"&Moneda=" + data["Moneda"] + "&FiltroCodiPro=" + data["FiltroCodiPro"] ;
    return this.http.httpGet(url);
  }

  selecttraerDatosVerFactura(data:{
    id_cliente_ws:number
    vConsultaFacturaPV:string
    vConsultaSucursal:string
    vConsultaTerminal:string
    vConsultaLocalizacion:string
  }){
    let url = URL_SERVICES + "SelecttraerDatosVerFactura?id_cliente_ws="+ data["id_cliente_ws"] + "&vConsultaFacturaPV="+ data["vConsultaFacturaPV"] + "&vConsultaSucursal="+ data["vConsultaSucursal"] + "&vConsultaTerminal="+ data["vConsultaTerminal"] + "&vConsultaLocalizacion="+ data["vConsultaLocalizacion"];
    return this.http.httpGet(url);
  }
}
