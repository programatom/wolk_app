import { Component, OnInit, ViewChild } from '@angular/core';
import {
  NavController, Platform, Events
} from '@ionic/angular';

// Services
import { LocalStorageService } from '../services/local-storage.service';
import { CajaDiariaService } from '../services/caja-diaria/caja-diaria.service';
import { PedidosGetService } from '../services/pedidos-get.service';
import { ReporteDeGastosService } from '../services/reporte-de-gastos/reporte-de-gastos.service';
import { PedidosPostService } from '../services/pedidos-post.service';
import { ObjUserData, ObjLocalStorage } from 'src/interfaces/interfaces';
import { PrintService } from '../services/print.service';
import { ActualizacionService } from '../services/actualizacion/actualizacion.service';
import { ToastService } from '../services/toast.service';

//plugins


@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  @ViewChild('fondo') fondo;
  // ng Model
  urlFoto: any;

  // Variables operativas
  showSplash: boolean = false;

  terminal: string;
  sucursal: string;
  nombreUsuario: string;
  ubicacion: string;


  constructor(private printServ: PrintService,
    private event: Events,
    public localStorageServ: LocalStorageService,
    private navCtrl: NavController,
    private cajaDiaria: CajaDiariaService,
    private pedidosGetServ: PedidosGetService,
    private reporteServ: ReporteDeGastosService,
    private events: Events,
    private pedidosPostServ: PedidosPostService,
    private plt:Platform,
    private actualizacionServ: ActualizacionService,
    private toastServ: ToastService) {
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // VARIABLE TEST PONER EN FALSE PARA BUILDS DE PRODUCCION  !!!!!!!!!!!!!!!!!!!!!!!!
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // TEST VARIABLE CHANGE
    let test = false;
    if(this.plt.is("cordova") == false || test){
      this.localStorageServ.localStorageObj.dataUser.msg = "01";
    }

    this.events.subscribe("hideSplash", () => {
      this.showSplash = false;
    });

    this.events.subscribe("showSplash", () => {
      this.showSplash = true;
    });

    let usuario = this.localStorageServ.localStorageObj["dataUser"];

    this.terminal = usuario.nro_terminal;
    this.nombreUsuario = usuario.NombreUsuario;
    this.sucursal = usuario.sucursal;
    this.ubicacion = usuario.nom_localizacion;

    this.actualizacionServ.buscarActualizacion();

  }

  irAFactura() {
    this.navCtrl.navigateForward("/menu-crear-factura");
  }

  seleccionarImpresora(){
    this.printServ.buscarImpresora("/menu");
  }

  irACajaDiaria() {
    this.localStorageServ.checkInternetConnection()
    this.showSplash = true;
    let data = {
      "id_cliente": this.localStorageServ.localStorageObj.dataUser.idUser,
      "usuario": this.localStorageServ.localStorageObj.dataUser.usuario,
      "zona_horaria": "Central America Standard Time"
    };
    this.cajaDiaria.selectAll(data).then((respuestaArray: Array<any>) => {
      this.pedidosGetServ.validarCaja(data["id_cliente"], data["usuario"], data["zona_horaria"]).then((validacion) => {
        respuestaArray.push(validacion);
        this.cajaDiaria.initParams(respuestaArray);
        this.showSplash = false;
        this.navCtrl.navigateForward("/caja-diaria");
      })
      console.log(respuestaArray);
    });
  }

  irAVerificacion() {
    this.localStorageServ.checkInternetConnection()
    this.navCtrl.navigateForward("/verificacion-producto");
  }

  irAOrdenes() {
    this.localStorageServ.checkInternetConnection()
    this.navCtrl.navigateForward("/generar-orden");
  }

  irAReporteDeGastos() {
    this.localStorageServ.checkInternetConnection()
    this.showSplash = true;
    this.reporteServ.validarCaja();
  }

  irAClientes() {
    this.localStorageServ.checkInternetConnection()
    this.navCtrl.navigateForward("/cliente-list");
  }






  logout() {

    let keys = Object.keys(this.localStorageServ.localStorageObj);
    let keysLength = keys.length;

    let contador = 0;
    for (let i = 0; i < keysLength; i++) {
      let key = keys[i];
      let split = key.split("_");
      if (split[0] == "factura") {
        if (this.localStorageServ.localStorageObj[key].isProcesada == false &&
          this.localStorageServ.localStorageObj[key].exceptionHacienda != "procesando") {
            contador = contador + 1;
        }
      }
    }
    if (contador == 0){
      var subHeader = "No tiene facturas sin procesar, pero esta acción eliminará todas las facturas de contingencia ¿Esta seguro que desea salir de la sesión?";
      let header = "ALERTA !!!!!!!!!!";
      let buttons = [
        {
          text: "Cancelar",
          role: "cancel"
        },
        {
          text: "Aceptar",
          handler: () => {
            this.showSplash = true;
            let user:ObjUserData = this.localStorageServ.localStorageObj.dataUser;
            this.pedidosPostServ.cerrarSesion(user.idUser, user.usuario).then((respuestaCerrarSesion)=>{
              this.localStorageServ.eliminateAllValuesInStorage().then(() => {
                this.localStorageServ.localStorageObj = new Object() as ObjLocalStorage;
                this.showSplash = false;
                this.navCtrl.navigateRoot('/login');
              })

            })
          }
        }
      ]
      this.localStorageServ.presentAlert(header, subHeader, undefined, buttons)
    }else{
      this.toastServ.presentToast("Esta acción eliminará " + contador + " facturas de contingencia sin procesar! Debe guardarlas antes de poder salir de la sesión");
    }
  }



  ngOnInit() {

    this.event.subscribe('errorServidor', () => {
      this.showSplash = false;
    })


  }
}
