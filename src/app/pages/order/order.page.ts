import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CrudService } from '../../services/crud.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ModalController, NavController, LoadingController } from '@ionic/angular';
import { AppComponent } from '../../app.component';
import { StorageService } from '../../services/storage.service';
import { CommentsPage } from '../../modals/comments/comments.page';
import { DetailPage } from '../../modals/detail/detail.page';
import { GeneralComponent } from 'src/app/components/general/general.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {
  // tslint:disable: no-conditional-assignment
  // tslint:disable: no-shadowed-variable
  // tslint:disable: max-line-length
  // tslint:disable: triple-equals
  // tslint:disable: prefer-for-of
  textra: number;
  totitem: any;
  totalOrder: number;
  userid: string;
  listaOrdenes: any;
  subsTotal: Subscription;
  cantidad: number;
  totcant: number;
  routerLink: any;
  impresa: string;
  loadingC: any;
  totextra = 0;
  errsystem = { sel: '', tbl: 80, where: '' };
  // @ViewChild('more', { read: ElementRef, static: false }) private more: ElementRef;

  constructor( private crudService: CrudService, private afAuth: AngularFireAuth,
               private modalCtrl: ModalController, private navCtrl: NavController,
               private appc: AppComponent, private loadingCtrl: LoadingController,
               private storage: StorageService, private general: GeneralComponent ) { }

  async ngOnInit() {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      this.impresa = (await this.storage.getItem('impresa')).value;
      console.log( this.userid );
      this.getOrdenes( this.userid );
      this.countordenes();
      this.getTotCant();
    } else {
      this.userid = null;
    }
  }

  async ionViewWillEnter() {
    if (this.afAuth.auth.currentUser != null) {
      this.impresa = (await this.storage.getItem('impresa')).value;
      this.getOrdenes( this.userid );
      this.countordenes();
      this.getTotCant();
    } else {
      this.general.mostrar_alert('Se necesita iniciar sesión para poder realizar un pedido');
      this.navCtrl.navigateBack('/signin');
    }
  }

  doRefresh(event: any) {
    console.log('Begin async operation');
    this.ionViewWillEnter();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  getTotCant() {
    this.crudService.crud({ sel: '', tbl: 100, where: '"' + this.userid + '",' + this.impresa }).subscribe(suc => {
      console.log(suc);
      if (suc[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + suc[0].ERROR + '",' +
        '"order","getTotCant",100';
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.totcant = suc[0][0][0];
      }
    }, err => {
      console.log(err);
      this.totcant = 0;
    });
  }

  async openDetail( vid: any, file: any, name: any) {
    const modal = await this.modalCtrl.create({
      component: DetailPage,
      cssClass: 'detail-modal',
      componentProps: { vid, file, name }
    });
    return await modal.present();
  }

  async addComent(vid: number) {
    const modal = await this.modalCtrl.create({
      component: CommentsPage,
      cssClass: 'options-modal',
      componentProps: { vid }
    });
    return await modal.present();
  }

  ordenar() {
    this.navCtrl.navigateBack('payment');
  }

  vaciarCarrito() {
    const data = { sel: '', tbl: 56, where: '"' + this.userid + '",' + this.impresa };
    this.crudService.crud( data ).subscribe(res => {
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"order","vaciarCarrito",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log(res);
        this.getOrdenes(this.userid);
        this.countordenes();
        this.getTotCant();
        this.appc.updateOrders();
      }
    }, err => {
      console.log(err);
    });
  }

  countordenes() {
    const data = { sel: '', tbl: 41, where: '"' + this.userid + '",' + this.impresa };
    this.crudService.crud( data ).subscribe(succ => {
      if (succ[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + succ[0].ERROR + '",' +
        '"order","countordenes",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log('count ordenes');
        console.log(succ);
        console.log(succ[0][0][0]);
        const badge = document.getElementById('badgeorders');
        console.log('badge');
        console.log(badge);
        if (badge != null) {
          badge.innerHTML = String(succ[0][0][0]);
        }
        const element = document.getElementById('ordenar') as HTMLInputElement;
        console.log(element);
        if (element != null) {
          if (succ[0][0][0] == 0) {
            element.disabled = true;
            this.routerLink = 'null';
          } else {
            element.disabled = false;
            this.routerLink = '/payment';
          }
        }
      }
    }, err => {
      console.log(err);
    });
  }

  changeCant(vid: number) {
    console.log(vid);
    // let cant = 0;
    const cantidad = (document.getElementById('cant' + vid )) as HTMLInputElement;
    console.log(cantidad.value);
    if ( cantidad.value != '' ) {
      this.doCant( 3, vid, Number(cantidad.value) );
    }

  }

  getTot( val1: any, val2: any ) {
    if ( val1 == null ) { val1 = 0; }
    if ( val2 == null ) { val2 = 0; }
    // tslint:disable: no-unused-expression
    // tslint:disable: radix
    val1 == null ? 0 : val1;
    val2 == null ? 0 : val2;
    const sum = parseInt(val1) + parseInt(val2);
    return sum;
  }

  getOrdenes( userid: string ) {
    console.log(userid, this.impresa);
    const datos = { sel: '', tbl: 10, where: '"' + userid + '",' + this.impresa };
    this.crudService.crud( datos ).subscribe(data  => {
      console.log('data');
      console.log(data);
      if (data[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + data[0].ERROR + '",' +
        '"order","getOrdenes",' + datos.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        if (data[0].length == 0) {
          document.getElementById('lordenes').innerHTML = String('<section padding align="center"><br><br><br><br><br><br><label align="center" style="color: #929292;' +
          'font-size: 16px">No existen productos agregados,<br>presione <b>Seguir comprando</b> para volver al menu</label><br><br><br><br><img src="../../../assets/images/btnadd.svg"' +
          'style="margin: 0 auto !important; width: 80%"></section>');
        } else {
          this.listaOrdenes = data[0];
          console.log('listaordenes', data[0]);
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < data[0].length; i++) {
            document.getElementById('options' + data[0][i][0]).innerHTML = '';
            console.log(data[0][i][0]);
            const datos = { sel: '', tbl: 113, where: data[0][i][7] + ',"' + userid + '",' + this.impresa + ',' + data[0][i][0] + ',1' };
            this.crudService.crud( datos ).subscribe(info  => {
              console.log('GOBP');
              console.log(info);
              // tslint:disable-next-line: prefer-for-of
              for (let o = 0; o < info[0].length; o++) {
                console.log(o);
                let res = '';
                if (info[0][o][1] > 0) {
                  res += '&nbsp<span style="color: #333">₡' + info[0][o][1] + '</span></ion-badge>';
                }
                document.getElementById('options' + data[0][i][0]).insertAdjacentHTML('beforeend', '&nbsp;<ion-badge color="light" style="font-weight: 400; font-size: 1.2">' + info[0][o][0] + res);
                // '<ion-chip style="background: #d7d8da; font-size: 0.8em; height: 26px;"><ion-label>' + info[0][o][0] + '</ion-label></ion-chip>');
              }
            });
          }
        }
      }
      for (let i = 0; i < data[0].length; i++) {
        this.totextra += Number(data[0][i][6]);
      }
    }, error  => {
      console.log(error);
    });
    const arr = { sel: '', tbl: 14, where: '"' + userid + '",' + this.impresa };
    this.crudService.crud( arr ).subscribe(data  => {
      console.log('data total');
      console.log(data);
      if (data[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + data[0].ERROR + '",' +
        '"order","getOrdenes",' + arr.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        document.getElementById('tot').innerHTML = data[0][0][0];
      }
      // console.log(Number(data[0][0][0].replace(',', '')), this.totextra);
      // const moneyFormat = new Intl.NumberFormat('es-es', {
      //   style: 'currency',
      //   currency: 'CRC'
      // });
      // const tot = (Number(data[0][0][0].replace(',', '')) + this.totextra).toLocaleString('en-US', {
      //   style: 'currency',
      //   currency: 'CRC',
      // });
      // console.log(tot.replace('CRC', ''));
      // console.log(Number(data[0][0][0].replace(',', '')) + this.totextra);
      // const tot = moneyFormat.format(Number(data[0][0][0].replace(',', '')) + this.totextra);
      // console.log(tot);
      // this.totalOrder = Number(tot.replace('CRC', ''));
      // this.totalOrder = Number(moneyFormat.format(Number(data[0][0][0].replace(',', '')) + this.totextra));
      // document.getElementById('tot').innerHTML = tot.replace('CRC', '');
    }, error  => {
      console.log(error);
    });
  }

  menuLink() {
    console.log('CLICK');
    this.navCtrl.navigateBack('/menu');
  }

  async eliminarOrden( vid: any ) {
    console.log(vid);
    const loading = await this.loadingCtrl.create({
      message: 'Por favor espere mientras eliminamos este producto'
    });
    await loading.present();
    const datos = { sel: '', tbl: 9, where: '3,' + vid + ',0,0,"",0' };
    this.crudService.crud( datos ).subscribe(res => {
      console.log( 'Eliminado' );
      console.log( res );
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"order","eliminarOrden",' + datos.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.getOrdenes( this.userid );
        this.countordenes();
        this.getTotCant();
        this.appc.updateOrders();
        loading.dismiss();
      }
      return true;
    }, err => {
      console.log( err );
      console.log( 'Error al eliminar' );
      loading.dismiss();
      return false;
    });
  }

  async showMore( vid: number, vcomm: string) {
    // console.log(Number(document.getElementsByClassName('cant' + vid).item(0).innerHTML));
    // const modal = await this.modalCtrl.create({
    //   component: OptionsPage,
    //   cssClass: 'options-modal',
    //   componentProps: {
    //     unidades: Number(document.getElementsByClassName('cant' + vid).item(0).innerHTML),
    //     vidprod: vid,
    //     vcomment: vcomm
    //   }
    // });
    // await modal.present();
    // const { data } = await modal.onWillDismiss();
    // console.log('data');
    // console.log(data);
    // this.ionViewWillEnter();
    // if (data != undefined) {
    //   this.ionViewWillEnter();
    // }
  }

  doCant( acc: number, vid: number, vcantidad: number ) {
    console.log(vid, acc, vcantidad);
    const data = { sel: '', tbl: 13, where: acc + ',' + vid + ',' + vcantidad };
    const tot = { sel: '', tbl: 14, where: '"' + this.userid + '",' + this.impresa };
    this.crudService.crud( data ).subscribe(res => {
      console.log(res);
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '",' +
        '"order","doCant",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.crudService.crud( tot ).subscribe(result => {
          console.log('get total');
          console.log(result);
          if (result[0].ERROR != undefined) {
            this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + result[0].ERROR + '",' +
            '"order","doCant",' + tot.tbl;
            this.crudService.crud(this.errsystem).subscribe(done => {
              console.log(done);
            }, err => {
              console.log(err);
            });
          } else {
            this.totalOrder = result[0][0][0];
            document.getElementById('tot').innerHTML = String(this.totalOrder);
            this.getTotCant();
          }
        }, error => {
          console.log(error);
        });
      }
    }, err => {
      console.log(err);
    });
  }

  restoCant( vid: number, precio: number ) {
    console.log('resta');
    let resto: any;
    // let cantidad = Number(document.getElementsByClassName('cant' + vid).item(0).innerHTML);
    const cantidad = (document.getElementById('cant' + vid )) as HTMLInputElement;
    if ( Number(cantidad.value) != 1 ) {
      resto = Number(cantidad.value) - 1;
      this.doCant( 2, vid, 0 );
      cantidad.value = resto;
      // console.log('precio', precio);
      this.totitem = Number(cantidad.value) * Number(precio);
      // console.log('this.totitem', this.totitem);
      document.getElementById('totitem' + vid).innerHTML = '₡' + this.totitem;
      const textra = (document.getElementById('textra' + vid )) as HTMLInputElement;
      // console.log('textra.innerText');
      // console.log(textra.innerText.replace('+₡', ''));
      // console.log('cantidad');
      // console.log(cantidad.value);
      const cnt = (Number(cantidad.value) + 1);
      const vle = Number(textra.innerText.replace('+₡', ''));
      // console.log( 'vle', vle );
      // console.log( 'cnt', cnt );
      const vleextra =  vle / cnt;
      this.textra = Number(vleextra) * Number(cantidad.value);
      // console.log('this.textra');
      // console.log(this.textra);
      document.getElementById('textra' + vid).innerHTML = '+₡' + String(this.textra);
    }

    // console.log('resto');
    // console.log(resto);
  }

  plusCant( vid: number, precio: number ) {
    console.log('suma');
    let sumo: any;
    this.doCant( 1, vid, 0 );
    const cantidad = (document.getElementById('cant' + vid )) as HTMLInputElement;
    sumo = Number(cantidad.value) + 1;
    cantidad.value = sumo;

    // console.log('precio', precio);
    this.totitem = Number(cantidad.value) * Number(precio);
    // console.log('this.totitem', this.totitem);
    document.getElementById('totitem' + vid).innerHTML = '₡' + this.totitem;
    const textra = (document.getElementById('textra' + vid )) as HTMLInputElement;
    // console.log('textra.innerText');
    // console.log(textra.innerText.replace('+₡', ''));
    // console.log('cantidad');
    // console.log(cantidad.value);
    const cnt = Number(cantidad.value) - 1;
    const vle = Number(textra.innerText.replace('+₡', ''));
    // console.log( 'vle', vle );
    // console.log( 'cnt', cnt );
    const vleextra =  vle / cnt;
    this.textra = Number(vleextra) * Number(cantidad.value);
    // this.textra = Number(textra.innerText.replace('+₡', '')) * Number(cantidad.value);
    // console.log('this.textra');
    // console.log(this.textra);
    document.getElementById('textra' + vid).innerHTML = '+₡' + String(this.textra);

    // console.log('sumo');
    // console.log(sumo);
  }

}
