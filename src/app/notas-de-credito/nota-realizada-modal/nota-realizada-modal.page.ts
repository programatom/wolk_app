import { Component, OnInit } from '@angular/core';
import { NotasDeCreditoService } from 'src/app/services/notas-de-credito/notas-de-credito.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ModalController } from '@ionic/angular';
import { NotasDeCreditoHttpService } from 'src/app/services/notas-de-credito/notas-de-credito-http.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { PrintService } from 'src/app/services/print.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-nota-realizada-modal',
  templateUrl: './nota-realizada-modal.page.html',
  styleUrls: ['./nota-realizada-modal.page.scss'],
})
export class NotaRealizadaModalPage implements OnInit {

  notaDeCreditoKeys:any;
  /*
  NC = {
    "Clientes": "CLIENTE GENERICO",
    "CodVerificador": "03",
    "Condicion Venta": "Contado",
    "Consecutivo Hacienda": "50601051900310174620600100006030000000025100029000",
    "Fechas Creación": "2019-05-01 09:07:58.6966667 -06:00",
    "Localización" : "SAN JOSE ",
    "Medios de Pago" : "Efectivo",
    "Monedas" : "CRC",
    "Motivo NC" : "Corrige monto",
    "N° Factura" : 9632,
    "N° Identificación" : "",
    "N° NC" : 9645,
    "N° Terminal" : "00006",
    "Observaciones" : "N/A",
    "Plazo Credito" : 0,
    "Referencia Factura Hacienda" : "50601051900310174620600100006040000000146100029000",
    "Sucursal" : "001",
    "Tipo Identificacíon" : "N/A",
    "Tipo de Cambio" : 1,
    "Total de Comprobante" : 0,
    "Total de Descuento" : 0,
    "Total de Impuestos" : 0,
    "Total de Venta" : 0,
    "Total de Venta Neta" : 0,
    "Usuario Creación" : "tomasapp",
    "claveHaciendaNC" : "50601051900310174620600100006030000000025100029000",
  } as any;
  */
  NC;
  user:ObjUserData;
  productos;
  showSplash = false;
  constructor(public NCLogic: NotasDeCreditoService,
              public localStorageServ: LocalStorageService,
              private modalCtrl: ModalController,
              private NCHttp: NotasDeCreditoHttpService,
              private printServ: PrintService,
              private toastServ: ToastService) {
                this.user = this.localStorageServ.localStorageObj.dataUser;
                this.NC = this.NCLogic.NCElegida;
                console.log(this.NC);
              }

  ngOnInit() {
    this.notaDeCreditoKeys = Object.keys(this.NCLogic.NCElegida);
    let idNC = this.NC["N° NC"];
    let data = {
      "id_cliente_ws": this.user.idUser,
      "UsuarioUbicacion": this.user.nom_localizacion,
      "documento": idNC,
    }
    this.NC.claveHaciendaNC = this.NC["Consecutivo Hacienda"];
    this.NCHttp.selectProductosTotales(data).subscribe((respuesta)=>{
      this.productos = respuesta;
    });

  }
  dismissModal(){
    this.modalCtrl.dismiss();
  }

  enviarAHacienda(){
    this.showSplash = true;
    this.NC.idNC = this.NC["N° NC"];
    this.NCLogic.searchClienteAndInsertDisAndEmOnFactura(this.NC["N° Identificación"], this.NC).then(async ()=>{
      console.log(this.NC);
      const ids:any = await this.NCLogic.getIDsOfCondicionYMedioYMotivo(this.NC["Medios de Pago"] ,this.NC["Condicion Venta"],this.NC["Motivo NC"]);

      this.NC.id_condicion_de_venta = ids.id_condicion;
      this.NC.id_medio_de_pago = ids.id_medio;
      this.NC.motivoID = ids.id_motivo;
      this.NC.formaDePagoID = "";
      this.NC.observacionesNC = this.NC["Observaciones"];
      this.NC.isguardado = "S";
      this.NC.plazo_credito = 0;

      this.NCLogic.procesarNCEnHacienda(this.NC).then(()=>{
        this.showSplash = false;
      }).catch((mensajeError)=>{
        this.toastServ.toastMensajeDelServidor(mensajeError);
        this.showSplash = false;
      });
    });
  }

  imprimir(reimpresion) {
    this.showSplash = true;
    let data  = {
      id_cliente_ws: parseInt(this.user.idUser),
      id_facturaPV: this.NC["N° NC"],
      nombreUsuario: this.user.usuario,
      sePagaCon: -1,
      vuelto: -1,
      clave: this.NC["Consecutivo Hacienda"],
      reImpresion: reimpresion
    }
    console.log("DATA ENVIADA AL SERVICIO DE IMPRESIÓN: ", data)
    this.NCHttp.buscarPrintString(data).subscribe((printString)=>{
      this.showSplash = false;
      console.log(printString);
      this.printService(printString);
    })
  }

  printService(printString) {

    this.printServ.printFN(this.localStorageServ.localStorageObj.impresora, printString).then(() => {
    })
      .catch((err) => {
        if (err == "No hay impresora") {
          this.printServ.buscarImpresora("/factura-visual-hacienda-nc").then(() => {
          })
            .catch(() => {
            })
        }
      })
  }

}
