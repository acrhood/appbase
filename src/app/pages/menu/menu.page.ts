import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ToastController, ModalController, Platform, NavController } from '@ionic/angular';
import { CrudService } from '../../services/crud.service';
import { environment } from '../../../environments/environment';
import { DetalleproductosPage } from '../detalleproductos/detalleproductos.page';
import { DetallecuponesPage } from '../detallecupones/detallecupones.page';
import { PopoverController } from '@ionic/angular';
import { FilterComponent } from 'src/app/components/filter/filter.component';
import { AppComponent } from '../../app.component';
import { formatDate } from '@angular/common';
import { GeneralComponent } from '../../components/general/general.component';
import { StorageService } from '../../services/storage.service';
import { OptionsPage } from '../../modals/options/options.page';
import { FtpaymentService } from 'src/app/services/ftpayment.service';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
const tipon = environment.tiponegocio;
const madreImpresa = environment.madreSucursal;

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  // tslint:disable: triple-equals
  // tslint:disable: max-line-length
  // tslint:disable: prefer-for-of
  user: boolean;
  tipo = environment.tipoproductos;
  producto: string;
  userid: string;
  tipoUser: number;
  listaproductos: any;
  listacomidas: any;
  listabebidas: any;
  listacategorias: any;
  listatipoprods: any;
  listacupones: string[] = [];
  fileslength: any;
  file: any;
  idcupon: any;
  limC = 0;
  limB = 0;
  sprod: any;
  categoria = 0;
  filprecio = 0;
  results = 0;
  ntable: number;
  appname: string;
  currentDatetime: any;
  currentTime: any;
  visible: number;
  impresa: string;
  nomSuc: string;
  nametoday: any;
  days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  dias: any;
  optshow: any;
  opttipo: any;
  search: string;
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private afAuth: AngularFireAuth, private toastCtrl: ToastController,
               private crudService: CrudService, private modalCtrl: ModalController,
               public popoverCtrl: PopoverController, public appc: AppComponent,
               private platform: Platform, private general: GeneralComponent,
               private storage: StorageService, private navCtrl: NavController, private fts: FtpaymentService) { }

  // slideCategories = { initialSlide: 1, slidesPerView: 1, spaceBetween: 10, speed: 400, freeMode: true, pagination: false };
  slideCategories = { slidesPerView: 3, spaceBetween: 5, freeMode: false, pagination: false };
  slideMenuopt = { slidesPerView: 2, spaceBetween: 5, freeMode: true, pagination: false };
  slideOpts = { initialSlide: 1, slidesPerView: 1, speed: 400, pagination: true,
    autoplay: { delay: 3000, disableOnInteraction: false, loop: true } };
  // autoHeight: true

  async ngOnInit() {
    console.log('menu');
    console.log('usuario firebase');
    console.log(this.afAuth.auth.currentUser);
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      this.appc.updateOrders();
    }
    this.loadResults();
  }

  doRefresh(event: any) {
    console.log('Begin async operation');
    this.ionViewWillEnter();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  getOptions(vid: number, name: any, file: any) {
    if (this.afAuth.auth.currentUser != null) {
      // validar disponibilidad
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
        console.log(data);
        if (data != undefined) {
          const badge = document.getElementById('badgeorders');
          const count = { sel: '', tbl: 41, where: '"' + this.userid + '",' + this.impresa };
          this.crudService.crud( count ).subscribe(succ => {
            console.log('count adToOrden');
            console.log(succ);
            badge.innerHTML = String(succ[0][0][0]);
          }, err => {
            console.log(err);
          });
          this.appc.updateOrders();
          this.cargarProductos(0, 1, 1, 0, '', 0, this.filprecio);
          this.cargarProductos(0, 1, 2, 0, '', 0, this.filprecio);
        }
      } else {
        this.general.mostrar_alert('Este producto está temporalmente agotado.');
      }
    });
    } else {
      this.general.mostrar_alert('Se necesita iniciar sesión para poder realizar un pedido.');
      this.navCtrl.navigateBack('/signin');
    }
  }

  async ionViewWillEnter() {
    // validate user
    this.limB = 0;
    this.limC = 0;
    // obtener id sucursal
    this.impresa = (await this.storage.getItem('impresa')).value;
    this.appc.updateUser();
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      this.appc.updateOrders();
    }
    console.log('impresa: ', this.impresa);
    this.crudService.crud({ sel: 'nombre', tbl: 39, where: 'id = ' + this.impresa }).subscribe(suc => {
      console.log('suc ionViewWillEnter');
      console.log(suc);
      if (suc[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + suc[0].ERROR + '","menu","ionViewWillEnter",39';
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        if (suc[0].length != 0) {
          this.nomSuc = suc[0][0][0];
        }
      }
    }, err => {
      console.log(err);
    });
    this.nametoday = this.days[new Date().getDay()];
    console.log('cargando productos...');
    const dataTipos = { sel: '', tbl: 65, where: madreImpresa };
    this.crudService.crud( dataTipos ).subscribe( results => {
      console.log('results tipos');
      console.log(results);
      for (let i = 0; i < results[0].length; i++) {
        console.log('FOR PRODUCTOS');
        const idtipo = results[0][i][0];
        this.cargarProductos(0, 1, idtipo, 0, '', 0, this.filprecio);
      }
    }, err => {
      console.log('err tipos');
      console.log(err);
    });
    // this.cargarProductos(0, 1, 1, 0, '', 0, this.filprecio);
    // this.cargarProductos(0, 1, 2, 0, '', 0, this.filprecio);
    this.cargarCategorias();
    this.cargarTipoprods();
    this.loadResults();
    this.cargarCupones();
    if (tipon == 2) {
      this.cargarMesa();
      document.getElementById('scanner').classList.remove('ion-hide');
      document.getElementById('gridTable').classList.remove('ion-hide');
    } else {
      document.getElementById('scanner').classList.add('ion-hide');
      document.getElementById('gridTable').classList.add('ion-hide');
    }

    // count ordenes
    console.log(this.userid, this.impresa);
    const data = { sel: '', tbl: 41, where: '"' + this.userid + '",' + this.impresa };
    this.crudService.crud( data ).subscribe(succ => {
      if (succ[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + succ[0].ERROR + '","menu","ionViewWillEnter"' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log('suc ionViewWillEnter');
        console.log(succ);
        document.getElementById('badgeorders').innerHTML = succ[0][0][0];
      }
    }, err => {
      console.log('err ionViewWillEnter');
      console.log(err);
    });
  }

  cargarMesa() {
    const datamesa = { sel: '', tbl: 40, where: '2,0,"' + this.userid + '",' + this.impresa };
    this.crudService.crud( datamesa ).subscribe(succ => {
      if (succ[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + succ[0].ERROR + '","menu","cargarMesa"' + datamesa.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        if (succ[0].length > 0 && succ[0][0][0] != 0) {
          this.ntable = succ[0][0][0];
          document.getElementById('gridTable').classList.remove('ion-hide');
          document.getElementById('nmesa').innerHTML = succ[0][0][1];
        } else {
          this.ntable = 0;
          document.getElementById('gridTable').classList.add('ion-hide');
        }
      }
    }, (err: any) => {
      console.log('err');
      console.log(err);
    });
  }

  loadResults() {
    const data = { sel: '', tbl: 59, where: '' };
    this.crudService.crud( data ).subscribe(succ => {
      console.log('succ');
      console.log(succ);
      if (succ[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + succ[0].ERROR + '","menu","loadResults",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.results = succ[0][0];
      }
    }, err => {
      console.log(err);
    });
  }

  async verDetalle(vid: number) {
    console.log('id producto');
    console.log(vid);
    const modal = await this.modalCtrl.create({
      component: DetalleproductosPage,
      componentProps: { vid, tipo: this.tipo, categoria: this.categoria, route: 'menu' }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log('Cierra modal detalle productos');
    console.log(data);
    const badge = document.getElementById('badgeorders');
    console.log(badge);
    const dataCount = { sel: '', tbl: 41, where: '"' + this.userid + '",' + this.impresa };
    this.crudService.crud( dataCount ).subscribe(succ => {
      console.log('suc ionViewWillEnter');
      console.log(succ);
      if (succ[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + succ[0].ERROR + '","menu","verDetalle",' + dataCount.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        badge.innerHTML = String(succ[0][0][0]);
      }
    }, err => {
      console.log('err ionViewWillEnter');
      console.log(err);
    });
  }

  async verDetallecupon(vid: number) {
    console.log(vid);
    const modal = await this.modalCtrl.create({
      component: DetallecuponesPage,
      componentProps: {
        vid,
        route: 'menu'
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log('Cierra modal detalle productos');
    console.log(data);
    const badge = document.getElementById('badgeorders');
    console.log(badge);
    const dataCount = { sel: '', tbl: 41, where: '"' + this.userid + '",' + this.impresa };
    this.crudService.crud( dataCount ).subscribe(succ => {
      console.log('suc ionViewWillEnter');
      console.log(succ);
      if (succ[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + succ[0].ERROR + '","menu","verDetallecupon",' + dataCount.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        badge.innerHTML = String(succ[0][0][0]);
      }
    }, err => {
      console.log('err ionViewWillEnter');
      console.log(err);
    });
  }

  buscarCategoria(vid: number) {
    // const search = (document.getElementById('search') as HTMLInputElement).value;
    this.categoria = vid;
    console.log('categoria:', vid);
    const search = this.search == undefined ? '' : this.search;
    this.cargarProductos(0, 1, this.tipo, 0, search, this.categoria, this.filprecio);
  }

  cargarCategorias() {
    console.log('cargar categorias');
    console.log(madreImpresa, this.tipo);
    const data = { sel: '', tbl: 66, where: madreImpresa + ',' + this.tipo };
    this.crudService.crud( data ).subscribe(res => {
      console.log('res');
      console.log(res);
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","menu","cargarCategorias",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.listacategorias = res[0];
      }
    }, err => {
      console.log('err');
      console.log(err);
    });
  }

  cargarTipoprods() {
    const data = { sel: '*', tbl: 62, where: 'id > 0 and idsucursal_madre = ' + madreImpresa };
    this.crudService.crud( data ).subscribe(res => {
      console.log('res');
      console.log(res);
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","menu","cargarTipoprods",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        this.listatipoprods = res[0];
      }
    }, err => {
      console.log('err');
      console.log(err);
    });
  }

  sproduct() {
    // const search = (document.getElementById('search') as HTMLInputElement).value;
    console.log('search', this.search);
    console.log('tipo', this.tipo);
    console.log('fprecio', this.filprecio);
    const search = this.search == undefined ? '' : this.search;
    this.cargarProductos(0, 1, this.tipo, 0, search, 0, this.filprecio);
  }

  cargarOptshowcatego( vtipo: any) {
    const opt = { sel: '*', tbl: 128, where: 'idtipoprod = '+vtipo };
    console.log(opt);
    this.crudService.crud( opt ).subscribe( res => {
      console.log('res');
      console.log(res);
      console.log(res[0][0][2]);
      this.opttipo = res[0][0][1];
      this.optshow = res[0][0][2];
    });
  }

  onClick( vtipo: any) {
    console.log('tipo');
    console.log(this.tipo);
    this.cargarOptshowcatego(vtipo);
    this.tipo = vtipo;
    const search = this.search == undefined ? '' : this.search;
    console.log('search');
    console.log(this.search);
    this.limC = 0;
    this.limB = 0;
    this.cargarProductos(0, 1, vtipo, 0, search, 0, this.filprecio);
    this.cargarCategorias();
    this.cargarCupones();
  }

  cargarProductos(vid: number, vacc: number, vtipo: number, lim: number, vsearch: string, categoria: number, fprecio: number) {
    console.log('impresa: ' + this.impresa);
    const prod = { sel: '', tbl: 7, where: vid + ',' + vtipo + ',' + lim + ',"' + vsearch + '",' +
    categoria + ',"' + this.userid + '", ' + fprecio + ',' + this.impresa };
    console.log(prod);
    this.crudService.crud( prod ).subscribe( res => {
      console.log(res);
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","menu","cargarProductos",' + prod.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log('carga productos comidas');
        console.log(vtipo);
        if (vtipo == 1) {
          if (vacc == 1) {
            this.listacomidas = res[0];
          } else {
            console.log('listacomidas');
            res[0].forEach((comidas: any) => {
              console.log('comidas');
              console.log(comidas);
              this.listacomidas.push(comidas);
            });
          }
        } else {
          if (vacc == 1) {
            this.listabebidas = res[0];
          } else {
            console.log('listabebidas');
            res[0].forEach((bebidas: any) => {
              console.log('bebidas');
              console.log(bebidas);
              this.listabebidas.push(bebidas);
            });
          }
        }
      }
    }, err => {
      console.log('error productos');
      console.log( err );
      console.log( JSON.stringify(err) );
    });
  }

  loadData(event: any) {
    const search = this.search == undefined ? '' : this.search;
    if ( this.tipo == 1 ) {
      this.limC = this.limC + 20;
      setTimeout(() => {
        this.cargarProductos(0, 2, this.tipo, this.limC, search, 0, this.filprecio);
        event.target.complete();
      }, 500);
    } else {
      this.limB = this.limB + 20;
      setTimeout(() => {
        this.cargarProductos(0, 2, this.tipo, this.limB, search, 0, this.filprecio);
        event.target.complete();
      }, 500);
    }
    console.log('complete');
  }

  addToOrden(vid: number) {
    const datos = { sel: '', tbl: 9, where: '1,0,' + vid + ',1,"' + this.userid + '",' + this.impresa };
    this.crudService.crud( datos ).subscribe( async res => {
      console.log( res );
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","menu","addToOrden",' + datos.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        const badge = document.getElementById('badgeorders');
        const data = { sel: '', tbl: 41, where: '"' + this.userid + '",' + this.impresa };
        this.crudService.crud( data ).subscribe(succ => {
          console.log('count adToOrden');
          console.log(succ);
          badge.innerHTML = String(succ[0][0][0]);
        }, err => {
          console.log(err);
        });
        this.appc.updateOrders();
        this.cargarProductos(0, 1, 1, 0, '', 0, this.filprecio);
        this.cargarProductos(0, 1, 2, 0, '', 0, this.filprecio);
        // document.getElementById('prod' + vid).setAttribute('color', 'success');
        // document.getElementById('ico' + vid).setAttribute('name', 'checkmark');
        // document.getElementById('txt' + vid).innerHTML = 'Agregado';
      }
    }, async err => {
      console.log( err );
      this.mostrar_mensaje('No pudimos agregar este producto a tu orden, intentalo de nuevo o cierra ' +
      'la aplicación e inicia nuevamente la aplicación');
    });
  }

  scanTable() {
    if (this.platform.is('hybrid')) {
      console.log('movil');
      /*this.barcodeScanner.scan().then(barcodeData => {
        const txtbarcode = atob(barcodeData.text);
        const txt = txtbarcode.split(',')[0];
        this.ntable = Number((barcodeData.text).split(',')[1]);
        document.getElementById('nmesa').innerHTML = txt;
        const datamesa = { sel: '', tbl: 40, where: '1 ,' + this.ntable + ',"' + this.userid + '",' + this.impresa };
        this.crudService.crud( datamesa ).subscribe(succ => {
          console.log('succ');
          console.log(succ);
        }, (err: any) => {
          console.log('err');
          console.log(err);
        });
      }).catch(err => {
        console.log('Error', err);
      });*/
    } else {
      console.log('web');
      document.getElementById('gridTable').classList.remove('ion-hide');
      const tag = atob('TWVzYSMxLDE=');
      const txtbarcode = tag.split(',');
      document.getElementById('nmesa').innerHTML = String(txtbarcode[0]);
      this.ntable = Number(txtbarcode[1]);
      const datamesa = { sel: '', tbl: 40, where: '1 ,' + this.ntable + ',"' + this.userid + '",' + this.impresa };
      this.crudService.crud( datamesa ).subscribe(succ => {
        console.log(succ);
        if (succ[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + succ[0].ERROR + '","menu","scanTable",' + datamesa.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        }
      }, (err: any) => {
        console.log(err);
      });
    }
  }

  deleteTable() {
    document.getElementById('gridTable').classList.add('ion-hide');
    const datamesa = { sel: '', tbl: 40, where: '3,0,"' + this.userid + '",' + this.impresa };
    this.crudService.crud( datamesa ).subscribe(succ => {
      console.log(succ);
      if (succ[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + succ[0].ERROR + '","menu","deleteTable",' + datamesa.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      }
    }, (err: any) => {
      console.log(err);
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

  async fPopover( ev: any ) {
    // const popover = await this.popoverCtrl.create({ component: FilterComponent, event: ev, mode: 'ios' });
    const popover = await this.popoverCtrl.create({
      component: FilterComponent,
      event: ev,
      mode: 'ios'
      // translucent: true
    });
    popover.style.cssText = '--min-width: 320px; --max-width: 320px;';
    await popover.present();
    const { data } = await popover.onWillDismiss();
    if (data != undefined) {
      this.filprecio = data.item;
      const search = this.search == undefined ? '' : this.search;
      this.cargarProductos(0, 1, this.tipo, 0, search, this.categoria, this.filprecio );
    }
  }

  onKey( event: any ) {
    console.log( event.target.value );
  }

  cargarCupones() {
    this.listacupones = [];
    this.fileslength = 2;
    const subDia = this.nametoday.substr(0, 3);
    this.currentDatetime = formatDate(new Date(), 'yyyy-MM-dd HH:mm', 'en');
    this.currentTime = formatDate(new Date(), 'HH:mm', 'en');
    console.log('time', this.currentDatetime, this.currentTime);
    this.visible = 1;
    const cupones = { sel: '', tbl: 105, where: '"","0,10",' + this.impresa };
    this.crudService.crud( cupones ).subscribe( rsult => {
      console.log(rsult);
      if (rsult[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + rsult[0].ERROR + '","menu","cargarCupones",' + cupones.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        // this.listacupones = rsult[0];
        console.log('listacupones', this.listacupones);
        rsult[0].forEach( (element: any) => {
          if (element[10] == 1) {
            console.log('entrefechas');
            if (this.currentDatetime >= element[5] && this.currentDatetime <= element[6]) {
              console.log('element[0]', element[0]);
              this.listacupones.push(element);
            }
          } else if (element[10] == 2) {
            console.log('pordias');
            const info = element[9].split(','); console.log('info', info);
            for (let i = 0; i < info.length; i++) {
              const dia = info[i].split('_')[0];  // console.log('dia', dia);
              const horas = info[i].split('_')[1];  // console.log('horas', horas);
              const inicio = horas.split('-')[0];  // console.log('inicio', inicio);
              const fin = horas.split('-')[1];  // console.log('fin', fin);
              if  (dia == subDia) {
                if (this.currentTime >= inicio && this.currentTime <= fin) {
                  this.listacupones.push(element);
                  console.log('element', element);
                }
              }
            }
          }
        });
      }
    }, err => {
      console.log('err');
      console.log( err );
    });
  }

}
