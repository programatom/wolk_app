import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FacturasAProcesarPage } from './facturas-a-procesar.page';

const routes: Routes = [
  {
    path: '',
    component: FacturasAProcesarPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FacturasAProcesarPage]
})
export class FacturasAProcesarPageModule {}
