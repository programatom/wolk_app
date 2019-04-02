import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-direccion-new',
  templateUrl: './direccion-new.page.html',
  styleUrls: ['./direccion-new.page.scss'],
})
export class DireccionNewPage implements OnInit {

  selectStatus: {
    "hasProvincia": boolean
    "hasCanton": boolean
    "hasDistrito": boolean
    "hasBarrio": boolean
  }

  provincias;
  cantones = [];
  barrios = [];
  distritos = [];

  showSplash = false;

  idProvincia: string;
  idCanton: string;
  idBarrio: string;
  idDistrito: string;
  sennas:string = "";

  principal:boolean = true;

  constructor(public clientesServ: ClienteService,
    private navCtrl: NavController,
    public localStorageServ: LocalStorageService,
    private toastServ: ToastService) {

  }

  ngOnInit() {
    this.selectStatus = {
      "hasProvincia": false,
      "hasCanton": false,
      "hasDistrito": false,
      "hasBarrio": false,
    };
    this.clientesServ.selectProvincias().subscribe((respuesta) => {
      respuesta.splice(0 , 1)
      this.provincias = respuesta;
      console.log(respuesta)
    })
  }

  selectChange(tipo) {
    this.showSplash = true;
    if (tipo == "provincia") {
      this.idCanton = undefined;
      this.idBarrio = undefined;
      this.idDistrito = undefined;
      this.selectStatus.hasDistrito = false
      this.selectStatus.hasBarrio = false
      this.selectStatus.hasCanton = false
      console.log(this.selectStatus)
      this.selectStatus.hasProvincia = true;
      this.clientesServ.selectCantones({
        "id_provincia": this.idProvincia,
      }).subscribe((cantones) => {
        cantones.splice(0 , 1)
        this.cantones = cantones;
        this.selectStatus.hasProvincia = true;
        this.showSplash = false
      });
    }

    if (tipo == "canton" && this.idCanton != undefined) {
      this.idBarrio = undefined;
      this.idDistrito = undefined;
      this.selectStatus.hasDistrito = false
      this.selectStatus.hasBarrio = false

      this.clientesServ.selectDistritos({
        "id_provincia": this.idProvincia,
        "id_canton": this.idCanton
      }).subscribe((distritos) => {
        distritos.splice(0 , 1)
        this.distritos = distritos;
        this.selectStatus.hasCanton = true;
        this.showSplash = false
      });
    }

    if (tipo == "distrito" &&
        this.idCanton != undefined &&
        this.idDistrito!= undefined &&
        this.idProvincia != undefined) {

      this.selectStatus.hasBarrio = false
      this.idBarrio = undefined;
      this.selectStatus.hasProvincia = true;
      this.clientesServ.selectBarrios({
        "id_provincia": this.idProvincia,
        "id_canton": this.idCanton,
        "id_distrito": this.idDistrito
      }).subscribe((barrios) => {
        barrios.splice(0, 1);
        this.barrios = barrios;
        this.selectStatus.hasDistrito = true;
        this.showSplash = false
      });
    }
    if (tipo == "barrio" && this.idCanton != undefined &&
    this.idDistrito!= undefined &&
    this.idProvincia != undefined) {
      this.showSplash = false;
      this.selectStatus.hasBarrio = true;
    }
  }

  dismiss() {
    this.navCtrl.navigateBack(this.clientesServ.newBackUrl);
  }


  agregarDireccion() {


    this.showSplash = true;
    let data: any = this.commonData();
    data.nombre = this.clientesServ.clienteNav.nombre;
    data.apellidos = this.clientesServ.clienteNav.apellidos;
    data.nombre_empresa = this.clientesServ.clienteNav.nombre_empresa;
    data.id_tipo_identificacion = this.clientesServ.clienteNav.id_tipo_identificacion;
    data.identificacion_cliente = this.clientesServ.clienteNav.identificacion_cliente;

    data.id_provincia = this.idProvincia
    data.id_canton = this.idCanton
    data.id_distrito = this.idDistrito
    data.id_barrio = this.idBarrio
    data.sennas = this.sennas;

    if(this.principal == false){
      data.ind_principal = "0";
    }

    this.clientesServ.procesoDirecciones(data).subscribe((respuesta) => {
      if (respuesta == true) {
        this.toastServ.toastMensajeDelServidor("Se agregó la dirección con éxito!", "success");
        this.clientesServ.clienteNewStatus.hasDireccion = true;
        this.navCtrl.navigateBack(this.clientesServ.newBackUrl);
      } else {
        this.toastServ.toastMensajeDelServidor("Ocurrió algun error!", "error");
      }
    })
  }

  commonData() {
    return {
      "id_cliente_ws": this.localStorageServ.localStorageObj.dataUser.idUser,
      "Usuario": this.localStorageServ.localStorageObj.dataUser.usuario,
      "ind_principal": "1"
    };
  }


}
