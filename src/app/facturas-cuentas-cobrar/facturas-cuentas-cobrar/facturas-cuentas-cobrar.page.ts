import { Component, OnInit } from '@angular/core';
import { FacturasAbiertasService } from 'src/app/services/facturas-abiertas/facturas-abiertas.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NavController } from '@ionic/angular';
import { DataFacturaService } from 'src/app/services/data-factura.service';
import { ToastService } from 'src/app/services/toast.service';
import { PedidosGetService } from 'src/app/services/pedidos-get.service';
import { ObjFactura, ObjUserData } from 'src/interfaces/interfaces';

@Component({
  selector: 'app-facturas-cuentas-cobrar',
  templateUrl: './facturas-cuentas-cobrar.page.html',
  styleUrls: ['./facturas-cuentas-cobrar.page.scss'],
})
export class FacturasCuentasCobrarPage implements OnInit {

  diaFinal:number
  mesFinal:number
  annoFinal:any

  diaInicial:number
  mesInicial:number
  annoInicial:any

  filtro = "";
  showSplash = false;
  facturas = [];

  user: ObjUserData;
  constructor(
    public facurasAbiertasServ: FacturasAbiertasService,
    public localStorageServ: LocalStorageService,
    private navCtrl: NavController,
    private dataFacturaServ: DataFacturaService,
    private toastServ: ToastService,
    private pedidosGetServ: PedidosGetService) {
      this.user = this.localStorageServ.localStorageObj.dataUser;
    }

  ngOnInit() {
    let cuatroDiasAtras = new Date();
    cuatroDiasAtras.setDate(cuatroDiasAtras.getDate() - 4);
    let mes1 = this.addCeroToNumber(cuatroDiasAtras.getMonth() + 1);
    let dia1 = this.addCeroToNumber(cuatroDiasAtras.getDate());
    let anno1 = cuatroDiasAtras.getFullYear();

    let unDiaAdelante = new Date();
    unDiaAdelante.setDate(unDiaAdelante.getDate() + 1);
    let mes2 = this.addCeroToNumber(unDiaAdelante.getMonth() + 1);
    let dia2 = this.addCeroToNumber(unDiaAdelante.getDate());
    let anno2 = unDiaAdelante.getFullYear();

    this.diaInicial =dia1;
    this.mesInicial =mes1;
    this.annoInicial =anno1;
    this.diaFinal = dia2;
    this.mesFinal = mes2;
    this.annoFinal = anno2;

  }

  dismiss(){
    this.navCtrl.navigateBack("/menu-crear-factura");
  }

  buscarFacturas(){
    var fechaInicial = this.mesInicial + "/" + this.diaInicial + "/" + this.annoInicial;
    var fechaFinal = this.mesFinal + "/" + this.diaFinal + "/" + this.annoFinal;

    let dateInicial = new Date(fechaInicial);
    let dateFinal = new Date(fechaFinal);

    if( dateInicial.toString() == "Invalid Date" ||
        dateFinal.toString() == "Invalid Date"){
      this.toastServ.toastMensajeDelServidor("La fecha ingresada es inválida" , "error")
    }else{
      this.showSplash = true;

      var fechaInicial = this.addCeroToNumber(this.diaInicial) + "/" + this.addCeroToNumber(this.mesInicial) + "/" + this.annoInicial;
      var fechaFinal = this.addCeroToNumber(this.diaFinal) + "/" + this.addCeroToNumber(this.mesFinal) + "/" + this.annoFinal;

      let data = {
        "id_cliente_ws": this.localStorageServ.localStorageObj.dataUser.idUser,
        "Fecha_ini": fechaInicial,
        "Fecha_fin": fechaFinal,
        "Moneda": "-",
        "FiltroCodiPro": this.filtro
      }
      console.log(data)
      this.showSplash = true;
      this.facurasAbiertasServ.selectfacturascreditoFiltro(data).subscribe((resp)=>{
        this.showSplash = false;
        console.log(resp);
        this.facturas = resp;
      });
    }
  }

  addCeroToNumber(number) {

    if (parseInt(number) < 10) {
      return "0" + parseInt(number);
    } else {
      return number.toString();
    }
  }



  procesarFactura(facturaAProcesar){
    this.showSplash = true
    let data = {
      "id_cliente_ws": this.localStorageServ.localStorageObj.dataUser.idUser,
      "vConsultaFacturaPV": facturaAProcesar["N° Factura"],
      "vConsultaSucursal": facturaAProcesar["Sucursal"],
      "vConsultaTerminal": facturaAProcesar["N° Terminal"],
      "vConsultaLocalizacion": facturaAProcesar["Localización"],
    };

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
            this.showSplash = false;
            this.navigate(factura);

          }else{
            // CASO 1.3 SE REALIZÓ ALGÚN PAGO
            this.showSplash = false;
            factura.pagoOfflineData.formaDePago = facturaDatos["Forma de Pago"]
            factura.noPaga = false;
            this.navigate(factura);
            console.log(this.dataFacturaServ.dataFactura)
          }
        }else{
          // CASO 2 SE ENVIÓ A HACIENDA
          this.showSplash = false;
          factura.claveDocHacienda = facturaDatos["Consecutivo Hacienda"];
          factura.isProcesada = true;
          factura.noPaga = false;
          this.navigate(factura);
          console.log(this.dataFacturaServ.dataFactura);
        }

        //facturaDatos["Localización"]
        //facturaDatos["N° Terminal"]
        //facturaDatos["Sucursal"]
        //facturaDatos["Usuario Creación"]
      })
    })
  }

  navigate(factura){
    console.log(factura);
    this.showSplash = true;
    this.pedidosGetServ.selectTotalesUbicaGrid(this.user.idUser, this.user.nom_localizacion, factura.id_facturaPV).then((respuesta: Array<any>)=>{
      console.log(respuesta);
      this.showSplash = false;
      this.dataFacturaServ.productosCXC = respuesta;
      this.dataFacturaServ.facturasTotalesType = "CXC";
      this.navCtrl.navigateForward("/facturas-totales");
    });
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
    factura.isguardado = "S"

    factura.isProcesadaInterno = true;
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
