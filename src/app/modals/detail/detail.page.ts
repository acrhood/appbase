import { Component, Input, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { StorageService } from '../../services/storage.service';
import { CrudService } from '../../services/crud.service';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})

export class DetailPage implements OnInit {
  
  @Input() vid: number;
  @Input() file: any;
  @Input() name: any;
  @Input() cant: any;
  userid: string;
  impresa: string;
  descr: any;
  precio: any;
  isfav: any;

  errsystem = { sel: '', tbl: 80, where: '' };
  
  constructor(private crudService: CrudService,
    private modalCtrl: ModalController,
    private afAuth: AngularFireAuth,
    private storage: StorageService ) { }

  async ngOnInit() {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
    }
    this.impresa = (await this.storage.getItem('impresa')).value;

    this.cargarInfo();
  }

  cargarInfo() {
  console.log('cargarInfo', this.vid + ',' + this.impresa + ',"' + this.userid + '"');
  const data = { sel: '', tbl: 93, where: this.vid + ',' + this.impresa + ',"' + this.userid + '"' };
  let producto: any = '';
  this.crudService.crud( data ).subscribe(res => {
    console.log('res', res);
    // insert error
    if (res[0].ERROR != undefined) {
      this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
      '"detalleproductos","cargarInfo",' + data.tbl;
      this.crudService.crud(this.errsystem).subscribe(done => {
        console.log(done);
      }, err => {
        console.log(err);
      });
    }
    producto = res[0];
    this.descr = producto[0][2];
    this.precio = producto[0][3];
    this.isfav = producto[0][4];
  }, err => {
    console.log(err);
  });

  console.log('descr', this.descr)
  console.log('precio', this.precio)
  console.log('isfav', this.isfav)
}

closeModal() {
  this.modalCtrl.dismiss();
}

}
