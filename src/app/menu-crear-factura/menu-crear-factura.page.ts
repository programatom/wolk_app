import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';


// Services
import { LocalStorageService } from '../services/local-storage.service';
import { ToastService } from '../services/toast.service';
import { DataFacturaService } from '../services/data-factura.service';
import { ProcesoFacturasService } from '../services/proceso-facturas.service';
import {  ObjUserData, ObjFactura } from 'src/interfaces/interfaces';
import { PedidosGetService } from '../services/pedidos-get.service';
import { AlertOptions } from '@ionic/core';
import { PedidosPostService } from '../services/pedidos-post.service';
import { CajaDiariaService } from '../services/caja-diaria/caja-diaria.service';
import { FacturasAbiertasService } from '../services/facturas-abiertas/facturas-abiertas.service';
import { ActualizacionService } from '../services/actualizacion/actualizacion.service';


@Component({
  selector: 'app-menu-crear-factura',
  templateUrl: './menu-crear-factura.page.html',
  styleUrls: ['./menu-crear-factura.page.scss'],
})
export class MenuCrearFacturaPage implements OnInit {

  showSplash: boolean = false;

  constructor(private alertCtrl: AlertController,
    public localStorageServ: LocalStorageService,
    private toastServ: ToastService,
    public dataFacturaServ: DataFacturaService,
    private procesoFacturasServ: ProcesoFacturasService,
    private navCtrl: NavController,
    private pedidosGetServ: PedidosGetService,
    private pedidosPostServ: PedidosPostService,
    private cajaDiaria: CajaDiariaService,
    private facturasAbiertasServ: FacturasAbiertasService,
    private actualizacionServ: ActualizacionService) { }

    ngOnInit(){
    }



    sincronizarDatosParaFacturaOffline(){
      this.showSplash = true;
      this.dataFacturaServ.inicializarOfflineData().then((resp) => {
        this.showSplash = false;
        let header = "Aviso importante"
        let subHeader = "Se sincronizaron los datos con éxito, recuerde realizar esta acción antincipandose a los periodos de contingencia para trabajar con datos actualizados";
        let buttons = [{
          text:"Entendido",
          role:"cancel"
        }]
        this.localStorageServ.presentAlert( header, subHeader, undefined, buttons);
        console.log(resp, this.localStorageServ.localStorageObj);
      });
    }

  crearFactura(modo) {
    if (modo == "online") {
      this.localStorageServ.checkInternetConnection();

      //MODO online

      //Acá inicializo todos los default values del objeto Factura.

      this.showSplash = true;

      this.pedidosGetServ.validarCaja(this.localStorageServ.localStorageObj['dataUser'].idUser,this.localStorageServ.localStorageObj['dataUser'].usuario,'Central America Standard Time').then((cajaValidada:any)=>{
        this.showSplash = false;
        this.toastServ.toastMensajeDelServidor('La caja está: ' + cajaValidada.respuestacaja);
        if(cajaValidada.respuestacaja == 'CERRADA' && cajaValidada != 'error'){
          let objAlert = {
            title: 'Caja cerrada',
            subTitle: 'Debe abrir la caja ingresando un monto inicial',
            inputs:[{
              placeholder:'Monto inicial',
            }],
            buttons:[{
              text:'Cancelar',
              role:'cancel'
            },
          {
            text:'Aceptar',
            handler:(montoInicial)=>{
              //Procesar apertura de caja
              if(typeof montoInicial[0] == "string"){
                let monto:string = montoInicial[0];
                let montoPunto = monto.replace(",",".");
                var montoNum = parseFloat(montoPunto);
                if(isNaN(montoNum)){
                  this.toastServ.toastMensajeDelServidor("Ingrese un numero" , "error")
                  return;
                }
              }else{
                var montoNum:number = montoInicial[0];
              }
              if(montoNum < 0){
                this.toastServ.toastMensajeDelServidor("Ingreso inválido")
                return;
              }

              let user:ObjUserData = this.localStorageServ.localStorageObj.dataUser;
              this.pedidosPostServ.abrirCaja(
                parseInt(user.idUser),
                user.sucursal,
                user.nro_terminal,
                user.nom_localizacion,
                montoNum,
                user.usuario
              ).then((resp:any)=>{
                if(resp == "true"){
                  this.inicializarVariablesOnline();
                  console.log(this.dataFacturaServ.dataFactura.subTotales)
                  this.getFacturaID();
                }else{
                  this.toastServ.toastMensajeDelServidor("Comunícate con el soporte técnico Wolk +506 4000 1301 : Problema con el Servidor Dase de Datos al intentar ABRIR LA CAJA")
                }
              })
            }
          }]
        }
        this.localStorageServ.presentAlert(objAlert["title"], objAlert["subTitle"], objAlert["inputs"], objAlert["buttons"]);
      }else if(cajaValidada.respuestacaja == "CIERRE DIARIO"){
        let header = " El cierre de caja esta definido como DIARIO. ¿Desea realizar el cierre ahora?";
        let subHeader = undefined;
        let buttons = [
          {
            text:"Cancelar",
            role:"cancel"
          },
          {
            text:"Aceptar",
            handler: ()=>{
              this.showSplash = true;
              let data = {
                "id_cliente":this.localStorageServ.localStorageObj.dataUser.idUser,
                "usuario":this.localStorageServ.localStorageObj.dataUser.usuario,
                "zona_horaria": "Central America Standard Time"
              };
              this.cajaDiaria.selectAll(data).then((respuestaArray:Array<any>)=>{
                this.pedidosGetServ.validarCaja(data["id_cliente"], data["usuario"], data["zona_horaria"]).then((validacion)=>{
                  respuestaArray.push(validacion);
                  this.cajaDiaria.initParams(respuestaArray);
                  this.showSplash = false;
                  this.navCtrl.navigateForward("/caja-diaria");
                })
                console.log(respuestaArray);
              });
            }
          }
        ]
        this.localStorageServ.presentAlert(header, subHeader, undefined, buttons)
      } else {
        this.inicializarVariablesOnline();
        this.getFacturaID();
      }
      })

    } else {
      console.log(this.localStorageServ.localStorageObj.offlineOK)
      if(this.localStorageServ.localStorageObj.offlineOK == "true" ||
         this.localStorageServ.localStorageObj.offlineOK == true){
        this.inicializarDataOffline();
        this.navCtrl.navigateForward("/crear-factura-offline/datos-de-cliente");
      }else{
        this.toastServ.toastMensajeDelServidor("Debe sincronizar los datos para el modo offline antes de realizar esta acción", "error")
        return;
      }
    }
  }

  inicializarDataOffline(){
    this.dataFacturaServ.dataFacturaOffline = new Object() as ObjFactura;
    this.dataFacturaServ.dataFacturaOffline.arrayProductos = [];
    this.dataFacturaServ.dataFacturaOffline.facturaOfflineVisualize = [];
    this.dataFacturaServ.dataFacturaOffline.emailCopy = "";
    this.dataFacturaServ.dataFacturaOffline.isProcesada = false;
    this.dataFacturaServ.dataFacturaOffline.noPaga = true;
    this.dataFacturaServ.dataFacturaOffline.exceptionHacienda = "";
    this.dataFacturaServ.dataFacturaOffline.descuentoFijo = 0;
    this.dataFacturaServ.dataFacturaOffline.isguardado = "N";
    this.dataFacturaServ.dataFacturaOffline.emailCliente = "";

    this.dataFacturaServ.dataFacturaOffline.pagoOfflineData = {
      "pendiente":undefined,
      "formaDePago":""
    }

    return;
  }

  inicializarVariablesOnline(){
    this.dataFacturaServ.inicializarDataOnline();
    return;
  }

  getFacturaID() {
    this.showSplash = true;
    this.procesoFacturasServ.procesoFacturaFn(this.localStorageServ.localStorageObj['dataUser'].idUser,
      0,
      0,
      "",
      "",
      this.localStorageServ.localStorageObj['dataUser'].sucursal,
      this.localStorageServ.localStorageObj['dataUser'].nro_terminal,
      this.localStorageServ.localStorageObj['dataUser'].nom_localizacion,
      "",
      "",
      0,
      "",
      "",
      0,
      "",
      "N",
      "",
      this.localStorageServ.localStorageObj['dataUser'].usuario).then((numeroDocumento:any) => {
        this.showSplash = false;
        this.dataFacturaServ.dataFactura.id_facturaPV = numeroDocumento;
        this.navCtrl.navigateForward('/datos-de-venta');
      })
  }


  checkearCaja(tipo) {
    this.localStorageServ.checkInternetConnection();

    this.showSplash = true;
    let data = {
      "id_cliente": this.localStorageServ.localStorageObj.dataUser.idUser,
      "usuario": this.localStorageServ.localStorageObj.dataUser.usuario,
      "zona_horaria": "Central America Standard Time"
    };
    this.pedidosGetServ.validarCaja(data["id_cliente"], data["usuario"], data["zona_horaria"]).then((cajaValidada: any) => {
      if (cajaValidada.respuestacaja == 'CERRADA') {
        this.showSplash = false;
        this.toastServ.toastMensajeDelServidor("No se puede realizar esta acción con la caja cerrada", "error");
        return;
      } else {
        if (tipo == "FCXC") {
          this.showSplash = false;
          this.irAFacturasPorCobrar();
        } else if (tipo == "FA"){
          this.irAFacturasAbiertas();
        }else if (tipo == "NC"){
          this.showSplash = false;
          //this.toastServ.toastMensajeDelServidor("Esta función estará disponible en la próxima versión")
          this.irANotasDeCredito();
        }else if (tipo == "FSP"){
          this.showSplash = false;
          this.irFacturasSinProcesar();
        }else if (tipo == "verNC"){
          this.showSplash = false;
          //this.toastServ.toastMensajeDelServidor("Esta función estará disponible en la próxima versión")
          this.irAVerNC();
        }
      }
    })
  }
  irAVerNC(){
    this.navCtrl.navigateForward("/notas-realizadas");
  }

  irFacturasSinProcesar(){
    this.navCtrl.navigateForward("/crear-factura-offline/facturas-a-procesar")
  }

  irAFacturasPorCobrar() {
    this.navCtrl.navigateForward("/facturas-cuentas-cobrar");
  }

  agregarCeros(number) {
    if (number < 10) {
      return "0" + number.toString();
    } else {
      return number;
    }
  }

  irANotasDeCredito(){
    this.navCtrl.navigateForward("/elejir-factura");
  }


  irAFacturasAbiertas() {
    this.showSplash = true;
    let cuatroDiasAtras = new Date();
    cuatroDiasAtras.setDate(cuatroDiasAtras.getDate() - 4);
    let mes1 = this.agregarCeros(cuatroDiasAtras.getMonth() + 1);
    let dia1 = this.agregarCeros(cuatroDiasAtras.getDate());
    let anno1 = cuatroDiasAtras.getFullYear();
    let fecha1 = dia1 + "/" + mes1 + "/" + anno1;

    let unDiaAdelante = new Date();
    unDiaAdelante.setDate(unDiaAdelante.getDate() + 1);
    let mes2 = this.agregarCeros(unDiaAdelante.getMonth() + 1);
    let dia2 = this.agregarCeros(unDiaAdelante.getDate());
    let anno2 = unDiaAdelante.getFullYear();
    let fecha2 = dia2 + "/" + mes2 + "/" + anno2;

    let data = {
      "id_cliente_ws": this.localStorageServ.localStorageObj.dataUser.idUser,
      "Fecha_ini": fecha1,
      "Fecha_fin": fecha2,
      "Moneda": "-",
      "FiltroCodiPro": this.localStorageServ.localStorageObj.dataUser.usuario
    }

    this.showSplash = true;
    this.facturasAbiertasServ.selectfacturascreditoFiltro(data).subscribe((resp) => {
      this.showSplash = false;
      this.facturasAbiertasServ.facturas = resp;
      this.navCtrl.navigateForward("/facturas-abiertas")
    })
  }


}
