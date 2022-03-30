import { Component, OnInit, Input } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { LoadingController, ModalController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { StorageService } from '../../services/storage.service';
import { Plugins } from '@capacitor/core';
const { Device } = Plugins;

@Component({
  selector: 'app-options',
  templateUrl: './options.page.html',
  styleUrls: ['./options.page.scss'],
})
export class OptionsPage implements OnInit {
// tslint:disable: triple-equals
// tslint:disable: max-line-length
// tslint:disable: prefer-for-of
// tslint:disable: no-unused-expression
  errsystem = { sel: '', tbl: 80, where: '' };
  @Input() vid: number;
  @Input() file: any;
  @Input() name: any;
  listDetails: any;
  listOptions: any;
  listprices: any;
  isChecked: string;
  userid: string;
  impresa: number;
  isfav: number;
  samedetail = [];
  cartdone = 0;
  validated = 0;
  iddetail = 0;
  action: number;
  platformiOS = false;
  constructor( private crudService: CrudService, private loading: LoadingController,
               private afAuth: AngularFireAuth, private storage: StorageService,
               private modalCtrl: ModalController ) { }

  async ngOnInit() {
    const device = await Device.getInfo();
    this.platformiOS = device.platform === 'ios';
    this.userid = this.afAuth.auth.currentUser.uid; // '2kCxTeuA36cssqbGNY1CSaQ9Ivl1'
    this.impresa = Number((await this.storage.getItem('impresa')).value);
    this.cargarInfo();
    // const loading = await this.loading.create({ message: 'Cargando...' });
    // await loading.present();
    console.log('iditem', this.vid);
    this.crudService.crud({ sel: '', tbl: 102, where: this.vid }).subscribe(suc => {
      console.log('detail');
      console.log(suc);
      if (suc[0].length > 0) {
        this.action = suc[0][0][3];
        if (suc[0][0][3] == 1) {
          this.listDetails = suc[0];
          this.listDetails.forEach((category: any) => {
            console.log('category[0]');
            console.log(category[0]);
            this.crudService.crud({ sel: '', tbl: 104, where: category[0] }).subscribe(options => {
              // append
              console.log('options');
              console.log(options);
              this.listOptions = options[0];
              this.listOptions.forEach((optns: any) => {
                console.log(optns);
                if (optns[4] == 0) {
                  const radioOptns = optns[2].replace(' ', '_');
                  // const ischecked = optns[5] == 1 ? radioOptns : '';
                  optns[5] == 1 ? this.isChecked = radioOptns : 1;
                  // console.log('ischecked', this.isChecked);
                  document.getElementById('parentnode').setAttribute('value', this.isChecked);
                  document.getElementById('options' + optns[1]).insertAdjacentHTML('beforeend',
                  '<ion-item>' +
                  '<ion-radio color="btnapp" class="chk options" slot="start" id="optn' + optns[0] + '" multiple="' + optns[4] + '" value="' + radioOptns + '" allow-empty-selection="false" name="rad' + optns[0] + '"></ion-radio>' +
                    '<ion-label style="display: inline-block">' + optns[2] + '</ion-label>' +
                    '<ion-label style="display: inline-block">₡' + optns[3] + '</ion-label>' +
                  '</ion-item>');
                } else {
                  const checked = optns[5] == 1 ? 'checked' : '';
                  document.getElementById('options' + optns[1]).insertAdjacentHTML('beforeend',
                  '<ion-item>' +
                  '<ion-checkbox color="btnapp" class="chk options" id="optn' + optns[0] + '" multiple="' + optns[4] + '" slot="start" ' + checked + '></ion-checkbox>' +
                    '<ion-label>' + optns[2] + '</ion-label>' +
                    '<ion-label>₡' + optns[3] + '</ion-label>' +
                  '</ion-item>');
                }
              });
            });
          });
        } else {
          this.listDetails = suc[0];
          console.log('suc[0][0]');
          console.log(suc[0]);
          console.log(suc[0][0]);
          console.log('suc: ', suc[0][0][0]);
          suc[0].forEach((optns: any) => {
            console.log(optns[0]);
            setTimeout(() => {
            document.getElementById('parentnode').setAttribute('value', suc[0][0][1].replace(' ', '_'));
            document.getElementById('options' + suc[0][0][0]).insertAdjacentHTML('beforeend',
              '<ion-item>' +
              '<ion-radio color="btnapp" class="chk options" slot="start" id="optn' + optns[0] + '"' +
              'value="' + optns[1].replace(' ', '_') + '"></ion-radio>' +
                '<ion-label style="display: inline-block">' + optns[1] + '</ion-label>' +
                '<ion-label style="display: inline-block">₡' + optns[2] + '</ion-label>' +
              '</ion-item>');
            }, 100);
          });
        }
      } else {
        this.action = 1;
      }
      // loading.dismiss();
    });
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

  cargarInfo() {
    // console.log('cargarInfo', this.vid + ',' + this.impresa + ',"' + this.userid + '"');
    const data = { sel: '', tbl: 93, where: this.vid + ',' + this.impresa + ',"' + this.userid + '"' };
    let producto: any = '';
    this.crudService.crud( data ).subscribe(res => {
      // console.log('res', res);
      producto = res[0];
      this.isfav = producto[0][4];
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
      this.cargarInfo();
    }, err => {
      console.log(err);
    });
  }

  addOptions(vaccion: number, iditem: number, quantity: number) {
    console.log('add options');
    const optns = Array.from(document.getElementsByClassName('options'));
    const cart = { sel: '', tbl: 111, where: vaccion + ',0,' + iditem + ',' + quantity + ',"' + this.userid + '",' +
    this.impresa + ',' + this.iddetail };
    this.crudService.crud( cart ).subscribe(suc => {
      if (suc[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + suc[0].ERROR + '","options","addOptions",' + cart.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        if (vaccion == 1) {
          for (let i = 0; i < optns.length; i++) {
            console.log('for add options');
            const idsubcategory = Number(optns[i].id.substr(4));
            const multiple = Number(optns[i].attributes[3].value);
            // const multiple = Number(document.getElementById('optn' + idsubcategory).getAttribute('multiple'));
            if (multiple == 1) { // checkbox
              // console.log('checkbox');
              const elem = (document.getElementById('optn' + idsubcategory) as HTMLInputElement).checked;
              const ischecked = elem == true ? 1 : 0;
              const options = { sel: '', tbl: 112, where: '0,' + suc[0][0][0] + ',' + iditem + ',' + idsubcategory +
                ',' + ischecked };
              this.crudService.crud( options ).subscribe(result => {
                // console.log(result);
                // errores db
              });
            } else { // radio
              const parentnode = document.getElementById('parentnode') as HTMLInputElement;
              const elem = document.getElementById('optn' + idsubcategory) as HTMLInputElement;
              if (parentnode.value == elem.value) {
                const ischecked = 1;
                // save options
                const options = { sel: '', tbl: 112, where: '0,' + suc[0][0][0] + ',' + iditem + ',' + idsubcategory +
                ',' + ischecked };
                this.crudService.crud( options ).subscribe(result => {
                  // console.log(result);
                  // errores db
                });
                // console.log('idsubcategory: ', idsubcategory, ' ischecked: ', ischecked);
              } else {
                const ischecked = 0;
                // save options
                // console.log(res);
                const options = { sel: '', tbl: 112, where: '0,' + suc[0][0][0] + ',' + iditem + ',' + idsubcategory +
                ',' + ischecked };
                this.crudService.crud( options ).subscribe(result => {
                  // console.log(result);
                });
                // console.log('idsubcategory: ', idsubcategory, ' ischecked: ', ischecked);
              }
            }
          }
        }
      }
      this.modalCtrl.dismiss({
        dismissed: true
      });
    });
  }

  async validateRepeated(iditem: number, quantity: number) {
    console.log('validateRepeated');
    let itt = -1;
    const optns = Array.from(document.getElementsByClassName('options'));
    const count = { sel: '', tbl: 109, where: '2,"' + this.userid + '",' + this.impresa + ',' + iditem };
    this.crudService.crud( count ).subscribe(cnt => {
      console.log('cnt: ', cnt[0][0][0]);
      const data = { sel: '', tbl: 109, where: '1,"' + this.userid + '",' + this.impresa + ',' + iditem };
      this.crudService.crud( data ).subscribe(suc => {
        console.log(suc);
        console.log(suc[0].length);
        if (suc[0].length > 0) {
          console.log('options founded');
          let iddetail = suc[0][0][0];
          for (let i = 0; i < suc[0].length; i++) {
            console.log('i:', i)
            console.log('iddetail:', iddetail, 'suc[0][i][0]:', suc[0][i][0]);
            if (iddetail != suc[0][i][0]) { // different detail
              // console.log('detalle diferente');
              this.validateArray();
              // console.log('validacion', this.validateArray());
              if (this.validateArray() > 0) {
                // actualizar cantidad en db
                // console.log('update');
                this.validated = 2;
                this.iddetail = suc[0][i - 1][0];
                break;
                // this.addOptions(2, iditem, quantity, suc[0]);
              } else {
                this.validated = 1;
                // console.log(this.validated);
              }
              this.samedetail = [];
              itt++;
              const idsubcategory = Number(optns[itt].id.substr(4));
              const multiple = Number(document.getElementById('optn' + idsubcategory).getAttribute('multiple'));
              if (multiple == 1) { // checkbox
                // console.log('checkbox');
                const elem = (document.getElementById('optn' + idsubcategory) as HTMLInputElement).checked;
                const ischecked = elem == true ? 1 : 0;
                // console.log(idsubcategory, suc[0][i][1]);
                if (idsubcategory == suc[0][i][1]) {
                  // console.log('misma categoria');
                  // console.log(ischecked, suc[0][i][2]);
                  if (ischecked == suc[0][i][2]) {
                    // console.log('mismo detalle');
                    this.samedetail.push(1);
                  } else {
                    // console.log('diferente detalle');
                    this.samedetail.push(0);
                  }
                }
                // console.log(suc[0][i][0], suc[0][i][1], suc[0][i][2]);
                // console.log('idsubcategory: ', idsubcategory, ' ischecked: ', ischecked);
              } else { // radio
                const parentnode = document.getElementById('parentnode') as HTMLInputElement;
                const elem = document.getElementById('optn' + idsubcategory) as HTMLInputElement;
                if (parentnode.value == elem.value) {
                  const ischecked = 1;
                  if (idsubcategory == suc[0][i][1]) {
                    // console.log('misma categoria');
                    if (ischecked == suc[0][i][2]) {
                      // console.log('mismo detalle');
                      this.samedetail.push(1);
                    } else {
                      // console.log('diferente detalle');
                      this.samedetail.push(0);
                    }
                  } else {
                    // console.log('diferente');
                  }
                  // console.log(suc[0][i][0], suc[0][i][1], suc[0][i][2]);
                  // console.log('idsubcategory: ', idsubcategory, ' ischecked: ', ischecked);
                } else {
                  const ischecked = 0;
                  if (idsubcategory == suc[0][i][1]) {
                    // console.log('misma categoria');
                    if (ischecked == suc[0][i][2]) {
                      // console.log('mismo detalle');
                      this.samedetail.push(1);
                    } else {
                      // console.log('detalle diferente');
                      this.samedetail.push(0);
                    }
                  } else {
                    // console.log('diferente');
                  }
                  // console.log(suc[0][i][0], suc[0][i][1], suc[0][i][2]);
                  // console.log('idsubcategory: ', idsubcategory, ' ischecked: ', ischecked);
                }
              }
            } else { // same detail
              console.log('mismo detalle');
              itt++;
              const idsubcategory = Number(optns[itt].id.substr(4));
              console.log('itt:', itt, 'optns length - 1', optns.length - 1);
              if (itt == optns.length - 1) { // cuando cambia de iddetalle
                itt = -1;
              }
              // console.log(idsubcategory);
              const multiple = Number(document.getElementById('optn' + idsubcategory).getAttribute('multiple'));
              if (multiple == 1) { // checkbox
                console.log('checkbox');
                const elem = (document.getElementById('optn' + idsubcategory) as HTMLInputElement).checked;
                const ischecked = elem == true ? 1 : 0;
                // console.log(idsubcategory, suc[0][i][1]);
                if (idsubcategory == suc[0][i][1]) {
                  console.log('misma categoria');
                  if (ischecked == suc[0][i][2]) {
                    console.log('mismo detalle');
                    this.samedetail.push(1);
                  } else {
                    console.log('diferente detalle');
                    this.samedetail.push(0);
                  }
                }
                // console.log(suc[0][i][0], suc[0][i][1], suc[0][i][2]);
                // console.log('idsubcategory: ', idsubcategory, ' ischecked: ', ischecked);
              } else { // radio
                const parentnode = document.getElementById('parentnode') as HTMLInputElement;
                const elem = document.getElementById('optn' + idsubcategory) as HTMLInputElement;
                if (parentnode.value == elem.value) {
                  const ischecked = 1;
                  if (idsubcategory == suc[0][i][1]) {
                    console.log('misma categoria');
                    if (ischecked == suc[0][i][2]) {
                      console.log('mismo detalle');
                      this.samedetail.push(1);
                    } else {
                      console.log('diferente detalle');
                      this.samedetail.push(0);
                    }
                  } else {
                    console.log('diferente');
                  }
                  // console.log(suc[0][i][0], suc[0][i][1], suc[0][i][2]);
                  // console.log('idsubcategory: ', idsubcategory, ' ischecked: ', ischecked);
                } else {
                  const ischecked = 0;
                  if (idsubcategory == suc[0][i][1]) {
                    console.log('misma categoria');
                    if (ischecked == suc[0][i][2]) {
                      console.log('mismo detalle');
                      this.samedetail.push(1);
                    } else {
                      console.log('detalle diferente');
                      this.samedetail.push(0);
                    }
                  } else {
                    // console.log('diferente');
                  }
                  // console.log(suc[0][i][0], suc[0][i][1], suc[0][i][2]);
                  // console.log('idsubcategory: ', idsubcategory, ' ischecked: ', ischecked);
                }
              }

              console.log('i:', i, 'optns length', optns.length);
              if (i == optns.length) {
                console.log('solo un recorrido de todas las opciones');
                this.validateArray();
                // console.log('validacion', this.validateArray());
                if (this.validateArray() > 0) {
                  this.validated = 2;
                  this.iddetail = suc[0][i][0];
                  break;
                } else {
                  this.validated = 1;
                }
              }

              // last
              console.log('last', i , cnt[0][0][0] - 1);
              if (i == cnt[0][0][0] - 1) {
                // console.log('last');
                this.validateArray();
                // console.log('validacion', this.validateArray());
                if (this.validateArray() > 0) {
                  this.validated = 2;
                  this.iddetail = suc[0][i][0];
                  break;
                } else {
                  this.validated = 1;
                }
              }
            }
            iddetail = suc[0][i][0];
          }
        } else {
          console.log('add first');
          this.addOptions(1, iditem, quantity);
        }
      });
    });
  }

  validateArray() {
    const len = this.samedetail.length;
    // console.log(len);
    // console.log(this.samedetail);
    let same = 0;
    for (let i = 0; i < len; i++) {
      // console.log('samedetail');
      // console.log(this.samedetail[i]);
      if (this.samedetail[i] == 1) {
        same++;
      }
    }
    if (same == len) {
      return len;
    } else {
      return 0;
    }

  }

  async placeOrder(iditem: number) {
    console.log('placeOrder');
    const quantity = Number((document.getElementById('quantity') as HTMLInputElement).value);
    // validar repetidos
    console.log(this.action);
    if (this.action == 1) {
      this.samedetail = [];
      await this.validateRepeated(iditem, quantity);
      setTimeout(() => {
        console.log(this.validated);
        switch (this.validated) {
          case 1:
            console.log('insert');
            this.addOptions(1, iditem, quantity);
            break;
          case 2:
            console.log('update');
            this.addOptions(2, iditem, quantity);
            break;
          default:
            // console.log('continue validating');
            break;
        }
      }, 500);
    } else {
      const optns = Array.from(document.getElementsByClassName('options'));
      for (let i = 0; i < optns.length; i++) {
        const checked = optns[i].attributes[6].nodeValue;
        if (checked == 'true') {
          console.log('checked', optns[i].attributes[6].nodeValue);
          const data = { sel: '', tbl: 117, where: iditem + ',' + quantity + ',"' + this.userid + '",' +
            this.impresa + ',' + optns[i].attributes[3].nodeValue.substr(4) };
          console.log(data);
          this.crudService.crud( data ).subscribe(res => {
            console.log('adding item w price');
            console.log(res);
            this.modalCtrl.dismiss({
              dismissed: true
            });
          });
        }
      }
      // 117 vaction tinyint(3),vid int,viditem int,vquantity int(3),vuser varchar(45),vimpresa int,vidprice int
    }

    // if (count[0].ERROR != undefined) {
    //   this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + count[0].ERROR + '","menu","ionViewWillEnter",39';
    //   this.crudService.crud(this.errsystem).subscribe(done => {
    //     console.log(done);
    //   }, err => {
    //     console.log(err);
    //   });
    // }
  }

  restoCant() {
    let quantity = Number((document.getElementById('quantity') as HTMLInputElement).value);
    quantity--;
    if (quantity > 0) {
      (document.getElementById('quantity') as HTMLInputElement).value = String(quantity);
    }
    console.log(quantity);
  }

  plusCant() {
    let quantity = Number((document.getElementById('quantity') as HTMLInputElement).value);
    quantity++;
    (document.getElementById('quantity') as HTMLInputElement).value = String(quantity);
    console.log(quantity);

  }

}
