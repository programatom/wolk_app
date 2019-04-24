import { Component, OnInit } from '@angular/core';
import { NotasDeCreditoService } from 'src/app/services/notas-de-credito/notas-de-credito.service';
import { NotasDeCreditoHttpService } from 'src/app/services/notas-de-credito/notas-de-credito-http.service';
import { ToastService } from 'src/app/services/toast.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-elejir-factura',
  templateUrl: './elejir-factura.page.html',
  styleUrls: ['./elejir-factura.page.scss'],
})
export class ElejirFacturaPage implements OnInit {

  diaInicial
  mesInicial
  annoInicial
  diaFinal
  mesFinal
  annoFinal
  filtro:string = "";
  showSplash: boolean;
  facturas: any = [];
  cantidadDeFacturasEncontradas = 0;

  constructor(private NCLogic: NotasDeCreditoService,
              private notasDeCreditoServHTTP: NotasDeCreditoHttpService,
              private toastServ: ToastService,
              public localStorageServ: LocalStorageService,
              private navCtrl: NavController) {

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

      var fechaInicial = this.addCeroToNumber(this.diaInicial) + "/" + this.addCeroToNumber(this.mesInicial) + "/" + this.annoInicial;
      var fechaFinal = this.addCeroToNumber(this.diaFinal) + "/" + this.addCeroToNumber(this.mesFinal) + "/" + this.annoFinal;

      this.showSplash = true;
      let data = {
        "id_cliente_ws": this.localStorageServ.localStorageObj.dataUser.idUser,
        "Fecha_ini": fechaInicial,
        "Fecha_fin": fechaFinal,
        "Moneda": "-",
        CondicionVenta:"-",
        UsuarioUbicacion:this.localStorageServ.localStorageObj.dataUser.nom_localizacion,
        "FiltroCodiPro": this.filtro
      }
      console.log(data)
      this.showSplash = true;

      this.notasDeCreditoServHTTP.buscarFacturas(data).subscribe((respuesta)=>{
        console.log(respuesta);
        this.showSplash = false;

        let respuestaServer = this.NCLogic.filterNCWithThisUser(respuesta);
        this.cantidadDeFacturasEncontradas = respuestaServer.length;
        this.facturas = respuestaServer;

      })
    }
  }

  alertNC(factura){
    let header = "Notas de crédito";
    let subHeader = "Elija una de estas acciones";
    let buttons = [{
      text:"Cancelar",
      role:"cancel"
    },{
      text:"Aplicar NC Parcial",
      handler:async ()=>{
        this.NCLogic.facturaElegida = new Object ();
        this.NCLogic.facturaElegida = factura;
        await this.NCLogic.inicializarFacturaElegida();
        this.navCtrl.navigateForward("/parcial-page");
      }
    },{
      text:"Aplicar NC Total",
      handler:async ()=>{
        this.NCLogic.facturaElegida = new Object ();
        this.NCLogic.facturaElegida = factura;
        await this.NCLogic.inicializarFacturaElegida();
        this.NCLogic.backURL = "/elejir-factura";
        this.navCtrl.navigateForward("/anular-factura");
      }
    },{
      text:"Ver Factura",
      handler:async ()=>{
        this.NCLogic.facturaElegida = new Object ();
        this.NCLogic.facturaElegida = factura;
        await this.NCLogic.inicializarFacturaElegida();
        this.NCLogic.backURL = "/elejir-factura";
        this.navCtrl.navigateForward("/factura-visual-hacienda-nc");
      }
    }];
    this.localStorageServ.presentAlert(header, subHeader, undefined, buttons);
  }

  addCeroToNumber(number) {

    if (parseInt(number) < 10) {
      return "0" + parseInt(number);
    } else {
      return number.toString();
    }
  }

  procesarFactura(){

  }


}
