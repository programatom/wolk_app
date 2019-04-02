import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FacturasTotalesPage } from './facturas-totales.page';

const routes: Routes = [
  {
    path: '',
    component: FacturasTotalesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FacturasTotalesPage]
})
export class FacturasTotalesPageModule {}
