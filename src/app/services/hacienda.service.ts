import { Injectable } from "@angular/core";
import { LocalStorageService } from "./local-storage.service";
import { ProcesoFacturasService } from "./proceso-facturas.service";

@Injectable({
  providedIn: "root"
})

export class HaciendaService{

  user;

  constructor(private localStorageServ: LocalStorageService,
              private procesoFacturasServ: ProcesoFacturasService){
    this.user = this.localStorageServ.localStorageObj.dataUser;
  }

  hacienda(tipo, objeto){

    if(tipo == "NOTADECREDITO"){
      //this.procesarNCEnHacienda(tipo, objeto);
    }{
      this.procesarFacturaEnHacienda();
    }

  }

  procesarFacturaEnHacienda(){

  }

  haciendaDisabled(isGuardada, consecutivoNC, consecutivoFactura){
    if(isGuardada == "N" || consecutivoNC != "0" || consecutivoFactura == "0"){
      return true;
    }else{
      return false;
    }
  }

 /*
  procesarNCEnHacienda(tipo, objeto) {
    return new Promise((resolve, reject) => {
      var id_clientews = this.user.idUser;
      var RecNoDoc = "";
      var RecTipoDoc = "";
      var id_documento = objeto.idNC; // VARIABLE CON KEY CAMBIANTE
      var pCorreos = objeto.correoCliente; // VARIABLE CON KEY CAMBIANTE
      var pNombreReceptor = objeto["Clientes"]; // VARIABLE CON KEY CAMBIANTE
      var UsuarioSucursal = this.user.sucursal;
      var UsuarioTerminal = this.user.nro_terminal;

      var pTipoDocumento = "03";
      //var ClaveFactura =
      var ZonaHoraria = "Central America Standard Time";
      var Usuario = this.user.usuario;
      this.procesoFacturasServ.procesarDocumentoHacienda(
        id_clientews,
        id_documento,
        pTipoDocumento,
        RecNoDoc,
        RecTipoDoc,
        pCorreos,
        pNombreReceptor,
        UsuarioSucursal,
        UsuarioTerminal,
        undefined, //CLAVE FACTURA
        ZonaHoraria,
        Usuario,
      ).then(async (respuesta) => {
        console.log(respuesta);
        if (respuesta["Estado"] == "ERROR") {
          this.toastServ.toastMensajeDelServidor(respuesta["Mensaje"], "error");
          resolve();
        } else if (respuesta["Estado"] == "ACEPTADO") {
          this.toastServ.toastMensajeDelServidor(respuesta["Mensaje"], "success");
          factura.isProcesada = true;
          factura.claveHaciendaNC = respuesta["Clave"];
          resolve();

        } else {
          this.toastServ.toastMensajeDelServidor(respuesta["Mensaje"], "error", 10000);
          factura.isProcesada = true;
          factura.claveHaciendaNC = respuesta["Clave"];
          resolve();

        }
      }).catch(()=>{
        reject("Comunícate con el soporte técnico Wolk +506 4000, error en el envío del documento a hacienda");
      })
    }).catch(()=>{
      reject("Comunícate con el soporte técnico Wolk +506 4000 1301 : Problema con el Servidor Dase de Datos al intentar Relacionar la NC a la factura de referencia");
    })

    })

  }

*/

}
