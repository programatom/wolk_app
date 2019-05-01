import { Component, OnInit } from '@angular/core';
import {
  AlertController,
  Platform, Events, NavController
} from '@ionic/angular';

// Plugins

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

// Providers
import { LocalStorageService } from '../../services/local-storage.service';
import { PedidosGetService } from '../../services/pedidos-get.service';
import { PedidosPostService } from '../../services/pedidos-post.service';
import { DataFacturaService } from '../../services/data-factura.service';
import { ToastService } from '../../services/toast.service';
import { AlertOptions } from '@ionic/core';
import { CommonOperationsService } from 'src/app/services/common-operations/common-operations.service';


@Component({
  selector: 'app-detalles-productos',
  templateUrl: './detalles-productos.page.html',
  styleUrls: ['./detalles-productos.page.scss'],
})
export class DetallesProductosPage implements OnInit {


  // Agregar producto vars
  idFactura: any;

  // NG model
  codigoProducto: any = "";
  cantidadProducto: any = 1;
  descuentoProducto: any = 0;
  precioProductoDisplay: any;
  camposHabilitados: boolean = false;
  camposDeshabilitados: boolean = true;
  exonerarImpuestos: string = "0";
  exonerarImpuestosBool: boolean = false;
  verMas: boolean = false;
  urlFoto: string;
  precioProducto: any = 0;

  arrayProductosDisplay: any = [];

  subTotal: any = '';
  monoDescuento: any = '';
  subTotalDesc: any = '';
  monImpuesto: any = '';
  totalFinal: any = '';

  //Variables Operativas
  dismissCambioCheckBoxAutorizacion: boolean = false;
  productoSeleccionado: any;
  showSplash: boolean = false;
  CCV: boolean = false;
  CCVException = false;

  constructor(private alertCtrl: AlertController,
    private plt: Platform,
    private event: Events,
    public localStorageServ: LocalStorageService,
    private pedidosGetServ: PedidosGetService,
    private pedidosPostServ: PedidosPostService,
    private toastServ: ToastService,
    public dataFacturaServ: DataFacturaService,
    private navCtrl: NavController,
    private barcodeScanner: BarcodeScanner,
    private common: CommonOperationsService) {

      console.log(this.localStorageServ.localStorageObj["dataUser"])
      if(this.plt.is("cordova")){

      }else{
        this.codigoProducto= "002901";
      }


    this.event.subscribe('errorServidor', () => {
      this.showSplash = false;
    })
    //this.dataFacturaServ.dataFactura.id_facturaPV = 21

    if (this.localStorageServ.localStorageObj['dataUser'] != null) {
      if (this.plt.is('cordova')) {
        if (this.plt.is('ios')) {
          this.urlFoto = this.localStorageServ.localStorageObj['dataUser'].logo;
        } else {
        }
      } else {
        this.urlFoto = this.localStorageServ.localStorageObj['dataUser'].logo;
      }
    } else {
      this.navCtrl.navigateRoot('LoginPage');
    }

    let productosGuardados = this.dataFacturaServ.arrayProductos;
    if (productosGuardados != undefined) {
      this.arrayProductosDisplay = productosGuardados;
    }
  }

  boolToString() {
    if (this.exonerarImpuestosBool == true) {
      this.exonerarImpuestos = "1";
    } else {
      this.exonerarImpuestos = "0";
    }
  }

  //--------------------------------------------------------------------------------------------------------------------------------

  habilitarCampos() {

    if (this.dismissCambioCheckBoxAutorizacion) {
      this.dismissCambioCheckBoxAutorizacion = false;
    } else {
      if (this.localStorageServ.localStorageObj['dataUser'].msg != '03') {
        if (this.camposHabilitados) {
          this.camposDeshabilitados = false;
          this.descuentoProducto = 0;
          this.exonerarImpuestosBool = false;
        } else {
          this.camposDeshabilitados = true;
        }
      } else {
        this.dismissCambioCheckBoxAutorizacion = false;
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


  //--------------------------------------------------------------------------------------------------------------------------------



  cantidadProductoFn(comando) {
    if (comando == 'agregar') {
      this.cantidadProducto = this.cantidadProducto + 1;
    } else {
      if (this.cantidadProducto > 1) {
        this.cantidadProducto = this.cantidadProducto - 1;
      }
    }
    this.cantidadProducto = Math.round(this.cantidadProducto*1000)/1000;
  }


  //--------------------------------------------------------------------------------------------------------------------------------



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
          this.buscarProductoFN(data['productoIdentif']).then((resp:{
            status:string,
            data:any
          })=>{
            console.log(resp);
            if(resp.status == "fail"){
              this.toastServ.toastNoSeEncontroProducto();
              this.showSplash = false;
            }else if(resp.status == "unico"){
              console.log("producto unico")
              this.showSplash = false;
              this.inicializarProducto(resp.data);
            }else if (resp.status == "array"){
              this.productSelector(resp.data);
            }
          });
        }
      }
    ];
    this.localStorageServ.presentAlert(header, undefined, inputs, buttons)
  }


  //--------------------------------------------------------------------------------------------------------------------------------



  buscarProductoFN(productoIdentif) {

    // Devuelve unico e inicializa, fail o array.

    return new Promise((resolve,) => {

      this.pedidosGetServ.buscarProducto(this.localStorageServ.localStorageObj['dataUser'].idUser, productoIdentif, this.localStorageServ.localStorageObj['dataUser'].nom_localizacion)
        .then((productoArray: any) => {
          if (productoArray.length == 1) {

            // El producto buscado es único

            let producto = productoArray[0];
            let resp = {
              "status":"unico",
              "data": producto
            }
            resolve(resp);
          } else if (productoArray == 0) {
            let resp = {
              "status":"fail",
              "data": null
            }
            resolve(resp);
          } else {
            let resp = {
              "status":"array",
              "data": productoArray
            }
            resolve(resp);
          }
        });
    });
  }


  //--------------------------------------------------------------------------------------------------------------------------------


  inicializarProducto(producto) {

    this.descuentoProducto = 0;
    this.exonerarImpuestosBool = false;

    if(this.CCVException == false){
      this.cantidadProducto = 1;
    }else{
      this.CCVException = false;
    }
    this.codigoProducto = producto['Código Producto'];

    this.precioProductoDisplay = producto['Precio Venta sin Imp'] + ' $';
    this.precioProducto = producto['Precio Venta sin Imp'];

    this.productoSeleccionado = producto;
    this.productoSeleccionado['existenciaInicial'] = this.productoSeleccionado.Existencia;

    console.log("Se inicializó un producto en las variables globales: ");
    console.log(this.productoSeleccionado);
    return;
  }


  //--------------------------------------------------------------------------------------------------------------------------------


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
            console.log("acepto")
            this.inicializarProducto(arrayProductos[indexSeleccion]);
            this.showSplash = false;
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




  //--------------------------------------------------------------------------------------------------------------------------------

  agregarProducto() {


    // FILTRO DE STR EN DATOS NUMÉRICOS
    let array = [this.cantidadProducto, this.precioProducto, this.descuentoProducto];
    let analisisObj = this.common.checkStrOrNumberThreeDecimals(array);

    if (analisisObj["status"] == "fail"){
      this.toastServ.toastCamposInvalidosProducto();
      return;
    }

    for (let i = 0; i < array.length; i ++){
      let valor = parseFloat(analisisObj["valores"][i]);
      if(i == 0){
        this.cantidadProducto = valor;
      }else if(i == 1){
        this.precioProducto = valor;
      }else if(i == 2){
        this.descuentoProducto = valor;
      }
    }

    if(this.descuentoProducto + this.dataFacturaServ.dataFactura.descuentoFijo > 100){
      this.toastServ.toastMensajeDelServidor("El descuento total no puede ser mayor a 100", "error")
      return;
    }else if (this.descuentoProducto + this.dataFacturaServ.dataFactura.descuentoFijo < 0){
      this.toastServ.toastMensajeDelServidor("El descuento total no puede ser menor a 0", "error")
      return;
    }else{
      var descuentoTotal = this.descuentoProducto + this.dataFacturaServ.dataFactura.descuentoFijo;
    }



    let displayStatus = undefined;
    let indexMatch;


    if (this.arrayProductosDisplay.length == 0) {
      displayStatus = 'noProduct';
      if (this.cantidadProducto == 0 || this.cantidadProducto < 0) {
        this.toastServ.toastCamposInvalidosProducto();
        return;
      }
    } else {

      for (let i = 0; i <= this.arrayProductosDisplay.length - 1; i++) {
        if (this.arrayProductosDisplay[i]['Código Producto'] == this.codigoProducto) {
          console.log('Ya se encuentra el producto ingresado');
          indexMatch = i;
          displayStatus = 'productoYaIngresado'
        }
      }
      if (displayStatus == undefined) {
        displayStatus = "noProduct";
        if (this.cantidadProducto == 0) {
          this.toastServ.toastCamposInvalidosProducto();
          return;
        }
      }
    }


    this.boolToString();
    this.showSplash = true;
    console.log("El producto tiene un descuento total de: " + descuentoTotal);
    this.nuevoProductoCheck().then(() => {
      this.pedidosPostServ.agregarProducto(
        this.localStorageServ.localStorageObj['dataUser'].idUser,
        this.dataFacturaServ.dataFactura.id_facturaPV,
        this.codigoProducto,
        this.localStorageServ.localStorageObj['dataUser'].nom_localizacion,
        this.cantidadProducto,
        descuentoTotal,
        this.precioProducto,
        this.exonerarImpuestos,
        this.localStorageServ.localStorageObj['dataUser'].usuario
      ).then((resp) => {
        if (resp['result'] == "EXITO") {
          this.pedidosGetServ.selectTotales(this.localStorageServ.localStorageObj['dataUser'].idUser, this.localStorageServ.localStorageObj['dataUser'].nom_localizacion, this.dataFacturaServ.dataFactura.id_facturaPV).then((data: any) => {
            if (data.SUBTOTAL != null) {
              this.subTotal = data.SUBTOTAL;
              this.monoDescuento = data.MONDESCUENTO;
              this.subTotalDesc = data.SUBTOTALDESC;
              this.monImpuesto = data.MONIMPUESTO;
              this.totalFinal = data.TOTALFINAL;
            }
            this.pedidosGetServ.selectTotalesUbicaGrid(this.localStorageServ.localStorageObj['dataUser'].idUser, this.localStorageServ.localStorageObj['dataUser'].nom_localizacion, this.dataFacturaServ.dataFactura.id_facturaPV).then((totalesLineas: any) => {
              // Array con todos los productos cargados.
              totalesLineas.reverse();
              console.log(totalesLineas)
              if (displayStatus == 'noProduct') {
                this.insertProduct(totalesLineas);
              } else {
                if (displayStatus == 'productoYaIngresado') {
                  this.updateProduct(indexMatch, totalesLineas);
                  return;
                }
              }
            })
          });
        } else {
          this.showSplash = false;
          console.log('No hubo éxito: ');
          console.log(resp);
          this.toastServ.toastMensajeDelServidor(resp['result']);
        }

      })
    });
  }


  //--------------------------------------------------------------------------------------------------------------------------------



  nuevoProductoCheck() {

    return new Promise((resolve) => {
      if (this.productoSeleccionado == undefined) {
        // Si voy acá es que no hay producto seleccionado, porque nunca se seleccionó uno y se ingresa a pelo
        this.busquedaProductoUnico().then((encontro) => {
          if (encontro) {
            resolve();
          }else{
            this.toastServ.toastNoSeEncontroProducto();
          }
        });
      } else {

        // Acá se mete si ya hay un producto seleccionado, pero puede ser que el codigo que esté ingresado no coincida con el codigo definido
        // en el producto seleccionado, que es un campo que se inicializa una vez que se buscan los datos del producto.

        if (this.productoSeleccionado['Código Producto'] == this.codigoProducto) {
          resolve();
        } else {
          this.busquedaProductoUnico().then((encontro) => {
            console.log(encontro)
            if (encontro) {
              resolve();
            }else{
              this.toastServ.toastNoSeEncontroProducto();
            }
          });
        }
      }
    });
  }


  //--------------------------------------------------------------------------------------------------------------------------------



  busquedaProductoUnico(codigo?, tipo?) {

    // Se usa desde nuevo producto check y desde scan. En nuevo producto solo checkeo si cambio el codigo ingresado
    // Si cambió no llega nada, en el otro siempre llega un text.

    // Devuelve true si lo encontró y ya esta inizialicado,  y fail si no.

    if(tipo == "html"){
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
        }else if( resp.status == "unico"){

          if(tipo == "html"){
            this.showSplash = false;
          }

          this.inicializarProducto(resp.data);
          resolve(true);
        } else {

          let haveProduct = this.barrerArrayDeBusquedaYCompararConCodigoIngresado(resp.data);
          if (haveProduct == false) {
            console.log("No se encontró")
            this.showSplash = false;
            resolve(false);
          }else{
            if(tipo == "html"){
              this.showSplash = false;
            }
            resolve(true);
          }
        }
      })
    })
  }

  // ---------------------------------------------------------------------------------------------------------------------

  barrerArrayDeBusquedaYCompararConCodigoIngresado(array){

    for (let i = 0; i <= array.length - 1; i++) {
      console.log(array[i])
      if (array[i]['Código Producto'] == this.codigoProducto) {
        this.inicializarProducto(array[i]);
        return true;
      }
    }

    return false;
  }

  // ---------------------------------------------------------------------------------------------------------------------


  updateProduct(i, totalesLineas) {
    // Subtotales
    this.subTotalesInsert(this.arrayProductosDisplay[i], totalesLineas, i)

    this.arrayProductosDisplay[i]['Precio Venta sin Imp'] = this.precioProducto;
    this.arrayProductosDisplay[i].Existencia = this.productoSeleccionado.Existencia - this.cantidadProducto;
    this.arrayProductosDisplay[i]['Cantidad'] = this.common.aproxXDecimals(this.arrayProductosDisplay[i]['Cantidad'] + this.cantidadProducto, 3);
    this.arrayProductosDisplay[i]['descuento'] = this.common.aproxXDecimals(this.descuentoProducto + this.dataFacturaServ.dataFactura.descuentoFijo, 2);
    this.showSplash = false;
  }

  // ---------------------------------------------------------------------------------------------------------------------



  insertProduct(totalesLineas) {
    this.productoSeleccionado.Existencia = this.productoSeleccionado.existenciaInicial - this.cantidadProducto;
    this.productoSeleccionado['Precio Venta sin Imp'] = this.precioProducto;
    this.productoSeleccionado['Cantidad'] = parseFloat(this.cantidadProducto);
    this.productoSeleccionado['verMas'] = false;
    this.productoSeleccionado['icono'] = 'add-circle';
    this.productoSeleccionado["descuento"] = this.common.aproxXDecimals(this.descuentoProducto + this.dataFacturaServ.dataFactura.descuentoFijo , 2);

    //Subtotales
    this.productoSeleccionado["subTotales"] = {};
    this.subTotalesInsert(this.productoSeleccionado, totalesLineas, 0);
    this.arrayProductosDisplay.unshift(this.productoSeleccionado);
    this.showSplash = false;

  }

  // ---------------------------------------------------------------------------------------------------------------------


  subTotalesInsert(array, totalesLineas, index) {

    array["subTotales"]["Sub Total"] = totalesLineas[index]["Sub Total"]
    array["subTotales"]["Descuento"] = totalesLineas[index]["Descuento"]
    array["subTotales"]["Sub Total descuento"] = totalesLineas[index]["Sub Total descuento"]
    array["subTotales"]["Impuestos"] = totalesLineas[index]["Impuestos"]
    array["subTotales"]["Total Linea"] = totalesLineas[index]["Total Linea"]
  }

  // ---------------------------------------------------------------------------------------------------------------------


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
    this.showSplash = true;
    let codigoProductoAEliminar = this.arrayProductosDisplay[index]['Código Producto'];
    this.pedidosPostServ.eliminarProducto(
      this.localStorageServ.localStorageObj['dataUser'].idUser,
      this.dataFacturaServ.dataFactura.id_facturaPV,
      codigoProductoAEliminar,
      this.localStorageServ.localStorageObj['dataUser'].nom_localizacion,
      this.arrayProductosDisplay[index]['Cantidad'],
      this.localStorageServ.localStorageObj['dataUser'].NombreUsuario
    ).then((resp) => {
      if (resp['result'] == 'EXITO') {
        this.pedidosGetServ.selectTotales(this.localStorageServ.localStorageObj['dataUser'].idUser, this.localStorageServ.localStorageObj['dataUser'].nom_localizacion, this.dataFacturaServ.dataFactura.id_facturaPV).then((data: any) => {
          this.showSplash = false;
          if (data.SUBTOTAL != null) {
            this.subTotal = data.SUBTOTAL;
            this.monoDescuento = data.MONDESCUENTO;
            this.subTotalDesc = data.SUBTOTALDESC;
            this.monImpuesto = data.MONIMPUESTO;
            this.totalFinal = data.TOTALFINAL;
            this.arrayProductosDisplay.splice(index, 1);
          } else {
            this.subTotal = 0;
            this.monoDescuento = 0;
            this.subTotalDesc = 0;
            this.monImpuesto = 0;
            this.totalFinal = 0;
            this.arrayProductosDisplay.splice(index, 1);
          }
        });
      } else {
        this.toastServ.toastMensajeDelServidor('Ocurrió algún error con el servidor, inténtelo nuevamente.');
      }
    })
  }


  // ---------------------------------------------------------------------------------------------------------------------


  verMasProducto(i) {
    if (this.arrayProductosDisplay[i]['verMas'] == true) {
      this.arrayProductosDisplay[i]['icono'] = 'add-circle';
      this.arrayProductosDisplay[i]['verMas'] = false;
    } else {
      this.arrayProductosDisplay[i]['icono'] = 'remove-circle';
      this.arrayProductosDisplay[i]['verMas'] = true;
    }
  }


  // ---------------------------------------------------------------------------------------------------------------------


  irAFactura() {
    console.log(this.dataFacturaServ.dataFactura)
    this.navCtrl.navigateForward('/facturas-totales');
  }


  // ---------------------------------------------------------------------------------------------------------------------


  scanDiv() {
    ////////////CODIGO|PP|
    if(this.plt.is("cordova")){
      this.scan();
    }else{
      let data = "100000100003"; //Esto serían 10 kilos con 0 decimales
      data = "100000015503";//Esto sería 1 kilos con 55 decimales

      this.procesarTextoCCV (data);
    }
  }
  // ---------------------------------------------------------------------------------------------------------------------


  procesarTextoCCV(data) {

    let codigo = parseInt(data.substring(0, 6));
    this.codigoProducto = codigo;
    let codiCant = parseInt(data.substring(6, 8));
    let codiPredecimal = data.substring(8, 11);
    let codiCantCompleto = codiCant + "." + codiPredecimal;
    this.cantidadProducto = parseFloat(codiCantCompleto);

    this.CCVException = true;

    this.busquedaProductoUnico(codigo).then((encontrado)=>{
      if (encontrado) {
        this.agregarProducto();
      }else{
        this.toastServ.toastNoSeEncontroProducto();
      }
    });
  }

  // ---------------------------------------------------------------------------------------------------------------------


  scan() {
    this.barcodeScanner.scan().then((barcodeData: any) => {
      if (this.CCV) {
        this.procesarTextoCCV(barcodeData.text);
      } else {
        this.busquedaProductoUnico(barcodeData.text).then((encontrado) => {
          if (encontrado) {
            this.agregarProducto();
          }else{
            this.toastServ.toastNoSeEncontroProducto();
          }
        });
      }
    }).catch(err => {
      console.log(err);
      this.toastServ.toastMensajeDelServidor('Ocurrió un error con el scan, intenteló nuevamente.')
    })
  }




  ngOnDestroy() {
    this.dataFacturaServ.arrayProductos = this.arrayProductosDisplay;
     this.dataFacturaServ.dataFactura.subTotales.subTotal = this.subTotal;
     this.dataFacturaServ.dataFactura.subTotales.monoDescuento = this.monoDescuento;
     this.dataFacturaServ.dataFactura.subTotales.subTotalDesc = this.subTotalDesc;
     this.dataFacturaServ.dataFactura.subTotales.monImpuesto = this.monImpuesto;
     this.dataFacturaServ.dataFactura.subTotales.total = this.totalFinal;
  }



  ngOnInit() {

    this.subTotal = this.dataFacturaServ.dataFactura.subTotales.subTotal;
    this.monoDescuento = this.dataFacturaServ.dataFactura.subTotales.monoDescuento;
    this.subTotalDesc = this.dataFacturaServ.dataFactura.subTotales.subTotalDesc;
    this.monImpuesto = this.dataFacturaServ.dataFactura.subTotales.monImpuesto;
    this.totalFinal = this.dataFacturaServ.dataFactura.subTotales.total;
    this.descuentoProducto = 0;
    if(this.dataFacturaServ.arrayProductos.length == 0){
      this.arrayProductosDisplay = [];
    }else{
      this.arrayProductosDisplay = this.dataFacturaServ.arrayProductos;
    }
  }

}
