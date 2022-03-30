import { Component, OnInit, Input } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { ModalController, NavController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { OrderPage } from '../order/order.page';
import { StorageService } from '../../services/storage.service';
import { GeneralComponent } from 'src/app/components/general/general.component';

@Component({
  selector: 'app-detallecupones',
  templateUrl: './detallecupones.page.html',
  styleUrls: ['./detallecupones.page.scss'],
})
export class DetallecuponesPage implements OnInit {

  // tslint:disable: triple-equals
  @Input() vid: number;
  @Input() route: any;

  file: any;
  nombre: any;
  descr: any;
  precio: any;
  tprecio: any;
  favorito: any;
  isfav: number;
  userid: string;
  cant: any;
  idcupon: any;
  listaimgs: any;
  fileslength: any;
  fileext: any;
  detallecupon: any;
  finicio: any;
  ffin: any;
  wodesc: any;
  tipopublic: any;
  porc: any;
  impresa: string;
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private crudService: CrudService,
               private modalCtrl: ModalController,
               private afAuth: AngularFireAuth,
               private toastCtrl: ToastController,
               private order: OrderPage,
               private storage: StorageService,
               private general: GeneralComponent,
               private navCtrl: NavController ) { }

  slideOpts = {
    initialSlide: 1,
    slidesPerView: 1,
    spaceBetween: 10
  };

  async ngOnInit() {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
    }
    this.impresa = (await this.storage.getItem('impresa')).value;
    this.cargarInfo();
    this.cargarFiles();
    this.cargarDetallecupon();
  }

  addToOrden( vidcupon: any ) {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      const idcupon: string = vidcupon;
      const cantidad = (document.getElementById('cant')) as HTMLInputElement;
      console.log('addToOrden');
      console.log('1,0,' + idcupon + ',' + cantidad.value + ',"' + this.userid + '",' + this.impresa);
      const datos = { sel: '', tbl: 9, where: '1,0,' + idcupon + ',' + cantidad.value + ',"' + this.userid + '",' + this.impresa };
      this.crudService.crud( datos ).subscribe(async res => {
        console.log( res );
        // insert error
        if (res[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
          '"detallecupones","addToOrden",' + datos.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        }
        this.mostrar_mensaje('Agregado a la orden');
        this.order.countordenes();
      }, async err => {
        console.log( err );
        this.mostrar_mensaje( err );
      });
    } else {
      this.general.mostrar_alert('Se necesita iniciar sesión para poder realizar un pedido');
      this.modalCtrl.dismiss();
    }
  }

  cargarDetallecupon() {
    console.log(this.vid + ',' + this.impresa);
    const data = { sel: '', tbl: 85, where: this.vid };
    this.crudService.crud( data ).subscribe(res => {
      console.log('DETALLE');
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"detallecupones","cargarDetallecupon",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      }
      this.detallecupon = res[0];
      // AGREGAR VISTA PREVIA DE PRODUCTOS RELACIONADOS AL CUPON
    }, err => {
      console.log(err);
    });
  }

  cargarInfo() {
    console.log(this.vid + ',' + this.impresa);
    const data = { sel: '', tbl: 91, where: this.vid + ',' + this.impresa };
    let cupon: any = '';
    this.crudService.crud( data ).subscribe(res => {
      console.log(res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"detallecupones","cargarInfo",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      }
      cupon = res[0];
      this.idcupon = cupon[0][0];
      this.nombre = cupon[0][1];
      this.descr = cupon[0][2];
      this.precio = cupon[0][3];
      this.tprecio = cupon[0][3];
      // this.file = cupon[0][4];
      this.finicio = cupon[0][5];
      this.ffin = cupon[0][6];
      this.wodesc = cupon[0][7];
      this.tipopublic = cupon[0][8];
      console.log((this.precio, this.wodesc));
      this.porc = (100 - ((this.precio / this.wodesc) * 100));
    }, err => {
      console.log(err);
    });
  }

  cargarFiles() {
    const data = { sel: 'url, SUBSTRING(url, -3, 3)', tbl: 87, where: 'idcupon = ' +  this.vid + ' and id > 0' };
    this.crudService.crud( data ).subscribe(res => {
      console.log(res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"detallecupones","cargarFiles",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      }
      this.fileslength = res[0].length;
      if (this.fileslength == 1) {
          this.file = res[0][0][0];
          this.fileext = res[0][0][1];
          // console.log('UNA', res[0][0][0]);
        } else {
          this.listaimgs = res[0];
          // console.log('VARIAS', res[0]);
        }
      }, err => {
        console.log(err);
      });
  }

// setfavorito() {
//     console.log('this.vid, this.userid');
//     console.log(this.vid, this.userid);
//     const data = { sel: '', tbl: 58, where: this.vid + ',"' + this.userid + '"' };
//     this.crudService.crud( data ).subscribe(res => {
//       console.log(res);
//       this.cargarInfo();
//     }, err => {
//       console.log(err);
//     });
//   }

dismiss() {
    this.modalCtrl.dismiss();
  }


restoCant() {
    console.log('resta');
    const cantidad = (document.getElementById('cant')) as HTMLInputElement;
    if ( Number(cantidad.value) != 1 ) {
      this.cant = Number(cantidad.value) - 1;
      cantidad.value = this.cant;
    }
    console.log('cantidad');
    console.log(cantidad.value);
    console.log('cant resto');
    console.log(this.cant);
    this.tprecio = this.cant * this.precio;
  }

plusCant() {
    console.log('suma');
    const cantidad = (document.getElementById('cant')) as HTMLInputElement;
    this.cant = Number(cantidad.value) + 1;
    cantidad.value = this.cant;
    console.log('cantidad');
    console.log(cantidad.value);
    console.log('cant sumo');
    console.log(this.cant);
    this.tprecio = this.cant * this.precio;
  }

inputCant() {
    console.log('input');
    const cantidad = (document.getElementById('cant')) as HTMLInputElement;
    this.cant = Number(cantidad.value);
    cantidad.value = this.cant;
    console.log('cantidad');
    console.log(cantidad.value);
    console.log('cant input');
    console.log(this.cant);
    this.tprecio = this.cant * this.precio;
  }

  async mostrar_mensaje( mensaje: any ) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      buttons: [
        {
          side: 'end',
          text: 'Cerrar',
          handler: () => {
            console.log(mensaje);
          }
        }
      ]
    });
    toast.present();
  }

}
