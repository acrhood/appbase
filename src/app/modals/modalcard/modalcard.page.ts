import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CrudService } from 'src/app/services/crud.service';
import * as firebase from 'firebase';

@Component({
  selector: 'app-modalcard',
  templateUrl: './modalcard.page.html',
  styleUrls: ['./modalcard.page.scss'],
})
export class ModalcardPage implements OnInit {
  lcards: any;
  userid = firebase.auth().currentUser.uid;

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    freeMode: true,
    slidesPerView: 1,
    spaceBetween: 10
  };

  constructor( private modalCtrl: ModalController,
               private crudService: CrudService ) { }

  ngOnInit() {
    this.cargarTarjetas();
  }

  cargarTarjetas() {
    const data = { sel: '', tbl: 49, where: '"' + this.userid + '"' };
    this.crudService.crud( data ).subscribe(res => {
      console.log('tarjetas');
      console.log( res );
      this.lcards = res[0];
    }, err => {
      console.log('Error al cargar tarjetas');
      console.log( err );
      console.log( JSON.stringify(err) );
    });
  }

  chooseCard( idcard: number, cardTokenId: string ) {
    console.log(cardTokenId);
    this.closeModal(idcard, cardTokenId);
  }

  closeModal( idcard: number, cardTokenId: string) {
    this.modalCtrl.dismiss({ idcard, cardTokenId });
  }

}
