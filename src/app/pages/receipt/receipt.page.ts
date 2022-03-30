import { Component, OnInit, Input } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ModalController, NavController } from '@ionic/angular';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-receipt',
  templateUrl: './receipt.page.html',
  styleUrls: ['./receipt.page.scss'],
})
export class ReceiptPage implements OnInit {
  // tslint:disable: triple-equals
  nrecibo: string;
  fecha: string;
  total: number;
  flete = 0;
  subtotal = 0;
  cliente: string;
  listaordenes: any;
  userid: string;
  impresa: string;
  nombresuc: string;
  cedulasuc: string;
  telefonossuc: string;
  @Input() idpago: string;
  @Input() tipo: string;
  datos = { sel: '', tbl: 19, where: '' };
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private crudService: CrudService,
               private afAuth: AngularFireAuth,
               public modalCtrl: ModalController,
               public navCtrl: NavController,
               private storage: StorageService ) { }

  async ngOnInit() {
    console.log('recibo');
    this.userid = this.afAuth.auth.currentUser.uid;
    console.log(this.userid);
    this.impresa = (await this.storage.getItem('impresa')).value;

    this.getinfosucursal();

    const usuario = { sel: '', tbl: 8, where: '"' + this.userid + '"' };
    this.crudService.crud( usuario ).subscribe(res => {
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","receipt","ngOnInit",' + usuario.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.cliente = res[0][0][1];
      }
    }, err => {
      console.log(err);
    });
    console.log('idpago receipt');
    console.log(this.idpago);
    this.datos.where = '"' + this.idpago + '",' + this.impresa;
    this.crudService.crud( this.datos ).subscribe(result => {
      console.log('receipt');
      console.log(result);
      this.listaordenes = result[0];
      this.nrecibo = result[0][0][8];
      this.fecha = result[0][0][3];
      this.total = result[0][0][4];
      this.flete = result[0][0][6];
      this.subtotal = result[0][0][7];
      // viditem int, vuser varchar(45), vimpresa int, viddetail int, vidstate int
      // for (const i of result[0]) {
      console.log(result[0].length);
      for (let i = 0; i < result[0].length; i++) {
        console.log('i: ', i);
        console.log(result[0][i][12] + ',"' + this.userid + '",' + this.impresa + ',' + result[0][i][11] + ',2');
        const options = { sel: '', tbl: 113, where: result[0][i][12] + ',"' + this.userid + '",' + this.impresa + ',' +
        result[0][i][11] + ',2'  };
        const iddetail = result[0][i][11];
        console.log('iddetail:', iddetail);
        this.crudService.crud( options ).subscribe(optns => {
          console.log(optns);
          // tslint:disable-next-line: prefer-for-of
          for (let o = 0; o < optns[0].length; o++) {
            console.log(iddetail);
            console.log(optns[0][o][0]);
            document.getElementById('opciones' + iddetail).insertAdjacentHTML('beforeend',
              '&nbsp;<ion-badge color="light" style="font-weight: 400; font-size: 1.2">' + optns[0][o][0] + '</ion-badge>');
          }
        });
      }
    }, err => {
      console.log(err);
    });
  }

  goBack() {
    this.modalCtrl.dismiss({ tipo: this.tipo });
    // this.navCtrl.navigateBack('menu');
  }

  getinfosucursal() {
    const suc = { sel: '', tbl: 99, where: this.impresa };
    this.crudService.crud( suc ).subscribe(res => {
      this.nombresuc = res[0][0][1];
      this.cedulasuc = res[0][0][21];
      this.telefonossuc = res[0][0][19];
    });
  }

}
