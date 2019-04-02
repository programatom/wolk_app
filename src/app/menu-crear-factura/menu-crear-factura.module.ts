import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { MenuCrearFacturaPage } from './menu-crear-factura.page';

const routes: Routes = [
  {
    path: '',
    component: MenuCrearFacturaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [MenuCrearFacturaPage]
})
export class MenuCrearFacturaPageModule {}
