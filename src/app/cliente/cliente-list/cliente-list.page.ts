import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.page.html',
  styleUrls: ['./cliente-list.page.scss'],
})
export class ClienteListPage implements OnInit {

  clientes = [];
  clientesDisplay = [];
  showSplash = false;
  searchParam:string;

  constructor(private clientesServ: ClienteService,
              public localStorageServ: LocalStorageService,
              private navCtrl: NavController) { }


  dismiss(){
    this.navCtrl.navigateRoot("/menu");
  }

  ngOnInit() {
    let user = this.localStorageServ.localStorageObj.dataUser;
    let data = {
      "id_cliente": parseInt(user.idUser),
      "busqueda":""
    };
    this.showSplash = true;
    this.clientesServ.selectClientes( data ).subscribe((clientes)=>{
      this.showSplash = false;
      console.log(clientes)
      this.clientes = clientes;
      this.clientesDisplay = clientes.splice(0,20);
    });
  }

  nuevoCliente(){
    this.navCtrl.navigateForward("/cliente-new");
  }

  irACliente(cliente){
    this.clientesServ.clienteNav = cliente;
    this.navCtrl.navigateForward("/cliente-edit");
  }

  buscar(){
    this.clientesDisplay = this.buscarArrayReturnResults(this.clientes, this.searchParam).splice(0,20);
  }

  buscarArrayReturnResults( array, filtro){

    // Tengo que definir las keys que valen la pena
    let searchKeys = ["Nombre" , "Apellidos", "N° Identificacíon"];

    let arrayLength = array.length;
    let results = new Array();

    for(let i = 0; i < arrayLength; i ++){
      let match = false;
      let obj = new Object();
      obj = array[i];
      let keys = Object.keys(obj);
      let keysLength = keys.length;
      for(let j = 0; j < keysLength; j ++ ){
        let key = keys[j];
        for(let k = 0; k < searchKeys.length; k ++){

          let searchKey = searchKeys[k];
          if( searchKey == key ){
            let value = obj[key];
            if(isNaN(value) && isNaN(filtro)){
              if(value.toLowerCase().search(filtro.toLowerCase()) != - 1){
                results.push(obj);
                match = true;
                break;
              }
            }else{
              if(value.toString().toLowerCase().search(filtro.toString().toLowerCase()) != -1 ){
                results.push(obj);
                match = true;
                break;
              }
            }
          }
        }
        if(match){
          break;
        }
      }
    }
    return results;
  }

}
