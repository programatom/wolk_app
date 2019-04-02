import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { NavController } from '@ionic/angular';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-telefono-new',
  templateUrl: './telefono-new.page.html',
  styleUrls: ['./telefono-new.page.scss'],
})
export class TelefonoNewPage implements OnInit {
  codigosPaises:any;
  tiposTelefonos:any;

  telefono:number;

  idCodigoPais:string;
  idTipoTelefono:string;
  principal:boolean = true;

  showSplash = false;


  constructor(public clientesServ: ClienteService,
              private navCtrl: NavController,
              public localStorageServ: LocalStorageService,
              private toastServ: ToastService) { }
  dismiss(){
    this.navCtrl.navigateBack(this.clientesServ.newBackUrl);
  }
  ngOnInit() {

    this.clientesServ.selectPaises().subscribe((paises)=>{
      paises.splice(0 , 1);
      this.codigosPaises = paises;
      this.clientesServ.selectTiposTelefono().subscribe((telefonos)=>{
        telefonos.splice(0,1);
        this.tiposTelefonos = telefonos;
      })
    })
  }

  inputErroneo(){
    if(this.telefono == undefined ||
      this.idTipoTelefono == undefined ||
      this.idCodigoPais == undefined ){
        return true;
      }
  }

  agregarTelefono(){
    if(this.inputErroneo()){
      this.toastServ.toastMensajeDelServidor("Complete todos los campos", "error");
      return;
    }

    if((this.telefono).toString().length > 8 ){
      this.toastServ.toastMensajeDelServidor("El numero debe ser de máximo 8 dígitos", "error");
      return;
    }

    if(this.telefono < 0){
      this.toastServ.toastMensajeDelServidor("Ingrese un numero de telefono válido", "error");
      return;
    }

    let data:any = this.commonData();

    data.nombre = this.clientesServ.clienteNav.nombre;
    data.apellidos = this.clientesServ.clienteNav.apellidos;
    data.nombre_empresa = this.clientesServ.clienteNav.nombre_empresa;
    data.id_tipo_identificacion = this.clientesServ.clienteNav.id_tipo_identificacion;
    data.identificacion_cliente = this.clientesServ.clienteNav.identificacion_cliente;

    data.id_tipo_telefono = this.idTipoTelefono;
    data.id_pais = this.idCodigoPais;
    data.telefono = this.telefono;

    if(this.principal == false){
      data.ind_principal = "0";
    }
    this.showSplash = true;

    this.clientesServ.procesoTelefonos(data).subscribe((respuesta)=>{
      this.showSplash = false;
      if(respuesta){
        this.toastServ.toastMensajeDelServidor("Se cargó el telefono con éxito!", "success");
        this.clientesServ.clienteNewStatus.hasTelefono = true;
        this.dismiss();
      }else{
        console.log(respuesta)
        this.toastServ.toastMensajeDelServidor("Ocurrió algun error", "error");
      }
    })
  }

  commonData(){
    return {
      "id_cliente_ws": this.localStorageServ.localStorageObj.dataUser.idUser,
      "Usuario":this.localStorageServ.localStorageObj.dataUser.usuario,
      "ind_principal": "1"
    };
  }
}
