import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { NavController, ToastController, ModalController, LoadingController } from '@ionic/angular';
import { ReceiptPage } from '../receipt/receipt.page';
import { FtpaymentService } from '../../services/ftpayment.service';
import { AlertPage } from '../../modals/alert/alert.page';
import { GeneralComponent } from '../../components/general/general.component';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-orderview',
  templateUrl: './orderview.page.html',
  styleUrls: ['./orderview.page.scss'],
})
export class OrderviewPage implements OnInit {
  // tslint:disable: triple-equals
  desde: any;
  hasta: any;
  vdesde: string;
  vhasta: string;
  listaOrdenes: any;
  userid: string;
  email: string;
  listapedidos: any;
  listadetallepedidos: any;
  loadingG: any;
  impresa: string;
  errsystem = { sel: '', tbl: 80, where: '' };

  constructor( private crudService: CrudService,
               private afAuth: AngularFireAuth,
               private navCtrl: NavController,
               private toastCtrl: ToastController,
               private modalCtrl: ModalController,
               private ftp: FtpaymentService,
               private loadingCtrl: LoadingController,
               private general: GeneralComponent,
               private storage: StorageService ) { }

  async ngOnInit() {
    if (this.afAuth.auth.currentUser != null) {
      this.userid = this.afAuth.auth.currentUser.uid;
      this.email = this.afAuth.auth.currentUser.email;
      this.impresa = (await this.storage.getItem('impresa')).value;
      this.cargarPedidos();
    } else {
      this.general.mostrar_alert('Para ver el historial de ordenes debes iniciar sesión');
      this.navCtrl.navigateBack('/signin');
    }
  }

  ionViewWillEnter() {
    // this.cargarPedidos();
    // setTimeout(() => {
    //   this.loadingG.dismiss();
    // }, 500);
  }

  doRefresh(event: any) {
    console.log('Begin async operation');
    this.cargarPedidos();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  async cargarPedidos() {
    this.loadingG = await this.loadingCtrl.create({
      message: 'Por favor espere un momento..'
    });
    await this.loadingG.present();
    console.log(this.email);
    const pedido = { sel: '', tbl: 72, where: '"' + this.userid + '",' + this.impresa };
    this.crudService.crud( pedido ).subscribe((res: any) => {
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","orderview","cargarPedidos",' + pedido.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log('res', res);
        console.log(res[0].length);
        this.listapedidos = res[0];
        let countpedidos = 0;
        this.listapedidos.forEach((detpedido: any) => {
          console.log('detpedido');
          console.log(detpedido);
          console.log(res[0].length);
          countpedidos++;
          if (countpedidos == res[0].length-1) {
            this.loadingG.dismiss();
          }
          const detalle = { sel: '', tbl: 73, where: detpedido[0] };
          this.crudService.crud( detalle ).subscribe((det: any) => {
            console.log('det');
            console.log(det);
            if (det[0].ERROR != undefined) {
              this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + det[0].ERROR + '",' +
              '"orderview","cargarPedidos,"' + detalle.tbl;
              this.crudService.crud(this.errsystem).subscribe(done => {
                console.log(done);
              }, err => {
                console.log(err);
              });
            } else {
              det[0].forEach((item: any) => {
                console.log('items');
                console.log(item);
                document.getElementById('detallepedido' + item[4]).insertAdjacentHTML('beforeend',
                '<ion-row style="width: 100%">' +
                  '<ion-col size="2" align="left">' +
                    '<ion-label>' + item[1] + '</ion-label>' +
                  '</ion-col>' +
                  '<ion-col size="6" align="center" style="padding-top: 0% 2%">' +
                    '<span>' + item[2] + '</span>' +
                  '</ion-col>' +
                  '<ion-col size="4" align="right" style="padding-top: 0% 2%">' +
                    '<span>₡ ' + item[3] + '</span>' +
                  '</ion-col>' +
                  '<ion-col size="12">' +
                    '<section id="options' + item[6] + '"></section>' +
                  '</ion-col>' +
                '</ion-row>');
                console.log('for each');
                });
                det[0].forEach((opt: any) => {
                  const iddetail = opt[6];
                  console.log('iddetail:', iddetail);
                  const options = { sel: '', tbl: 113, where: opt[5] + ',"' + this.userid + '",' + this.impresa + ',' + opt[6] + ',2'  };
                  console.log(options);
                  this.crudService.crud( options ).subscribe(optns => {
                    console.log(optns);
                    if (optns[0].length > 0) {
                      for (let o = 0; o < optns[0].length; o++) {
                        console.log(iddetail);
                        console.log(optns[0][o][0]);
                        document.getElementById('options' + iddetail).insertAdjacentHTML('beforeend',
                        '&nbsp;<ion-badge color="light" style="font-weight: 400; font-size: 1.2">' + optns[0][o][0] + '</ion-badge>');
                      }
                    }
                  });
                });
            }
          }, errdet => {
            console.log('errdet');
            console.log(errdet);
            this.loadingG.dismiss();
          });
        });
        console.log('end for each');
      }
      this.loadingG.dismiss();
      console.log('end loading');
    }, err => {
      console.log('err');
      console.log(err);
      this.loadingG.dismiss();
    });
  }

  async viewreceipt(vid: number) {
    console.log(vid);
    const modalP = await this.modalCtrl.create({
      component: ReceiptPage,
      componentProps: {
        idpago: vid,
        tipo: 1
      }
    });
    await modalP.present();
    const { data } = await modalP.onWillDismiss();
    console.log('data viewreceipt');
    console.log(data);
    if (data.tipo == 1) {
      this.navCtrl.navigateBack('/orderview');
    }
  }

  buscarOrden() {
    console.log('buscarOrden');
    console.log(this.userid);
    if (this.vdesde == undefined) {
      this.vdesde = '0000-00-00';
    }

    if (this.vhasta == undefined) {
      this.vhasta = '0000-00-00';
    }

    const data = { sel: '', tbl: 20, where: '1,"' + this.userid + '","' + this.vdesde + '","' + this.vhasta + '",0' };
    this.crudService.crud( data ).subscribe( async res => {
      console.log('res');
      console.log(res);
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","orderview","buscarOrden",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        if ( res[0].length > 0 ) {
          this.listaOrdenes = res[0];
          console.log(res[0]);
        } else {
          const toast = await this.toastCtrl.create({
            message: 'No se encontraron ordenes',
            duration: 2000
          });
          toast.present();
        }
      }
    }, err => {
      console.log(err);
    });
  }

  cancel_orden(idpay: string, idorden: number, idestado: number) {
    console.log(idpay, idorden);
    const valiDate = { sel: '', tbl: 79, where: idorden };
    this.crudService.crud( valiDate ).subscribe(async vres => {
      console.log('vres' , vres);
      if (vres[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + vres[0].ERROR + '","orderview","cancel_orden",' + valiDate.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        if (vres[0].length > 0) {
          console.log('cancelar');
          const modalP = await this.modalCtrl.create({
            component: AlertPage,
            componentProps: {
              error: 'Desea cancelar su orden?'
            },
            cssClass: 'alert-modal'
          });
          await modalP.present();
          const { data } = await modalP.onWillDismiss();
          console.log(data);
          if (data != undefined) {
            console.log('return charge');
            const loading = await this.loadingCtrl.create({
              message: 'Por favor espere un momento..'
            });
            await loading.present();
            if (idestado != 4) {
              this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
                if (sucft[0].ERROR != undefined) {
                  this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + sucft[0].ERROR + '","orderview","cancel_orden",96';
                  this.crudService.crud(this.errsystem).subscribe(done => {
                    console.log(done);
                  }, err => {
                    console.log(err);
                  });
                } else {
                  this.ftp.appReturnCharge(sucft[0][0][0], sucft[0][0][1], this.email, idpay).subscribe((res: any) => {
                    console.log('res return charge');
                    console.log(res);
                    // console.log(res[0][0]);
                    if (res != null) {
                      if (res.apiStatus == 'Successful') {
                        const estado = { sel: '', tbl: 30, where: idorden + ',6' };
                        this.crudService.crud( estado ).subscribe( resEstado => {
                          console.log(resEstado);
                          if (resEstado[0].ERROR != undefined) {
                            this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + resEstado[0].ERROR + '",' +
                            '"orderview","cancel_orden",' + estado.tbl;
                            this.crudService.crud(this.errsystem).subscribe(done => {
                              console.log(done);
                            }, err => {
                              console.log(err);
                            });
                          } else {
                            this.cargarPedidos();
                          }
                          loading.dismiss();
                        }, errEstado => {
                          console.log('err estado');
                          console.log(errEstado);
                          loading.dismiss();
                        });
                      } else if (res.apiStatus == 'Invalid Charge') {
                        this.general.mostrar_error('Esta orden no puede ser cancelada', 0);
                        loading.dismiss();
                      } else {
                        this.general.mostrar_error('Tuvimos un inconveniente, favor intentelo de nuevo', 0);
                        loading.dismiss();
                      }
                    } else {
                      this.general.mostrar_error('Tuvimos un inconveniente, favor intentelo de nuevo', 0);
                      loading.dismiss();
                    }
                  }, error => {
                    console.log('error return charge');
                    console.log(error);
                    loading.dismiss();
                  });
                }
              }, err => {
                console.log('err');
                console.log(err);
              });
            } else {
              this.general.mostrar_error('Esta orden no puede ser cancelada por que ya fue enviada', 0);
              loading.dismiss();
            }
          } else {
            this.general.mostrar_error('Tuvimos un inconveniente, favor intentelo de nuevo', 0);
          }
        } else {
          console.log('no se puede cancelar');
          this.general.mostrar_error('Esta orden no puede ser cancelada', 0);
        }
      }
    }, verr => {
      console.log('verr', verr);
    });
  }

  async mostrar_orden( idpay: string ) {
    console.log('mostrar orden idpay');
    console.log(idpay);
    // this.presentModal(idpay);
    const modal = await this.modalCtrl.create({
      component: ReceiptPage,
      componentProps: {
        idpago: idpay,
        tipo: 2
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    if (data.tipo == 1) {
      this.navCtrl.navigateBack('/menu');
    } else {
      this.navCtrl.navigateBack('/orderview');
    }
  }

  async presentModal(vidpago: any) {
    const modal = await this.modalCtrl.create({
      component: ReceiptPage,
      componentProps: {
        idpago: vidpago
      }
    });
    return await modal.present();
  }

}
