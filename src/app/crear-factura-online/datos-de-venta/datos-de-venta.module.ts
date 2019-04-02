import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DatosDeVentaPage } from './datos-de-venta.page';

const routes: Routes = [
  {
    path: '',
    component: DatosDeVentaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DatosDeVentaPage]
})
export class DatosDeVentaPageModule {}
