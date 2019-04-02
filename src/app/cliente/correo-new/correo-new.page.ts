import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { NavController } from '@ionic/angular';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-correo-new',
  templateUrl: './correo-new.page.html',
  styleUrls: ['./correo-new.page.scss'],
})
export class CorreoNewPage implements OnInit {

  correo:string = "";
  showSplash = false;
  principal:boolean = true;


  constructor(public clientesServ: ClienteService,
              private navCtrl: NavController,
              public localStorageServ: LocalStorageService,
              private toastServ: ToastService) {

              }

  ngOnInit() {

  }

  dismiss(){
    this.navCtrl.navigateBack(this.clientesServ.newBackUrl);
  }

  correoErroneo(){
    if(this.correo.indexOf('@') == -1 ){
      return true
    }else{
      return false;
    }
  }

  agregarCorreo(){

    if(this.correoErroneo()){
      this.toastServ.toastMensajeDelServidor("El correo ingresado es inválido");
      return;
    }

    this.showSplash = true;
    let data:any = this.commonData();
    data.nombre = this.clientesServ.clienteNav.nombre;
    data.apellidos = this.clientesServ.clienteNav.apellidos;
    data.nombre_empresa = this.clientesServ.clienteNav.nombre_empresa;
    data.id_tipo_identificacion = this.clientesServ.clienteNav.id_tipo_identificacion;
    data.identificacion_cliente = this.clientesServ.clienteNav.identificacion_cliente;

    data.correo = this.correo;

    if(this.principal == false) {
      data.ind_principal = "0";
    }
    console.log(data);
    this.clientesServ.procesoCorreos(data).subscribe((respuesta)=>{
      console.log(respuesta)
      if(respuesta == true){
        this.toastServ.toastMensajeDelServidor("Se agregó el correo con éxito", "success");
        this.clientesServ.clienteNewStatus.hasCorreo = true;
        this.navCtrl.navigateBack(this.clientesServ.newBackUrl);
      } else {
        this.toastServ.toastMensajeDelServidor("Ocurrió algun error!", "error");
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
