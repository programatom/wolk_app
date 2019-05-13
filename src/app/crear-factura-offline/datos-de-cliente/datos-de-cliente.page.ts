import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';

// Service

import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { DataFacturaService } from 'src/app/services/data-factura.service';
import { AlertOptions } from '@ionic/core';
import { NavigationParamsService } from 'src/app/services/navigation-params.service';
import { ObjFactura } from 'src/interfaces/interfaces';
import { Router } from '@angular/router';




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
  clienteSeleccionado: any = {};
  creditoNoSeleccionado: boolean = true;

  desviarLimpiezaObjCliente:boolean = false;


  constructor(private alertCtrl: AlertController,
    public localStorageServ: LocalStorageService,
    private toastServ: ToastService,
    public dataFacturaServ: DataFacturaService,
    private navParams: NavigationParamsService,
    private navCtrl: NavController,
    private router: Router) {
      console.log(this.dataFacturaServ.dataFacturaOffline)
    }
  //---------------------------------------------------------------------------------------------------------------------

  limpiarObjCliente(){
    if(this.desviarLimpiezaObjCliente){
      this.desviarLimpiezaObjCliente = false;
      console.log("Se desvía la limpieza de la variable cliente")
    }else{
      console.log("Se limpia la variable cliente")
      this.clienteSeleccionado = {};
    }
  }

  selectMedioDePago() {

    if (this.medioDePagoDisplay == 'Otro') {
      console.log('entre en otro')
      let objAlert = {
        title: 'Ingrese el medio de pago',
        inputs: [
          {
            name: 'medioPago',
            placeholder: 'Medio de pago',
          }
        ],
        buttons: [
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
        ]
      };
      this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);
    } else {
      this.medioDePago = this.medioDePagoDisplay;
    }
  }

  //---------------------------------------------------------------------------------------------------------------------



  buscarCliente() {
    let objAlert1 = {
      title: 'Ingrese un cliente',
      inputs: [
        {
          name: 'identificadorCliente',
          placeholder: 'Ingrese algún identificador'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aceptar',
          handler: data => {

            let identif = data['identificadorCliente'];
            let arrayClientes = this.buscarArrayReturnResults(this.localStorageServ.localStorageObj.clientes, identif);

            if (arrayClientes.length == 1) {
              let cliente = arrayClientes[0];
              if(cliente.Activo == "1"){
                this.desviarLimpiezaObjCliente = true;
                this.cliente = cliente['Nombre'] + cliente['Apellidos'];
                this.clienteSeleccionado = cliente;
                this.dataFacturaServ.dataFacturaOffline.descuentoFijo = cliente["% Desc Fijo"];
                console.log('Se seleccionó al cliente: ');
                console.log(this.clienteSeleccionado)
              }else{
                this.toastServ.toastMensajeDelServidor("Este cliente no está activo", "error");
                return;
              }
            } else if (arrayClientes.length == 0) {
              this.toastServ.toastMensajeDelServidor('No se encontró ningún cliente');
            } else {
              let i;
              let alertInputs = [];
              for (i = 0; i <= arrayClientes.length - 1; i++) {
                alertInputs.push({
                  type: 'radio',
                  label: arrayClientes[i]['Nombre'] + arrayClientes[i]['Apellidos'],
                  value: i,
                });
              }
              let objAlert2 = {
                title: 'Se encontró más de un cliente con ese identificador',
                subTitle: 'Elija un cliente de la lista',
                inputs: alertInputs,
                buttons: [{
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
                      this.dataFacturaServ.dataFacturaOffline.descuentoFijo = arrayClientes[indexSeleccion]["% Desc Fijo"];

                      console.log('Se seleccionó al cliente: ')
                      console.log(this.dataFacturaServ.dataFacturaOffline.descuentoFijo)
                    }

                  }
                },]

              };
              this.localStorageServ.presentAlert(objAlert2["title"], objAlert2["subTitle"], objAlert2["inputs"], objAlert2["buttons"]);
            }
          }
        }
      ]
    };
    this.localStorageServ.presentAlert(objAlert1["title"], objAlert1["subTitle"], objAlert1["inputs"], objAlert1["buttons"]);
  }

  //---------------------------------------------------------------------------------------------------------------------


  buscarArrayReturnResults(array, filtro) {

    // Tengo que definir las keys que valen la pena
    let searchKeys = ["Nombre", "Apellidos", "Empresa", "N° Identificacíon"];

    let arrayLength = array.length;
    let results = new Array();

    for (let i = 0; i < arrayLength; i++) {
      let match = false;
      let obj = new Object();
      obj = array[i];
      let keys = Object.keys(obj);
      let keysLength = keys.length;
      for (let j = 0; j < keysLength; j++) {
        let key = keys[j];
        for (let k = 0; k < searchKeys.length; k++) {
          let searchKey = searchKeys[k];
          if (searchKey == key) {
            let value = obj[key];
            if (isNaN(value) && isNaN(filtro)) {
              if (value.toLowerCase().search((filtro).toLowerCase()) != - 1) {
                // AGREGADO POR NECESIDAD PUNTUAL !!!!!!!!
                if(obj["Activo"] == "1"){
                  results.push(obj);
                  match = true;
                }

                break;
              }
            } else {
              if (value.toString().search(filtro.toString().toLowerCase()) != -1) {
                // AGREGADO POR NECESIDAD PUNTUAL !!!!!!!!
                if(obj["Activo"] == "1"){
                  results.push(obj);
                  match = true;
                }
                break;
              }
            }
          }
        }
        if (match) {
          break;
        }
      }
    }
    console.log(results)
    return results;
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
  checkExistenceOfVariableInArray(){

  }

  irAFacturasTotales() {
    let factura = this.dataFacturaServ.dataFacturaOffline;

    factura.id_condicion_venta = this.condicionVenta;
    this.dataFacturaServ.dataFacturaOffline.facturaOfflineVisualize = [];

    let indexCondicion = this.localStorageServ.localStorageObj.condicionesVenta.findIndex((element) => { return element.id_condicion_venta == this.condicionVenta })
    let condicionVenta = this.localStorageServ.localStorageObj.condicionesVenta[indexCondicion].condicion_venta;
    if( condicionVenta == "Crédito" ||
    condicionVenta == "Credito" ||
    condicionVenta == "credito" ){
      if(this.plazoCredito == undefined){
        this.toastServ.toastMensajeDelServidor("Debe seleccionar un plazo de crédito", "error");
        return;
      }
    }


    factura.facturaOfflineVisualize.push({
      "variable": "Condición de venta",
      "valor": this.localStorageServ.localStorageObj.condicionesVenta[indexCondicion].condicion_venta,
      "id": this.condicionVenta
    })

    factura.id_medio_pago = this.medioDePago;

    let indexMedio = this.localStorageServ.localStorageObj.mediosDePago.findIndex((element) => { return element.id_medio_pago == this.medioDePago })
    factura.facturaOfflineVisualize.push({
      "variable": "Medio de pago",
      "valor": this.localStorageServ.localStorageObj.mediosDePago[indexMedio].medio_pago,
      "id": this.medioDePago
    });

    if (this.plazoCredito == undefined) {
      factura.plazo_credito = "0";
    } else {
      var numeroString = this.plazoCredito.split(" ");
      factura.plazo_credito = numeroString[0];
      factura.facturaOfflineVisualize.push({
        "variable": "Plazo de crédito",
        "valor": numeroString[0],
      });
    }

    factura.tipo_cambio = this.tarifaDeCambio;
    factura.id_moneda = this.moneda;
    factura.consecutivoMH = "0";

    if (this.clienteSeleccionado["IdTipoIdentificación"] == undefined) {
      factura.id_tipo_identificacion = "";
      factura.identificacion_cliente = "";
      factura.cliente = this.cliente;
    } else {
      factura.id_tipo_identificacion = this.clienteSeleccionado["IdTipoIdentificación"];
      factura.identificacion_cliente = this.clienteSeleccionado["N° Identificacíon"];
      factura.cliente = this.clienteSeleccionado["Nombre"] + " " + this.clienteSeleccionado["Apellidos"];
      console.log(this.clienteSeleccionado)
      if(this.clienteSeleccionado["correo"] != null && this.clienteSeleccionado["correo"] != undefined){
        factura.emailCliente = this.clienteSeleccionado["correo"];
      }else{
        factura.emailCliente = "";
      }
      console.log(this.clienteSeleccionado)
    }

    factura.observaciones = "SIN OBSERVACIONES";
    factura.isguardado = "S";
    console.log(this.dataFacturaServ.dataFacturaOffline);

    this.navParams.clientData.moneda = "CRC";
    this.navParams.clientData.tarifa = 1;
    this.navParams.clientData.cliente = this.clienteSeleccionado;

    this.navCtrl.navigateForward('/crear-factura-offline/detalles-productos');
  }

  //---------------------------------------------------------------------------------------------------------------------


  ngOnDestroy() {
    if(this.router.url == "/menu-crear-factura"){
      console.log("Se vuelve al default la factura offline");
      this.dataFacturaServ.dataFacturaOffline = new Object() as ObjFactura;
    }
    this.dataFacturaServ.dataFacturaOffline.clienteSeleccionado = this.clienteSeleccionado;
  }

  ngOnInit() {
    if (this.dataFacturaServ.dataFacturaOffline.clienteSeleccionado != undefined) {
      this.clienteSeleccionado = this.dataFacturaServ.dataFacturaOffline.clienteSeleccionado;
    }
  }

}
