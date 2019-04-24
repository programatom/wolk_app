import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { PedidosGetService } from 'src/app/services/pedidos-get.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NotasDeCreditoHttpService } from 'src/app/services/notas-de-credito/notas-de-credito-http.service';
import { ToastService } from 'src/app/services/toast.service';
import { NotasDeCreditoService } from 'src/app/services/notas-de-credito/notas-de-credito.service';
import { PrintService } from 'src/app/services/print.service';

@Component({
  selector: 'app-anular-factura',
  templateUrl: './anular-factura.page.html',
  styleUrls: ['./anular-factura.page.scss'],
})
export class AnularFacturaPage implements OnInit {

  formaDePagoID = "caja x efectivo";
  formasDePago:any = [];
  user:any;
  observaciones:string = "";
  factura:any;
  showSplash: boolean;

  constructor(private navCtrl: NavController,
              private pedidosGetServ: PedidosGetService,
              public localStorageServ: LocalStorageService,
              private NCServHTTP: NotasDeCreditoHttpService,
              private NCLogic: NotasDeCreditoService,
              private toastServ: ToastService,
              private printServ: PrintService,
              private _NCServ: NotasDeCreditoService) { }

  ngOnInit() {
    this.factura = this.NCLogic.facturaElegida;
    console.log(this.factura)
    this._NCServ.searchClienteAndInsertDisAndEmOnFactura(this.factura["N° Identificación"], this.factura).then((result)=>{
      console.log(result)
    })
    this.user = this.localStorageServ.localStorageObj.dataUser;
    this.pedidosGetServ.selectCuentasFormasdePagoActivas(this.user.idUser).then((array: any) => {
      array.splice(0, 1);
      this.formasDePago = array;
    });
  }

  anularFactura(){

    let terminalUser = this.user.nro_terminal;
    let sucursalUser = this.user.sucursal;

    let terminalFactura = this.factura["N° Terminal"];
    let sucursalFactura = this.factura["Sucursal"];


    if(terminalUser != terminalFactura){
      this.toastServ.toastMensajeDelServidor("No puede anular una nota de crédito en una factura emitida por otra terminal");
      return;
    }

    if(sucursalUser != sucursalFactura){
      this.toastServ.toastMensajeDelServidor("No puede anular una nota de crédito en una factura emitida por otra sucursal");
      return;
    }

    let data = {
      id_cliente_ws: this.user.idUser,
      id_facturaPV: this.factura["N° Factura"],
      sucursal: sucursalUser,
      nro_terminal: terminalUser,
      nom_localizacion:this.user.nom_localizacion,
      nom_formaPago: this.formaDePagoID,
      id_codigo_referencia: "01",
      observaciones_nc: this.observaciones,
      ZonaHoraria:"Central America Standard Time",
      Usuario: this.user.usuario
    };

    console.log(data)
    this.showSplash = true;

    this.NCServHTTP.procesoNCClientes(data).subscribe((respuesta)=>{
      console.log(respuesta);
      let number = parseInt(respuesta);
      this.showSplash = false;
      if(number > 0 ){
        this.factura.isAnulada = true;
        this.factura.motivoID = "01";
        this.factura.observacionesNC = this.observaciones;
        this.factura.formaDePagoID = this.formaDePagoID;

        this.factura.idNC = number;
      }else if (number < 0){
        this.toastServ.toastMensajeDelServidor("Consulte a soporte ERROR al generar NC de Anulación" , "error");
        return
      }else if (number == 0){
        this.toastServ.toastMensajeDelServidor("Ya la factura de referencia tiene una NC de ANULACION , favor verifique" , "error");
        return
      }
    })
  }

  imprimir(reimpresion){

    // Acá tengo que mandar el id de la respuesta de hacienda
    let data  = {
      id_cliente_ws: this.user.idUser,
      id_facturaPV: this.factura.idNC,
      nombreUsuario: this.user.NombreUsuario,
      sePagaCon: -1,
      vuelto: -1,
      clave: this.factura["Consecutivo Hacienda"],
      reImpresion: reimpresion
    }
    console.log(data)

    this.NCServHTTP.buscarPrintString(data).subscribe((printString)=>{
      console.log(printString)
      this.printServ.printFN(this.localStorageServ.localStorageObj.impresora, printString).then(()=>{
      }).catch((error)=>{
        if(error == "No hay impresora"){
          this.printServ.buscarImpresora("/anular-factura").then(()=>{
          }).catch(()=>{
          })
        }
      })
    })
  }

  procesarNCEnHacienda(){
    this.showSplash = true;
    this._NCServ.procesarNCEnHacienda(this.factura).then(()=>{
      this.showSplash = false;
    }).catch(()=>{
      this.toastServ.toastMensajeDelServidor("Comunícate con el soporte técnico Wolk +506 4000 1301 : Problema con el Servidor Base de Datos al intentar Relacionar la NC a la factura de referencia")
    })
  }


  dismiss(){
    this.navCtrl.navigateBack(this.NCLogic.backURL)
  }

}
