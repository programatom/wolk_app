import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FacturasCuentasCobrarPage } from './facturas-cuentas-cobrar.page';

const routes: Routes = [
  {
    path: '',
    component: FacturasCuentasCobrarPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FacturasCuentasCobrarPage]
})
export class FacturasCuentasCobrarPageModule {}
