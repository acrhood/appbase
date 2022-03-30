import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as firebase from 'firebase';
import { CrudService } from 'src/app/services/crud.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.page.html',
  styleUrls: ['./modal.page.scss'],
})
export class ModalPage implements OnInit {
  ldirections: any;
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
    this.cargarDirecciones();
  }

  cargarDirecciones() {
    const data = { sel: '', tbl: 16, where: '"' + this.userid + '"' };
    this.crudService.crud( data ).subscribe(
      res => {
        console.log('direcciones');
        console.log( res );
        this.ldirections = res[0];
      },
      err => {
        console.log('Error al cargar direcciones');
        console.log( err );
        console.log( JSON.stringify(err) );
      }
    );
  }

  chooseDirection(viddirection: number) {
    console.log(viddirection);
    this.closeModal(viddirection);
  }

  closeModal(viddirection: number) {
    this.modalCtrl.dismiss({ viddirection });
  }

}
