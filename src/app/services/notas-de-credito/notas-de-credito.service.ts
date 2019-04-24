import { Injectable } from '@angular/core';
import { LocalStorageService } from '../local-storage.service';
import { ObjUserData } from 'src/interfaces/interfaces';
import { ProcesoFacturasService } from '../proceso-facturas.service';
import { ToastService } from '../toast.service';
import { Events } from '@ionic/angular';
import { NotasDeCreditoHttpService } from './notas-de-credito-http.service';
import { PedidosGetService } from '../pedidos-get.service';

@Injectable({
  providedIn: 'root'
})
export class NotasDeCreditoService {

  //isAnulada
  //idNC
  //descuentoFijo
  //

  facturaElegida = new Object() as any;
  user: ObjUserData;
  NCElegida = new Object() as any;

  backURL = "";


  constructor(private localStorageServ: LocalStorageService,
    private procesoFacturasServ: ProcesoFacturasService,
    private toastServ: ToastService,
    private event: Events,
    private _NCHttp: NotasDeCreditoHttpService,
    private pedidosGetServ: PedidosGetService
  ) {
    this.user = this.localStorageServ.localStorageObj.dataUser;
  }

  async inicializarFacturaElegida() {
    let facturaElegidaAInicializarEnComp = this.facturaElegida;
    facturaElegidaAInicializarEnComp.isAnulada = false;
    facturaElegidaAInicializarEnComp.isProcesada = false;
    facturaElegidaAInicializarEnComp.claveHaciendaNC = "0";
    facturaElegidaAInicializarEnComp.descuentoFijo = 0;
    facturaElegidaAInicializarEnComp.formaDePagoID = "";
    facturaElegidaAInicializarEnComp.idNC = 0;
    facturaElegidaAInicializarEnComp.id_condicion_de_venta = "";
    facturaElegidaAInicializarEnComp.id_medio_de_pago = "";

    facturaElegidaAInicializarEnComp.motivoID = "0";
    facturaElegidaAInicializarEnComp.observacionesNC = "";
    facturaElegidaAInicializarEnComp.isguardado = "N";
    const ids:any = await this.getIDsOfCondicionYMedio(facturaElegidaAInicializarEnComp["Medios de Pago"] ,facturaElegidaAInicializarEnComp["Condicion Venta"]);
    facturaElegidaAInicializarEnComp.id_condicion_de_venta = ids.id_condicion;
    facturaElegidaAInicializarEnComp.id_medio_de_pago = ids.id_medio;

    return;
  };


  insertDocumentoReferenciaNC(factura) {
    return new Promise((resolve, reject) => {
      let substrClaveIDDoc:string = factura["Consecutivo Hacienda"];
      substrClaveIDDoc = substrClaveIDDoc.substring(29, 31);

      let data = {
        id_cliente_ws: parseInt(this.user.idUser),
        pIdNotaCredito: factura.idNC,
        pIdTipoDocumento: substrClaveIDDoc,
        pClave: factura["Consecutivo Hacienda"],
        pFechaEmision: factura["Fechas Creación"],
        pIdCodigoReferencia: factura.motivoID,
        pRazon: factura.observacionesNC,
        Usuario: this.user.usuario,
        ZonaHoraria: "Central America Standard Time"
      }
      console.log("LA DATA ENVIADA A INSERT DOC", data);
      this._NCHttp.insertDocumentoReferenciaNC(data).subscribe((respuesta) => {
        console.log("Respuesta INSERT", respuesta);
        if (respuesta == true) {
          resolve();
        } else {
          reject();
        }
      })

    })

  }

  filterNCWithThisUser(arrayNC:Array<any>):Array<any>{
    let arrayLong = JSON.parse(JSON.stringify(arrayNC.length));
    let arraySinClientesAjenos = [];
    for(let i = 0; i < arrayLong; i ++){
      if(arrayNC[i]["Usuario Creación"] == this.user.usuario){
        arraySinClientesAjenos.push(arrayNC[i]);
      }
    }
    return arraySinClientesAjenos;
  }

  async guardar(factura){

    return new Promise((resolve)=>{
      if(factura.motivoID == "01"){
        let data = {
          id_cliente_ws: this.user.idUser,
          id_facturaPV: factura["N° Factura"],
          sucursal: this.user.sucursal,
          nro_terminal: this.user.nro_terminal,
          nom_localizacion:this.user.nom_localizacion,
          nom_formaPago: factura.formaDePagoID,
          id_codigo_referencia: "01",
          observaciones_nc: factura.observacionesNC,
          ZonaHoraria:"Central America Standard Time",
          Usuario: this.user.usuario
        };

        console.log("SE GUARDA EN EL SERVIDOR CON PROCESO NC CLIENTES", data);

        this._NCHttp.procesoNCClientes(data).subscribe((respuesta)=>{
          console.log("PROCESO RESPUESTA NC CLIENTE: " + respuesta);
          resolve();
        });
      }else{
        let data = {
          "id_cliente_ws":this.user.idUser,
          "id_facturaPV": factura["N° Factura"],
          "id_DocumentoPV": factura.idNC,
          "consecutivoMH": factura.claveHaciendaNC,
          "id_tipo_identificacion": factura["Tipo Identificacíon"] ,
          "identificacion_cliente": factura["N° Identificación"],
          sucursal: this.user.sucursal,
          nro_terminal: this.user.nro_terminal,
          nom_localizacion: this.user.nom_localizacion,
          "cliente": factura["Clientes"],
          "nom_formaPago": factura.formaDePagoID,
          "id_codigo_referencia": factura.motivoID,
          "id_condicion_venta": factura.id_condicion_de_venta, // CHECKEAR TEMA ID
          "plazo_credito": factura.plazo_credito,
          "id_medio_pago": factura.id_medio_de_pago,// CHECKEAR TEMA ID
          "id_moneda": factura["Monedas"],// CHECKEAR TEMA ID
          "tipo_cambio": 1,
          "observaciones": factura.observacionesNC,
          "isguardado": factura.isguardado,
          "pCodigoAfiliado":"",
          "ZonaHoraria": "Central America Standard Time",
          "Usuario":this.user.usuario
        }
        console.log("SE GUARDA EN EL SERVIDOR CON PROCESO NC PARCIAL", data);
        this._NCHttp.procesoNCParcial(data).subscribe((respuesta)=>{
          console.log("RESPUESTA PROCESO NC PARCIAL: " + respuesta);
          factura.isguardado = "S";
          resolve();
        })
      }


    })

  }


  procesarNCEnHacienda(factura) {
    return new Promise((resolve, reject) => {

      this.insertDocumentoReferenciaNC(factura).then(() => {
        var id_clientews = this.user.idUser;
        var id_documento = factura.idNC;
        var pTipoDocumento = "03";
        var RecNoDoc = "";
        var RecTipoDoc = "";
        var pCorreos = factura.correoCliente;
        var pNombreReceptor = factura["Clientes"];
        var UsuarioSucursal = this.user.sucursal;
        var UsuarioTerminal = this.user.nro_terminal;
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
            await this.guardar(factura);
            resolve();

          } else {
            this.toastServ.toastMensajeDelServidor(respuesta["Mensaje"], "error", 10000);
            factura.isProcesada = true;
            factura.claveHaciendaNC = respuesta["Clave"];
            await this.guardar(factura);
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

  searchClienteAndInsertDisAndEmOnFactura(idDelCiente, factura){
    return new Promise((resolve)=>{
      if(idDelCiente == ""){
        factura.descuentoFijo = 0;
        factura.correoCliente = "";
        resolve("generico");
      }else{
        this.pedidosGetServ.buscarCliente(this.user.idUser, idDelCiente).then((clientes)=>{
          factura.descuentoFijo = clientes[0]["% Desc Fijo"];
          factura.correoCliente = clientes[0]["correo"];
          resolve("cliente");
        })
      }
    })
  }

  getTotalesAndProductosFromFactura(
    subTotal,
    monoDescuento,
    subTotalDesc,
    monImpuesto,
    totalFinal,
    nroFactura,
    productosDisplay

  ){
    return new Promise((resolve)=>{
      this.pedidosGetServ.selectTotales(this.user.idUser, this.user.nom_localizacion, nroFactura).then((subTotales: any) => {
        this.pedidosGetServ.selectTotalesUbicaGrid(this.user.idUser, this.user.nom_localizacion, nroFactura).then((productos:any)=>{
          for(let i = 0; i <productos.length; i ++){
            let producto = productos[i];
            producto['Precio Venta sin Imp'] = producto["Precio Unitario"];
            producto['verMas'] = false;
            producto['icono'] = 'add-circle';
            producto["descuento"] = producto["Descuento"];
            producto["subTotales"] = new Object ();
            producto["subTotales"]["Sub Total"] = producto["Sub Total"];
            producto["subTotales"]["Descuento"] = producto["Sub Total"] - producto["Sub Total descuento"];
            producto["subTotales"]["Sub Total descuento"] = producto["Sub Total descuento"]
            producto["subTotales"]["Impuestos"] = producto["Impuestos"]
            producto["subTotales"]["Total Linea"] = producto["Total Linea"]
          }
          resolve({
            "productos":productos,
            "subtotales":subTotales
          });
        })
      })

    })
  }


  async getIDsOfCondicionYMedio(medioDePago, condicionDeVenta){
    return new Promise((resolve)=>{
      this.pedidosGetServ.selectMediosPagos().then((mediosDePago: Array<any>)=>{
        this.pedidosGetServ.selectCondicionVenta().then((condicionesDeVenta: Array<any>)=>{
          var respuesta = new Object as {
            id_condicion:string
            id_medio:string
          };
          mediosDePago.filter( (val ,index)=>{
            if(val.medio_pago == medioDePago){
              respuesta.id_medio = val.id_medio_pago;
            }
          })
          condicionesDeVenta.filter( (val,index) =>{
            if(val.condicion_venta == condicionDeVenta){
              respuesta.id_condicion = val.id_condicion_venta;
            }
          });
          resolve(respuesta);
        })
      })
    })
  }
}
