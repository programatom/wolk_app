import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, Events } from '@ionic/angular';

// Providers
import { PedidosGetService } from '../../services/pedidos-get.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { ToastService } from '../../services/toast.service';
import { DataFacturaService } from '../../services/data-factura.service';
import { AlertOptions } from '@ionic/core';

@Component({
  selector: 'app-datos-de-cliente',
  templateUrl: './datos-de-cliente.page.html',
  styleUrls: ['./datos-de-cliente.page.scss'],
})
export class DatosDeClientePage implements OnInit {
  // NG Models
  medioDePagoDisplay = "01";

  cliente: any = "CLIENTE GENERICO";
  condicionVenta: any = "01";
  moneda: string = "CRC";
  medioDePago: string = "01";

  selectOptionsMediosDePago: any = {
    title: 'Medios de pago',
    subTitle: 'Elija un medio pago de la lista o elija otro e ingrese uno.',
  };

  monedas: any = [];
  mediosDePago: any = [];
  condicionesVenta: any = [];
  plazos = [];
  plazoCredito: string;
  tarifaDeCambio = 1;
  nombreMonedaSelec: any;

  // Variables Operativas
  showSplash: boolean = false;
  clienteSeleccionado: any = {};
  creditoNoSeleccionado: boolean = true;

  desviarLimpiezaObjCliente = false;

  constructor(private pedidosGetServ: PedidosGetService,
    public localStorageServ: LocalStorageService,
    private toastServ: ToastService,
    public dataFacturaServ: DataFacturaService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
    private events: Events) {


    this.events.subscribe('errorServidor', () => {
      this.showSplash = false;
    })

    this.showSplash = true;
    this.pedidosGetServ.selectMonedas().then((monedas: any) => {
      monedas.splice(0, 1);
      this.monedas = monedas;
      this.pedidosGetServ.selectMediosPagos().then((mediosDePago: any) => {
        mediosDePago.splice(0, 1);
        mediosDePago[mediosDePago.length - 1].medio_pago = 'Otro';
        this.mediosDePago = mediosDePago;
        this.pedidosGetServ.selectCondicionVenta().then((condicionesVenta: any) => {
          condicionesVenta.splice(0, 1);
          this.condicionesVenta = condicionesVenta;
          this.showSplash = false;
        })
      })
    });

    let cantidadDeMeses = 48;
    for (let i = 1; i <= cantidadDeMeses; i++) {
      let sustantivo;
      if (i == 1) {
        sustantivo = 'Mes';
      } else {
        sustantivo = 'Meses'
      }
      this.plazos.push({ 'nroMeses': i + ' ' + sustantivo })
    }
  }


  //---------------------------------------------------------------------------------------------------------------------


  limpiarObjCliente() {
    if (this.desviarLimpiezaObjCliente) {
      this.desviarLimpiezaObjCliente = false;
      console.log("Se desvía la limpieza de la variable cliente")
    } else {
      console.log("Se limpia la variable cliente")
      this.clienteSeleccionado = {};
    }
  }

  selectMedioDePago() {


    if (this.medioDePagoDisplay == 'Otro') {
      let header = 'Ingrese el medio de pago';
      let subHeader = 'Elija un cliente de la lista';
      let inputs = [
        {
          name: 'medioPago',
          placeholder: 'Medio de pago',
        }
      ];
      let buttons = [
        {
          text: 'Cancelar',
          role: 'cancel'

        },
        {
          text: 'Aceptar',
          handler: data => {
            this.medioDePago = data['medioPago'];

          }
        }
      ];
      this.localStorageServ.presentAlert(header, subHeader, inputs, buttons);
    } else {
      this.medioDePago = this.medioDePagoDisplay;
    }
  }

  //---------------------------------------------------------------------------------------------------------------------



  buscarCliente() {

    let header = 'Ingrese un cliente';
    let inputs = [
      {
        name: 'identificadorCliente',
        placeholder: 'Ingrese algún identificador'
      }
    ];
    let buttons = [
      {
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Aceptar',
        handler: data => {
          this.showSplash = true;
          this.pedidosGetServ.buscarCliente(this.localStorageServ.localStorageObj["dataUser"].idUser, data['identificadorCliente']).then((arrayClientes: any) => {
            this.showSplash = false;
            if (arrayClientes.length == 1) {
              let cliente = arrayClientes[0];
              if (cliente.Activo == "1") {
                this.desviarLimpiezaObjCliente = true;
                this.cliente = cliente['Nombre'] + cliente['Apellidos'];
                this.clienteSeleccionado = cliente;
                this.dataFacturaServ.dataFactura.descuentoFijo = cliente["% Desc Fijo"];

                console.log('Se seleccionó al cliente: ')
                console.log(this.clienteSeleccionado)
              } else {
                this.toastServ.toastMensajeDelServidor("Este cliente no está activo", "error");
                return;
              }
            } else if (arrayClientes == 0) {
              this.toastServ.toastMensajeDelServidor('No se encontró ningún cliente');
            } else {
              let i;
              let alertInputs = [];
              for (i = 0; i <= arrayClientes.length - 1; i++) {
                let cliente = arrayClientes[i];
                if (cliente.Activo == "1") {
                  alertInputs.push({
                    type: 'radio',
                    label: cliente['Nombre'] + cliente['Apellidos'],
                    value: i,
                  });
                }
              }

              let header = 'Se encontró más de un cliente con ese identificador';
              let subHeader = 'Elija un cliente de la lista';
              let inputs = alertInputs;
              let buttons = [{
                text: 'Cancelar',
                role: 'cancel',
              },
              {
                text: 'Aceptar',
                handler: (indexSeleccion) => {
                  if (indexSeleccion == undefined) {
                    this.toastServ.toastMensajeDelServidor('Elija un cliente!');
                  } else {

                    this.desviarLimpiezaObjCliente = true;
                    this.cliente = arrayClientes[indexSeleccion]['Nombre'] + arrayClientes[indexSeleccion]['Apellidos'];
                    this.clienteSeleccionado = arrayClientes[indexSeleccion];
                    this.dataFacturaServ.dataFactura.descuentoFijo = arrayClientes[indexSeleccion]["% Desc Fijo"];

                    console.log('Se seleccionó al cliente: ')
                    console.log(this.clienteSeleccionado)
                  }

                }
              },];
              this.localStorageServ.presentAlert(header, subHeader, inputs, buttons);
            }
          });
        }
      }
    ]
    this.localStorageServ.presentAlert(header, inputs, inputs, buttons);
  }

  //---------------------------------------------------------------------------------------------------------------------


  habilitarCredito() {
    if (this.condicionVenta == '02') {
      this.creditoNoSeleccionado = false;
    } else {
      this.plazoCredito = undefined;
      this.creditoNoSeleccionado = true;
    }
  }

  //---------------------------------------------------------------------------------------------------------------------


  irAFacturasTotales() {
    let factura = this.dataFacturaServ.dataFactura;

    if (this.creditoNoSeleccionado == false && this.plazoCredito == undefined) {
      this.toastServ.toastMensajeDelServidor("Debe seleccionar un plazo de crédito", "error");
      return;
    }
    factura.id_condicion_venta = this.condicionVenta;
    factura.id_medio_pago = this.medioDePago;
    factura.id_moneda = this.moneda;

    if (this.plazoCredito == undefined) {
      factura.plazo_credito = "0";
    } else {
      var numeroString = this.plazoCredito.split(" ");
      factura.plazo_credito = numeroString[0];
    }

    factura.tipo_cambio = this.tarifaDeCambio;

    if (this.clienteSeleccionado["IdTipoIdentificación"] == undefined) {
      factura.id_tipo_identificacion = "";
      factura.identificacion_cliente = "";
      factura.cliente = this.cliente;
    } else {
      factura.id_tipo_identificacion = this.clienteSeleccionado["IdTipoIdentificación"];
      factura.identificacion_cliente = this.clienteSeleccionado["N° Identificacíon"];
      factura.cliente = this.clienteSeleccionado["Nombre"] + " " + this.clienteSeleccionado["Apellidos"];
      factura.emailCliente = this.clienteSeleccionado["correo"];
    }

    factura.observaciones = "SIN OBSERVACIONES";
    factura.isguardado = "S";
    console.log(factura);
    this.navCtrl.navigateForward("/detalles-productos");

  }

  //---------------------------------------------------------------------------------------------------------------------


  buscarTarifaDeCambio() {
    this.showSplash = true;
    let indexMoneda = this.monedas.findIndex((element) => { return element.id_moneda == this.moneda });
    this.pedidosGetServ.buscarTarifa(this.localStorageServ.localStorageObj["dataUser"].idUser, this.monedas[indexMoneda].id_moneda).then((data) => {
      this.showSplash = false;
      this.tarifaDeCambio = data[0]['tarifa'];
      this.nombreMonedaSelec = data[0]['codigo'];
    })
  }


  ngOnInit() {
  }

}
