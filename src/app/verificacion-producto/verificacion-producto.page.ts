import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../services/local-storage.service';
import { ToastService } from '../services/toast.service';
import { PedidosGetService } from '../services/pedidos-get.service';
import { NavController, Platform } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { PrintService } from '../services/print.service';
import { CommonOperationsService } from '../services/common-operations/common-operations.service';
import { ObjProducto, ObjUserData, ObjDatosEmisor } from 'src/interfaces/interfaces';
import { PrintStringProcessService } from '../services/print-string-process/print-string-process.service';

@Component({
  selector: 'app-verificacion-producto',
  templateUrl: './verificacion-producto.page.html',
  styleUrls: ['./verificacion-producto.page.scss'],
})
export class VerificacionProductoPage implements OnInit {

  showSplash: boolean = false
  arrayProductosDisplay = [];
  codigoProducto: any;
  cantidadProducto: number = 1;
  user: any;
  impresora: any;

  localizacion: string = "";
  observaciones: string = "";

  verificando: boolean = false;
  existenciaReal: any = 1;

  productoSeleccionado: any = {

  }

  diferenciaTotal: any = 0;

  datosEmisor:ObjDatosEmisor;



  constructor(public localStorageServ: LocalStorageService,
    private navCtrl: NavController,
    private toastServ: ToastService,
    private pedidosGetServ: PedidosGetService,
    private barcodeScanner: BarcodeScanner,
    private printServ: PrintService,
    private plt: Platform,
    private common: CommonOperationsService,
    private stringProcessPrint: PrintStringProcessService) {
      this.datosEmisor = this.localStorageServ.localStorageObj.datosEmisor;
    }

  iniciarVerif() {
    this.verificando = true;
  }

  ngOnInit() {
    this.user = this.localStorageServ.localStorageObj.dataUser;
    this.impresora = this.localStorageServ.localStorageObj.impresora;
    this.localizacion = this.localStorageServ.localStorageObj.dataUser.nom_localizacion;
  }
  dismiss() {
    this.navCtrl.navigateBack("/menu");
  }

  dismissAlert() {

    let header = "Atención";
    let subHeader = "¿Quiere realizar una nueva verificación? Perderá los datos de la verificación actual.";
    let buttons = [{
      text: "Cancel",
      role: "cancel"
    }, {
      text: "Aceptar",
      handler: () => {
        this.navCtrl.navigateBack("/menu");
      }
    }]
    this.localStorageServ.presentAlert(header, subHeader, undefined, buttons);
  }


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
          this.showSplash = true
          this.buscarProductoFN(data['productoIdentif']).then((resp: {
            status: string,
            data: any
          }) => {
            console.log(resp);
            if (resp.status == "fail") {
              this.toastServ.toastNoSeEncontroProducto();
              this.showSplash = false;
            } else if (resp.status == "unico") {

              this.showSplash = false;
              this.inicializarProducto(resp.data);
            } else if (resp.status == "array") {
              this.productSelector(resp.data);
            }
          });
        }
      }
    ];
    this.localStorageServ.presentAlert(header, undefined, inputs, buttons)
  }

  buscarProductoFN(productoIdentif) {

    // Devuelve unico e inicializa, fail o array.

    return new Promise((resolve) => {

      this.pedidosGetServ.buscarProducto(this.localStorageServ.localStorageObj['dataUser'].idUser, productoIdentif, this.localizacion)
        .then((productoArray: any) => {
          if (productoArray.length == 1) {

            // El producto buscado es único

            let producto = productoArray[0];
            let resp = {
              "status": "unico",
              "data": producto
            }
            resolve(resp);
          } else if (productoArray == 0) {
            let resp = {
              "status": "fail",
              "data": null
            }
            resolve(resp);
          } else {
            let resp = {
              "status": "array",
              "data": productoArray
            }
            resolve(resp);
          }
        });
    });
  }


  productSelector(arrayProductos) {
    this.showSplash = false;
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
            this.inicializarProducto(arrayProductos[indexSeleccion]);
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

  scan() {
    this.barcodeScanner.scan().then((barcodeData: any) => {
      this.busquedaProductoUnico(barcodeData.text).then((encontrado) => {
        if (encontrado) {
        } else {
          this.toastServ.toastNoSeEncontroProducto();
        }
      });

    }).catch(err => {
      console.log(err);
      this.toastServ.toastMensajeDelServidor('Ocurrió un error con el scan, intenteló nuevamente.')
    })
  }


  imprimir() {

    let printString = this.generarPrintString();
    console.log(printString)
    this.printServ.printFN(this.impresora, printString).then(() => {

    }).catch((error) => {
      if (error == "No hay impresora") {
        this.printServ.buscarImpresora("/verificacion-producto").then(() => {
        }).catch(() => {
        })
      }
    })
  }

  cantidadProductoFn(comando) {
    if (comando == 'agregar') {
      this.existenciaReal = this.existenciaReal + 1;
    } else {
      if (this.existenciaReal > 1) {
        this.existenciaReal = this.existenciaReal - 1;
      }
    }
    this.existenciaReal = Math.round(this.existenciaReal * 1000) / 1000;
  }

  breakAgregarProducto() {
    this.busquedaProductoUnico(this.codigoProducto).then(() => {
      this.agregarProducto();
    });
  }



  agregarProducto() {
    this.showSplash = true;
    if (this.codigoProducto == undefined) {
      this.showSplash = false;
      this.toastServ.toastMensajeDelServidor("Ingrese un producto", "error");
      return;
    }

    if (this.productoSeleccionado["Código Producto"] != this.codigoProducto) {
      this.breakAgregarProducto();
      this.showSplash = false;
      return;
    }

    if (this.productoSeleccionado == undefined) {
      this.toastServ.toastMensajeDelServidor("Eliga un producto", "error")
      this.showSplash = false;
      return;
    }



    let array = [this.existenciaReal];
    let analisisObj = this.common.checkStrOrNumberThreeDecimals(array);

    for (let i = 0; i < array.length; i++) {
      let valor = parseFloat(analisisObj["valores"][i]);
      if (i == 0) {
        this.existenciaReal = valor;
      }
    }

    if (analisisObj["status"] == "fail") {
      this.toastServ.toastCamposInvalidosProducto();
      this.showSplash = false;
      return;
    }


    for (let i = 0; i < array.length; i++) {
      let valor = parseFloat(analisisObj["valores"][i]);
      if (i == 0) {
        this.existenciaReal = valor;
      }
    }


    let displayStatus = undefined;


    if (this.existenciaReal < 0) {
      this.toastServ.toastCamposInvalidosProducto();
      this.showSplash = false;
      return;
    }

    if (this.arrayProductosDisplay.length == 0) {
      displayStatus = 'noProduct';
    } else {
      for (let i = 0; i <= this.arrayProductosDisplay.length - 1; i++) {
        if (this.arrayProductosDisplay[i]['Código Producto'] == this.codigoProducto) {
          console.log('Ya se encuentra el producto ingresado');
          this.showSplash = false;
          this.toastServ.toastMensajeDelServidor("El producto ya se encuentra ingresado", "success");
          return;
        }
      }
      displayStatus = 'noProduct';
    }

    if (displayStatus == 'noProduct') {
      this.insertProduct();
    }


  }

  scanDiv() {
    ////////////CODIGO|PP|
    if (this.plt.is("cordova")) {
      this.scan();
    } else {
      this.busquedaProductoUnico("001000").then((encontrado) => {
        if (encontrado) {
        } else {
          this.toastServ.toastNoSeEncontroProducto();
        }
      })
    }
  }

  // ---------------------------------------------------------------------------------------------------------------------



  insertProduct() {
    this.showSplash = false;

    //Subtotales
    let diferencia = parseFloat(this.existenciaReal) - parseFloat(this.productoSeleccionado.Existencia);
    // si la diferencia es positiva, hay mas existencia real que la nomral
    // Si la dif es negativa
    this.productoSeleccionado.diferencia = this.common.aproxXDecimals(diferencia, 3);
    this.diferenciaTotal = this.common.aproxXDecimals(diferencia, 3);
    this.arrayProductosDisplay.unshift(this.productoSeleccionado);
    this.showSplash = false;
    this.cantidadProducto = 1;

  }

  nuevoProductoCheck() {

    return new Promise((resolve) => {
      if (this.productoSeleccionado == undefined) {
        // Si voy acá es que no hay producto seleccionado, porque nunca se seleccionó uno y se ingresa a pelo
        this.busquedaProductoUnico().then((resp: any) => {
          if (resp.status == "fail") {
            this.toastServ.toastNoSeEncontroProducto();
          } else {
            resolve();
          }
        });
      } else {

        // Acá se mete si ya hay un producto seleccionado, pero puede ser que el codigo que esté ingresado no coincida con el codigo definido
        // en el producto seleccionado, que es un campo que se inicializa una vez que se buscan los datos del producto.

        if (this.productoSeleccionado['Código Producto'] == this.codigoProducto) {
          resolve();
        } else {
          this.busquedaProductoUnico().then((encontro) => {
            if (encontro) {
              resolve();
            } else {
              this.toastServ.toastNoSeEncontroProducto();
            }
          });
        }
      }
    });
  }



  inicializarProducto(producto) {

    console.log(producto)

    this.codigoProducto = producto['Código Producto'];

    this.productoSeleccionado = producto;

    console.log("Se inicializó un producto en las variables globales: ");
    console.log(this.productoSeleccionado);
    return;
  }

  busquedaProductoUnico(codigo?, tipo?) {

    // Se usa desde nuevo producto check y desde scan. En nuevo producto solo checkeo si cambio el codigo ingresado
    // Si cambió no llega nada, en el otro siempre llega un text.

    // Devuelve true si lo encontró y ya esta inizialicado,  y fail si no.

    if (tipo == "html") {
      this.showSplash = true;
    }

    if (codigo != undefined) {
      this.codigoProducto = codigo;
    }


    return new Promise((resolve) => {

      this.buscarProductoFN(this.codigoProducto).then((resp: any) => {

        if (resp.status == "fail") {
          this.showSplash = false;
          resolve(false);
        } else if (resp.status == "unico") {
          if (tipo == "html") {
            this.showSplash = false;
          }
          this.inicializarProducto(resp.data);
          resolve(true);
        } else {
          let haveProduct = this.barrerArrayDeBusquedaYCompararConCodigoIngresado(resp.data);
          if (haveProduct == false) {
            this.showSplash = false;
            resolve(false);
          } else {
            if (tipo == "html") {
              this.showSplash = false;
            }
            resolve(true);
          }
        }
      })
    })
  }

  // ---------------------------------------------------------------------------------------------------------------------

  barrerArrayDeBusquedaYCompararConCodigoIngresado(array) {

    for (let i = 0; i <= array.length - 1; i++) {
      if (array[i]['Código Producto'] == this.codigoProducto) {
        this.inicializarProducto(array[i]);
        return true;
      }
    }
    return false;
  }

  eliminarProducto(index) {
    let header = "Confirmación"
    let subHeader = '¿Está seguro que desea eliminar éste producto?'
    let buttons = [{
      text: 'Cancelar',
      role: 'cancel'
    }, {
      text: 'Aceptar',
      handler: () => {
        this.eliminarProductoFN(index);
      }
    }];
    let inputs = undefined;
    this.localStorageServ.presentAlert(header, subHeader, inputs, buttons)

  }


  // ---------------------------------------------------------------------------------------------------------------------



  eliminarProductoFN(index) {
    let producto = this.arrayProductosDisplay[index];
    this.arrayProductosDisplay.splice(index, 1);
  }

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ':' + seconds + " " + ampm;
    return strTime;
  }

  generarPrintString() {

    let date = new Date();
    let mes = date.getMonth() + 1;
    let dia = date.getDate();
    let año = date.getFullYear();
    let fecha = mes + "/" + dia + "/" + año;
    let hora = this.formatAMPM(date);
    let linealarga = "\n----------------------------------------\n";
    let direccionSplit = this.datosEmisor.direccion.split(",");
    let direccion = direccionSplit[1] + "," + direccionSplit[2];


    let user: ObjUserData = this.localStorageServ.localStorageObj.dataUser;
    let sucursal = user.sucursal;
    let usuario = user.usuario;
    let terminal = user.nro_terminal;
    let header = "\n\nCODIGO           DESCRIP             DIF"

    let printString1 = "        Verificacion inventario\n"
      + this.stringProcessPrint.centeredString(this.datosEmisor.nombre_comercial_cliente)
      + "\n" + this.stringProcessPrint.centeredString(this.datosEmisor.nombre_cliente)
      + "\n    Ced: "+ this.datosEmisor.identificacion_cliente
      + " | Tel: " + this.datosEmisor.telefono+"\n"
      + this.stringProcessPrint.centeredString(this.datosEmisor.correo)
      + "\n" + this.stringProcessPrint.centeredString(direccion)
      + "\n" + this.stringProcessPrint.centeredString(this.datosEmisor.sennas)
      + "\n\n\n"
      + "Fecha " + fecha + this.stringProcessPrint.cutString(hora, 40 - "Fecha ".length - fecha.length, "left") + "\n"
      + "No CPU:MOVIL-854FD-3977\nSucursal:"
      + sucursal + "\nTerminal:"
      + terminal + "\nAtendido por: "
      + usuario
      + header
      + linealarga;



    let stringProductos = ""


    for (let i = 0; i < this.arrayProductosDisplay.length; i++) {
      let producto = this.arrayProductosDisplay[i];
      let linea = this.stringProcessPrint.generateLineProduct(producto["Código Producto"], producto["Nombre Producto"], Math.round(producto.diferencia * 1000) / 1000);
      stringProductos = stringProductos + linea;
    }
    stringProductos = stringProductos + linealarga;

    let stringFirmas = "     ------------------------------     \n"
      + "           Nombre autorizado\n\n\n"
      + "     ------------------------------     \n"
      + "           Firma autorizado\n"
      + " Orden emitida utilizando Wolksoftware\n"
      + "           www.wolksoftcr.com";

    return printString1 + stringProductos + this.observaciones + "\n\n" + stringFirmas + "\n\n\n\n";
  }




}
