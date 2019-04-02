import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy , RouterModule, Routes} from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { IonicStorageModule } from '@ionic/storage';

import { HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';

import { File } from '@ionic-native/File/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Market } from '@ionic-native/market/ngx';

import { PagoPageModule } from './crear-factura-online/pago/pago.module';
import { ModalPrintPageModule } from './crear-factura-online/modal-print/modal-print.module';
import { PagoPageModuleOffline } from './crear-factura-offline/pago/pago.module';
import { NotaRealizadaModalPageModule } from './notas-de-credito/nota-realizada-modal/nota-realizada-modal.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [
  ],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, IonicStorageModule.forRoot(), HttpClientModule,
  PagoPageModule, ModalPrintPageModule, PagoPageModuleOffline, NotaRealizadaModalPageModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    FileTransfer,
    File,
    Keyboard,
    BarcodeScanner,
    BluetoothSerial,
    AppVersion,
    Market
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
