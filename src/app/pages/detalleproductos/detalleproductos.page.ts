import { Component, OnInit, Input, Pipe } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { ModalController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { OrderPage } from '../order/order.page';
import { StorageService } from '../../services/storage.service';
import { OptionsPage } from '../../modals/options/options.page';
import { AppComponent } from '../../app.component';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-detalleproductos',
  templateUrl: './detalleproductos.page.html',
  styleUrls: ['./detalleproductos.page.scss'],
})
export class DetalleproductosPage implements OnInit {
  // tslint:disable: triple-equals
  // tslint:disable: no-unused-expression
  // tslint:disable: max-line-length
  @Input() vid: number;
  @Input() route: any;

  img: any;
  file: any;
  nombre: any;
  descr: any;
  precio: any;
  tprecio: any;
  favorito: any;
  isfav: number;
  userid: string;
  cant: any;
  idprod: any;
  listaimgs: any;
  fileslength: any;
  fileext: any;
  impresa: string;
  listDetailProduct: any;
  listOptions: any;
  conpapas: any;
  sinpapas: any;
  isChecked: string;
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private crudService: CrudService,
               private modalCtrl: ModalController,
               private afAuth: AngularFireAuth,
               private toastCtrl: ToastController,
               private order: OrderPage,
               private storage: StorageService,
               public appc: AppComponent,
               public navCtrl: NavController ) { }

  slideOpts = {
    initialSlide: 1,
    slidesPerView: 1,
    spaceBetween: 10
  };

  async ngOnInit() {
    // this.userid = 'snHEqaw0WBOqfbOUuIXkoXSXMKc2';
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
    }
    this.impresa = (await this.storage.getItem('impresa')).value;
    this.cargarInfo();
    this.cargarFiles();
    // this.getProductOptions();
  }

  getOptions(vid: number, name: any, file: any) {
    const datos = { sel: '', tbl: 132, where: vid };
    this.crudService.crud( datos ).subscribe(async res => {
      const disp = res[0][0][0];
      if (disp == 1) {
        const modal = await this.modalCtrl.create({
          component: OptionsPage,
          componentProps: {
            vid,
            name,
            file
          },
          cssClass: 'optionsProducts-modal'
        });
        await modal.present();
        const { data } = await modal.onWillDismiss();
        console.log('data', data);
        if (data != undefined) {
          const msj = await this.toastCtrl.create({
          message: 'Se agregó ' + name + ' a carrito',
          duration: 2500 });
          msj.present();
        }
      } else {
        const msj = await this.toastCtrl.create({
          message: 'Este producto está temporalmente agotado',
          duration: 2500 });
          msj.present();
      }
    });
  }

  // getProductOptions() {
  //   this.crudService.crud({ sel: '', tbl: 102, where: this.vid }).subscribe(details => {
  //     console.log('details');
  //     console.log(details);
  //     // insert error
  //     if (details[0].ERROR != undefined) {
  //       this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + details[0].ERROR + '",' +
  //       '"detalleproductos","getProductOptions",102';
  //       this.crudService.crud(this.errsystem).subscribe(done => {
  //         console.log(done);
  //       }, err => {
  //         console.log(err);
  //       });
  //     }
  //     this.listDetailProduct = details[0];
  //     this.listDetailProduct.forEach((category: any) => {
  //       this.crudService.crud({ sel: '', tbl: 104, where: category[0] }).subscribe(options => {
  //         // append
  //         console.log('options');
  //         console.log(options);
  //         // insert error
  //         if (options[0].ERROR != undefined) {
  //           this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + options[0].ERROR + '",' +
  //           '"detalleproductos","getProductOptions",104';
  //           this.crudService.crud(this.errsystem).subscribe(done => {
  //             console.log(done);
  //           }, err => {
  //             console.log(err);
  //           });
  //         }
  //         this.listOptions = options[0];
  //         this.listOptions.forEach((optns: any) => {
  //           console.log(optns);
  //           if (optns[4] == 0) {
  //             const radioOptns = optns[2].replace(' ', '_');
  //             // const ischecked = optns[5] == 1 ? radioOptns : '';
  //             optns[5] == 1 ? this.isChecked = radioOptns : 1;
  //             console.log('ischecked', this.isChecked);
  //             document.getElementById('parentnode').setAttribute('value', this.isChecked);
  //             document.getElementById('options' + optns[1]).insertAdjacentHTML('beforeend',
  //             '<ion-col size="4">' +
  //               '<ion-item>' +
  //                 '<ion-radio color="secondary" class="ion-no-margin" slot="start" value="' + radioOptns + '"></ion-radio>' +
  //               '</ion-item>' +
  //             '</ion-col>' +
  //             '<ion-col class="ion-padding-top" size="4">' +
  //               '<ion-label class="ion-text-center">' + optns[2] + '</ion-label>' +
  //             '</ion-col>' +
  //             '<ion-col class="ion-padding-top" size="4">' +
  //             ' <ion-label class="ion-text-center">₡ ' + optns[3] + '</ion-label>' +
  //             '</ion-col>');
  //           } else {
  //             const checked = optns[5] == 1 ? 'checked' : '';
  //             document.getElementById('options' + optns[1]).insertAdjacentHTML('afterbegin',
  //             '<ion-col size="4">' +
  //               '<ion-list>' +
  //                 '<ion-item>' +
  //                   '<ion-checkbox color="secondary" class="ion-no-margin" slot="start" ' + checked + '></ion-checkbox>' +
  //                 '</ion-item>' +
  //               '</ion-list>' +
  //             '</ion-col>' +
  //             '<ion-col class="ion-padding-top" size="4">' +
  //               '<label class="ion-text-center">' + optns[2] + '</label>' +
  //             '</ion-col>' +
  //             '<ion-col class="ion-padding-top" size="4">' +
  //               '<ion-label class="ion-text-center">₡ ' + optns[3] + '</ion-label>' +
  //             '</ion-col>');
  //           }
  //         });
  //       });
  //     });
  //   });
  // }

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
      this.idprod = producto[0][0];
      this.nombre = producto[0][1];
      this.descr = producto[0][2];
      this.precio = producto[0][3];
      this.tprecio = producto[0][3];
      this.isfav = producto[0][4];
      this.img = producto[0][5];
    }, err => {
      console.log(err);
    });
  }

  cargarFiles() {
    const data = { sel: 'url, SUBSTRING(url, -3, 3)', tbl: 2, where: 'idproducto = ' +  this.vid + ' and id > 0' };
    this.crudService.crud( data ).subscribe(res => {
      console.log(res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","detalleproductos","cargarInfo",' + data.tbl;
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

  setfavorito() {
    console.log('this.vid, this.userid');
    console.log(this.vid, this.userid);
    const data = { sel: '', tbl: 58, where: this.vid + ',"' + this.userid + '"' };
    this.crudService.crud( data ).subscribe(res => {
      console.log(res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"detalleproductos","setfavorito",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      }
      this.cargarInfo();
    }, err => {
      console.log(err);
    });
  }

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

  addToOrden( vidprod: any ) {
    const idusuario = this.userid;
    const idproducto: string = vidprod;
    const cantidad = (document.getElementById('cant')) as HTMLInputElement;
    console.log('addToOrden');
    console.log('1,0,' + idproducto + ',' + cantidad.value + ',"' + idusuario + '",' + this.impresa);
    const datos = { sel: '', tbl: 9, where: '1,0,' + idproducto + ',' + cantidad.value + ',0,0,"' + idusuario + '",' + this.impresa };
    this.crudService.crud( datos ).subscribe(async res => {
      console.log( res );
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"detalleproductos","addToOrden",' + datos.tbl;
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
  }

  async mostrar_mensaje( mensaje: any ) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2000,
      position: 'bottom',
      buttons: [{
        side: 'end',
        text: 'Cerrar',
        handler: () => {
          console.log(mensaje);
        }
      }]
    });
    toast.present();
  }

}
