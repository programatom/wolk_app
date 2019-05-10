import { Component, OnInit } from '@angular/core';

import { NavController, ModalController } from '@ionic/angular';

// Services
import { LocalStorageService } from '../../services/local-storage.service';
import { PedidosGetService } from '../../services/pedidos-get.service';
import { ProcesoFacturasService } from '../../services/proceso-facturas.service';
import { DataFacturaService } from '../../services/data-factura.service';
import { ToastService } from '../../services/toast.service';
import { NavigationParamsService } from '../../services/navigation-params.service';
import { CommonOperationsService } from 'src/app/services/common-operations/common-operations.service';

@Component({
  selector: 'app-pago',
  templateUrl: './pago.page.html',
  styleUrls: ['./pago.page.scss'],
})
export class PagoPage implements OnInit {

  montoTotal: number;
  montoCliente: number;
  pendiente: number = 0;
  vuelto: number = 0;
  cliente: any;
  pagarDisabled: boolean = true;

  tipoDoc: string = "01";
  formasPago: Array<any>;
  formaSeleccionada: string = "caja x efectivo";
  showSplash: boolean = false;
  voucher:any;
  user:any;

  constructor(public navCtrl: NavController, public navParams: NavigationParamsService,
    public localStorageServ: LocalStorageService,
    private pedidosGetServ: PedidosGetService,
    private procesoFacturasServ: ProcesoFacturasService,
    public dataFacturaServ: DataFacturaService,
    private toastServ: ToastService,
    private modalCtrl: ModalController,
    private common: CommonOperationsService) {

      this.user = this.localStorageServ.localStorageObj['dataUser'];
  }


  procesoPagoFacturaCliente(tipo) {

    let factura = this.dataFacturaServ.dataFactura;
    let id_cliente_ws = this.user.idUser;
    let id_facturaPV = factura.id_facturaPV;
    let id_tipo_identificacion = factura.id_tipo_identificacion;
    let identificacion_cliente = factura.identificacion_cliente;
    let sucursal = this.user.sucursal;
    let nro_terminal = this.user.nro_terminal;
    let nom_localizacion = this.user.nom_localizacion;
    let nom_formaPago = this.dataFacturaServ.dataFactura.pagoOfflineData.formaDePago;
    let cliente = factura.cliente;
    let id_condicion_venta = factura.id_condicion_venta;
    let plazo_credito = factura.plazo_credito;
    let id_moneda = factura.id_moneda;
    let tipo_cambio = factura.tipo_cambio;
    let observaciones = factura.observaciones;
    let ZonaHoraria = "Central America Standard Time";
    let Usuario = this.user.usuario;
    let total_comprobante = this.montoTotal;

    if(tipo=="pagar"){
      var total_ultimo_abonado = this.montoCliente - this.vuelto;
      var total_pendiente = this.pendiente;
    }else if (tipo == "completo"){
      var total_ultimo_abonado = this.dataFacturaServ.dataFactura.pagoOfflineData.pendiente;
      var total_pendiente = 0;
    }else if (tipo == "credito"){
      var total_ultimo_abonado = this.montoTotal - this.dataFacturaServ.dataFactura.pagoOfflineData.pendiente;
      if(total_ultimo_abonado != 0){
        this.toastServ.toastMensajeDelServidor("La factura debe ser nueva para enviar el crédito", "error");
        return;
      }
      var total_pendiente = this.montoTotal;
    }

    this.showSplash = true;
    this.procesoFacturasServ.procesoPagoFacturaCliente(id_cliente_ws,
      id_facturaPV,
      id_tipo_identificacion,
      identificacion_cliente,
      sucursal,
      nro_terminal,
      nom_localizacion,
      nom_formaPago,
      cliente,
      id_condicion_venta,
      plazo_credito,
      id_moneda,
      tipo_cambio,
      total_comprobante,
      total_pendiente,
      total_ultimo_abonado,
      observaciones,
      ZonaHoraria,
      Usuario,
    ).then((resp) => {
      this.dataFacturaServ.dataFactura.noPaga = false;
      this.dataFacturaServ.dataFactura.pagoOfflineData.pendiente = resp[0]["total_pendiente"];
      this.showSplash = false;
      this.toastServ.toastMensajeDelServidor("Se envió el pago con éxito")
      this.dismissModal();
      console.log(resp);
    })
  }

  //---------------------------------------------------------------------------------------------------------

  changeMontoCliente() {


    this.pagarDisabled = false;
    this.pendiente = this.dataFacturaServ.dataFactura.pagoOfflineData.pendiente;
    let pendienteMenosMonto:number = this.common.aproxXDecimals(this.pendiente - this.montoCliente , 2);

    if(pendienteMenosMonto < 0){
      this.pendiente = 0;
      this.vuelto =  - pendienteMenosMonto;
    }else{
      this.vuelto = 0;
      this.pendiente = pendienteMenosMonto;
    }
  }

  //---------------------------------------------------------------------------------------------------------

  selectTipoDoc(tipo) {
    this.tipoDoc = tipo;
  }

  //---------------------------------------------------------------------------------------------------------


  dismissModal(resp?) {
    this.modalCtrl.dismiss();
  }


  ngOnInit() {

    this.pedidosGetServ.selectCuentasFormasdePagoActivas(this.user.idUser).then((array: any) => {
      array.splice(0, 1);
      this.formasPago = array;
    });
    this.montoTotal = this.dataFacturaServ.dataFactura.subTotales.total;
    this.cliente = this.navParams.clientData.cliente;
    this.dataFacturaServ.dataFactura.pagoOfflineData.formaDePago = "caja x efectivo";
    this.pendiente = this.dataFacturaServ.dataFactura.pagoOfflineData.pendiente;

  }

}
