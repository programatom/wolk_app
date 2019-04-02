import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ElejirFacturaPage } from './elejir-factura.page';

const routes: Routes = [
  {
    path: '',
    component: ElejirFacturaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ElejirFacturaPage]
})
export class ElejirFacturaPageModule {}
