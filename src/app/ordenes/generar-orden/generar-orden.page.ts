import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { OrdenesService, Orden } from 'src/app/services/ordenes/ordenes.service';
import { NavController, Platform } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { PedidosGetService } from 'src/app/services/pedidos-get.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { PrintService } from 'src/app/services/print.service';
import { CommonOperationsService } from 'src/app/services/common-operations/common-operations.service';

@Component({
  selector: 'app-generar-orden',
  templateUrl: './generar-orden.page.html',
  styleUrls: ['./generar-orden.page.scss'],
})
export class GenerarOrdenPage implements OnInit {

  entrada = true;
  salida = false;
  showSplash = false;

  dia: string;
  mes: string;
  anno: string;

  tiposDeMovimientos = [];
  user: ObjUserData;
  orden: Orden;

  codigoProducto: any = "";
  cantidadProducto: number = 1;
  productoSeleccionado: any;
  arrayProductosDisplay: any = [];

  CCV = false;
  CCVException = false;

  impresora:any;
  backButtonSubscription: import("/Users/tomasgarciapineiro/Desktop/proyecto facturas/wolk-app/node_modules/rxjs/internal/Subscription").Subscription;

  constructor(public localStorageServ: LocalStorageService,
    public ordenesServ: OrdenesService,
    private navCtrl: NavController,
    private toastServ: ToastService,
    private pedidosGetServ: PedidosGetService,
    private barcodeScanner: BarcodeScanner,
    private printServ: PrintService,
    private plt: Platform,
    private common: CommonOperationsService) {
    this.user = this.localStorageServ.localStorageObj.dataUser;
    this.orden = this.ordenesServ.orden;
    this.impresora = this.localStorageServ.localStorageObj.impresora;
    this.backButtonSubscription = this.plt.backButton.subscribeWithPriority(0,()=>{

    });
  }

  ngOnDestroy(){
    this.ordenesServ.orden = new Object() as Orden;
    this.backButtonSubscription.unsubscribe();
  }

  dismiss() {
    this.navCtrl.navigateBack("/menu");
  }

  ngOnInit() {
    let hoy = new Date();
    this.dia = this.addCeroToNumber(hoy.getDate());
    this.mes = this.addCeroToNumber(hoy.getMonth() + 1);
    this.anno = hoy.getFullYear().toString();
    this.ordenesServ.inicializarOrden();
    this.selectTiposMovimientos();

  }

  addCeroToNumber(number) {
    if (parseInt(number) < 10) {
      return "0" + parseInt(number);
    } else {
      return number.toString();
    }
  }

  nuevaOrden(){
    let header = "Confirmación";
    let subHeader = "¿Está seguro que desea realizar una nueva orden?";
    let buttons = [{
      text:"Cancelar",
      role:"cancel"
    },{
      text:"Aceptar",
      handler:()=>{
        this.arrayProductosDisplay = [];
        this.ordenesServ.inicializarOrden();
      }
    }];
  this.localStorageServ.presentAlert(header,subHeader, undefined, buttons);
  }

  changeCheck(tipo) {
    if (tipo == "entrada") {
      this.ordenesServ.orden.id_tipo_movimiento = "E";
      this.selectTiposMovimientos();
    } else {
      this.ordenesServ.orden.id_tipo_movimiento = "S";
      this.selectTiposMovimientos();
    }
  }

  selectTiposMovimientos() {
    this.showSplash = true;
    this.ordenesServ.orden.id_tipo_ajuste = undefined
    var id_tipo_movimiento = this.ordenesServ.orden.id_tipo_movimiento;
    let data = {
      "id_tipo_movimiento": id_tipo_movimiento
    }
    this.ordenesServ.selectTiposMovimientosPV(data).subscribe((resp) => {
      this.showSplash = false;
      resp.splice(0, 1);
      this.tiposDeMovimientos = resp;
      if (id_tipo_movimiento == "E") {
        this.eliminarElementoDeArray(11, this.tiposDeMovimientos);
      } else {
        this.eliminarElementoDeArray(6, this.tiposDeMovimientos);
      }

    })
  }

  eliminarElementoDeArray(numeroAEliminar, array) {
    for (let i = 0; i < array.length; i++) {
      let elemento = array[i];
      if (elemento.id_tipo_ajuste == numeroAEliminar) {
        array.splice(i, 1);
      }
    }
  }

  generarOrden() {
    let fecha = this.mes + "/" + this.dia + "/" + this.anno;
    let dateObj = new Date(fecha).toString();
    if (dateObj == "Invalid Date") {
      this.toastServ.toastMensajeDelServidor("Ingrese una fecha válida", "error");
      return;
    } else {
      fecha = this.addCeroToNumber(this.dia) + "/" + this.addCeroToNumber(this.mes) + "/" + this.anno;
      let data = {
        "id_cliente_ws": this.user.idUser,
        "num_documento": 0,
        "fecha": fecha,
        "tipo_movimiento": this.orden.id_tipo_movimiento,
        "id_tipo_ajuste": this.orden.id_tipo_ajuste,
        "Usuario_acepta": "",
        "Usuario_origen": this.user.usuario,
        "Usuario_destino": this.user.usuario,
        "nom_localizacion_origen": this.user.nom_localizacion,
        "nom_localizacion_destino": this.user.nom_localizacion,
        "num_documento_relacionado": 0,
        "Observaciones": this.orden.Observaciones,
        "Activo": "1",
        "Usuario": this.user.usuario,
        "ZonaHoraria": "Central America Standard Time"

      }
      this.showSplash = true;
      this.ordenesServ.procesoEntradaSalidaInventarioPV(data).subscribe((resp) => {
        this.showSplash = false;
        console.log(resp)
        if (resp > 0) {
          this.orden.isGenerada = true;
          this.orden.num_documento = resp;
          console.log(this.ordenesServ.orden)
        } else {
        }
      })
    }
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

      this.pedidosGetServ.buscarProducto(this.localStorageServ.localStorageObj['dataUser'].idUser, productoIdentif, this.localStorageServ.localStorageObj['dataUser'].nom_localizacion)
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
      if (this.CCV) {
        this.procesarTextoCCV(barcodeData.text);
      } else {
        this.busquedaProductoUnico(barcodeData.text).then((encontrado) => {
          if (encontrado) {
            this.agregarProducto();
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
    this.codigoProducto = codigo;
    let codiCant = parseInt(data.substring(6, 8));
    let codiPredecimal = data.substring(8, 11);
    let codiCantCompleto = codiCant + "." + codiPredecimal;
    this.cantidadProducto = parseFloat(codiCantCompleto);

    this.CCVException = true;

    this.busquedaProductoUnico(codigo).then((encontrado) => {
      if (encontrado) {
        this.agregarProducto();
      } else {
        this.toastServ.toastNoSeEncontroProducto();
      }
    });
  }

  imprimir(pReimpresion){
    let data = {
      "id_cliente_ws":this.user.idUser,
      "num_documento":this.orden.num_documento,
      "TipoMovimiento":this.orden.id_tipo_movimiento,
      "Usuario":this.user.usuario,
      "ZonaHoraria":"Central America Standard Time",
      "pReimpresion":pReimpresion
    };
    this.showSplash = true;
    this.ordenesServ.printOrdenesES(data).subscribe((resp)=>{
      this.showSplash = false;
      console.log(resp)
      this.printServ.printFN(this.impresora,resp).then(()=>{

      }).catch((error)=>{
        if(error == "No hay impresora"){
          this.printServ.buscarImpresora("/generar-orden").then(()=>{
          }).catch(()=>{
          })
        }
      })
    })
  }

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



  agregarProducto() {
    let array = [this.cantidadProducto];
    let analisisObj = this.common.checkStrOrNumberThreeDecimals(array);

    for (let i = 0; i < array.length; i ++){
      let valor = parseFloat(analisisObj["valores"][i]);
      if(i == 0){
        this.cantidadProducto = valor;
      }
    }

    if (analisisObj["status"] == "fail") {
      this.toastServ.toastCamposInvalidosProducto();
      return;
    }


    for (let i = 0; i < array.length; i++) {
      let valor = parseFloat(analisisObj["valores"][i]);
      if (i == 0) {
        this.cantidadProducto = valor;
      }
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

    this.showSplash = true;
    this.nuevoProductoCheck().then(() => {
      let data = {
        "id_cliente_ws": this.user.idUser,
        "num_documento": this.orden.num_documento,
        "codigo_producto":this.codigoProducto,
        "cant":this.cantidadProducto,
        "nom_localizacion":this.user.nom_localizacion,
        "tipo_movimiento": this.orden.id_tipo_movimiento,
        "Usuario_acepta": "",
        "Usuario_origen": this.user.usuario,
        "Usuario_destino": this.user.usuario,
        "nom_localizacion_origen": this.user.nom_localizacion,
        "nom_localizacion_destino": this.user.nom_localizacion,
        "Activo": "1",
        "Usuario": this.user.usuario,
        "ZonaHoraria": "Central America Standard Time"
      }
      this.ordenesServ.procesoEntradaSalidaInventarioProductosPV(data).subscribe((resp) => {
        console.log(data);
        if (resp['result'] == "EXITO") {
          if (displayStatus == 'noProduct') {
            this.insertProduct();
          } else {
            if (displayStatus == 'productoYaIngresado') {
              this.updateProduct(indexMatch);
              return;
            }
          }
        } else {
          this.showSplash = false;
          console.log('No hubo éxito: ');
          console.log(resp);
          this.toastServ.toastMensajeDelServidor(resp['result']);
        }

      })
    });



  }

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

  updateProduct(i) {
    // Subtotales

    this.arrayProductosDisplay[i]['Cantidad'] = this.common.aproxXDecimals(this.arrayProductosDisplay[i]['Cantidad'] + this.cantidadProducto,3);
    this.showSplash = false;
  }

  // ---------------------------------------------------------------------------------------------------------------------



  insertProduct() {
    this.productoSeleccionado['Cantidad'] = this.cantidadProducto;

    //Subtotales
    this.arrayProductosDisplay.unshift(this.productoSeleccionado);
    this.showSplash = false;

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

    if (this.CCVException == false) {
      this.cantidadProducto = 1;
    } else {
      this.CCVException = false;
    }

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
    this.showSplash = true;
    let codigoProductoAEliminar = this.arrayProductosDisplay[index]['Código Producto'];
    let cantidad = this.arrayProductosDisplay[index]['Cantidad'];
    let data = {
      "id_cliente_ws":this.user.idUser,
      "num_documento":this.orden.num_documento,
      "codigo_producto":codigoProductoAEliminar,
      "nom_localizacion":this.user.nom_localizacion,
      "cant":cantidad,
      "tipo_movimiento":this.orden.id_tipo_movimiento,
      "Usuario":this.user.usuario,
      "ZonaHoraria":"Central America Standard Time"
    }
    this.ordenesServ.eliminarLineaOrdenES(data).subscribe((resp) => {
      this.showSplash = false;
      console.log(data);
      if (resp['result'] == 'EXITO') {
        this.arrayProductosDisplay.splice(index, 1);
      } else {
        this.toastServ.toastMensajeDelServidor('Ocurrió algún error con el servidor, inténtelo nuevamente.');
      }
    })
  }

}
