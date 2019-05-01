import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ProductListLogicService } from 'src/app/services/product-list-logic/product-list-logic.service';
import { ToastService } from 'src/app/services/toast.service';
import { CommonOperationsService } from 'src/app/services/common-operations/common-operations.service';
import { NotasDeCreditoHttpService } from 'src/app/services/notas-de-credito/notas-de-credito-http.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { NotasDeCreditoService } from 'src/app/services/notas-de-credito/notas-de-credito.service';
import { Events } from '@ionic/angular';
import { PrintService } from 'src/app/services/print.service';

@Component({
  selector: 'app-procesar-parcial',
  templateUrl: './procesar-parcial.page.html',
  styleUrls: ['./procesar-parcial.page.scss'],
})
export class ProcesarParcialPage implements OnInit {

  camposHabilitados = false;
  dismissCambioCheckBoxAutorizacion = false;
  CCV = false;
  codigoProducto = "";
  precioProducto = 0
  cantidadProducto:any = 1;
  descuentoProducto = 0;
  exonerarImpuestosBool = false;
  CCVException = false;
  precioProductoDisplay:string = "$ 0";
  productoSeleccionado = {} as any;
  arrayProductosDisplay = [];
  showSplash = false;
  exonerarImpuestos = "0";
  user: ObjUserData;
  factura: any;

  subTotal = '';
  monoDescuento = '';
  subTotalDesc = '';
  monImpuesto = '';
  totalFinal = '';
  objNCTotalesParametrosHTTP: { id_cliente_ws: number; UsuarioUbicacion: any; documento: any; txtDocu: any; };




  constructor(public localStorageServ: LocalStorageService,
              public productLogic:ProductListLogicService,
              private toastServ: ToastService,
              private common: CommonOperationsService,
              private _NCHttp: NotasDeCreditoHttpService,
              private _NCLogic: NotasDeCreditoService,
              private event: Events,
              private printServ: PrintService
              ) {
                this.event.subscribe("loading" , ()=>{
                  this.showSplash = true;
                });
                this.event.subscribe("end-loading" , ()=>{
                  this.showSplash = false;
                });
                this.event.subscribe("inicializar" , (producto)=>{
                  console.log(producto)
                  this.inicializarProducto(producto);
                });
                this.event.subscribe("agregar-producto", ()=>{
                  this.agregarProducto();
                });
                this.event.subscribe("scan-code", (objScan:{
                  "codigo"
                  "cantidad"
                  "CCVException"
                })=>{
                  this.codigoProducto = objScan.codigo;
                  this.cantidadProducto = objScan.cantidad;
                  this.CCVException = objScan.CCVException;
                });
                this.event.subscribe("habilitar-campos", (auth)=>{
                  console.log("Se permite HC? :" +  auth)
                  if(auth){
                    this.habilitarCampos();
                  }else{
                    this.camposHabilitados = false;
                    console.log(this.camposHabilitados)
                  }
                });




              }

  ngOnInit() {

    this.factura = this._NCLogic.facturaElegida;
    this.user = this.localStorageServ.localStorageObj.dataUser;
    this.objNCTotalesParametrosHTTP = {
      id_cliente_ws: parseInt(this.user.idUser),
      UsuarioUbicacion: this.user.nom_localizacion,
      documento: this.factura.idNC,
      txtDocu: this.factura["N° Factura"]
    };
    /*

    this.pedidosGetServ.selectTotales(this.user.idUser, this.user.nom_localizacion, this.factura["N° Factura"]).then((data: any) => {
      console.log(data)
      if (data.SUBTOTAL != null) {
        this.subTotal = data.SUBTOTAL;
        this.monoDescuento = data.MONDESCUENTO;
        this.subTotalDesc = data.SUBTOTALDESC;
        this.monImpuesto = data.MONIMPUESTO;
        this.totalFinal = data.TOTALFINAL;
      }
    })

    this.pedidosGetServ.selectTotalesUbicaGrid(this.user.idUser, this.user.nom_localizacion, this.factura["N° Factura"]).then((productos:any)=>{
      console.log(productos);
      this.showSplash = false;
      for(let i = 0; i <productos.length; i ++){
        let producto = productos[i];
        producto['Precio Venta sin Imp'] = producto["Precio Unitario"];
        producto['verMas'] = false;
        producto['icono'] = 'add-circle';
        producto["descuento"] = producto["Descuento"];
        producto["subTotales"] = new Object ();
        producto["subTotales"]["Sub Total"] = producto["Sub Total"];
        producto["subTotales"]["Descuento"] = producto["Sub Total"] - producto["Sub Total descuento"];
        producto["subTotales"]["Sub Total descuento"] = producto["Sub Total descuento"]
        producto["subTotales"]["Impuestos"] = producto["Impuestos"]
        producto["subTotales"]["Total Linea"] = producto["Total Linea"]

      }
      this.arrayProductosDisplay = productos;

    })
    */
  }


  verMasProducto(i) {
    if (this.arrayProductosDisplay[i]['verMas'] == true) {
      this.arrayProductosDisplay[i]['icono'] = 'add-circle';
      this.arrayProductosDisplay[i]['verMas'] = false;
    } else {
      this.arrayProductosDisplay[i]['icono'] = 'remove-circle';
      this.arrayProductosDisplay[i]['verMas'] = true;
    }
  }


  habilitarCampos(){
    if (this.dismissCambioCheckBoxAutorizacion) {
      this.dismissCambioCheckBoxAutorizacion = false;
    } else {
      if (this.localStorageServ.localStorageObj['dataUser'].msg != '03') {
        if (this.camposHabilitados) {
          this.descuentoProducto = 0;
          this.exonerarImpuestosBool = false;
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

    if(this.descuentoProducto + this.factura.descuentoFijo > 100){
      this.toastServ.toastMensajeDelServidor("El descuento total no puede ser mayor a 100", "error")
      return;
    }else if (this.descuentoProducto + this.factura.descuentoFijo < 0){
      this.toastServ.toastMensajeDelServidor("El descuento total no puede ser menor a 0", "error")
      return;
    }else{
      var descuentoTotal = this.descuentoProducto + this.factura.descuentoFijo;
    }


    this.boolToString();
    this.showSplash = true;
    this.nuevoProductoCheck().then(() => {
      let data = {
        id_cliente_ws: this.localStorageServ.localStorageObj['dataUser'].idUser,
        id_facturaPV: this.factura.idNC,
        codigo_producto: this.codigoProducto,
        nom_localizacion: this.localStorageServ.localStorageObj['dataUser'].nom_localizacion,
        cant: this.cantidadProducto,
        descuentonew: descuentoTotal,
        precio: this.precioProducto,
        isexonerado: this.exonerarImpuestos,
        Usuario: this.localStorageServ.localStorageObj['dataUser'].usuario
      }

      console.log(data);
      this._NCHttp.agregarProducto(
        data
      ).subscribe((resp) => {
        console.log(resp)
        if (resp['result'] == "EXITO") {

          console.log(this.objNCTotalesParametrosHTTP);
          this._NCHttp.selectNCTotales(this.objNCTotalesParametrosHTTP).subscribe((data: any) => {
            console.log("Select totales: ",data)

            if (data[0].SUBTOTAL != null) {
              this.subTotal = data[0].SUBTOTAL;
              this.monoDescuento = data[0].MONDESCUENTO;
              this.subTotalDesc = data[0].SUBTOTALDESC;
              this.monImpuesto = data[0].MONIMPUESTO;
              this.totalFinal = data[0].TOTALFINAL;
            }
            let totalesData = {
              id_cliente_ws: this.user.idUser,
              UsuarioUbicacion: this.user.nom_localizacion,
              documento: this.factura.idNC,
            }
            console.log(totalesData);
            this._NCHttp.selectProductosTotales(totalesData).subscribe((totalesLineas: any) => {
              // Array con todos los productos cargados.
              totalesLineas.reverse();
              console.log("totales lineas", totalesLineas)
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

  eliminarProducto(index){
    this.showSplash = true;
    var codigo = this.arrayProductosDisplay[index]['Código Producto'];
    var cantidad = this.arrayProductosDisplay[index]['Cantidad'];

    let data = {
      id_cliente_ws: this.user.idUser,
      id_documento:this.factura.idNC,
      id_facturaPV: this.factura["N° Factura"],
      codigo_producto: codigo,
      nom_localizacion: this.user.nom_localizacion,
      cant:cantidad,
      Usuario: this.user.usuario
    }
    console.log(data);
    this._NCHttp.eliminarProducto(data).subscribe((respuesta)=>{
      console.log(respuesta)
      this._NCHttp.selectNCTotales(this.objNCTotalesParametrosHTTP).subscribe((data: any) => {
        console.log(data);
        if (data[0].SUBTOTAL != null) {
          this.subTotal = data[0].SUBTOTAL;
          this.monoDescuento = data[0].MONDESCUENTO;
          this.subTotalDesc = data[0].SUBTOTALDESC;
          this.monImpuesto = data[0].MONIMPUESTO;
          this.totalFinal = data[0].TOTALFINAL;
        }else{
          this.subTotal = "0";
          this.monoDescuento = "0";
          this.subTotalDesc = "0";
          this.monImpuesto = "0";
          this.totalFinal = "0";
        }
        this.showSplash = false
        this.arrayProductosDisplay.splice(index, 1);
      })
    })
  }





  //--------------------------------------------------------------------------------------------------------------------------------



  nuevoProductoCheck() {

    return new Promise((resolve) => {
      if (this.productoSeleccionado == undefined) {
        // Si voy acá es que no hay producto seleccionado, porque nunca se seleccionó uno y se ingresa a pelo
        this.productLogic.busquedaProductoUnico().then((resp:any) => {
          if (resp.status == "fail") {
            this.toastServ.toastNoSeEncontroProducto();
          }else{
            resolve();
          }
        });
      } else {

        // Acá se mete si ya hay un producto seleccionado, pero puede ser que el codigo que esté ingresado no coincida con el codigo definido
        // en el producto seleccionado, que es un campo que se inicializa una vez que se buscan los datos del producto.

        if (this.productoSeleccionado['Código Producto'] == this.codigoProducto) {
          resolve();
        } else {
          this.productLogic.busquedaProductoUnico().then((encontro) => {
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


    updateProduct(i, totalesLineas) {
      // Subtotales
      this.subTotalesInsert(this.arrayProductosDisplay[i], totalesLineas, i)

      this.arrayProductosDisplay[i]['Precio Venta sin Imp'] = this.precioProducto;
      this.arrayProductosDisplay[i].Existencia = this.productoSeleccionado.Existencia - this.cantidadProducto;
      this.arrayProductosDisplay[i]['Cantidad'] = this.common.aproxXDecimals(this.arrayProductosDisplay[i]['Cantidad'] + this.cantidadProducto, 3);
      this.arrayProductosDisplay[i]['descuento'] = this.common.aproxXDecimals(this.descuentoProducto + this.factura.descuentoFijo, 2);
      this.showSplash = false;
    }

    // ---------------------------------------------------------------------------------------------------------------------



    insertProduct(totalesLineas) {
      this.productoSeleccionado.Existencia = this.productoSeleccionado.existenciaInicial - this.cantidadProducto;
      this.productoSeleccionado['Precio Venta sin Imp'] = this.precioProducto;
      this.productoSeleccionado['Cantidad'] = parseFloat(this.cantidadProducto);
      this.productoSeleccionado['verMas'] = false;
      this.productoSeleccionado['icono'] = 'add-circle';
      this.productoSeleccionado["descuento"] = this.common.aproxXDecimals(this.descuentoProducto + this.factura.descuentoFijo, 2);

      //Subtotales
      this.productoSeleccionado["subTotales"] = {};
      this.subTotalesInsert(this.productoSeleccionado, totalesLineas, 0);
      this.arrayProductosDisplay.unshift(this.productoSeleccionado);
      this.showSplash = false;

    }

    subTotalesInsert(array, totalesLineas, index) {

      array["subTotales"]["Sub Total"] = totalesLineas[index]["Sub Total"]
      array["subTotales"]["Descuento"] = totalesLineas[index]["Descuento"]
      array["subTotales"]["Sub Total descuento"] = totalesLineas[index]["Sub Total descuento"]
      array["subTotales"]["Impuestos"] = totalesLineas[index]["Impuestos"]
      array["subTotales"]["Total Linea"] = totalesLineas[index]["Total Linea"]
    }

    boolToString() {
      if (this.exonerarImpuestosBool == true) {
        this.exonerarImpuestos = "1";
      } else {
        this.exonerarImpuestos = "0";
      }
    }



    procesarNCEnHacienda(){
      this.showSplash = true;
      this._NCLogic.procesarNCEnHacienda(this.factura).then(()=>{
        this.showSplash = false;
      }).catch((mensajeError)=>{
        this.toastServ.toastMensajeDelServidor(mensajeError);
        this.showSplash = false;
      });
    }

    guardarNotaDeCredito(){
      this.showSplash = true;
      this._NCLogic.guardar(this.factura).then(()=>{
        this.toastServ.toastMensajeDelServidor("Se guardó la nota de crédito con éxito");
        this.showSplash = false;
      })
    }

    imprimir(reimpresion){
      this.showSplash = true;
      let data  = {
        id_cliente_ws: parseInt(this.user.idUser),
        id_facturaPV: this.factura.idNC,
        nombreUsuario: this.user.usuario,
        sePagaCon: -1,
        vuelto: -1,
        clave: this.factura.claveHaciendaNC,
        reImpresion: reimpresion
      }
      console.log("DATA ENVIADA AL SERVICIO DE IMPRESIÓN: ", data)
      this._NCHttp.buscarPrintString(data).subscribe((printString)=>{
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
            this.printServ.buscarImpresora("/procesar-parcial").then(() => {
            })
              .catch(() => {
              })
          }
        })
    }


}
