import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { URL_SERVICES } from 'src/app/config/config';
import { Observable } from 'rxjs';
import { NavigationParamsService } from '../navigation-params.service';

@Injectable({
  providedIn: 'root'
})
export class CajaDiariaService {

  constructor(private http: HttpService,
    private navParams: NavigationParamsService) {

  }

  initParams(arrayRespuesta) {
    console.log(arrayRespuesta)
    let saldos = arrayRespuesta[0].data;
    let gastos = arrayRespuesta[1].data;
    let ingresos = arrayRespuesta[2].data;
    let validacion = arrayRespuesta[3];

    saldos.length == 0 ? saldos.push({
      "Monto Inicial": 0
    }) : saldos = saldos;
    console.log(saldos);

    this.navParams.dataCajaDiaria.data = new Object() as any;

    let totalInicial = 0;
    for (let i = 0; i < saldos.length; i ++){
      let saldo = saldos[i];

      let saldo_incial_raw:string = saldo["Monto Inicial"].toString();
      let saldo_incial = parseFloat((saldo_incial_raw.replace(",","")));
      totalInicial = totalInicial + saldo_incial;
    }
    this.navParams.dataCajaDiaria.data.saldo_inicial = Math.round(totalInicial*100)/100;



    this.navParams.dataCajaDiaria.data.estado = validacion["respuestacaja"];

    Object.keys(validacion)[1] != undefined ?
    this.navParams.dataCajaDiaria.data.fecha = validacion[Object.keys(validacion)[1]]:
    this.navParams.dataCajaDiaria.data.fecha = "";




    this.navParams.dataCajaDiaria.data.arrayGastos = gastos;
    var totalGasto = 0;
    for (let i = 0; i < gastos.length; i ++){
      let gasto = this.navParams.dataCajaDiaria.data.arrayGastos[i];
      gasto.html = new Object() as any;
      gasto.html.icono = "add-circle";

      let monto_pagado_raw:string = gasto["Monto Pagado"].toString();
      let monto_pagado = parseFloat((monto_pagado_raw.replace(",","")));


      totalGasto = totalGasto + monto_pagado;
    }
    this.navParams.dataCajaDiaria.data.totalGastos = Math.round(totalGasto*100)/100;



    this.navParams.dataCajaDiaria.data.arrayIngresos = ingresos;
    var totalIngresos = 0;
    for (let i = 0; i < ingresos.length; i ++){
      let ingreso = this.navParams.dataCajaDiaria.data.arrayIngresos[i];
      ingreso.html = new Object() as any;
      ingreso.html.icono = "add-circle";

      let monto_pagado_raw:string = ingreso["Monto Pagado"].toString();
      let monto_pagado = parseFloat((monto_pagado_raw.replace(",","")));


      totalIngresos = totalIngresos + monto_pagado;
    }
    this.navParams.dataCajaDiaria.data.totalIngresos = Math.round(totalIngresos*100)/100;


    this.navParams.dataCajaDiaria.data.saldo_caja = Math.round((this.navParams.dataCajaDiaria.data.saldo_inicial + this.navParams.dataCajaDiaria.data.totalIngresos - this.navParams.dataCajaDiaria.data.totalGastos)*100)/100;
    this.navParams.dataCajaDiaria.data.impresionString = "";
    return;
  }

  selectAll(data) {
    return new Promise((resolve) => {
      let respuestaArray = new Array();

      this.selectSaldos(data).subscribe((saldos) => {
        respuestaArray.push({
          "variable": "saldos",
          "data": saldos
        })
        let data2 = new Object() as any;
        data2.id_cliente = data.id_cliente;
        data2.usuario = data.usuario;
        this.selectGastos(data2).subscribe((gastos) => {
          console.log(gastos)
          respuestaArray.push({
            "variable": "gastos",
            "data": gastos
          })
          this.SelectIngresosCajaUsuario(data2).subscribe((ingresos) => {
            respuestaArray.push({
              "variable": "ingresos",
              "data": ingresos
            })
            resolve(respuestaArray);
          })
        })
      })
    })
  }

  selectSaldos(data: {
    id_cliente: number,
    usuario: string,
    zona_horaria: string
  }): Observable<any> {
    let url = URL_SERVICES + "SelectsaldosCajasDiariausuario?id_cliente_ws=" + data["id_cliente"] + "&usuario=" + data["usuario"] + "&ZonaHoraria=" + data["zona_horaria"];
    return this.http.httpGet(url);
  };

  selectGastos(data: {
    id_cliente: number,
    usuario: string
  }): Observable<any> {
    let url = URL_SERVICES + "SelectGastosCajaUsuario?id_cliente_ws=" + data["id_cliente"] + "&Usuario=" + data["usuario"];
    console.log(url)
    return this.http.httpGet(url);
  };

  SelectIngresosCajaUsuario(data: {
    id_cliente: number,
    usuario: string
  }): Observable<any> {
    let url = URL_SERVICES + "SelectIngresosCajaUsuario?id_cliente_ws=" + data["id_cliente"] + "&Usuario=" + data["usuario"];
    return this.http.httpGet(url);
  };

  procesoCierreCaja(data: {
    id_cliente_ws: any,
    nom_localizacion: any,
    nro_terminal: any,
    sucursal: string,
    Usuario: string,
    monto_contabilizado: number, //monto inicial + total de ventas ) – (totales gastos
    monto_cierre: number, // input o texboxt de monto de cierre
    monto_diferencia: number, //(monto_cierre - monto_contabilizado)
    observaciones: string,
    ZonaHoraria?: string
  }) {
    data.ZonaHoraria = "Central America Standard Time";
    let url = URL_SERVICES + "ProcesoCierreCaja";
    return this.http.httpPost(url, data);
  }

  ticketGeneralYCierre(data: {
    id_cliente_ws: number,
    Fecha_ini: string,
    montcierre: number,
    saldocaja: number,
    balance: number,
    apertur: number,
    totalgasto: number,
    totalventas: number,
    pReimpresion: boolean,
    Usuario: string,
    ZonaHoraria?: string
  }) {
    data.ZonaHoraria = "Central America Standard Time";
    let url = URL_SERVICES + "TicketCierreGeneral?id_cliente_ws="+ data["id_cliente_ws"] + "&Fecha_ini="+ data["Fecha_ini"] +"&Usuario=" + data["Usuario"] + "&montcierre=" +data["montcierre"]  +"&saldocaja="+ data["saldocaja"] + "&balance=" + data["balance"]+"&apertur=" + data["apertur"] +"&totalgasto=" +data["totalgasto"] +"&totalventas=" +data["totalventas"] +"&ZonaHoraria=Central America Standard Time&pReimpresion=" + data["pReimpresion"];

    return this.http.httpGet(url);
  }


}
