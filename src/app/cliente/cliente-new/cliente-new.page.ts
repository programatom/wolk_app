import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-cliente-new',
  templateUrl: './cliente-new.page.html',
  styleUrls: ['./cliente-new.page.scss'],
})
export class ClienteNewPage implements OnInit {

  tiposIdentificacion = [];

  idTipoIdentificacion:any = "";
  nroIdentificacion:string = "";
  nombreCliente:string = "";
  apellidoCliente:string = "";
  nombreComercial:string = "";
  descFijo:number = 0;
  activo:boolean = true;

  showSplash = false;

  constructor(public clientesServ: ClienteService,
              public localStorageServ: LocalStorageService,
              private navCtrl: NavController,
              private toastServ: ToastService) { }

  ngOnInit() {
    this.clientesServ.clienteNewStatus.isProcesado = false;
    this.clientesServ.clienteNewStatus.hasCorreo = false;
    this.clientesServ.clienteNewStatus.hasTelefono = false;
    this.clientesServ.clienteNewStatus.hasDireccion = false;

    this.clientesServ.selectTiposIdentificacion().subscribe((data)=>{
      data.splice(0 , 1);
      this.tiposIdentificacion = data;
    });
    this.clientesServ.newBackUrl = "/cliente-new";
    this.clientesServ.clienteNav = new Object();
  }

  dismiss(){
    this.navCtrl.navigateBack("/cliente-list");
  }

  limpiarVariables(){
    this.idTipoIdentificacion = "";
    this.nombreCliente = "";
    this.apellidoCliente = "";
    this.nombreComercial = "";
  }

  consultarPadron(){
    if(this.nroIdentificacion.search("_") == 0 || this.nroIdentificacion.search("-") == 0){
      this.toastServ.toastMensajeDelServidor("No se permite el ingreso de guiones en la cedula" , "error")
      this.showSplash = false;
      return;
    }

    this.limpiarVariables();
    this.nroIdentificacion? this.nroIdentificacion: this.nroIdentificacion = "";

    let data = {
      "num_identificacion":this.nroIdentificacion,
    }
    this.showSplash = true;
    this.clientesServ.cargarClientesPadron(data).subscribe((data)=>{
      console.log(data);
      this.showSplash = false;
      if(data.length == 0){
        this.toastServ.toastMensajeDelServidor("No se encontraron datos para ese número de identificación. Debe ingresar los datos de forma manual")
      }else{
        let cliente = data[0];
        this.nombreCliente = cliente.nom_nombre;
        if(cliente.tipo_identificacion == "02"){
          this.nombreComercial = cliente.nom_nombre
        }

        this.apellidoCliente = cliente.nom_primer_apellido + cliente.nom_segundo_apellido;
        this.idTipoIdentificacion = cliente.tipo_identificacion;

      }
    });
  }

  procesarCliente(){
    console.log(this.activo);

    var activoString = "0";
    if(this.activo){
      activoString = "1";
    }

    if(this.descFijo > 100 || this.descFijo < 0){
      this.toastServ.toastMensajeDelServidor("Ingrese un descuento válido" , "error")
      this.showSplash = false;
      return;
    }
    if(this.nroIdentificacion.search("_") == 0 || this.nroIdentificacion.search("-") == 0){
      this.toastServ.toastMensajeDelServidor("No se permite el ingreso de guiones en la cedula" , "error")
      this.showSplash = false;
      return;
    }

    const longCedulasFisicas = [9];
    const longCedulasJuridicas = [10];
    const longDimex = [11, 12]
    console.log(this.idTipoIdentificacion)
    if(this.idTipoIdentificacion == "01"){
      if(!longCedulasFisicas.includes(this.nroIdentificacion.length)){
        this.toastServ.toastMensajeDelServidor("Para cedulas físicas el numero de identificación debe ser de 9 caracteres" , "error")
        return;
      }
    }else if(this.idTipoIdentificacion == "02"){
      if(!longCedulasJuridicas.includes(this.nroIdentificacion.length)){
        this.toastServ.toastMensajeDelServidor("Para cedulas Jurídicas el numero de identificación debe ser de 10 caracteres" , "error")
        return;
      }
    }else if (this.idTipoIdentificacion == "03"){
      if(!longDimex.includes(this.nroIdentificacion.length)){
        this.toastServ.toastMensajeDelServidor("Para cedulas DIMEX el numero de identificación debe ser de 11 o 12 caracteres" , "error")
        return;
      }
    }


    let data = {
      id_cliente_ws: this.localStorageServ.localStorageObj.dataUser.idUser,
      nombre: this.nombreCliente,
      apellidos: this.apellidoCliente,
      nombre_empresa: this.nombreComercial,
      id_tipo_identificacion: this.idTipoIdentificacion,
      identificacion_cliente: this.nroIdentificacion,
      Activo: activoString,
      Desc_cliente: this.descFijo,
      Usuario: this.localStorageServ.localStorageObj.dataUser.usuario,
    };
    this.showSplash = true;
    this.clientesServ.procesoClientesC(data).subscribe((respuesta)=>{
      this.showSplash = false;
      if(respuesta == true){
        this.clientesServ.clienteNewStatus.isProcesado = true;
        this.clientesServ.clienteNav = {
          "nombre": data["nombre"],
          "apellidos": data["apellidos"],
          "nombre_empresa": data["nombre_empresa"],
          "id_tipo_identificacion": data["id_tipo_identificacion"],
          "identificacion_cliente": data["identificacion_cliente"],
        };
        this.toastServ.toastMensajeDelServidor("Procesado exitosamente! Debe ingresar como mínimo un email, un correo y una dirección.", "success");
      }else{
        this.toastServ.toastMensajeDelServidor("Comunícate con el soporte técnico Wolk +506 4000 1301 : Problema con el Servidor Dase de Datos al intentar almacenar cliente nuevo", "error")
      }
    })
  }

}
