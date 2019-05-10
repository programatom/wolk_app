import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { PedidosGetService } from '../pedidos-get.service';
import { LocalStorageService } from '../local-storage.service';
import { ToastService } from '../toast.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { PedidosPostService } from '../pedidos-post.service';
import { CajaDiariaService } from '../caja-diaria/caja-diaria.service';
import { NavController } from '@ionic/angular';
import { Events } from '@ionic/angular';
import { URL_SERVICES } from 'src/app/config/config';

@Injectable({
  providedIn: 'root'
})
export class ReporteDeGastosService {

  constructor(private http: HttpService,
    private pedidosGetServ: PedidosGetService,
    private localStorageServ: LocalStorageService,
    private toastServ: ToastService,
    private pedidosPostServ: PedidosPostService,
    private cajaDiaria: CajaDiariaService,
    private navCtrl: NavController,
    private events: Events) { }

    selectCuentasFormasdePagoActivas(data:{
      "id_wolk":number
    }){
      let url = URL_SERVICES + "SelectCuentasFormasdePagoActivas?id_cliente_ws=" + data.id_wolk;
      return this.http.httpGet(url);
    }

    procesoGastos(data:{
      id_cliente_ws:number
      sucursal:string
      nro_terminal:string
      nom_localizacion:string
      Usuario:string

      motivo:string
      monto_gasto:number
      nom_formaPago:string
      id_moneda:string
      tipo_cambio:string
      observaciones:string


      Activo?:string
      ZonaHoraria?:string
      id_gastos?:number
    }){
      data.Activo = "0";
      data.id_gastos = 0;
      data.ZonaHoraria = "Central America Standard Time";
      console.log(data);
      let url = URL_SERVICES + "ProcesoGastos";
      return this.http.httpPost(url, data);


    }

  validarCaja() {
    this.pedidosGetServ.validarCaja(this.localStorageServ.localStorageObj['dataUser'].idUser, this.localStorageServ.localStorageObj['dataUser'].usuario, 'Central America Standard Time').then((cajaValidada: any) => {
      this.events.publish("hideSplash");
      this.toastServ.toastMensajeDelServidor('La caja está: ' + cajaValidada.respuestacaja);
      if (cajaValidada.respuestacaja == 'CERRADA' && cajaValidada != 'error') {
        let objAlert = {
          title: 'Caja cerrada',
          subTitle: 'Debe abrir la caja ingresando un monto inicial',
          inputs: [{
            placeholder: 'Monto inicial',
          }],
          buttons: [{
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Aceptar',
            handler: (montoInicial) => {
              //Procesar apertura de caja
              if (typeof montoInicial[0] == "string") {
                let monto: string = montoInicial[0];
                let montoPunto = monto.replace(/,/g, ".");
                var montoNum = parseFloat(montoPunto);
              } else {
                var montoNum: number = montoInicial[0];
              }
              if (montoNum < 0) {
                this.toastServ.toastMensajeDelServidor("Ingreso inválido")
                return;
              }

              let user: ObjUserData = this.localStorageServ.localStorageObj.dataUser;
              this.events.publish("showSplash");

              this.pedidosPostServ.abrirCaja(
                parseInt(user.idUser),
                user.sucursal,
                user.nro_terminal,
                user.nom_localizacion,
                montoNum,
                user.usuario
              ).then((resp: any) => {
                this.events.publish("hideSplash");
                if (resp == "true") {
                  this.toastServ.toastMensajeDelServidor("Se abrió la caja con éxito" , "success");
                  this.navCtrl.navigateForward("/reporte-gastos");
                } else {
                  this.toastServ.toastMensajeDelServidor("Comunícate con el soporte técnico Wolk +506 4000 1301 : Problema con el Servidor Dase de Datos al intentar ABRIR LA CAJA" , "error")
                }
              })
            }
          }]
        }
        this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);
      } else if (cajaValidada.respuestacaja == "CIERRE DIARIO") {
        let header = " El cierre de caja esta definido como DIARIO. ¿Desea realizar el cierre ahora?";
        let subHeader = undefined;
        let buttons = [
          {
            text: "Cancelar",
            role: "cancel"
          },
          {
            text: "Aceptar",
            handler: () => {
              let data = {
                "id_cliente": this.localStorageServ.localStorageObj.dataUser.idUser,
                "usuario": this.localStorageServ.localStorageObj.dataUser.usuario,
                "zona_horaria": "Central America Standard Time"
              };
              this.events.publish("showSplash");
              this.cajaDiaria.selectAll(data).then((respuestaArray: Array<any>) => {
                this.pedidosGetServ.validarCaja(data["id_cliente"], data["usuario"], data["zona_horaria"]).then((validacion) => {
                  respuestaArray.push(validacion);
                  this.cajaDiaria.initParams(respuestaArray);
                  this.events.publish("hideSplash");
                  this.navCtrl.navigateForward("/caja-diaria");
                })
                console.log(respuestaArray);
              });
            }
          }
        ]
        this.localStorageServ.presentAlert(header, subHeader, undefined, buttons);
      }else{
        this.navCtrl.navigateForward("/reporte-gastos");
      }
    });

  }

}
