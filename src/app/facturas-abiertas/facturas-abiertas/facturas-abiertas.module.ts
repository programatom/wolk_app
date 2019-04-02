import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FacturasAbiertasPage } from './facturas-abiertas.page';

const routes: Routes = [
  {
    path: '',
    component: FacturasAbiertasPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FacturasAbiertasPage]
})
export class FacturasAbiertasPageModule {}
