import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NavigationParamsService } from 'src/app/services/navigation-params.service';
import { NavController, AlertController } from '@ionic/angular';
import { CajaDiariaService } from 'src/app/services/caja-diaria/caja-diaria.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { ToastService } from 'src/app/services/toast.service';
import { PrintService } from 'src/app/services/print.service';
import { AlertOptions } from '@ionic/core';
import { PedidosPostService } from 'src/app/services/pedidos-post.service';

@Component({
  selector: 'app-caja-diaria',
  templateUrl: './caja-diaria.page.html',
  styleUrls: ['./caja-diaria.page.scss']
})
export class CajaDiariaPage implements OnInit {

  datosCaja: any = {};
  verMasGastos: boolean = false;
  iconoGastos: string = "add-circle";

  verMasIngresos: boolean = false;
  iconoIngresos: string = "add-circle";

  balance: number = 0;
  montoFisico: number = 0;
  observaciones: string = "";

  showSplash = false;
  initiallyClosed: boolean = false;
  constructor(public localStorageServ: LocalStorageService,
    private navParams: NavigationParamsService,
    private navCtrl: NavController,
    private cajaDiariaServ: CajaDiariaService,
    private toastServ: ToastService,
    private printServ: PrintService,
    private alertCtrl: AlertController,
    private pedidosPostServ: PedidosPostService
  ) {
  }

  ngOnInit() {
    this.datosCaja = this.navParams.dataCajaDiaria.data;
    this.balance = Math.round((this.montoFisico - this.datosCaja.saldo_caja) * 100) / 100;
    if (this.datosCaja.estado == "CERRADA") {
      this.initiallyClosed = true;
    }
  }

  verMasGastosFN() {
    if (this.verMasGastos) {
      this.verMasGastos = false;
      this.iconoGastos = "add-circle";
    } else {
      this.verMasGastos = true;
      this.iconoGastos = "remove-circle";
    }
  }

  verMasIngresosFN() {
    if (this.verMasIngresos) {
      this.verMasIngresos = false;
      this.iconoIngresos = "add-circle";
    } else {
      this.verMasIngresos = true;
      this.iconoIngresos = "remove-circle";
    }
  }

  cerrarCajaAlert() {

    let keys = Object.keys(this.localStorageServ.localStorageObj);

    if(this.montoFisico < 0){
      this.toastServ.toastMensajeDelServidor("No se puede enviar montos negativos!", "error");
      return;
    }

    let keysLength = keys.length;
    for (let i = 0; i < keysLength; i++) {
      let key = keys[i];
      let split = key.split("_");
      if (split[0] == "factura") {
        if (this.localStorageServ.localStorageObj[key].isProcesada == false &&
            this.localStorageServ.localStorageObj[key].exceptionHacienda != "procesando") {
          let header = "Hay facturas sin procesar, ¿desea procesarlas antes de cerrar la caja?";
          let buttons = [{
            "text": "Cerrar caja",
            "handler": () => {
              this.cerrarCaja();
            }
          }, {
            "text": "Procesar facturas",
            "handler": () => {
              this.irAProcesarFacturas();
            }
          }
          ]
          this.presentAlert(header, undefined, undefined, buttons);
          return;
        }
      }
    }
    this.cerrarCaja();

  }

  irAProcesarFacturas() {
    this.navCtrl.navigateForward("/crear-factura-offline/facturas-a-procesar");
  }
  cerrarCaja() {
    this.showSplash = true;
    let monto_contabilizado = this.datosCaja.saldo_inicial + this.datosCaja.totalIngresos - this.datosCaja.totalGastos;
    let user: ObjUserData = this.localStorageServ.localStorageObj.dataUser;
    let data = {
      "id_cliente_ws": parseInt(user.idUser),
      "nom_localizacion": user.nom_localizacion,
      "nro_terminal": user.nro_terminal,
      "sucursal": user.sucursal,
      "Usuario": user.usuario,
      "monto_contabilizado": monto_contabilizado, //monto inicial + total de ventas ) – (totales gastos
      "monto_cierre": this.montoFisico, // input o texboxt de monto de cierre
      "monto_diferencia": Math.round((this.montoFisico - monto_contabilizado) * 100) / 100, //(monto_cierre - monto_contabilizado)
      "observaciones": this.observaciones,
      "ZonaHoraria": "Central America Standard Time"
    };
    console.log(data)

    this.cajaDiariaServ.procesoCierreCaja(data).subscribe((respuesta) => {
      this.showSplash = false;
      console.log(respuesta)
      if (respuesta == true) {
        this.toastServ.toastMensajeDelServidor("Se cerró la caja con éxito!", "success")
        this.datosCaja.estado = "CERRADA";
      } else {
        this.toastServ.toastMensajeDelServidor("Ocurrió un error en el cierre de cajaComunícate con el soporte técnico Wolk +506 4000 1301 : Problema con el Servidor Dase de Datos al intentar CERRAR LA CAJA", "error")
      }

    });
  }

  imprimirInforme() {

    this.showSplash = true;
    console.log(this.datosCaja);
    let user: ObjUserData = this.localStorageServ.localStorageObj.dataUser;
    let data = {
      "id_cliente_ws": parseInt(user.idUser),
      "Fecha_ini": this.datosCaja.fecha,
      "montcierre": this.montoFisico,
      "saldocaja": this.datosCaja.saldo_caja,
      "balance": this.balance,
      "apertur": this.datosCaja.saldo_inicial,
      "totalgasto": this.datosCaja.totalGastos,
      "totalventas": this.datosCaja.totalIngresos,
      "pReimpresion": false,
      "Usuario": user.usuario,
      "ZonaHoraria": "Central America Standard Time"
    };

    if (this.datosCaja.impresionString == "") {
      this.enviarAImprimir(data);

    } else {
      data.pReimpresion = true;
      this.enviarAImprimir(data);
    }

  }

  enviarAImprimir(data) {
    console.log(data);
    this.cajaDiariaServ.ticketGeneralYCierre(data).subscribe((respuesta) => {
      console.log(respuesta)
      if (respuesta == false) {
        this.toastServ.toastMensajeDelServidor("Comunícate con el soporte técnico Wolk +506 4000 1301 : Problema con el Servidor Dase de Datos al intentar IMPRIMIR EL CIERRE DE CAJA", "error");
        this.showSplash = false;
      } else {
        if (typeof respuesta == "string") {
          this.datosCaja.impresionString = respuesta;
        };
        this.imprimir(respuesta);
      }
    });
  }

  imprimir(respuesta) {
    this.printServ.printFN(this.localStorageServ.localStorageObj.impresora, respuesta).then(() => {
      this.showSplash = false;
    })
      .catch((err) => {
        this.showSplash = false;
        console.log(err);
        if (err == "No hay impresora") {
          this.printServ.buscarImpresora("/caja-diaria").then(() => {
            this.toastServ.toastMensajeDelServidor("Intente de imprimir el documento nuevamente", "success");
          })
            .catch(() => {
            })
        }
      });
  }

  changeMontoFisico() {
    this.balance = Math.round((this.montoFisico - this.datosCaja.saldo_caja) * 100) / 100;
  }

  dismiss() {
    this.navCtrl.navigateBack("/menu");
  }

  abrirCaja() {
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
          if(montoInicial[0] < 0){
            this.toastServ.toastMensajeDelServidor("Ingrese un numero válido!", "error");
            return;
          }
          if (typeof montoInicial[0] == "string") {
            let monto: string = montoInicial[0];
            let montoPunto = monto.replace(",", ".");
            var montoNum = parseFloat(montoPunto);
          } else {
            var montoNum: number = montoInicial[0];
          }
          let user: ObjUserData = this.localStorageServ.localStorageObj.dataUser;
          this.pedidosPostServ.abrirCaja(
            parseInt(user.idUser),
            user.sucursal,
            user.nro_terminal,
            user.nom_localizacion,
            montoNum,
            user.usuario
          ).then((resp: any) => {
            if (resp == "true") {
              this.navCtrl.navigateBack("/menu");
            } else {
              this.toastServ.toastMensajeDelServidor("Comunícate con el soporte técnico Wolk +506 4000 1301 : Problema con el Servidor Dase de Datos al intentar ABRIR LA CAJA")
            }
          })
        }
      }]
    }
    this.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);
  }

  async presentAlert(header?, subHeader?, inputs?, buttons?) {


    let alertOptions = new Object() as AlertOptions;

    if (header != undefined) {
      alertOptions.header = header
    }
    if (subHeader != undefined) {
      alertOptions.subHeader = subHeader
    }
    if (inputs != undefined) {
      alertOptions.inputs = inputs
    }
    if (buttons != undefined) {
      alertOptions.buttons = buttons
    }

    const alert = await this.alertCtrl.create(alertOptions);
    return await alert.present();
  }


}
