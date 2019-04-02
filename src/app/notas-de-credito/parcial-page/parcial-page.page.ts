import { Component, OnInit } from '@angular/core';
import { NotasDeCreditoHttpService } from 'src/app/services/notas-de-credito/notas-de-credito-http.service';
import { PedidosGetService } from 'src/app/services/pedidos-get.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { NotasDeCreditoService } from 'src/app/services/notas-de-credito/notas-de-credito.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavController } from '@ionic/angular';

//Clientes: "BRANDON JESUS VALVERDE"
//Condicion Venta: "Contado"
//Consecutivo Hacienda: "50609031900310174620600100010010000000417100029000"
//Estado: "N/E"
//Fechas Creación: "2019-03-09 15:26:35.0233333 -06:00"
//Hacienda: "´50609031900310174620600100010010000000417100029000"
//Localización: "SAN JOSE "
//Medios de Pago: "Efectivo"
//Monedas: "CRC"
//N° Factura: 6756
//N° Identificación: "305100887"
//N° Terminal: "00010"
//Observaciones: "SIN OBSERVACIONES"
//Sucursal: "001"
//Tipo Identificacíon: "Cédula Física"
//Tipo de Cambio: 1
//Total Exento: 0
//Total Gravado: 12500
//Total de Comprobante: 9887.5
//Total de Descuento: 3750
//Total de Impuestos: 1137.5
//Total de Venta: 12500
//Total de Venta Neta: 8750
//Usuario Creación: "Valverde"
//plazo_credito:

@Component({
  selector: 'app-parcial-page',
  templateUrl: './parcial-page.page.html',
  styleUrls: ['./parcial-page.page.scss'],
})
export class ParcialPagePage implements OnInit {

  formaDePagoID = "caja x efectivo";
  motivoID = "03";
  observaciones = "";
  motivos = [];
  formasDePago = [];
  user: ObjUserData;
  factura: any = {};
  showSplash = false;

  constructor(private _NCHttp: NotasDeCreditoHttpService,
    private pedidosGetServ: PedidosGetService,
    public localStorageServ: LocalStorageService,
    private notasDeCreditoServ: NotasDeCreditoService,
    private toastServ: ToastService,
    private navCtrl: NavController,
    private _NCHttpServ: NotasDeCreditoService) { }

  dismiss() {
    this.navCtrl.navigateBack("/factura-visual-hacienda-nc")
  }

  ngOnInit() {

    this.user = this.localStorageServ.localStorageObj.dataUser;
    this.factura = this.notasDeCreditoServ.facturaElegida;

    this._NCHttp.selectMotivos().subscribe((motivos) => {
      motivos.splice(0, 1);
      this.motivos = motivos;
    })
    this.pedidosGetServ.selectCuentasFormasdePagoActivas(this.user.idUser).then((formasDePago: any) => {
      formasDePago.splice(0, 1);
      this.formasDePago = formasDePago;
    })
  }

  procesarNCObtenerID() {


    let terminalUser = this.user.nro_terminal;
    let sucursalUser = this.user.sucursal;

    let terminalFactura = this.factura["N° Terminal"];
    let sucursalFactura = this.factura["Sucursal"];

    // SE AGREGAN MOTIVO ID Y OBSERVACIONES NC A LA FACTURA

    this.factura.motivoID = this.motivoID;
    this.factura.observacionesNC = this.observaciones;
    this.factura.formaDePagoID = this.formaDePagoID;


    if (terminalUser != terminalFactura) {
      this.toastServ.toastMensajeDelServidor("No puede anular una nota de crédito en una factura emitida por otra terminal");
      return;
    }

    if (sucursalUser != sucursalFactura) {
      this.toastServ.toastMensajeDelServidor("No puede anular una nota de crédito en una factura emitida por otra sucursal");
      return;
    }
    this.showSplash = true;

    let data = {
      id_cliente_ws: this.user.idUser,
      id_facturaPV: this.factura["N° Factura"],
      id_DocumentoPV: this.factura.idNC,
      consecutivoMH: this.factura.claveHaciendaNC,
      id_tipo_identificacion: "",
      identificacion_cliente: "",
      sucursal: this.user.sucursal,
      nro_terminal: this.user.nro_terminal,
      nom_localizacion: this.user.nom_localizacion,
      cliente: "",
      nom_formaPago: this.formaDePagoID,
      id_codigo_referencia: this.motivoID,
      id_condicion_venta: "",
      plazo_credito: 0,
      id_medio_pago: "",
      id_moneda: "",
      tipo_cambio: 1,
      observaciones: this.observaciones,
      isguardado: this.factura.isguardado,
      pCodigoAfiliado: "",
      ZonaHoraria: "Central America Standard Time",
      Usuario: this.user.usuario
    };
    this._NCHttp.procesoNCParcial(data).subscribe((respuesta) => {
      this.showSplash = false;
      let number = parseInt(respuesta);
      console.log("El id de la NC es: " + number);
      this._NCHttpServ.searchClienteAndInsertDisAndEmOnFactura(this.factura["N° Identificación"], this.factura).then((cliente)=>{
        console.log("El cliente es : " + cliente)
        if (number > 0) {
          this.factura.idNC = number;
          console.log(this.factura);
          this.factura.isguardado = "S";
          this.navCtrl.navigateForward("/procesar-parcial");
        } else if (number < 0) {
          this.toastServ.toastMensajeDelServidor("Consulte a soporte ERROR al generar NC de Anulación", "error");
          return
        } else if (number == 0) {
          this.toastServ.toastMensajeDelServidor("Ya la factura de referencia tiene una NC de ANULACION , favor verifique", "error");
          return
        }
      })
    })
  }

}
