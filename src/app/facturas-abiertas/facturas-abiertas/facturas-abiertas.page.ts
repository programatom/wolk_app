import { Component, OnInit } from '@angular/core';
import { FacturasAbiertasService } from 'src/app/services/facturas-abiertas/facturas-abiertas.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NavController } from '@ionic/angular';
import { ObjFactura } from 'src/interfaces/interfaces';
import { DataFacturaService } from 'src/app/services/data-factura.service';
import { PedidosGetService } from 'src/app/services/pedidos-get.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-facturas-abiertas',
  templateUrl: './facturas-abiertas.page.html',
  styleUrls: ['./facturas-abiertas.page.scss'],
})
export class FacturasAbiertasPage implements OnInit {

  facturas = [];
  showSplash: boolean = false

  constructor(public facurasAbiertasServ: FacturasAbiertasService,
    public localStorageServ: LocalStorageService,
    private navCtrl: NavController,
    private dataFacturaServ: DataFacturaService,
    private pedidosGetServ: PedidosGetService,
    private toastServ: ToastService) { }

  ngOnInit() {
    this.facturas = this.facurasAbiertasServ.facturas;
  }



  dismiss() {
    this.navCtrl.navigateBack("/menu-crear-factura");
  }

  procesarFactura(facturaAProcesar){
    this.showSplash = true
    let data = {
      "id_cliente_ws": this.localStorageServ.localStorageObj.dataUser.idUser,
      "vConsultaFacturaPV": facturaAProcesar["N° Factura"],
      "vConsultaSucursal": this.localStorageServ.localStorageObj.dataUser.sucursal,
      "vConsultaTerminal": this.localStorageServ.localStorageObj.dataUser.nro_terminal,
      "vConsultaLocalizacion": this.localStorageServ.localStorageObj.dataUser.nom_localizacion,
    }
    this.facurasAbiertasServ.selecttraerDatosVerFactura(data).subscribe((facturaDatosArray)=>{
      var facturaDatos = facturaDatosArray[0];
      this.pedidosGetServ.buscarCliente(data["id_cliente_ws"],facturaDatos["N° Identificación"]).then((clientes)=>{
        console.log(facturaDatosArray);

        this.dataFacturaServ.inicializarDataOnline();
        let factura: ObjFactura = this.dataFacturaServ.dataFactura;

        if(facturaDatos["Clientes"] == "CLIENTE GENERICO"){
          factura.descuentoFijo = 0;
        }else{
          factura.emailCopy = clientes[0]["correo"];
          factura.descuentoFijo = clientes[0]["% Desc Fijo"];
        }


        this.inicializarDataComun(factura, facturaDatos);

        if(facturaDatos["Consecutivo Hacienda"] == "0" ){
          // CASO 1 NO SE ENVIÓ A HACIENDA
          if(facturaDatos["Forma de Pago"] == "SIN PAGOS"){
            // CASO 1.2 NO SE REALIZÓ NINGÚN PAGO
            factura.noPaga = true;
            this.pedidosGetServ.selectTotalesUbicaGrid(data["id_cliente_ws"], data["vConsultaLocalizacion"],facturaDatos["N° Factura"]).then((productos:any)=>{
              this.pedidosGetServ.selectTotales(data["id_cliente_ws"],data["vConsultaLocalizacion"], facturaDatos["N° Factura"]).then((totales:any)=>{
                factura.subTotales.subTotal = totales.SUBTOTAL;
                factura.subTotales.monoDescuento = totales.MONDESCUENTO;
                factura.subTotales.subTotalDesc = totales.SUBTOTALDESC;
                factura.subTotales.monImpuesto = totales.MONIMPUESTO;
                factura.subTotales.total = totales.TOTALFINAL;

                var arrayProductos = [];
                for(let i = 0; i < productos.length ; i ++){
                  let producto = productos[i];
                  let productoPush = new Object () as any;
                  productoPush["subTotales"] = new Object () as any;

                  productoPush['icono'] = 'add-circle'
                  productoPush.Cantidad = producto.Cantidad
                  productoPush['Código Producto'] = producto["Código Producto"];
                  productoPush['Nombre Producto'] = producto["Nombre Producto"];
                  productoPush['Precio Precio Venta sin Imp'] = producto["Precio Unitario"];
                  productoPush["descuento"] = producto["Descuento"];
                  productoPush["subTotales"]['Sub Total'] = producto["Sub Total"];
                  productoPush["subTotales"]['Descuento'] = producto["Sub Total"] - producto["Sub Total descuento"];
                  productoPush["subTotales"]['Sub Total descuento'] = producto["Sub Total descuento"]
                  productoPush["subTotales"]['Impuestos'] = producto["Impuestos"];
                  productoPush["subTotales"]['Total Linea'] = producto["Total Linea"];
                  arrayProductos.push(productoPush);
                }

                this.dataFacturaServ.arrayProductos = arrayProductos;
                this.showSplash = false;
                this.navCtrl.navigateForward("/detalles-productos");
              })
            });

          }else{
            // CASO 1.3 SE REALIZÓ ALGÚN PAGO
            this.showSplash = false;

            factura.pagoOfflineData.formaDePago = facturaDatos["Forma de Pago"]
            factura.noPaga = false;
            this.navCtrl.navigateForward("/facturas-totales");
            console.log(this.dataFacturaServ.dataFactura)
          }
        }else{
          // CASO 2 SE ENVIÓ A HACIENDA
          this.showSplash = false;
          this.toastServ.toastMensajeDelServidor("Ésta factura ya se envío hacienda! No puede modificarla", "error");
          return;
          /*
          factura.claveDocHacienda = facturaDatos["Consecutivo Hacienda"];
          factura.isProcesada = true;
          factura.noPaga = false;
          this.navCtrl.navigateForward("/facturas-totales");
          console.log(this.dataFacturaServ.dataFactura);
          */

        }



        //facturaDatos["Fechas Creación"]
        //facturaDatos["Localización"]
        //facturaDatos["N° Terminal"]
        //facturaDatos["Sucursal"]
        //facturaDatos["Usuario Creación"]
      })

    })
  }

  inicializarDataComun(factura: ObjFactura, facturaDatos){

    if(facturaDatos["Usuario Creación"] != this.localStorageServ.localStorageObj.dataUser.usuario){
      factura.usuarioExcepcionBool = true;
      factura.usuarioExcepcion.idUser = this.localStorageServ.localStorageObj.dataUser.idUser;
      factura.usuarioExcepcion.usuario = facturaDatos["Usuario Creación"]
      factura.usuarioExcepcion.sucursal = facturaDatos["Sucursal"]
      factura.usuarioExcepcion.nro_terminal = facturaDatos["N° Terminal"]
      factura.usuarioExcepcion.nom_localizacion = facturaDatos["Localización"]
    }

    factura.isProcesadaInterno = true;
    factura.isguardado = "S"
    factura.pagoOfflineData.pendiente = facturaDatos["Total Pendiente de Pago"]
    factura.pagoOfflineData.montoAbonado = facturaDatos["Total abonado"]
    factura.id_facturaPV = facturaDatos["N° Factura"]
    factura.plazo_credito = facturaDatos["plazo_credito"];
    factura.tipo_cambio = facturaDatos["Tipo de Cambio"];
    factura.id_tipo_identificacion = facturaDatos["id_tipo_identificacion"];
    factura.observaciones = facturaDatos["Observaciones"];
    factura.id_medio_pago = facturaDatos["id_medio_pago"];
    factura.id_moneda = facturaDatos["Monedas"]
    factura.identificacion_cliente = facturaDatos["N° Identificación"];
    factura.id_condicion_venta = facturaDatos["id_condicion_venta"];
    factura.cliente = facturaDatos["Clientes"];
    return;
  }

}
