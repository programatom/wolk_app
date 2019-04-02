import { Component, OnInit } from '@angular/core';
import { ClienteService } from 'src/app/services/cliente/cliente.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { NavController } from '@ionic/angular';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-cliente-edit',
  templateUrl: './cliente-edit.page.html',
  styleUrls: ['./cliente-edit.page.scss'],
})
export class ClienteEditPage implements OnInit {

  cliente: any;
  showSplash = false;
  objData = new Object() as any;
  asyncCount = 0;

  changeDetector = {
    "telefonos": false,
    "correos": false,
    "direcciones": false
  }


  constructor(private clientesServ: ClienteService,
    public localStorageServ: LocalStorageService,
    private navCtrl: NavController,
    private router: Router) { }

  ngOnInit() {
    this.cliente = this.clientesServ.clienteNav;
    this.clientesServ.clienteNav = {
      "nombre": this.cliente["Nombre"],
      "apellidos": this.cliente["Apellidos"],
      "nombre_empresa": this.cliente["Empresa"],
      "id_tipo_identificacion": this.cliente["IdTipoIdentificación"],
      "identificacion_cliente": this.cliente["N° Identificacíon"],
    };
    this.clientesServ.newBackUrl = "/cliente-edit"
    this.findNavigationEnd().subscribe((data)=>{
      if(data.url == "/cliente-edit"){
        this.initSelectValues();
      }
    });
    this.initSelectValues();
  }

  findNavigationEnd() {
    return this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        map((evento: NavigationEnd) =>  evento)
      )
  }

  initSelectValues() {
    this.showSplash = true;
    let data = {
      "id_cliente_ws": this.localStorageServ.localStorageObj.dataUser.idUser,
      "id_tipo_identificacion": this.cliente.IdTipoIdentificación,
      "identificacion_cliente": this.cliente["N° Identificacíon"]
    };
    this.clientesServ.selectCorreosClientes(data).subscribe((correos) => {
      console.log(correos)
      this.objData.correos = correos;
      this.clientesServ.selectTelefonosClientes(data).subscribe((telefonos) => {
        console.log(telefonos)
        this.objData.telefonos = telefonos;
        this.clientesServ.selectDireccionesClientes(data).subscribe((direcciones) => {
          console.log(direcciones)
          this.showSplash = false;
          this.objData.direcciones = direcciones;
        })
      })
    })


  }

  changeCheck(tipo, index) {
    if (tipo == "telefonos") {
      this.allPrincipalsToCero("telefonos", index);
      this.changeDetector[tipo] = true;
      this.objData[tipo][index].Principal = "1";
    }
    if (tipo == "correos") {
      this.allPrincipalsToCero("correos", index);
      this.objData[tipo][index].principal = "1";
      this.changeDetector[tipo] = true;
    }
    if (tipo == "direcciones") {
      this.allPrincipalsToCero("direcciones", index);
      this.objData[tipo][index].Principal = "1";
      this.changeDetector[tipo] = true;
    }
  }

  dismiss() {
    this.navCtrl.navigateBack("/cliente-list");
  }

  allPrincipalsToCero(tipo, index) {

    for (let i = 0; i < this.objData[tipo].length; i++) {
      if (this.objData[tipo][i].Principal != undefined) {
        if (i != index) {
          this.objData[tipo][i].Principal = "0";
        } else {
          this.objData[tipo][index].Principal = "1";
        }
      } else {
        if (i != index) {
          this.objData[tipo][i].principal = "0";
        } else {
          this.objData[tipo][index].principal = "1";
        }
      }
    }
    return;
  }

  guardarCambios() {
    let keys = Object.keys(this.changeDetector);
    for (let j = 0; j < keys.length; j++) {
      let key = keys[j];
      if (this.changeDetector[key]) {
        this.asyncCount = this.asyncCount + 1;
      }
    }
    this.showSplash = true;

    if (this.changeDetector["telefonos"]) {
      let principal = this.searchPrincipal("telefonos");
      let data: any = this.commonData();
      data.id_tipo_telefono = principal["TipoTeléfono"];
      data.telefono = principal["Teléfono"];
      data.id_pais = principal["CodPais"];
      this.clientesServ.procesoTelefonos(data).subscribe((data) => {
        console.log(data)
        this.asyncCount = this.asyncCount - 1;
        if (this.asyncCount == 0) {
          this.showSplash = false;
        }
      });
    }
    if (this.changeDetector["correos"]) {
      let principal = this.searchPrincipal("correos");
      let data: any = this.commonData();
      data.correo = principal.correo;
      this.clientesServ.procesoCorreos(data).subscribe((data) => {
        console.log(data)
        this.asyncCount = this.asyncCount - 1;
        if (this.asyncCount == 0) {
          this.showSplash = false;
        }
      });
    }
    if (this.changeDetector["direcciones"]) {
      let principal = this.searchPrincipal("direcciones");
      console.log(principal);
      let data: any = this.commonData();
      data.id_provincia = principal["ID Provincia"]
      data.id_canton = principal["ID Canton"]
      data.id_distrito = principal["ID Distrito"]
      data.id_barrio = principal["ID Barrio"]
      data.sennas = principal["Señas"]
      this.clientesServ.procesoDirecciones(data).subscribe((data) => {
        console.log(data)
        this.asyncCount = this.asyncCount - 1;
        if (this.asyncCount == 0) {
          this.showSplash = false;
        }
      });
    }
  }
  commonData() {
    return {
      "id_cliente_ws": this.localStorageServ.localStorageObj.dataUser.idUser,
      "id_tipo_identificacion": this.cliente.IdTipoIdentificación,
      "identificacion_cliente": this.cliente["N° Identificacíon"],
      "ind_principal": "1",
      "Usuario": this.localStorageServ.localStorageObj.dataUser.usuario,
    };
  }

  searchPrincipal(tipo) {

    for (let i = 0; i < this.objData[tipo].length; i++) {
      if (this.objData[tipo][i].Principal != undefined) {
        if (this.objData[tipo][i].Principal == "1") {
          return this.objData[tipo][i];
        }
      } else {
        if (this.objData[tipo][i].principal == "1") {
          return this.objData[tipo][i];
        }
      }
    }
  }

}
