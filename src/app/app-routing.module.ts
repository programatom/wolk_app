import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'menu', pathMatch: 'full' },
  { path: 'menu', loadChildren: './menu/menu.module#MenuPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'menu-crear-factura', loadChildren: './menu-crear-factura/menu-crear-factura.module#MenuCrearFacturaPageModule' },
  { path: 'datos-de-cliente', loadChildren: './crear-factura-online/datos-de-cliente/datos-de-cliente.module#DatosDeClientePageModule' },
  { path: 'datos-de-venta', loadChildren: './crear-factura-online/datos-de-venta/datos-de-venta.module#DatosDeVentaPageModule' },
  { path: 'detalles-productos', loadChildren: './crear-factura-online/detalles-productos/detalles-productos.module#DetallesProductosPageModule' },
  { path: 'facturas-totales', loadChildren: './crear-factura-online/facturas-totales/facturas-totales.module#FacturasTotalesPageModule' },
  { path: 'modal-print', loadChildren: './crear-factura-online/modal-print/modal-print.module#ModalPrintPageModule' },
  { path: 'pago', loadChildren: './crear-factura-online/pago/pago.module#PagoPageModule' },
  { path: 'crear-factura-offline/datos-de-cliente', loadChildren: './crear-factura-offline/datos-de-cliente/datos-de-cliente.module#DatosDeClientePageModule' },
  { path: 'crear-factura-offline/detalles-productos', loadChildren: './crear-factura-offline/detalles-productos/detalles-productos.module#DetallesProductosPageModule' },
  { path: 'crear-factura-offline/facturas-totales', loadChildren: './crear-factura-offline/facturas-totales/facturas-totales.module#FacturasTotalesPageModule' },
  { path: 'crear-factura-offline/pago', loadChildren: './crear-factura-offline/pago/pago.module#PagoPageModuleOffline' },
  { path: 'crear-factura-offline/facturas-a-procesar', loadChildren: './crear-factura-offline/facturas-a-procesar/facturas-a-procesar.module#FacturasAProcesarPageModule' },
  { path: 'crear-factura-offline/proceso-offline', loadChildren: './crear-factura-offline/proceso-offline/proceso-offline.module#ProcesoOfflinePageModule' },
  { path: 'caja-diaria', loadChildren: './caja-diaria/caja-diaria/caja-diaria.module#CajaDiariaPageModule' },
  { path: 'cliente-edit', loadChildren: './cliente/cliente-edit/cliente-edit.module#ClienteEditPageModule' },
  { path: 'cliente-new', loadChildren: './cliente/cliente-new/cliente-new.module#ClienteNewPageModule' },
  { path: 'cliente-list', loadChildren: './cliente/cliente-list/cliente-list.module#ClienteListPageModule' },
  { path: 'direccion-new', loadChildren: './cliente/direccion-new/direccion-new.module#DireccionNewPageModule' },
  { path: 'correo-new', loadChildren: './cliente/correo-new/correo-new.module#CorreoNewPageModule' },
  { path: 'telefono-new', loadChildren: './cliente/telefono-new/telefono-new.module#TelefonoNewPageModule' },
  { path: 'reporte-gastos', loadChildren: './reporte-gastos/reporte-gastos/reporte-gastos.module#ReporteGastosPageModule' },
  { path: 'facturas-abiertas', loadChildren: './facturas-abiertas/facturas-abiertas/facturas-abiertas.module#FacturasAbiertasPageModule' },
  { path: 'facturas-cuentas-cobrar', loadChildren: './facturas-cuentas-cobrar/facturas-cuentas-cobrar/facturas-cuentas-cobrar.module#FacturasCuentasCobrarPageModule' },
  { path: 'generar-orden', loadChildren: './ordenes/generar-orden/generar-orden.module#GenerarOrdenPageModule' },
  { path: 'verificacion-producto', loadChildren: './verificacion-producto/verificacion-producto.module#VerificacionProductoPageModule' },
  { path: 'parcial-page', loadChildren: './notas-de-credito/parcial-page/parcial-page.module#ParcialPagePageModule' },
  { path: 'elejir-factura', loadChildren: './notas-de-credito/elejir-factura/elejir-factura.module#ElejirFacturaPageModule' },
  { path: 'anular-factura', loadChildren: './notas-de-credito/anular-factura/anular-factura.module#AnularFacturaPageModule' },
  { path: 'procesar-parcial', loadChildren: './notas-de-credito/procesar-parcial/procesar-parcial.module#ProcesarParcialPageModule' },
  { path: 'notas-realizadas', loadChildren: './notas-de-credito/notas-realizadas/notas-realizadas.module#NotasRealizadasPageModule' },
  { path: 'nota-realizada-modal', loadChildren: './notas-de-credito/nota-realizada-modal/nota-realizada-modal.module#NotaRealizadaModalPageModule' },
  { path: 'factura-visual-hacienda-nc', loadChildren: './notas-de-credito/factura-visual-hacienda-nc/factura-visual-hacienda-nc.module#FacturaVisualHaciendaNCPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
