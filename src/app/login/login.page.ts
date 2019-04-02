import { Component, OnInit } from '@angular/core';
import { NavController, Events, Platform } from '@ionic/angular';

// Providers
import { LocalStorageService } from '../services/local-storage.service';
import { ToastService } from '../services/toast.service';
import { PedidosPostService } from '../services/pedidos-post.service';
import { ActualizacionService } from '../services/actualizacion/actualizacion.service';



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
    private plt: Platform,
    private event: Events,
    private localStorageServ: LocalStorageService,
    private pedidosPostServ: PedidosPostService,
    private toastServ: ToastService,
    private navCtrl: NavController,
    private actulizacionServ: ActualizacionService
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

    this.localStorageServ.checkInternetConnection();
    this.showSplash = true;
    this.pedidosPostServ.login(this.id_cliente_ws, this.cedula, this.password).then((data: any) => {

      console.log(data);

      if (data[0].msg == "01" ||
          data[0].msg == "02" ||
          data[0].msg == "03" ||
          data[0].msg == "04" ||
          data[0].msg == "05") {
        if (this.plt.is('cordova')) {


          data[0].idUser = this.id_cliente_ws;
          data[0].usuario = this.cedula;
          console.log('Como se guarda la data del user desde el login: ')
          console.log(data[0])
          this.localStorageServ.insertAndInstantiateValue("dataUser", data[0]).then(()=>{
            this.usuarioValidoBool = true;
            this.usuarioValido = data[0].NombreUsuario;
            this.localStorageServ.searchAndInstantiateAllKeysInStorage().then(() => {
              console.log('Se encontró el dataUser')
              console.log(JSON.stringify(this.localStorageServ.localStorageObj["dataUser"]))
              this.navCtrl.navigateRoot('/menu').then(()=>{
              });
              this.showSplash = false;
            });
          });
        } else {


          data[0].idUser = this.id_cliente_ws;
          data[0].usuario = this.cedula;
          console.log('Como se guarda la data del user desde el login: ')
          console.log(data[0])
          this.localStorageServ.insertAndInstantiateValue("dataUser", data[0]);
          this.usuarioValidoBool = true;
          this.usuarioValido = data[0].NombreUsuario;
          this.localStorageServ.searchAndInstantiateAllKeysInStorage().then(() => {
            console.log('Se encontró el dataUser');
            this.localStorageServ.insertAndInstantiateValue("offlineOK" , false);
            this.navCtrl.navigateRoot('/menu');
            this.showSplash = false;
          })
        }
      } else {
        this.showSplash = false;
        this.toastServ.toastMensajeDelServidor(data[0].msg , "error");
      }
    }).catch(()=>{
      this.toastServ.toastMensajeDelServidor("Ingrese datos válidos" , "error")
    })
  }


  ngOnInit() {
  }

}
