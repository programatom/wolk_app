export interface ObjFactura {

    id_facturaPV: number,
    consecutivoMH:number,
    id_tipo_identificacion:string,
    identificacion_cliente:string,
    cliente:string,
    id_condicion_venta:string,
    plazo_credito:string,
    id_medio_pago:string,
    id_moneda:string,
    tipo_cambio:number,
    observaciones:string,
    isguardado:string,
    claveDocHacienda:string,
    noPaga:boolean,
    isProcesada:boolean,
    impresionString:string,
    reimpresionString:string,
    emailCopy:string,
    emailCliente:string,
    emails:string,
    isOffline:boolean,
    arrayProductos?:Array<any>,
    clienteSeleccionado:any,
    subTotales:{
      subTotal:any
      monoDescuento:any
      subTotalDesc:any
      monImpuesto:any
      total:any
    }
    facturaOfflineVisualize:Array<any>,
    pagoOfflineData:{
      pendiente:number,
      formaDePago:string,
      montoAbonado?:number,
      vuelto?:number
    }
    tiquet:boolean
    exceptionHacienda:string
    isProcesadaInterno:boolean
    descuentoFijo:number
    usuarioExcepcion: {
      idUser: any
      nom_localizacion:any
      nro_terminal:any
      sucursal:string
      usuario:string
    };
    usuarioExcepcionBool:boolean
  }

export interface ObjUserData {
    NombreUsuario: string;
    cortar_papel: number,
    msg:string,
    idUser: any,
    nom_localizacion:any,
    nro_terminal:any,
    sucursal:string,
    usuario:string,
    nombre_impresora:any,
    tamano_papel:number,
    logo:string;
}

export interface ObjProducto {

  codigo_producto:string, //Código_Producto
  precio_venta_sin_imp:number, //Precio_Venta_sin_Imp
  categoria:string, //Categoria
  codigo_proveedor:string, //Código_Proveedor
  existencia:number, //Existencia
  existencia_minima:number, //Existencia_Minima
  localizacion:string, //Localización
  nombre_producto:string, // Nombre_Producto
  tamaño:string, //Tamaño
  unidad_medida_hacienda:string, //Unidad_Medida_Hacienda
  unidades_a_reponer:number, //Unidades_a_Reponer
  descuento:number
  cantidad:number
  subtotales:ObjSubtotales
  html:{
    verMas:boolean
    icono:string
  }
  isExonerado:string
  descuentoFijo:number
  monto_imp:number  // Monto Imp
  monto_desc:number // Monto Desc
  precio_venta_sin_imp_sin_cambios
}

export interface ObjSubtotales {

  descuento_para_procesar:number
  descuento_porc:number
  sub_total:number
  descuento:number
  sub_total_descuento:number
  impuestos:number
  total_linea:number

}

export interface ObjSubtotalGlobal {

  sub_total:number
  descuento_total:number
  sub_total_descuento:number
  impuestos_total:number
  total_factura:number

}

export interface ObjLocalStorage {

  clientes:any
  condicionesVenta:any
  dataUser:any
  formasDePago:any
  mediosDePago:any
  plazos:any
  productos:any
  impresora:any
  offlineOK:any
  datosEmisor
}


export interface ObjResponse {
  "status": string,
  "mensaje": string
}

export interface ObjClientData{
  moneda:string
  tarifa:number
  cliente:any
}

export interface ObjProcesoOffline{
  key:string
  factura:ObjFactura
  fecha:string
}

export interface ObjDatosEmisor{
  correo
  direccion
  id_barrio
  id_canton
  id_distrito
  id_pais
  id_provincia
  id_tipo_identificacion_cliente
  identificacion_cliente
  nombre_cliente
  nombre_comercial_cliente
  sennas
  telefono
}
