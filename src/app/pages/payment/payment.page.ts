import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoadingController, NavController, ModalController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/auth';
import { GeneralComponent } from '../../components/general/general.component';
import { ReceiptPage } from '../receipt/receipt.page';
import { CrudService } from '../../services/crud.service';
import { FtpaymentService } from '../../services/ftpayment.service';
import { ModalPage } from '../../modals/modal/modal.page';
import { ModalcardPage } from '../../modals/modalcard/modalcard.page';
import { DatePipe } from '@angular/common';
import { SecurepaymentPage } from '../securepayment/securepayment.page';
import { StorageService } from '../../services/storage.service';
import { SMS } from '@ionic-native/sms/ngx';
import { SinpePage } from '../../modals/sinpe/sinpe.page';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Plugins, LocalNotificationEnabledResult, LocalNotificationActionPerformed, LocalNotification, Device } from '@capacitor/core';
// import { FcmService } from './services/fcm.service';
const { SplashScreen /*,PushNotifications*/, LocalNotifications } = Plugins;

// const impresa = environment.impresa;
const tipon = environment.tiponegocio;

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {
  // tslint:disable: max-line-length
  // tslint:disable: triple-equals
  // tslint:disable: no-conditional-assignment
  paymentAmount: number; fpaymentAmount: string;
  currency = 'CRC'; currencyIcon = '$';
  userid: string; idorden: number;
  flete: string; subtotal: number;
  nproducto: any; totDolar: any; total: number;
  ftcharge: any; ftcard: any; loadingG: any;
  iddireccion: number; tipoenvio = 'express';
  idenvio: number; cardTid: string; idcard: number;
  chsub: any; chtot: any; chfle: any; infopago = 2;
  @ViewChild('Map', {static: false}) mapElement: ElementRef;
  jstoday: any; today = new Date(); strXML: string; medioPago: string;
  nametoday: any;
  days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  aperture: any; clousure: any; currentTime: any; datetoday: any; feriado: any;
  errsystem = { sel: '', tbl: 80, where: '' }; impresa: string;
  tipoentrega: string;
  idbank: number; banknumber: string; sinpenumber: number; issinpe: number; sinpe: number; sinpemessaje: any;
  maxsinpe = 50000;

  constructor( private afAuth: AngularFireAuth,
               private crudService: CrudService,
               private navCtrl: NavController,
               private general: GeneralComponent,
               private fts: FtpaymentService,
               private modalCtrl: ModalController,
               public alertController: AlertController,
               private afauth: AngularFireAuth,
               private loadingCtrl: LoadingController,
               private datepipe: DatePipe,
               private storage: StorageService,
               private sms: SMS,
               private permissions: AndroidPermissions ) { }

  async ngOnInit() {
    this.userid = this.afAuth.auth.currentUser.uid;
    this.impresa = (await this.storage.getItem('impresa')).value;
    console.log('provider', this.afauth.auth.currentUser.providerData[0].providerId);
    this.nametoday = this.days[new Date().getDay()];
    this.getinfoHorario();
    this.getinfoFeriados();
    this.getinfoSinpe();
    if (tipon == 2) {
      document.getElementById('served').classList.add('ion-hide');
    } else if (tipon == 1 || tipon == 3) {
      document.getElementById('served').classList.remove('ion-hide');
    }

    LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'CHAT_MSG',
          actions: [
            {
              id: 'view',
              title: 'Abrir'
            },
            {
              id: 'remove',
              title: 'Quitar',
              destructive: true
            }
            // {
            //   id: 'respond',
            //   title: 'Respond',
            //   input: true
            // }
          ]
        }
      ]
    });
  }

  getinfoSinpe() {
    this.crudService.crud({ sel: '', tbl: 121, where: this.impresa }).subscribe(datasinpe => {
      console.log('datasinpe', datasinpe);
      if (datasinpe[0].length > 0) {
        this.sinpenumber = datasinpe[0][0][2];
        this.sinpemessaje = datasinpe[0][0][3];
        this.sinpe = datasinpe[0][0][5];
        console.log('sinpenumber', this.sinpenumber);
        console.log('sinpemessaje', this.sinpemessaje);
        console.log('sinpe', this.sinpe);
      }
    });
    this.crudService.crud({ sel: 'bancosinpe', tbl: 5, where: 'uid = "' + this.userid + '"' }).subscribe(data => {
      this.idbank = data[0][0][0];
      console.log('idbank', this.idbank);
      if ( this.idbank != 0) {
        this.issinpe = 1;
        this.crudService.crud({ sel: 'numero', tbl: 119, where: 'id = ' + this.idbank }).subscribe(info => {
          this.banknumber = info[0][0][0];
          console.log('banknumber', this.banknumber);
        });
      } else {
        this.issinpe = 0;
      }
      console.log('ISSINPE', this.issinpe);
    });
  }

  async sendSMS() {
    this.total = Number(String(this.fpaymentAmount).replace(/\,/g, ''));
    console.log('INFO SMS', this.banknumber, this.total);
    const verifySMS = await this.modalCtrl.create({
      component: SinpePage,
      cssClass: 'options-modal',
      componentProps: {
        payment: this.total,
        banknum: this.banknumber
      },
      backdropDismiss: false
    });
    verifySMS.present();
    // this.sms.send('+' + this.banknumber, `Pase 10 ${this.sinpenumber} ${this.sinpemessaje}`);
    this.sms.send(`+${this.banknumber}`, `Pase ${this.total} ${this.sinpenumber} ${this.sinpemessaje}`);
    const { data } = await verifySMS.onWillDismiss();
    console.log('MODAL OTP', data.reference );
    if ( data.reference == 'timelimit') {
      console.log('Se ha acabado el tiempo de confirmación');
    } else if ( data.reference == undefined || data.reference == '') {
      console.log('Ha ocurrido un error al procesar el pago');
    } else {
      console.log('CREAR ORDEN DE PAGO');
      console.log('this.makePayment', data.reference, '', this.total);
      this.makePayment(`${data.reference}`, '', this.total);
    }
  }

  async ionViewWillEnter() {
    console.log('userid: ', this.userid);
    this.impresa = (await this.storage.getItem('impresa')).value;
    const data = { sel: '', tbl: 22, where: '"' + this.userid + '",' + this.impresa };
    this.crudService.crud( data ).subscribe(res => {
      console.log('res');
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","payment","ionViewWillEnter",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log( JSON.stringify(res) ) ;
        this.fpaymentAmount = res[0][0][0];
        this.paymentAmount = Number(res[0][0][1]);
        this.idorden = res[0][0][2];
        this.subtotal = res[0][0][3];
        this.flete = res[0][0][4];
        this.nproducto = res[0][0][5];
        this.chsub = res[0][0][3];
        this.chtot = res[0][0][0];
        this.chfle = res[0][0][4];
        console.log(this.fpaymentAmount);
        console.log(this.paymentAmount);
        console.log(this.flete);
        this.showDefaultCard();
        if (this.flete != '0.00') {
          this.showDefaultDirection();
        } else {
          document.getElementById('direccion').innerHTML = 'No hay direcciones registradas';
        }
      }
    }, err => {
      console.log(err);
    });
  }

  getinfoHorario() {
    console.log('SUBSTRING_INDEX(' + this.nametoday + ', "/",1), SUBSTRING_INDEX(' + this.nametoday + ', "/",-1)');
    const horario = { sel: 'SUBSTRING_INDEX(' + this.nametoday + ', "/",1), SUBSTRING_INDEX(' + this.nametoday + ', "/",-1)',
                      tbl: 77,
                      where: 'idsucursal = ' + this.impresa };
    this.crudService.crud( horario ).subscribe( rsult => {
      // insert error
      if (rsult[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + rsult[0].ERROR + '","payment","getinfoHorario",' + horario.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log('horario', rsult[0][0]);
        this.aperture = rsult[0][0][0];
        this.clousure = rsult[0][0][1];
      }
    }, err => {
      console.log('err');
      console.log( err );
    });
  }

  getinfoFeriados() {
    const date = new Date();
    console.log('date', date);
    this.datetoday = this.datepipe.transform(date, 'yyyy/MM/dd');
    const feriado = { sel: '',
                      tbl: 75,
                      where: this.impresa + ',"' + this.datetoday + '"' };
    this.crudService.crud( feriado ).subscribe( rsult => {
      // insert error
      if (rsult[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + rsult[0].ERROR + '","payment","getinfoFeriados",' + feriado.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log('feriado', rsult[0][0]);
        this.feriado = rsult[0][0];
      }
    }, err => {
      console.log('err');
      console.log( err );
    });
  }

  doPay() {
    // validate data user
    const dataUser = { sel: '', tbl: 107, where: '"' + this.userid + '"' };
    this.crudService.crud( dataUser ).subscribe(async suc => {
      if (suc[0].ERROR != undefined) {
        this.general.mostrar_error(suc[0].ERROR, 1);
      } else {
        this.crudService.crud({ sel: '', tbl: 125, where: this.impresa }).subscribe(async maxorders => {
          console.log(maxorders);
          // secure payment
          const modalS = await this.modalCtrl.create({
            component: SecurepaymentPage,
            cssClass: 'pin-modal',
            componentProps: {
              ordenesactuales: maxorders[0][0][0],
              maximoordenes: maxorders[0][0][1]
            }
          });
          await modalS.present();
          const { data } = await modalS.onWillDismiss();
          console.log('secure payment');
          console.log(data.dismissed, data.validado);
          if (data.dismissed && data.validado == 1) {
            if (this.infopago == 0 || this.infopago == 2) {
              this.medioPago = '02';
            } else {
              this.medioPago = '01';
            }

            console.log('tipo: ' + this.afauth.auth.currentUser.providerData[0].providerId);
            // registro con email
            if (this.afauth.auth.currentUser.providerData[0].providerId == 'password') {
              const verifyemail: boolean = this.afAuth.auth.currentUser.emailVerified;
              console.log(verifyemail);
              if (verifyemail == false) {
                this.general.mostrar_error('El correo no ha sido verificado, favor revise su correo para verificar el correo de este usuario', 0);
              } else {
                this.loadingG = await this.loadingCtrl.create({
                  message: 'Por favor espere mientras realizamos su pago..'
                });
                await this.loadingG.present();
                console.log('pago maximo por tipo de pago');
                // pago máximo por tipo de pago
                this.crudService.crud({ sel: '', tbl: 123, where: this.paymentAmount + ',' + this.impresa + ',' + this.infopago }).subscribe(res => {
                  console.log(res);
                  if (res[0][0][0] == 0) {
                    if (this.infopago == 1) {
                      this.loadingG.dismiss();
                      this.general.mostrar_alert('No se permite realizar compras mayores a ' + res[0][0][1] + ' en efectivo');
                    } else if (this.infopago == 2) {
                      this.loadingG.dismiss();
                      this.general.mostrar_alert('No se permite realizar compras mayores a ' + res[0][0][1] + ' en tarejta');
                    } else {
                      this.loadingG.dismiss();
                      this.general.mostrar_alert('No se permite realizar compras mayores a ' + res[0][0][1] + ' en SINPE');
                    }
                  } else {
                    console.log('pago maximo por dia');
                    // pago máximo por día
                    console.log(this.impresa + ',"' + this.userid + '"');
                    this.crudService.crud({ sel: '', tbl: 124, where: this.impresa + ',"' + this.userid + '"' }).subscribe(maxday => {
                      console.log(maxday);
                      if (maxday[0][0][0] == 0) {
                        this.loadingG.dismiss();
                        this.general.mostrar_alert('No se permite realizar compras mayores a ' + maxday[0][0][1] + ' por día');
                      } else {
                        console.log('today:', this.nametoday);
                        console.log('aperture:', this.aperture);
                        console.log('clousure:', this.clousure);
                        const date = new Date();
                        this.currentTime = date.getHours() + ':' + date.getMinutes();
                        console.log('currentTime', this.currentTime);
                        if  ( this.currentTime >= this.aperture && this.currentTime <= this.clousure) {
                          this.crudService.crud({ sel: '', tbl: 8, where: '"' + this.afAuth.auth.currentUser.uid + '"' }).subscribe((session: any) => {
                            // insert error
                            if (session[0].ERROR != undefined) {
                              this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + session[0].ERROR + '","payment","doPay",8';
                              this.crudService.crud(this.errsystem).subscribe(done => {
                                console.log(done);
                              }, err => {
                                console.log(err);
                              });
                            } else {
                              if (session[0][0][4] == '') {
                                this.general.mostrar_alert('Debes de confirmar tu número de teléfono antes de continuar con el pago');
                                this.navCtrl.navigateBack('/infouser');
                              } else {
                                this.afauth.user.subscribe(async result => {
                                  console.log(result.email);
                                  console.log('resuser');
                                  console.log('verified password');
                                  console.log(result.email);
                                  this.ftcard = this.cardTid;
                                  console.log('ftcard');
                                  console.log(this.ftcard);
                                  console.log('validar direcciones y tarjetas');
                                  console.log(this.cardTid, this.iddireccion, this.infopago);
                                  /* incluir cargos si no hay */
                                  // infopago =  0 express 1 efectivo 2 tarjeta 3 sinpe
                                  // if (this.tipoenvio == 'express') {
                                    //   if (this.cardTid == undefined || this.iddireccion == undefined) {
                                      //     this.general.mostrar_error('Es necesario una direccion y una tarjeta para continuar', 0);
                                      //     this.loadingG.dismiss();
                                      //   } else {
                                        //     this.chargeFT(result.email);
                                        //   }
                                        // }
                                  if (this.tipoenvio == 'express') {
                                    console.log('validacion de direccion y tarjeta');
                                    console.log(this.iddireccion, this.cardTid);
                                    // infopago 1 efectivo 2 tarjeta 3 sinpe
                                    if (this.infopago == 1 || this.infopago == 3) {
                                      if (this.iddireccion == undefined) {
                                        this.general.mostrar_error('Es necesario una direccion para continuar', 0);
                                        this.loadingG.dismiss();
                                      } else {
                                        this.idenvio = this.iddireccion;
                                        this.validarInfoPago(result.email)
                                      }
                                    } else if (this.infopago == 2) {
                                      if (this.cardTid == undefined || this.iddireccion == undefined) {
                                        this.general.mostrar_error('Es necesario una direccion y una tarjeta para continuar', 0);
                                        this.loadingG.dismiss();
                                      } else {
                                        this.idenvio = this.iddireccion;
                                        this.validarInfoPago(result.email)
                                      }
                                    }
                                  } else {
                                    this.idenvio = 0;
                                    this.validarInfoPago(result.email)
                                  }
                                  console.log('fin');
                                }, err => {
                                  console.log(err);
                                });
                              }
                            }
                          });
                        } else {
                          console.log('NO');
                          this.loadingG.dismiss();
                          this.general.mostrar_error('Lo sentimos, no podemos procesar su solicitud porque estamos fuera del horario laboral', 0);
                        }
                      }
                    });
                  }
                });
              }
            }
          }
        });
      }
    }, err => {
      console.log('error');
      console.log(err);
    });
  }

  validarInfoPago(email: any) {
    if (this.infopago == 2) {
      // TARJETA
      if (this.cardTid == undefined) {
        this.general.mostrar_error('Es necesario una tarjeta para continuar', 0);
        this.loadingG.dismiss();
      } else {
        this.total = Number(this.fpaymentAmount.replace(/\,/g, ''));
        this.chargeFT(email);
      }
    } else if (this.infopago == 3) {
      // SINPE
      this.idcard = 0;
      this.loadingG.dismiss();
      this.sendSMS();
    } else {
      // EFECTIVO
      this.idcard = 0;
      this.total = Number(String(this.fpaymentAmount).replace(/\,/g, ''));
      this.makePayment('', '', this.total);
    }
  }

  chargeFT(email: string) {
    this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
      console.log(sucft[0][0][0], sucft[0][0][1], email, 'Comercio: Los Pira', this.currency, this.paymentAmount);
      this.fts.appIncludeCharge(sucft[0][0][0], sucft[0][0][1], email, 'Comercio: Los Pira', this.currency, this.paymentAmount).subscribe((chargeIncluded: any) => {
        console.log('chargeIncluded');
        console.log(chargeIncluded);
        // apply charge
        if (chargeIncluded != null) {
          this.ftcharge = chargeIncluded.chargeTokenId;
          this.fts.appApplyCharge(sucft[0][0][0], sucft[0][0][1], email, this.ftcharge, this.ftcard).subscribe((pago: any) => {
          console.log('pago');
          console.log(pago);
          if (pago != null) {
            if (pago.apiStatus == 'Successful') {
              console.log('Pago realizado exitosamente');
              /* registrar pago en base de datos y redireccionar a la vista de la factura */
              const idpay = pago.systemTrace;
              const estado = pago.isApproved;
              console.log(idpay, estado);
              // infopago =  0 express 1 efectivo 2 tarjeta
              switch (this.tipoenvio) {
                case 'express':
                  this.idenvio = this.iddireccion;
                  this.makePayment(idpay, estado, this.total);
                  break;
                case 'recoge':
                  this.idenvio = 0;
                  if (this.infopago == 2) { // tarjeta
                    this.makePayment(idpay, estado, this.total);
                  } else {
                    this.makePayment('', '', this.total);
                  }
                  break;
                case 'servido':
                  this.idenvio = 0;
                  if (this.infopago == 2) { // tarjeta
                    this.makePayment(idpay, estado, this.total);
                  } else {
                    this.makePayment('', '', this.total);
                  }
                  break;
                default:
                  break;
              }
            } else if (pago.apiStatus == 'Declined') {
              this.fts.appDeleteCharge(sucft[0][0][0], sucft[0][0][1], email, this.ftcharge).subscribe(chargeDeleted => {
                console.log('chargeDeleted');
                console.log(chargeDeleted);
                this.loadingG.dismiss();
                this.general.mostrar_error('Tuvimos un error al procesar su pago. Intente con otro método de pago', 0);
              }, errDeleted => {
                console.log(errDeleted);
              });
            } else {
              console.log('error con el pago');
              this.errsystem.where = '0,"' + pago.apiStatus + '","' +  email + '","' + pago.message + '",' + '"payment","chargeFT",0';
              this.crudService.crud(this.errsystem).subscribe(res => {
                this.loadingG.dismiss();
                console.log(res);
              }, err => {
                this.loadingG.dismiss();
                console.log(err);
              });
              this.general.mostrar_error('Tuvimos un error al procesar su pago. Intentelo de nuevo', 0);
            }
          } else {
            this.loadingG.dismiss();
            this.general.mostrar_error('Tuvimos un error al procesar su pago. Intente con otro método de pago', 0);
          }
          }, err => {
            console.log('error pago');
            console.log(err);
          });
        } else {
        this.loadingG.dismiss();
        this.general.mostrar_error('Tuvimos un inconveniente con su pago, favor intentelo de nuevo', 0);
        }
      }, err => {
        console.log(err);
        this.loadingG.dismiss();
      });
    }, err => {
      console.log('err');
      console.log(err);
    });
  }

  makePayment(idpay: string, estado: string, total: number) {
    console.log('makePayment');
    // tslint:disable-next-line: no-unused-expression
    this.idenvio == undefined ? 0 : this.idenvio;
    console.log(this.ftcharge, this.idorden);
    this.ftcharge = this.ftcharge == undefined ? '' : this.ftcharge;
    const tipo = this.tipoenvio == 'express' ? 1 : this.tipoenvio == 'recoge' ? 2 : this.tipoenvio == 'servido' ? 3 : 0;
    console.log(tipo);
    const makepayment = { sel: '', tbl: 18, where: `1,0,${this.idorden},"${idpay}","${this.userid}",1,"${estado}",${total},${this.idenvio},${this.idcard},${this.infopago},"${this.ftcharge}",${tipo}` };
    console.log(`1,0,${this.idorden},"${idpay}","${this.userid}",1,"${estado}",${total},${this.idenvio},${this.idcard},${this.infopago},"${this.ftcharge}",${tipo}`);
    this.crudService.crud( makepayment ).subscribe(async resultpayment => {
      console.log('result payment');
      // insert error
      if (resultpayment[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + resultpayment[0].ERROR + '",' +
        '"payment","makePayment",' + makepayment.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        console.log( JSON.stringify(resultpayment) );
        console.log(resultpayment[0][0][0]);
        console.log('mostrar orden idpay');
        console.log(idpay);
        this.loadingG.dismiss();
        if (idpay == '') {
          idpay = resultpayment[0][0][0];
        }
        this.sendNotification();
        const modalP = await this.modalCtrl.create({
          component: ReceiptPage,
          componentProps: {
            idpago: idpay,
            tipo: 1
          }
        });
        await modalP.present();
        const { data } = await modalP.onWillDismiss();
        console.log(data);
        if (data.tipo == 1) {
          this.navCtrl.navigateBack('/menu');
        } else {
          this.navCtrl.navigateBack('/orderview');
        }
      }
    }, err => {
      this.loadingG.dismiss();
      console.log('err');
      console.log( err );
    });
  }

  async sendNotification() {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Confirmación de compra! 😉',
          body: 'Gracias por tu compra, pronto disfrutarás de tu pedido!',
          id: 1,
          actionTypeId: 'CHAT_MSG',
          schedule: {at: new Date(Date.now() + 1000 * 10)}
          // extra: {
          //   data: 'Pass data to your handler'
          // }
        },
        {
          title: 'Recibimos tu pedido!',
          body: 'Tu orden está lista para ser preparada! 🙂',
          id: 2,
          actionTypeId: 'CHAT_MSG',
          schedule: {at: new Date(Date.now() + 2000 * 60)}
          // extra: {
          //   data: 'Pass data to your handler'
          // }
        }
      ]
    })
  }

  changeinfopago( event: any ) {
    // infopago =  0 express 1 efectivo 2 tarjeta
    const vtype: any = event.target.id;
    console.log('type');
    console.log(vtype);
    const classlist1 = document.querySelector('.opttarjeta');
    const classlist2 = document.querySelector('.optsinpe');
    const classlist3 = document.querySelector('.optefectivo');
    if (vtype == 'efectivo') {
      this.infopago = 1;
      if (classlist1 != undefined ) { classlist1.classList.remove('active'); }
      if (classlist2 != undefined ) { classlist2.classList.remove('active'); }
      if (classlist3 != undefined ) { classlist3.classList.add('active'); }
      const tarjetas = document.getElementById('tarjetas') as HTMLInputElement;
      tarjetas.style.display = 'none';
    } else if (vtype == 'tarjeta' ) {
      this.infopago = 2;
      if (classlist1 != undefined ) { classlist1.classList.add('active'); }
      if (classlist2 != undefined ) { classlist2.classList.remove('active'); }
      if (classlist3 != undefined ) { classlist3.classList.remove('active'); }
      const tarjetas = document.getElementById('tarjetas') as HTMLInputElement;
      tarjetas.style.display = 'block';
    } else {
      this.alertSinpe();
      this.infopago = 3;
      if (classlist1 != undefined ) { classlist1.classList.remove('active'); }
      if (classlist2 != undefined ) { classlist2.classList.add('active'); }
      if (classlist3 != undefined ) { classlist3.classList.remove('active'); }
      const tarjetas = document.getElementById('tarjetas') as HTMLInputElement;
      tarjetas.style.display = 'none';

      this.permissions.checkPermission( this.permissions.PERMISSION.RECEIVE_SMS).then((result)=> {
        if (!result.hasPermission) {
          this.permissions.requestPermission( this.permissions.PERMISSION.RECEIVE_SMS);
        }
      }, (err) => {
        this.permissions.requestPermission( this.permissions.PERMISSION.RECEIVE_SMS);
      });

      // this.permissions.checkPermission( this.permissions.PERMISSION.SEND_SMS).then((result)=> {
      //   if (!result.hasPermission) {
      //     this.permissions.requestPermission( this.permissions.PERMISSION.SEND_SMS);
      //   }
      // },(err)=> {
      //   this.permissions.requestPermission( this.permissions.PERMISSION.SEND_SMS);
      // });

      // this.permissions.checkPermission( this.permissions.PERMISSION.READ_SMS).then((result)=> {
      //   if (!result.hasPermission) {
      //     this.permissions.requestPermission( this.permissions.PERMISSION.READ_SMS);
      //   }
      // },(err)=> {
      //   this.permissions.requestPermission( this.permissions.PERMISSION.READ_SMS);
      // });
    }
  }

  async alertSinpe() {
    let msj = '';
    if (this.total >= this.maxsinpe) {
      msj = 'No puede realizarse compras por medio de SINPE Movil por un monto mayor a <b>' + this.maxsinpe + '</b>';
      this.changeinfopago('tarjeta');
    } else {
      msj = 'La función de pago por medio de SINPE Movil requiere de lo siguiente:<br>' +
      '<ul>' +
        '<li>Verifique que tiene señal de línea telefónica</li>' +
        '<li>Es necesario que la aplicación pueda enviar, leer y acceder a la información de sus mensajes</li>' +
        '<li>El envío de mensajes de texto podría significar un costo relacionado al operador de servicios telefónicos</li>' +
        '<li>Al cerrar esta información, ya usted confirma que lee y acepta todas las condiciones y que se encuentra debidamente afiliado al servicio SINPE Movil de su banco de preferencia</li>' +
      '</ul>';
    }
    const alert = await this.alertController.create({
      header: 'Importante SINPE Móvil',
      message: msj,
      buttons: [{
          text: 'Entendido',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }]
    });
    await alert.present();
  }

  showDefaultDirection() {
    console.log('showDefaultDirection');
    console.log(this.userid);
    const data = { sel: '', tbl: 53, where: '"' + this.userid + '"' };
    this.crudService.crud( data ).subscribe(res => {
      console.log('default direccion');
      console.log(res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","payment","showDefaultDirection",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        if (res[0].length > 0) {
          console.log('default res');
          console.log(res);
          console.log(res[0][0][0]);
          this.iddireccion = res[0][0][0];
          document.getElementById('direccion').innerHTML = res[0][0][1];
          document.getElementById('otrassenas').innerHTML = res[0][0][2];
          // infopago =  0 express 1 efectivo 2 tarjeta 3 sinpe
          this.infopago = 2;
        } else {
          document.getElementById('direccion').innerHTML = 'No hay direcciones registradas';
        }
      }
    }, err => {
      console.log(err);
    });
  }

  showDefaultCard() {
    console.log(this.userid);
    const data = { sel: '', tbl: 52, where: '"' + this.userid + '"' };
    this.crudService.crud( data ).subscribe(res => {
      console.log('default tarjeta');
      console.log(res);
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","payment","showDefaultCard",' + data.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      } else {
        if (res[0].length > 0) {
          this.cardTid = res[0][0][1];
          this.idcard = res[0][0][5];
          console.log(this.cardTid);
          document.getElementById('infoCard').innerHTML = res[0][0][2] + ' que termina en ' + res[0][0][0];
          this.infopago = 2;
        } else {
          console.log('no hay tarjetas');
          const direcciones = document.getElementById('direcciones') as HTMLInputElement;
          const tarjetas = document.getElementById('tarjetas') as HTMLInputElement;
          const infopago = document.getElementById('infopago') as HTMLInputElement;
          direcciones.style.display = 'block';
          tarjetas.style.display = 'block';
          infopago.style.display = 'block';
          document.getElementById('infoCard').innerHTML = 'No hay tarjetas registradas';
        }
      }
    }, err => {
      console.log(err);
    });
  }

  async presentModal(vid: string) {
    const modal = await this.modalCtrl.create({
      component: ReceiptPage,
      componentProps: {
        idpago: vid
      }
    });
    return await modal.present();
  }

  goback() {
    this.navCtrl.navigateBack('/user');
  }

  async showDirections() {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      cssClass: 'modal-modal'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    if (data != undefined) {
      this.iddireccion = data.viddirection;
      const datadir = { sel: '', tbl: 17, where: this.iddireccion };
      console.log(datadir);
      this.crudService.crud( datadir ).subscribe(res => {
        console.log(res);
        // insert error
        if (res[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","payment","showDirections",' + datadir.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        } else {
          document.getElementById('direccion').innerHTML = res[0][0][1];
          document.getElementById('otrassenas').innerHTML = res[0][0][2];
          const dataTotExpress = { sel: '', tbl: 50, where: '"' + this.userid + '",' + this.iddireccion + ',' + this.impresa };
          this.crudService.crud( dataTotExpress ).subscribe(exp => {
            console.log(exp);
            this.fpaymentAmount = exp[0][0][0];
            this.paymentAmount = Number(exp[0][0][1]);
            this.subtotal = exp[0][0][3];
            this.flete = exp[0][0][4];
          }, errexp => {
            console.log(errexp);
          });
        }
      }, err => {
        console.log(err);
      });
    }
  }
  selectOptdelivery( event: any ) {
    const vtype: any = event.target.id;
    this.tipoenvio = vtype;
    console.log('tipo envio');
    console.log(this.tipoenvio);
    console.log('type');
    console.log(vtype);

    const classlist1 = document.querySelector('.opttarjeta');
    const classlist2 = document.querySelector('.optsinpe');
    const classlist3 = document.querySelector('.optefectivo');

    if (vtype == 'express') {
      document.getElementById('express').setAttribute('src', '../../../assets/icon/express_.gif');
      document.getElementById('express').setAttribute('width', '62%');
      document.querySelector('.optexpress').classList.add('active');
      document.querySelector('.optrecoge').classList.remove('active');
      document.querySelector('.optservido').classList.remove('active');
      // if ( classlist1 != undefined ) { classlist1.classList.remove('active'); }
      // if ( classlist2 != undefined ) { classlist2.classList.remove('active'); }
      // if ( classlist3 != undefined ) { classlist3.classList.add('active'); }
      this.fpaymentAmount = this.chtot;
      console.log('total');
      console.log(this.fpaymentAmount);
      console.log(Number(this.fpaymentAmount.replace(/\,/g, '')));
      this.flete = this.chfle;
      this.subtotal = this.chsub;
      const direcciones = document.getElementById('direcciones') as HTMLInputElement;
      const tarjetas = document.getElementById('tarjetas') as HTMLInputElement;
      const infopago = document.getElementById('infopago') as HTMLInputElement;
      // direcciones.style.display = 'block';
      // tarjetas.style.display = 'block';
      // infopago.style.display = 'none';
      direcciones.style.display = 'block';
      tarjetas.style.display = 'block';
      infopago.style.display = 'block';
      this.infopago = 2;
    } else if (vtype == 'servido') {
      document.getElementById('servido').setAttribute('src', '../../../assets/icon/servido_.gif');
      document.querySelector('.optservido').classList.add('active');
      document.querySelector('.optrecoge').classList.remove('active');
      document.querySelector('.optexpress').classList.remove('active');
      // 1 tarjeta 2 sinpe 3 efectivo
      if ( classlist1 != undefined ) { classlist1.classList.add('active'); }
      if ( classlist2 != undefined ) { classlist2.classList.remove('active'); }
      if ( classlist3 != undefined ) { classlist3.classList.remove('active'); }
      this.fpaymentAmount = this.chsub;
      this.flete = '0.00';
      this.subtotal = this.chsub;
      const direcciones = document.getElementById('direcciones') as HTMLInputElement;
      const tarjetas = document.getElementById('tarjetas') as HTMLInputElement;
      const infopago = document.getElementById('infopago') as HTMLInputElement;
      direcciones.style.display = 'none';
      tarjetas.style.display = 'block';
      infopago.style.display = 'block';
      this.infopago = 1;
    } else {
      document.getElementById('recoge').setAttribute('src', '../../../assets/icon/recoge_.gif');
      document.querySelector('.optrecoge').classList.add('active');
      document.querySelector('.optexpress').classList.remove('active');
      document.querySelector('.optservido').classList.remove('active');
      if ( classlist1 != undefined ) { classlist1.classList.add('active'); }
      if ( classlist2 != undefined ) { classlist2.classList.remove('active'); }
      if ( classlist3 != undefined ) { classlist3.classList.remove('active'); }
      this.fpaymentAmount = this.chsub;
      console.log('subtotal');
      console.log(String(this.subtotal).replace(/\,/g, ''));
      this.flete = '0.00';
      this.subtotal = this.chsub;
      const direcciones = document.getElementById('direcciones') as HTMLInputElement;
      const tarjetas = document.getElementById('tarjetas') as HTMLInputElement;
      const infopago = document.getElementById('infopago') as HTMLInputElement;
      direcciones.style.display = 'none';
      tarjetas.style.display = 'block';
      infopago.style.display = 'block';
      this.infopago = 2;
    }
  }

  haveDirections( vaccion: number ) {
    const express = { sel: '', tbl: 21, where: vaccion + ',"' + this.userid + '"' };
    this.crudService.crud( express ).subscribe(res => {
      console.log( 'haveDirections' );
      console.log( res );
      // insert error
      if (res[0].ERROR != undefined) {
        this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","payment","haveDirections",' + express.tbl;
        this.crudService.crud(this.errsystem).subscribe(done => {
          console.log(done);
        }, err => {
          console.log(err);
        });
      }
    }, err => {
      console.log( err );
    });
  }

  async showCards() {
    const modal = await this.modalCtrl.create({
      component: ModalcardPage,
      cssClass: 'modal-modal'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    if (data != undefined) {
      this.idcard = data.idcard;
      this.cardTid = data.cardTokenId;
      console.log('this.idcard, this.cardTid');
      console.log(this.idcard, this.cardTid);
      const datadir = { sel: '', tbl: 54, where: this.idcard };
      this.crudService.crud( datadir ).subscribe(res => {
        console.log(res);
        // insert error
        if (res[0].ERROR != undefined) {
          this.errsystem.where = '0,"Error en DB","' + this.userid + '","' + res[0].ERROR + '","payment","showCards",' + datadir.tbl;
          this.crudService.crud(this.errsystem).subscribe(done => {
            console.log(done);
          }, err => {
            console.log(err);
          });
        } else {
          document.getElementById('infoCard').innerHTML = res[0][0][2] + ' que termina en ' + res[0][0][1];
        }
      }, err => {
        console.log(err);
      });
    }
  }

}
