import { Component, OnInit } from '@angular/core';
import { CrudService } from 'src/app/services/crud.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastController, ModalController, NavController } from '@ionic/angular';
import { AppComponent } from '../../app.component';
import { DetalleproductosPage } from '../detalleproductos/detalleproductos.page';
import { StorageService } from '../../services/storage.service';
import { OptionsPage } from '../../modals/options/options.page';
import { GeneralComponent } from 'src/app/components/general/general.component';
// tslint:disable: max-line-length
// tslint:disable: triple-equals

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  styleUrls: ['./favorite.page.scss'],
})
export class FavoritePage implements OnInit {
  listaFavoritos: any;
  userid: string;
  tipo: any = 1;
  categoria = 0;
  impresa: string;
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private crudService: CrudService,
               private afAuth: AngularFireAuth,
               private toastCtrl: ToastController,
               public appc: AppComponent,
               private modalCtrl: ModalController,
               private storage: StorageService,
               private general: GeneralComponent,
               private navCtrl: NavController ) { }

  async ngOnInit() {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      console.log( this.userid );
      this.impresa = (await this.storage.getItem('impresa')).value;
      this.getFavorites( this.userid );
    }
  }

  async ionViewWillEnter() {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      this.impresa = (await this.storage.getItem('impresa')).value;
      this.getFavorites( this.userid );
    } else {
      this.general.mostrar_alert('Se necesita iniciar sesión para poder realizar un pedido');
      this.navCtrl.navigateBack('/signin');
    }
  }

  doRefresh(event: any) {
    console.log('Begin async operation');
    this.getFavorites( this.userid );
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  async getOptions(vid: number, name: any, file: any) {
    console.log('vid, name, file');
    console.log(vid, name, file);
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
    // const { data } = await modal.onWillDismiss();
    // console.log(data);
    // if (data != undefined) {
    //   // const badge = document.getElementById('badgeorders');
    //   const count = { sel: '', tbl: 41, where: '"' + this.userid + '",' + this.impresa };
    //   this.crudService.crud( count ).subscribe(succ => {
    //     console.log('count adToOrden');
    //     console.log(succ);
    //     // badge.innerHTML = String(succ[0][0][0]);
    //   }, err => {
    //     console.log(err);
    //   });
    //   // this.appc.updateOrders();
    //   this.getProductOptions();
    // }
  }

  getFavorites( userid: string ) {
    console.log(userid + ' ' + this.impresa);
    const datos = { sel: '', tbl: 60, where: '"' + userid + '",' + this.impresa };
    this.crudService.crud( datos ).subscribe(
      data  => {
        // insert error
        if (data[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + data[0].ERROR + '","favorite","getFavorites",' + datos.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        } else {
          console.log('data');
          console.log(data);
          console.log('data[0].length', data[0].length);
          if (data[0].length == 0) {
            console.log('NO HAY');
            document.getElementById('lfavoritos').innerHTML = String('<section padding align="center"><br><br><br><br><label align="center" style="color: #929292; font-size: 16px">No existen productos favoritos,<br>presione <b>Seguir comprando</b> para volver al menu</label><br><br><br><br><img src="../../../assets/images/favorites.svg" style="margin: 0 auto !important; width: 90%"></section>');
          } else {
            this.listaFavoritos = data[0];
            console.log('this.listaFavoritos');
            console.log(this.listaFavoritos);
          }
        }
      }, error  => {
      console.log(error);
    });
  }

  setfavorito( vid: number ) {
    console.log( 'vid, this.userid' );
    console.log( vid, this.userid );
    const data = { sel: '', tbl: 58, where: vid + ',"' + this.userid + '"' };
    this.crudService.crud( data ).subscribe(res => {
      console.log(res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","favorite","setfavorito",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.getFavorites( this.userid );
      }
    }, err => {
      console.log(err);
    });
  }

  addFteToOrden( vid: number ) {
    console.log( vid );
    const datos = { sel: '', tbl: 9, where: '1,0,' + vid + ',1,"' + this.userid + '",' + this.impresa };
    this.crudService.crud( datos ).subscribe(
      async res => {
        console.log( res );
        // insert error
        if (res[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","favorite","addFteToOrden",' + datos.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        } else {
          // const badge = document.getElementById('badgeorders');
          // const data = { sel: '', tbl: 41, where: '"' + this.userid + '",' + this.impresa };
          // this.crudService.crud( data ).subscribe(succ => {
          //   badge.innerHTML = String(succ[0][0][0]);
          // }, err => {
          //   console.log(err);
          // });
          this.appc.updateOrders();
          // document.getElementById('prod' + vid).classList.remove('btnadd');
          // document.getElementById('prod' + vid).classList.add('btnalready');
          document.getElementById('fte' + vid).setAttribute('color', 'success');
          document.getElementById('ico' + vid).setAttribute('name', 'checkmark');
          document.getElementById('txt' + vid).innerHTML = 'Agregado';
        }
      }, async err => {
        console.log( err );
        this.mostrar_mensaje('No pudimos agregar este producto a tu orden, intentalo de nuevo o reinicie la aplicación');
      }
    );
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

  async verDetalle(vid: number) {
    console.log(vid);
    const modal = await this.modalCtrl.create({
      component: DetalleproductosPage,
      componentProps: {
        vid,
        tipo: this.tipo,
        categoria: this.categoria,
        route: 'favorite'
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log('Cierra modal detalle productos');
    console.log(data);
  }

}
