import { Component, OnInit } from '@angular/core';
import { NotasDeCreditoHttpService } from 'src/app/services/notas-de-credito/notas-de-credito-http.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { NavController, ModalController } from '@ionic/angular';
import { NotasDeCreditoService } from 'src/app/services/notas-de-credito/notas-de-credito.service';
import { NotaRealizadaModalPage } from '../nota-realizada-modal/nota-realizada-modal.page';
import { PrintService } from 'src/app/services/print.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-notas-realizadas',
  templateUrl: './notas-realizadas.page.html',
  styleUrls: ['./notas-realizadas.page.scss'],
})
export class NotasRealizadasPage implements OnInit {
  user: ObjUserData;

  diaInicial
  mesInicial
  annoInicial
  diaFinal
  mesFinal
  annoFinal
  filtro = "";
  notasDeCredito: any = [];
  notasDeCreditoEncontradas: any;
  showSplash: boolean;

  constructor(private _NCHttp: NotasDeCreditoHttpService,
    private localStorageServ: LocalStorageService,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private _NCLogic: NotasDeCreditoService,
    private printServ: PrintService,
    private toastServ: ToastService) {

    this.user = this.localStorageServ.localStorageObj.dataUser;

  }

  ngOnInit() {
    let cuatroDiasAtras = new Date();
    cuatroDiasAtras.setDate(cuatroDiasAtras.getDate() - 4);
    let mes1 = this.addCeroToNumber(cuatroDiasAtras.getMonth() + 1);
    let dia1 = this.addCeroToNumber(cuatroDiasAtras.getDate());
    let anno1 = cuatroDiasAtras.getFullYear();

    let unDiaAdelante = new Date();
    unDiaAdelante.setDate(unDiaAdelante.getDate() + 1);
    let mes2 = this.addCeroToNumber(unDiaAdelante.getMonth() + 1);
    let dia2 = this.addCeroToNumber(unDiaAdelante.getDate());
    let anno2 = unDiaAdelante.getFullYear();

    this.diaInicial = dia1;
    this.mesInicial = mes1;
    this.annoInicial = anno1;
    this.diaFinal = dia2;
    this.mesFinal = mes2;
    this.annoFinal = anno2;
  }

  dismiss() {
    this.navCtrl.navigateBack("/menu-crear-factura");
  }

  async ver(notaDeCredito) {
    this._NCLogic.NCElegida = notaDeCredito;
    let modal = await this.presentModalNota();
    modal.present();
    modal.onDidDismiss().then(()=>{
      this.showSplash = true;
      setTimeout(()=>{
        this.showSplash = false;
        this.buscarNC();
      },4000)
    });
  }

  presentModalNota() {
    return this.modalCtrl.create({
      component: NotaRealizadaModalPage
    });
  }

  buscarNC() {
    var fechaInicial = this.addCeroToNumber(this.diaInicial) + "/" + this.addCeroToNumber(this.mesInicial) + "/" + this.annoInicial;
    var fechaFinal = this.addCeroToNumber(this.diaFinal) + "/" + this.addCeroToNumber(this.mesFinal) + "/" + this.annoFinal;

    this.showSplash = true;
    let data = {
      id_cliente_ws: this.user.idUser,
      Fecha_ini: fechaInicial,
      Fecha_fin: fechaFinal,
      UsuarioUbicacion: this.user.nom_localizacion,
      FiltroCodiPro: ""
    }
    console.log(data);
    this._NCHttp.buscarNotasDeCredito(data).subscribe((respuesta) => {
      this.showSplash = false;

      let respuestaServer = this._NCLogic.filterNCWithThisUser(respuesta);
      console.log(respuestaServer)
      this.notasDeCreditoEncontradas = respuestaServer.length;
      this.notasDeCredito = respuestaServer;

    })
  }

  addCeroToNumber(number) {

    if (parseInt(number) < 10) {
      return "0" + parseInt(number);
    } else {
      return number.toString();
    }
  }


  reenviarCorreo(notaDeCredito) {
    if(notaDeCredito["Consecutivo Hacienda"] == 0){
      this.toastServ.toastMensajeDelServidor("No se puede enviar un email a una nota de crédito que no se envió a hacienda")
      return;
    }
    let header = "Ingrese un correo para reenviar el email";
    let input = [{
      placeholer: "Email"
    }];
    let buttons = [{
      text: "Cancelar",
      role: "cancel"
    }, {
      text: "Reenviar",
      handler: (emailInput) => {
        let email = emailInput[0];
        // FALTA AGREGAR EL EMAIL DEL CLIENTE!
        this.showSplash = true;
        let data = {
          pTipoDocumento: "03",
          pCorreos:email,
          pIdDocumento: notaDeCredito["N° NC"],
          pNombreReceptor:notaDeCredito["Clientes"],
          pNombreReporte:"RPTNotaCredito",
          id_cliente_ws: parseInt(this.user.idUser),
          ZonaHoraria: "Central America Standard Time",
          Usuario: this.user.usuario,
          id_codigo_referencia:"01"
        }
        console.log(data)
        this._NCHttp.enviarEmail(data).subscribe((data)=>{
          this.showSplash = false;
          if(data["enviado"]){
            this.toastServ.toastMensajeDelServidor("Se envió el correo con éxito")
          }else{
            this.toastServ.toastMensajeDelServidor("No se pudo enviar el correo")

          }
        })
      }

    }]
    this.localStorageServ.presentAlert(header, undefined, input, buttons);
  }

  reImprimir(notaDeCredito) {
    this.showSplash = true;

    let data = {
      id_cliente_ws: this.user.idUser,
      id_facturaPV: notaDeCredito["N° NC"],
      nombreUsuario: this.user.NombreUsuario,
      sePagaCon: -1,
      vuelto: -1,
      clave: notaDeCredito["Consecutivo Hacienda"],
      reImpresion: true
    }
    this._NCHttp.buscarPrintString(data).subscribe((printString) => {
      console.log(printString);
      this.showSplash = false;
      this.printService(printString);
    })
  }

  printService(printString) {

    this.printServ.printFN(this.localStorageServ.localStorageObj.impresora, printString).then(() => {
    })
      .catch((err) => {
        if (err == "No hay impresora") {
          this.printServ.buscarImpresora("/notas-realizadas").then(() => {
          })
            .catch(() => {
            })
        }
      })
  }

}
