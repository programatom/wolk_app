import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import { Events, Platform } from '@ionic/angular';
import { ToastService } from '../toast.service';
import { PedidosGetService } from '../pedidos-get.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Injectable({
  providedIn: 'root'
})
export class ProductListLogicService {

  codigoProducto = "";
  CCV = false;


  dismissCambioCheckBoxAutorizacion: any = false;
  camposHabilitados: any = false;
  camposDeshabilitados: boolean = true;
  descuentoProducto: number = 0;
  exonerarImpuestosBool: boolean = false;

  precioProducto
  cantidadProducto

  constructor(private localStorageServ: LocalStorageService,
    private event: Events,
    private toastServ: ToastService,
    private pedidosGetServ: PedidosGetService,
    private plt: Platform,
    private barcodeScanner: BarcodeScanner) { }


  buscarProducto() {
    let header = 'Ingrese un producto';
    let inputs = [
      {
        name: 'productoIdentif',
        placeholder: 'Ingrese el nombre o el código'
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
          this.event.publish("loading");
          this.buscarProductoFN(data['productoIdentif']).then((resp: {
            status: string,
            data: any
          }) => {
            console.log(resp);
            if (resp.status == "fail") {
              this.toastServ.toastNoSeEncontroProducto();
              this.event.publish("end-loading")
            } else if (resp.status == "unico") {

              this.event.publish("end-loading")
              this.event.publish("inicializar", resp.data)
            } else if (resp.status == "array") {
              this.productSelector(resp.data);
            }
          });
        }
      }
    ];
    this.localStorageServ.presentAlert(header, undefined, inputs, buttons)
  }

  productSelector(arrayProductos) {
    this.event.publish("end-loading");
    return new Promise((resolve, reject) => {
      let i;
      let alertInputs = [];

      for (i = 0; i <= arrayProductos.length - 1; i++) {
        alertInputs.push({
          type: 'radio',
          label: arrayProductos[i]['Nombre Producto'],
          value: i,
        });
      }
      let header = 'Se encontró más de un producto';
      let subHeader = 'Elija un producto de la lista'
      let inputs = alertInputs
      let buttons = [{
        text: 'Cancelar',
        role: 'cancel',
      },
      {
        text: 'Aceptar',
        handler: (indexSeleccion) => {
          if (indexSeleccion == undefined) {
            this.toastServ.toastMensajeDelServidor('Debe seleccionar un producto!');
          } else {
            this.event.publish("inicializar", arrayProductos[indexSeleccion]);
          }
        }
      }, {
        text: 'Ver info',
        handler: (indexSeleccion) => {
          let header = 'Info de: ' + arrayProductos[indexSeleccion]['Nombre Producto']
          let message = '<strong>Existencia: </strong>' + arrayProductos[indexSeleccion]['Existencia'] + '<br>' +
            '<strong>Categoria: </strong>' + arrayProductos[indexSeleccion]['Categoria'] + '<br>' +
            '<strong>Código Producto: </strong>' + arrayProductos[indexSeleccion]['Código Producto'] + '<br>' +
            '<strong>Código Proveedor: </strong>' + arrayProductos[indexSeleccion]['Código Proveedor'] + '<br>' +
            '<strong>Existencia Minima: </strong>' + arrayProductos[indexSeleccion]['Existencia Minima'] + '<br>' +
            '<strong>Precio Venta sin Imp: </strong>' + arrayProductos[indexSeleccion]['Precio Venta sin Imp'] + '<br>' +
            '<strong>Unidades a Reponer: </strong>' + arrayProductos[indexSeleccion]['Unidades a Reponer'] + '<br>'
          let inputs = undefined;
          let buttons = [{
            text: 'Volver',
            handler: () => {
              this.productSelector(arrayProductos);
            }
          }];
          this.localStorageServ.presentAlert(header, undefined, inputs, buttons, message)
        }
      }]
      this.localStorageServ.presentAlert(header, subHeader, inputs, buttons)
    })
  }

  buscarProductoFN(productoIdentif) {

    // Devuelve unico e inicializa, fail o array.

    return new Promise((resolve, ) => {

      this.pedidosGetServ.buscarProducto(this.localStorageServ.localStorageObj['dataUser'].idUser, productoIdentif, this.localStorageServ.localStorageObj['dataUser'].nom_localizacion)
        .then((productoArray: any) => {
          if (productoArray.length == 1) {

            // El producto buscado es único

            let producto = productoArray[0];
            let resp =  {
              "status": "unico",
              "data": producto
            }
            resolve(resp);
          } else if (productoArray == 0) {
            let resp =  {
              "status": "fail",
              "data": null
            }
            resolve(resp);
          } else {
            let resp =  {
              "status": "array",
              "data": productoArray
            }
            resolve(resp);
          }
        });
    });
  }

  scanDiv() {
    ////////////CODIGO|PP|
    if (this.plt.is("cordova")) {
      this.scan();
    } else {
      let data = "100000100003"; //Esto serían 10 kilos con 0 decimales
      data = "100000015503";//Esto sería 1 kilos con 55 decimales

      this.procesarTextoCCV(data);
    }
  }

  scan() {
    this.barcodeScanner.scan().then((barcodeData: any) => {
      if (this.CCV) {
        this.procesarTextoCCV(barcodeData.text);
      } else {
        this.busquedaProductoUnico(barcodeData.text).then((encontrado) => {
          if (encontrado) {
            this.event.publish("agregar-producto");
          } else {
            this.toastServ.toastNoSeEncontroProducto();
          }
        });
      }
    }).catch(err => {
      console.log(err);
      this.toastServ.toastMensajeDelServidor('Ocurrió un error con el scan, intenteló nuevamente.')
    })
  }

  procesarTextoCCV(data) {

    let codigo = parseInt(data.substring(0, 6));
    //this.codigoProducto = codigo;

    let codiCant = parseInt(data.substring(6, 8));
    let codiPredecimal = data.substring(8, 11);
    let codiCantCompleto = codiCant + "." + codiPredecimal;
    //this.cantidadProducto = parseFloat(codiCantCompleto);
    this.event.publish("scan-code", {
      "codigo": codigo,
      "cantidad": parseFloat(codiCantCompleto),
      "CCVException": true
    });

    //this.CCVException = true;

    this.busquedaProductoUnico(codigo).then((encontrado) => {
      if (encontrado) {
        this.event.publish("agregar-producto");
      } else {
        this.toastServ.toastNoSeEncontroProducto();
      }
    });
  }


  busquedaProductoUnico(codigo?, tipo?) {

    // Se usa desde nuevo producto check y desde scan. En nuevo producto solo checkeo si cambio el codigo ingresado
    // Si cambió no llega nada, en el otro siempre llega un text.

    // Devuelve true si lo encontró y ya esta inizialicado,  y fail si no.

    if (tipo == "html") {
      this.event.publish("loading");
    }

    if (codigo != undefined) {
      this.codigoProducto = codigo;
    }


    return new Promise((resolve) => {

      this.buscarProductoFN(this.codigoProducto).then((resp: any) => {

        if (resp.status == "fail") {
          this.event.publish("end-loading");
          resolve(false);
        } else if (resp.status == "unico") {
          if (tipo == "html") {
            this.event.publish("end-loading");
          }
          this.event.publish("inicializar", resp.data)
          resolve(true);
        } else {
          let haveProduct = this.barrerArrayDeBusquedaYCompararConCodigoIngresado(resp.data);
          if (haveProduct == false) {
            this.event.publish("end-loading");
            resolve(false);
          } else {
            if (tipo == "html") {
              this.event.publish("end-loading");
            }
            resolve(true);
          }
        }
      })
    })
  }


  barrerArrayDeBusquedaYCompararConCodigoIngresado(array) {

    for (let i = 0; i <= array.length - 1; i++) {
      if (array[i]['Código Producto'] == this.codigoProducto) {
        this.event.publish("inicializar" , array[i])
        return true;
      }
    }
    return false;
  }

  habilitarCampos() {
    if (this.dismissCambioCheckBoxAutorizacion) {
      console.log("se desvia el ion change")
      this.dismissCambioCheckBoxAutorizacion = false;
    } else {
      if (this.localStorageServ.localStorageObj['dataUser'].msg != '03') {
        this.event.publish("habilitar-campos" , true);
      } else {
        this.event.publish("habilitar-campos" , false);
        this.dismissCambioCheckBoxAutorizacion = true;

        let header = "No está autorizado!";
        let buttons = [{
          text:"Entendido!",
          message: "Su rol es: " + this.localStorageServ.localStorageObj.dataUser.msg + " y debería ser 02 o 03",
          role:"cancel"
        }]
        this.localStorageServ.presentAlert(header, undefined, undefined, buttons);
      }
    }
  }


}
