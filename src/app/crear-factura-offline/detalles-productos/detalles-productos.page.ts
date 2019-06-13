import { Component, OnInit } from '@angular/core';
import {
NavController, AlertController,
  Platform, Events
} from '@ionic/angular';

import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
// Plugins


import { ObjSubtotales, ObjProducto } from "../../../interfaces/interfaces";

// Service

import { LocalStorageService } from 'src/app/services/local-storage.service';
import { DataFacturaService } from 'src/app/services/data-factura.service';
import { ToastService } from 'src/app/services/toast.service';
import { CommonOperationsService } from 'src/app/services/common-operations/common-operations.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-detalles-productos',
  templateUrl: './detalles-productos.page.html',
  styleUrls: ['./detalles-productos.page.scss'],
})
export class DetallesProductosPage implements OnInit {

    codigoInicializado: any;


    // NG model
    camposHabilitados: boolean = false;
    camposDeshabilitados: boolean = true;
    exonerarImpuestos: string = "0";
    exonerarImpuestosBool: boolean = false;
    urlFoto: string;

    arrayProductosDisplay: Array<ObjProducto> = [];

    subTotal: number = 0;
    monoDescuento: number = 0;
    subTotalDesc: number = 0;
    monImpuesto: number = 0;
    totalFinal: number = 0;

    objProductoSeleccionado = new Object () as ObjProducto;

    //Variables Operativas
    dismissCambioCheckBoxAutorizacion: boolean = false;
    productoSeleccionado: any;
    showSplash: boolean = false;
    CCV: boolean = false;
    CCVException: boolean;

    descuentoFijoBool = false;
  backButtonSubscription: import("/Users/tomasgarciapineiro/Desktop/proyecto facturas/wolk-app/node_modules/rxjs/internal/Subscription").Subscription;
  constructor(public navCtrl: NavController,
    public localStorageServ: LocalStorageService,
    private plt: Platform,
    public dataFacturaServ: DataFacturaService,
    private toastServ: ToastService,
    private event: Events,
    private barcodeScanner: BarcodeScanner,
    private common: CommonOperationsService,
    private router: Router) {

      this.backButtonSubscription = this.plt.backButton.subscribeWithPriority(0,()=>{

      });

      this.event.subscribe('errorServidor', () => {
        this.showSplash = false;
      })


      this.inicializarObjProductSeleccionado();

      if(this.plt.is("cordova") == false){
        this.objProductoSeleccionado.codigo_producto = "002901";
      }

      let productosGuardados = this.dataFacturaServ.arrayProductos;
      if (productosGuardados != undefined) {
        this.arrayProductosDisplay = productosGuardados;
      }
    }


    inicializarObjProductSeleccionado(){
      this.objProductoSeleccionado.codigo_producto = ""
      this.objProductoSeleccionado.cantidad = 1
      this.objProductoSeleccionado.precio_venta_sin_imp = 0
      this.objProductoSeleccionado.categoria = ""
      this.objProductoSeleccionado.codigo_producto = "";
      this.objProductoSeleccionado.existencia = 0
      this.objProductoSeleccionado.existencia_minima = 0
      this.objProductoSeleccionado.localizacion = ""
      this.objProductoSeleccionado.nombre_producto = ""
      this.objProductoSeleccionado.tamaño = ""
      this.objProductoSeleccionado.unidad_medida_hacienda = ""
      this.objProductoSeleccionado.unidades_a_reponer = 0
      this.objProductoSeleccionado.descuento = 0;
      this.objProductoSeleccionado.descuentoFijo = this.dataFacturaServ.dataFacturaOffline.descuentoFijo;
      this.objProductoSeleccionado.isExonerado = "0";
      this.objProductoSeleccionado.html = new Object () as {
        verMas:boolean
        icono:string
      };
      this.objProductoSeleccionado.html.icono = "add-circle"
      this.objProductoSeleccionado.html.verMas = false
      return;
    }





  cantidadProductoFn(comando) {
    if (comando == 'agregar') {
      this.objProductoSeleccionado.cantidad = this.objProductoSeleccionado.cantidad + 1;
    } else {
      if (this.objProductoSeleccionado.cantidad > 1) {
        this.objProductoSeleccionado.cantidad = this.objProductoSeleccionado.cantidad - 1;
      }
    };
    this.objProductoSeleccionado.cantidad = Math.round(this.objProductoSeleccionado.cantidad*1000)/1000;
}





  buscarProducto() {

    let objAlert = {
      title: 'Ingrese un producto',
      inputs: [
        {
          name: 'productoIdentif',
          placeholder: 'Ingrese el nombre o el código'
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
            let resp = this.buscarProductoFN((data['productoIdentif']).toLowerCase());
            if(resp == "fail"){
              this.toastServ.toastNoSeEncontroProducto();
              this.showSplash = false;
            }else if(resp == "unico"){
              this.showSplash = false;
            }else{
              this.productSelector(resp);
            }
          }
        }
      ]
    };
    this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);
  }





  buscarProductoFN(productoIdentif) {

    // Devuelve unico e inicializa, fail o array.

    let productoArray = this.buscarArrayReturnResults(this.localStorageServ.localStorageObj["productos"], productoIdentif);

    console.log("Resultados de la busqueda: " , productoArray)
    if (productoArray.length == 1) {

      // El producto buscado es único
      let producto = productoArray[0];
      this.inicializarProducto(producto);
      return("unico");
    } else if (productoArray.length == 0) {
      return("fail");
    } else {
      return(productoArray);
    }

  }



  buscarArrayReturnResults( array, filtro){

    // Tengo que definir las keys que valen la pena
    let searchKeys = ["Código Producto" , "Nombre Producto"];

    let arrayLength = array.length;
    let results = new Array();

    for(let i = 0; i < arrayLength; i ++){
      let match = false;
      let obj = new Object();
      obj = array[i];
      let keys = Object.keys(obj);
      let keysLength = keys.length;
      for(let j = 0; j < keysLength; j ++ ){
        let key = keys[j];
        for(let k = 0; k < searchKeys.length; k ++){

          let searchKey = searchKeys[k];
          if( searchKey == key ){
            let value = obj[key];
            if(isNaN(value) && isNaN(filtro)){
              if(value.toLowerCase().search(filtro) != - 1){
                results.push(obj);
                match = true;
                break;
              }
            }else{
              if(value.toString().search(filtro.toString()) != -1 ){
                results.push(obj);
                match = true;
                break;
              }
            }
          }
        }
        if(match){
          break;
        }
      }
    }
    return results;
  }




  inicializarProducto(producto) {
    this.exonerarImpuestosBool = false;
    this.codigoInicializado = producto['Código Producto'];
    this.objProductoSeleccionado.codigo_producto = producto['Código Producto'];
    this.objProductoSeleccionado.monto_imp = producto['Monto Imp'];
    this.objProductoSeleccionado.monto_desc = producto['Monto Desc'];

    if(this.CCVException ){
      this.CCVException = false;
    }else{
      this.objProductoSeleccionado.cantidad = 1;
    }
    this.objProductoSeleccionado.precio_venta_sin_imp = producto['Precio Venta sin Imp'];
    this.objProductoSeleccionado.precio_venta_sin_imp_sin_cambios = producto['Precio Venta sin Imp'];
    this.objProductoSeleccionado.categoria = producto["Categoria"];
    this.objProductoSeleccionado.existencia = producto["Existencia"];
    this.objProductoSeleccionado.existencia_minima = producto["Existencia Minima"];
    this.objProductoSeleccionado.localizacion = producto["Localización"];
    this.objProductoSeleccionado.nombre_producto = producto["Nombre Producto"];
    this.objProductoSeleccionado.tamaño = producto["Tamaño"];
    this.objProductoSeleccionado.unidad_medida_hacienda = producto["Unidad Medida Hacienda"];
    this.objProductoSeleccionado.unidades_a_reponer = producto["Unidades a Reponer"];
    this.objProductoSeleccionado.html.icono = "add-circle";
    this.objProductoSeleccionado.html.verMas = false;


    console.log("Se inicializó un producto en las variables globales: ");
    console.log(this.objProductoSeleccionado);

    return;

  }




  productSelector(arrayProductos) {

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

      let objAlert1 = {
        title: 'Se encontró más de un producto',
        subTitle: 'Elija un producto de la lista',
        inputs: alertInputs,
        buttons: [{
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

            let objAlert = {
              title: 'Info de: ' + arrayProductos[indexSeleccion]['Nombre Producto'],
              message: '<strong>Existencia: </strong>' + arrayProductos[indexSeleccion]['Existencia'] + '<br>' +
                '<strong>Categoria: </strong>' + arrayProductos[indexSeleccion]['Categoria'] + '<br>' +
                '<strong>Código Producto: </strong>' + arrayProductos[indexSeleccion]['Código Producto'] + '<br>' +
                '<strong>Código Serveedor: </strong>' + arrayProductos[indexSeleccion]['Código Serveedor'] + '<br>' +
                '<strong>Existencia Minima: </strong>' + arrayProductos[indexSeleccion]['Existencia Minima'] + '<br>' +
                '<strong>Precio Venta sin Imp: </strong>' + arrayProductos[indexSeleccion]['Precio Venta sin Imp'] + '<br>' +
                '<strong>Unidades a Reponer: </strong>' + arrayProductos[indexSeleccion]['Unidades a Reponer'] + '<br>'
              ,
              buttons: [{
                text: 'Volver',
                handler: () => {
                  this.productSelector(arrayProductos);
                }
              }]
            };
            this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"], objAlert["message"]);
          }
        }]

      };;
      this.localStorageServ.presentAlert(objAlert1["title"], objAlert1["subTitle"], objAlert1["inputs"], objAlert1["buttons"]);
    })
  }





  stringWithCommasToDecimal(string) {
    return parseFloat(string.replace(/,/g, ''));
  }




  agregarProducto() {

    let fail = this.validarCampos();

    if(fail){
      return;
    }
    // SE PUEDE AGREGAR EL PRODUCTO
    // YA HAY UN PRODUCTO CON ÉSTE CODIGO?



    let displayStatus = undefined;
    let indexMatch;

    if (this.arrayProductosDisplay.length == 0) {
      displayStatus = 'noProduct';
      if (this.objProductoSeleccionado.cantidad == 0) {
        this.toastServ.toastCamposInvalidosProducto();
        return;
      }
    } else {
      for (let i = 0; i <= this.arrayProductosDisplay.length - 1; i++) {
        if (this.arrayProductosDisplay[i].codigo_producto == this.objProductoSeleccionado.codigo_producto) {
          indexMatch = i;
          displayStatus = 'productoYaIngresado'
        }
      }
      if (displayStatus == undefined) {
        displayStatus = "noProduct";
        if (this.objProductoSeleccionado.cantidad == 0) {
          this.toastServ.toastCamposInvalidosProducto();
          return;
        }
      }
    }

    let carryOn = this.checkearNuevoProducto();
    if(carryOn){
    }else{
      return;
    }

    console.log(this.objProductoSeleccionado)

    if(displayStatus == "noProduct"){

      if(this.exonerarImpuestosBool){
        this.objProductoSeleccionado.isExonerado = "1";
      }else{
        this.objProductoSeleccionado.isExonerado = "0";
      }

      let subtotales:ObjSubtotales = this.calcularSubtotales(this.objProductoSeleccionado, displayStatus);
      this.objProductoSeleccionado.subtotales = subtotales;
      //Acá ya se le agregó todo al objproducto y se despacha el clon

      var obj = this.objProductoSeleccionado;
      var cloneOfObj = JSON.parse(JSON.stringify(obj));
      this.arrayProductosDisplay.push(cloneOfObj);
      this.calcularSubtotalesGlobales();

    }else{

      // SE DEBE SUMAR LA CANTIDAD INGRESADA y UPDATEAR TODOS LOS CAMPOS DEL PRODUCTO

      this.arrayProductosDisplay[indexMatch].cantidad =  this.common.aproxXDecimals(this.arrayProductosDisplay[indexMatch].cantidad + this.objProductoSeleccionado.cantidad , 3);
      this.arrayProductosDisplay[indexMatch].precio_venta_sin_imp = this.objProductoSeleccionado.precio_venta_sin_imp;
      this.arrayProductosDisplay[indexMatch].descuento = this.objProductoSeleccionado.descuento;
      if(this.exonerarImpuestosBool){
        this.arrayProductosDisplay[indexMatch].isExonerado = "1";
      }else{
        this.arrayProductosDisplay[indexMatch].isExonerado = "0";
      }
      let subtotales:ObjSubtotales = this.calcularSubtotales(this.arrayProductosDisplay[indexMatch], displayStatus);
      this.arrayProductosDisplay[indexMatch].subtotales = subtotales;
      this.calcularSubtotalesGlobales();

    }



  }



  validarCampos(){

    let array = [this.objProductoSeleccionado.cantidad, this.objProductoSeleccionado.precio_venta_sin_imp, this.objProductoSeleccionado.descuento];
    let analisisObj = this.common.checkStrOrNumberThreeDecimals(array);
    if (analisisObj["status"] == "fail"){
      this.toastServ.toastCamposInvalidosProducto();
      return true;
    }

    for (let i = 0; i < array.length; i ++){
      let valor = parseFloat(analisisObj["valores"][i]);
      if(i == 0){
        this.objProductoSeleccionado.cantidad = valor;
      }else if(i == 1){
        this.objProductoSeleccionado.precio_venta_sin_imp = valor;
      }else if(i == 2){
        this.objProductoSeleccionado.descuento = valor;
      }
    }

    if (this.objProductoSeleccionado.descuento + this.dataFacturaServ.dataFacturaOffline.descuentoFijo > 100){
      this.toastServ.toastMensajeDelServidor("El descuento no puede ser mayor a 100" , "error");
      return true;
    }

    if (this.objProductoSeleccionado.descuento < 0 ){
      this.toastServ.toastCamposInvalidosProducto();
      return true;
    }

    if (this.objProductoSeleccionado.cantidad < 0 ){
      this.toastServ.toastCamposInvalidosProducto();
      return true;
    }

    return false;

  }



  calcularSubtotalesGlobales(){
    let arrayLength = this.arrayProductosDisplay.length;

    this.subTotal = 0
    this.monoDescuento = 0
    this.subTotalDesc = 0
    this.monImpuesto = 0
    this.totalFinal = 0

    for(let i = 0; i < arrayLength ; i ++){

      let producto:ObjProducto = this.arrayProductosDisplay[i];
      console.log(this.arrayProductosDisplay);
      this.subTotal = this.subTotal + producto.subtotales.sub_total;
      this.monoDescuento = this.monoDescuento + producto.subtotales.descuento;
      this.subTotalDesc = this.subTotalDesc + producto.subtotales.sub_total_descuento;
      this.monImpuesto = this.monImpuesto + producto.subtotales.impuestos;
      this.totalFinal = this.totalFinal + producto.subtotales.total_linea;
    }

    this.subTotal = Math.round(this.subTotal*100)/100;
    this.monoDescuento = Math.round(this.monoDescuento*100)/100;
    this.subTotalDesc = Math.round(this.subTotalDesc*100)/100;
    this.monImpuesto = Math.round(this.monImpuesto*100)/100;
    this.totalFinal = Math.round(this.totalFinal*100)/100;

  }



  calcularSubtotales(producto: ObjProducto, displayStatus, indexMatch?){

  //  descuento_porc:number
  //  sub_total:number
  //  descuento:number
  //  sub_total_descuento:number
  //  impuesto:number = producto * (precio - descuento)  + (precio - descuento) * 13%
  //  total_linea:number

    let obj = new Object() as ObjSubtotales;
    let impuestoPorc = 0.13;
    if (producto.precio_venta_sin_imp_sin_cambios == 0){
      var descuentoProductoInterno = 0;
    }else{
      var descuentoProductoInterno = producto.monto_desc / producto.precio_venta_sin_imp_sin_cambios * 100;
    }
    obj.descuento_porc = this.round(producto.descuento + this.dataFacturaServ.dataFacturaOffline.descuentoFijo + descuentoProductoInterno);
    obj.descuento_para_procesar = this.round(producto.descuento + this.dataFacturaServ.dataFacturaOffline.descuentoFijo)

    obj.sub_total = this.round(producto.cantidad * (producto.precio_venta_sin_imp));

    let descuentoGlobal = this.round(((producto.precio_venta_sin_imp) * obj.descuento_porc/100) * producto.cantidad);
    obj.descuento = this.round(descuentoGlobal);

    obj.sub_total_descuento = this.round(obj.sub_total - obj.descuento);

    let isExonerado = producto.isExonerado;

    if ( isExonerado == "1"){
      console.log("Está exonerado")
      obj.impuestos = 0;
    }else{
      if( producto.monto_imp == 0){
        obj.impuestos = 0;
      }else{
        let nuevoPrecioUnitario = this.round(obj.sub_total_descuento / producto.cantidad);
        obj.impuestos = this.round(nuevoPrecioUnitario * impuestoPorc * producto.cantidad);
      }
    }

    obj.total_linea = this.round(obj.sub_total_descuento + obj.impuestos);
    //Éste es el descuento unitario que es un un numero entero


    return obj;
  }

  round(equation){
    return Math.round((equation)*100)/100;
  }



  checkearNuevoProducto(){
    if( this.codigoInicializado != this.objProductoSeleccionado.codigo_producto){
      let productoEncontrado = this.busquedaProductoUnico(this.objProductoSeleccionado.codigo_producto);
      if(productoEncontrado){
        return true;
      }else{
        this.toastServ.toastMensajeDelServidor("No se encontró un producto con ese código");
        return false;
      }
    }else{
      return true;
    }

  }




  busquedaProductoUnico(codigo?, tipo?) {

    // Se usa desde nuevo producto check y desde scan. En nuevo producto solo checkeo si cambio el codigo ingresado
    // Si cambió no llega nada, en el otro siempre llega un text.

    // Devuelve true si lo encontró y ya esta inizialicado,  y fail si no.
    let resp;
    if(codigo != undefined){
      resp = this.buscarProductoFN(codigo);
    }else{
      resp = this.buscarProductoFN(this.objProductoSeleccionado.codigo_producto);
    }

    if (resp == "fail") {
      return(false);
    }else if( resp == "unico"){
      return(true);
    } else {

      let haveProduct = this.barrerArrayDeBusquedaYCompararConCodigoIngresado(resp);
      if (haveProduct == false) {
        return(false);
      }else{
        return(true);
      }
    }
  }

  // ---------------------------------------------------------------------------------------------------------------------

  barrerArrayDeBusquedaYCompararConCodigoIngresado(array){

    for (let i = 0; i <= array.length - 1; i++) {
      if (array[i]["Código Producto"] == this.objProductoSeleccionado.codigo_producto) {
        this.inicializarProducto(array[i]);
        return true;
      }
    }
    return false;
  }




  // ---------------------------------------------------------------------------------------------------------------------

  eliminarProducto(index) {
    let objAlert = {
      title: 'Confirmación',
      subTitle: '¿Está seguro que desea eliminar éste producto?',
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Aceptar',
        handler: () => {
          this.arrayProductosDisplay.splice(index, 1);
          this.calcularSubtotalesGlobales();
        }
      }]
    };
    this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);
  }


  // ---------------------------------------------------------------------------------------------------------------------


  verMasProducto(i) {
    if (this.arrayProductosDisplay[i].html['verMas'] == true) {
      this.arrayProductosDisplay[i].html['icono'] = 'add-circle';
      this.arrayProductosDisplay[i].html['verMas'] = false;
    } else {
      this.arrayProductosDisplay[i].html['icono'] = 'remove-circle';
      this.arrayProductosDisplay[i].html['verMas'] = true;
    }
  }


  // ---------------------------------------------------------------------------------------------------------------------


  irAFactura() {

    this.instanciarDatosEnStorageObj();

    this.navCtrl.navigateForward('/crear-factura-offline/facturas-totales');

  }


  // ---------------------------------------------------------------------------------------------------------------------


  scanDiv() {
    ////////////CODIGO|PP|
    if(this.plt.is("cordova")){
      this.scan();
    }else{
      let data = "100000100003";
      data = "100000015003";

      this.procesarTextoCCV (data);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------------


  procesarTextoCCV(data:string) {

    let codigo = parseInt(data.substring(0, 6));
    this.objProductoSeleccionado.codigo_producto = codigo.toString();
    let codiCant = parseInt(data.substring(6, 8));
    let codiPredecimal = data.substring(8, 11);
    let codiCantCompleto = codiCant + "." + codiPredecimal;
    console.log(codiPredecimal);
    this.objProductoSeleccionado.cantidad = parseFloat(codiCantCompleto);
    console.log(this.objProductoSeleccionado);
    this.CCVException = true;

    let encontrado = this.busquedaProductoUnico(codigo);
    if (encontrado) {
      this.agregarProducto();
    }else{
      this.toastServ.toastNoSeEncontroProducto();
    }

  }

  // ---------------------------------------------------------------------------------------------------------------------


  scan() {
    this.barcodeScanner.scan().then((barcodeData: any) => {
      if (this.CCV) {
        this.procesarTextoCCV(barcodeData.text);
      } else {
        let encontrado = this.busquedaProductoUnico(barcodeData.text);
        if (encontrado) {
          this.agregarProducto();
        }else{
          this.toastServ.toastNoSeEncontroProducto();
        }

      }
    }).catch(err => {
      console.log(err);
      this.toastServ.toastMensajeDelServidor('Ocurrió un error con el scan, intenteló nuevamente.')
    })
  }


  //---------------------------------------------------------------------------------------------------------------------

  instanciarDatosEnStorageObj(){
    this.dataFacturaServ.dataFacturaOffline.arrayProductos = this.arrayProductosDisplay;
    this.dataFacturaServ.dataFacturaOffline.subTotales = {
      "subTotal": this.subTotal,
      "monoDescuento": this.monoDescuento,
      "subTotalDesc":this.subTotalDesc,
      "monImpuesto": this.monImpuesto,
      "total": this.totalFinal,
    };
    return;
  }

  ionViewWillLeave(){
    this.backButtonSubscription.unsubscribe();
    this.instanciarDatosEnStorageObj();
  }

  ngOnDestroy(){
    this.backButtonSubscription.unsubscribe();
  }


  ngOnInit() {
    console.log(this.dataFacturaServ.dataFacturaOffline)
    if(this.dataFacturaServ.dataFacturaOffline.arrayProductos.length != 0){
      this.arrayProductosDisplay = this.dataFacturaServ.dataFacturaOffline.arrayProductos;
    }else{
      this.arrayProductosDisplay = [];
    }

    if(this.dataFacturaServ.dataFacturaOffline.subTotales != undefined){
      this.subTotal = this.dataFacturaServ.dataFacturaOffline.subTotales.subTotal
      this.monoDescuento = this.dataFacturaServ.dataFacturaOffline.subTotales.monoDescuento
      this.subTotalDesc = this.dataFacturaServ.dataFacturaOffline.subTotales.subTotalDesc
      this.monImpuesto = this.dataFacturaServ.dataFacturaOffline.subTotales.monImpuesto
      this.totalFinal = this.dataFacturaServ.dataFacturaOffline.subTotales.total
    }
  }


}
