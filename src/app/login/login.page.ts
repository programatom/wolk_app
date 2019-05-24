import { Component, OnInit } from '@angular/core';
import { NavController, Events } from '@ionic/angular';

// Providers
import { LocalStorageService } from '../services/local-storage.service';
import { ToastService } from '../services/toast.service';
import { PedidosPostService } from '../services/pedidos-post.service';



@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  password: string = '';
  cedula: string = '';
  id_cliente_ws: number;

  showSplash: boolean = false;

  animacion1Done: boolean = false;
  animacion2Done: boolean = false;
  mostrarUserVar: boolean = false;
  mostrarPWVar: boolean = false;

  gifActive: boolean = false;

  usuarioValido = "";
  usuarioValidoBool = false;

  constructor(
    private event: Events,
    private localStorageServ: LocalStorageService,
    private pedidosPostServ: PedidosPostService,
    private toastServ: ToastService,
    private navCtrl: NavController,
) {
    this.event.subscribe('errorServidor', () => {
      this.showSplash = false;
    })
  }


  mostrarUser() {
    if (this.animacion1Done == false) {
      this.animacion1Done = true;
      this.mostrarUserVar = true;
    }
  }

  mostrarPW() {
    if (this.animacion2Done == false) {
      this.animacion2Done = true;
      this.mostrarPWVar = true;
    }
  }

  ingresar() {

    let hasInternet = this.localStorageServ.checkInternetConnection();

    if(!hasInternet){
      if(this.localStorageServ.localStorageObj.last_user){

        if(this.id_cliente_ws == this.localStorageServ.localStorageObj.last_user_id
           && this.cedula == this.localStorageServ.localStorageObj.last_user
           && this.password == this.localStorageServ.localStorageObj.last_user_pw){
             this.advance(this.localStorageServ.localStorageObj.dataUser_last_login);
           }else{
             this.toastServ.toastMensajeDelServidor("No tiene conexión a internet!" , "error");
             return;
           }
      }
    }

    this.showSplash = true;
    this.pedidosPostServ.login(this.id_cliente_ws, this.cedula, this.password).then((data: any) => {

      console.log(data);

      if (data[0].msg == "01" ||
          data[0].msg == "02" ||
          data[0].msg == "03" ||
          data[0].msg == "04" ||
          data[0].msg == "05") {

            data[0].idUser = this.id_cliente_ws;
            data[0].usuario = this.cedula;

            this.localStorageServ.insertAndInstantiateValue("last_user_id", data[0].idUser);
            this.localStorageServ.insertAndInstantiateValue("last_user", data[0].usuario);
            this.localStorageServ.insertAndInstantiateValue("last_user_pw", this.password);
            this.localStorageServ.insertAndInstantiateValue("dataUser_last_login", data[0]);
            this.localStorageServ.insertAndInstantiateValue("offlineOK", false);

            this.advance(data[0]);

      } else {
        this.showSplash = false;
        this.toastServ.toastMensajeDelServidor(data[0].msg , "error");
      }
    }).catch(()=>{
      this.toastServ.toastMensajeDelServidor("Ingrese datos válidos" , "error")
    })
  }

  advance(dataUser){

    this.localStorageServ.insertAndInstantiateValue("dataUser", dataUser).then(()=>{
      this.usuarioValidoBool = true;
      this.usuarioValido = dataUser.NombreUsuario;
      this.localStorageServ.searchAndInstantiateAllKeysInStorage().then(() => {
        this.navCtrl.navigateRoot('/menu').then(()=>{
        });
        this.showSplash = false;
      });
    });
  }


  ngOnInit() {
  }

}
