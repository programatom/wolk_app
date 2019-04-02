import { Component, OnInit } from '@angular/core';
import { NotasDeCreditoService } from 'src/app/services/notas-de-credito/notas-de-credito.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-nota-realizada-modal',
  templateUrl: './nota-realizada-modal.page.html',
  styleUrls: ['./nota-realizada-modal.page.scss'],
})
export class NotaRealizadaModalPage implements OnInit {

  notaDeCreditoKeys:any;

  constructor(public _NCLogic: NotasDeCreditoService,
              public localStorageServ: LocalStorageService,
              private modalCtrl: ModalController) { }

  ngOnInit() {
    this.notaDeCreditoKeys = Object.keys(this._NCLogic.NCElegida);
  }
  dismissModal(){
    this.modalCtrl.dismiss();
  }


}
