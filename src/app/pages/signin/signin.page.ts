import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavController, ToastController, Platform, ModalController } from '@ionic/angular';
import { CrudService } from '../../services/crud.service';
import * as firebase from 'firebase';
import { GeneralComponent } from '../../components/general/general.component';
import { environment } from '../../../environments/environment';
import { FtpaymentService } from '../../services/ftpayment.service';
import { StorageService } from '../../services/storage.service';
import { AngularFireAuth } from '@angular/fire/auth';
// import { GooglePlus } from '@ionic-native/google-plus/ngx';
const tipon = environment.tiponegocio;
const madreSucursal = environment.madreSucursal;
import { Plugins } from '@capacitor/core';
const { Device, SignInWithApple } = Plugins;

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
  // tslint:disable: triple-equals
  email: string;
  pass: string;
  data = {};
  datasesion = {};
  msg: string;
  impresa: number = madreSucursal;
  errsystem = { sel: '', tbl: 80, where: '' };
  user = null;
  showAppleSignIn = false;
  isActiveToggleTextPassword: Boolean = true;
  @ViewChild('logSectionBtn1', { read: ElementRef, static: false }) private logsectionbtn1: ElementRef;
  @ViewChild('logSectionBtn2', { read: ElementRef, static: false }) private logsectionbtn2: ElementRef;
  @ViewChild('logSectionBtn3', { read: ElementRef, static: false }) private logsectionbtn3: ElementRef;
  @ViewChild('dataLog', { read: ElementRef, static: false }) private datalog: ElementRef;
  @ViewChild('btnLoginMail', { read: ElementRef, static: false }) public btnloginmail: ElementRef;
  @ViewChild('smSocialMediaBtns', { read: ElementRef, static: false }) private smsocialmediabtns: ElementRef;
  @ViewChild('logMsj', { read: ElementRef, static: false }) private logmsj: ElementRef;

  constructor( private authService: AuthService,
               private afAuth: AngularFireAuth,
               private navCtrl: NavController,
               public platform: Platform,
               private crudService: CrudService,
               public modalCtrl: ModalController,
               private general: GeneralComponent,
               private fts: FtpaymentService,
               private storage: StorageService,
              //  private googlePlus: GooglePlus
               ) { }

  async ngOnInit() {
    const device = await Device.getInfo();
    this.showAppleSignIn = device.platform === 'ios';
  }

  noSession() {
    this.navCtrl.navigateBack('/sucursales');
  }

  toggleTextPassword(){
    this.isActiveToggleTextPassword = (this.isActiveToggleTextPassword==true)?false:true;
  }

  getType() {
      return this.isActiveToggleTextPassword ? 'password' : 'text';
  }

  resetPass( mail: string ) {
    firebase.auth().sendPasswordResetEmail(mail);
  }

  async loginWithEmail() {
    console.log('Login Email');
    // quitar espacios en blanco
    this.authService.signInWithEmail( this.email.replace(/\s+/g, ''), this.pass )
    .then(res => {
      console.log(res);
      // Verificacion correo
      // if ( res.user.emailVerified ) {
      console.log('signin success');
      console.log(res.user.uid);
      const data = { sel: 'idtipo', tbl: 5, where: 'uid = "' + res.user.uid + '"' };
      this.crudService.crud( data ).subscribe(
        tipo => {
          console.log(tipo);
          // insert error
          if (tipo[0].ERROR != undefined) {
            this.errsystem.where = '0,"Error en DB","' + this.email + '","' + tipo[0].ERROR + '","signin","loginWithEmail",' + data.tbl;
            this.crudService.crud(this.errsystem).subscribe(done => {
              console.log(done);
            }, err => {
              console.log(err);
            });
          } else {
            // store password on cache
            this.storage.setItem('passCache', this.pass).then(suc => {
              console.log('suc', suc);
            }, rej => {
              console.log('rej', rej);
            }).catch(errCatch => {
              console.log('errCatch', errCatch);
            });
            if ( res != null ) {
              if (tipo[0][0][0] == 2 || tipo[0][0][0] == 1) {
                // revisar esto porque si hay mas sucursales va a dar error
                const datasuc = { sel: 'idtiponegocio', tbl: 39, where: 'idtiponegocio = ' + tipon };
                this.crudService.crud( datasuc ).subscribe(
                  async succ => {
                    console.log('succ tiposuc');
                    console.log(succ);
                    this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
                      // insert error
                      if (sucft[0].ERROR != undefined) {
                        this.errsystem.where = '0,"Error en DB","' + this.email + '","' + sucft[0].ERROR + '","signin","loginWithEmail",96';
                        this.crudService.crud(this.errsystem).subscribe(done => {
                          console.log(done);
                        }, err => {
                          console.log(err);
                        });
                      } else {
                        this.fts.logOnUser(sucft[0][0][0], this.email, '').subscribe((logging: any) => {
                          console.log('logging');
                          console.log(logging);
                        }, (errlog: any) => {
                          console.log(errlog);
                        });
                      }
                    }, err => {
                      console.log('err');
                      console.log(err);
                    });
                    // if ((await this.storage.getItem('impresa')).value == null) {
                    //   this.navCtrl.navigateBack('/sucursales');
                    // } else {
                    if (succ[0][0][0] == 1) {
                      this.navCtrl.navigateBack('/sessionstatus');
                    } else if (succ[0][0][0] == 3) {
                      this.navCtrl.navigateBack('/restaurant');
                    }
                    // }
                  }, err => {
                    console.log('error');
                    console.log(err);
                  }
                );
              } else {
                this.general.mostrar_error('Este usuario no existe en la aplicación', 0);
              }
            } else {
              this.navCtrl.navigateBack('/signin');
            }
          }
        }, err => {
          console.log(err);
        }
      );
      // this.navCtrl.navigateBack('/tabs/menu');
      // } else {
      //   this.general.mostrar_error('Debe de verificar el correo', 0);
      // }
    })
    .catch(async error => {
      console.log( JSON.stringify( error ) );
      if ( error.code == 'auth/wrong-password' ) {
        this.general.mostrar_error('Contraseña incorrecta', 0);
      } else if ( error.code == 'auth/invalid-email' ) {
        this.general.mostrar_error('Correo Inválido', 0);
      } else if ( error.code == 'auth/user-not-found' ) {
        this.general.mostrar_error('Datos ingresados inválidos. Favor verificar que la información ingresada es correcta', 0);
      } else if ( error.code == 'auth/too-many-requests' ) {
        this.general.mostrar_error('Muchos intentos fallidos de ingreso. Favor intenta de nuevo mas tarde', 0);
      } else {
        console.log('otro error');
        this.errsystem.where = '0,"' + error.code + '","' + this.email + '","' + error.message + '","signin","loginWithEmail",0';
        this.crudService.crud(this.errsystem).subscribe(res => {
          console.log(res);
        }, err => {
          console.log(err);
        });
      }
    });
  }

  loginWithGoogle() {
    console.log('Login Google');
    if (this.platform.is('hybrid')) {
      console.log('Loggin appGoogle');
      // this.googlePlus.login({})
      // .then((res: any) => {
      //   console.log(res);
      // })
      // .catch((err: any) => console.error(err));
    } else {
      this.authService.signInWithGoogle().then(res => {
        console.log('logueando');
        console.log(res);
        console.log(JSON.stringify(res));
        this.crudService.crud({ sel: '', tbl: 8, where: '"' + res.user.uid + '"' }).subscribe((session: any) => {
          console.log('suc session');
          console.log(session);
          // insert error
          if (session[0].ERROR != undefined) {
            this.errsystem.where = '0,"Error en DB","' + this.email + '","' + session[0].ERROR + '","signin","loginWithGoogle",8';
            this.crudService.crud(this.errsystem).subscribe(done => {
              console.log(done);
            }, err => {
              console.log(err);
            });
          } else {
            if (session[0].length == 0) {
              this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
                // insert error
                if (sucft[0].ERROR != undefined) {
                  this.errsystem.where = '0,"Error en DB","' + this.email + '","' + sucft[0].ERROR + '","signin","loginWithGoogle",96';
                  this.crudService.crud(this.errsystem).subscribe(done => {
                    console.log(done);
                  }, err => {
                    console.log(err);
                  });
                } else {
                  this.fts.createUser(sucft[0][0][0], res.user.email, res.user.email, res.user.email, '',
                  res.user.email, '88888888')
                  .subscribe(ftsuser => {
                    // insert error
                    // if (ftsuser[0].ERROR != undefined) {
                    //   this.errsystem.where = '0,"Error en DB","' + this.email + '","' + ftsuser[0].ERROR + '"';
                    //   this.crudService.crud(this.errsystem).subscribe(suc => {
                    //     console.log(suc);
                    //   }, err => {
                    //     console.log(err);
                    //   });
                    // }
                    console.log('ftuser');
                    console.log(ftsuser);
                    const data = { sel: '', tbl: 6, where: '1,0,"' + res.user.displayName + '","' + res.user.email +
                    '","LoginGoogle2020",' + this.impresa + ',"","' + res.user.uid + '",0,2,0' };
                    this.crudService.crud( data ).subscribe(suc => {
                      // insert error
                      if (suc[0].ERROR != undefined) {
                        this.errsystem.where = '0,"Error en DB","' + this.email + '","' + suc[0].ERROR + '",' +
                        '"signin","loginWithGoogle",' + data.tbl;
                        this.crudService.crud(this.errsystem).subscribe(done => {
                          console.log(done);
                        }, err => {
                          console.log(err);
                        });
                      } else {
                        console.log('suc google');
                        console.log(suc);
                        this.navCtrl.navigateBack('/sessionstatus');
                        this.storage.setItem('passCache', 'LoginGoogle2020').then(store => {
                          console.log('store');
                          console.log(store);
                        }, errStore => {
                          console.log('errStore');
                          console.log(errStore);
                        });
                      }
                    }, err => {
                      console.log('err google');
                      console.log(err);
                    });
                  }, erruser => {
                    console.log('erruser');
                    console.log(erruser);
                  });
                }
              }, err => {
                console.log('err');
                console.log(err);
              });
            } else {
              this.navCtrl.navigateBack('/menu');
            }
          }
        }, errSession => {
          console.log('err session');
          console.log(errSession);
        });
        this.msg = String(res);
        this.navCtrl.navigateBack('/');
      })
      .catch(error => {
        console.log(error);
        this.msg = String(error);
      });
    }
  }

  loginWithFacebook() {
    console.log('Login Facebook');
    if ( this.platform.is('hybrid') ) {
      console.log('Login Facebook App');
      this.authService.signInWithFacebookApp().then(res => {
        console.log('res facebook app');
        console.log( JSON.stringify(res) );
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        firebase.auth().signInWithCredential(facebookCredential).then( succ => {
          console.log('facebook success');
          console.log( succ );
          console.log(succ.user.uid);
          this.crudService.crud({ sel: '', tbl: 8, where: '"' + succ.user.uid + '"' }).subscribe((session: any) => {
            console.log('existe usuario?');
            console.log(session);
            // insert error
            if (session[0].ERROR != undefined) {
              console.log('error');
              this.errsystem.where = '0,"Error en DB","' + this.email + '","' + session[0].ERROR + '","signin","loginWithFacebook",8';
              this.crudService.crud(this.errsystem).subscribe(done => {
                console.log(done);
              }, err => {
                console.log(err);
              });
            } else {
              console.log('no error');
              if (session[0].length == 0) {
                console.log('no esta el usuario');
                console.log('impresa: ', this.impresa);
                this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
                  console.log('creando usuario en ft');
                  console.log(sucft);
                  this.fts.createUser(sucft[0][0][0], succ.user.email, succ.user.email, succ.user.email, 'LoginFacebook2020',
                  succ.user.email, '88888888')
                  .subscribe(() => {
                    console.log('gurdando usuario');
                    const data = { sel: '', tbl: 6, where: '1,0, "' + succ.user.displayName + '","' + succ.user.email +
                    '","LoginFacebook2020",' + this.impresa + ',"","' + succ.user.uid + '",0,2,0' };
                    console.log('data: ', '1,0, "' + succ.user.displayName + '","' + succ.user.email +
                    '","LoginFacebook2020",' + this.impresa + ',"","' + succ.user.uid + '",0,2,0');
                    this.crudService.crud( data ).subscribe(result => {
                      console.log('mantusuarios');
                      console.log(result);
                      this.afAuth.auth.currentUser.sendEmailVerification();
                      this.navCtrl.navigateBack('/sessionstatus');
                    }, err => {
                      console.log( err );
                    });
                  });
                }, err => {
                  console.log('err');
                  console.log(err);
                });
              } else {
                this.navCtrl.navigateBack('/sessionstatus');
              }
            }
          });
        }).catch( error => {
          console.log('facebook error');
          console.log( JSON.stringify(error) );
        });
      }).catch( err => {
        console.log('err facebook app');
        console.log( JSON.stringify(err) );
      });
    } else {
      console.log('Login Facebook Web');
      this.authService.signInWithFacebookWeb().then( (res) => {
        console.log('res facebook web');
        console.log(res);
        this.crudService.crud({ sel: '', tbl: 8, where: '"' + res.user.uid + '"' }).subscribe((session: any) => {
          if (session[0].length == 0) {
            this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
              this.fts.createUser(sucft[0][0][0], res.user.email, res.user.email, res.user.email, 'LoginFacebook2020',
              res.user.email, '88888888')
              .subscribe(suc => {
                console.log('suc fts user');
                console.log(suc);
                const data = { sel: '', tbl: 6, where: '1,0,"' + res.user.displayName + '","' + res.user.email +
                  '","LoginFacebook2020",' + this.impresa + ',"","' + res.user.uid + '",0,2,0' };
                this.crudService.crud( data ).subscribe(sucCrud => {
                  console.log('suc facebook');
                  console.log(sucCrud);
                  this.storage.setItem('passCache', 'LoginFacebook2020').then(store => {
                    console.log('store');
                    console.log(store);
                  }, errStore => {
                    console.log('errStore');
                    console.log(errStore);
                  });
                  this.navCtrl.navigateBack('/sucursales');
                }, err => {
                  console.log('err google');
                  console.log(err);
                });
              }, errFacebook => {
                console.log('errFacebook');
                console.log(errFacebook);
              });
            }, err => {
              console.log('err');
              console.log(err);
            });
          } else {
            this.navCtrl.navigateBack('/sucursales');
          }
        }, errSession => {
          console.log('err session');
          console.log(errSession);
        });
      })
      .catch((error: any) => {
        console.log('error facebook web');
        console.log(error);
        if (error.code == 'auth/account-exists-with-different-credential') {
          this.general.mostrar_error('Esta cuenta ya ha sido registrada', 0);
        }
      });
    }
  }

  loginWithApple() {
    SignInWithApple.Authorize().then(async (res: any) => {
      console.log('inicio sesion apple');
      console.log(res);
      console.log('response');
      console.log(res.response);
      console.log('identityToken');
      console.log(res.response.identityToken);
      console.log('fin sesion apple');
      if (res.response && res.response.identityToken) {
        this.authService.signInWithApple(res.response).then(suc => {
          console.log('suc signin with apple');
          console.log(suc);
          console.log('uid');
          console.log(suc.user);
          this.crudService.crud({ sel: '', tbl: 8, where: '"' + suc.user.uid + '"' }).subscribe((session: any) => {
            if (session[0].length == 0) {
              this.crudService.crud({ sel: '', tbl: 96, where: this.impresa }).subscribe(sucft => {
                this.fts.createUser(sucft[0][0][0], suc.user.email, suc.user.email, suc.user.email, 'LoginApple2020',
                suc.user.email, '88888888')
                .subscribe(user => {
                  console.log('suc fts user');
                  console.log(user);
                  const data = { sel: '', tbl: 6, where: '1,0,"' + suc.user.displayName == null ? '' : suc.user.displayName + '","'
                  + suc.user.email + '","LoginApple2020",' + this.impresa + ',"","' + suc.user.uid + '",0,2,0,0' };
                  this.crudService.crud( data ).subscribe(sucCrud => {
                    console.log('suc apple');
                    console.log(sucCrud);
                    this.storage.setItem('passCache', 'LoginApple2020').then(store => {
                      console.log('store');
                      console.log(store);
                      this.navCtrl.navigateBack('/sessionstatus');
                    }, errStore => {
                      console.log('errStore');
                      console.log(errStore);
                    });
                  }, errCrud => {
                    console.log('errCrud');
                    console.log(errCrud);
                  });
                }, errUserFT => {
                  console.log('errUserFT');
                  console.log(errUserFT);
                });
              }, err => {
                console.log('err');
                console.log(err);
              });
            } else {
              this.navCtrl.navigateBack('/sessionstatus');
            }
          }, errSession => {
            console.log('err session');
            console.log(errSession);
          });
        }).catch((error: any) => {
          console.log('error sign in apple');
          console.log(error);
        });
      } else {
        console.log(res);
      }
    })
    .catch((response: any) => {
      console.log('inicio error apple');
      console.log(response);
      console.log('fin error apple');
    });
  }

  emailLogin() {
    // this.logsectionbtn1.nativeElement.classList.add('ion-hide');
    // this.logsectionbtn2.nativeElement.classList.add('ion-hide');
    // this.logsectionbtn3.nativeElement.classList.add('ion-hide');
    // this.datalog.nativeElement.classList.remove('ion-hide');
    // this.smsocialmediabtns.nativeElement.classList.remove('ion-hide');
    // this.logmsj.nativeElement.classList.add('ion-hide');
    this.email = '';
    this.pass = '';
  }

  showMediaBtns() {
    // this.logsectionbtn1.nativeElement.classList.remove('ion-hide');
    // this.logsectionbtn2.nativeElement.classList.remove('ion-hide');
    // this.logsectionbtn3.nativeElement.classList.remove('ion-hide');
    // this.datalog.nativeElement.classList.add('ion-hide');
    // this.smsocialmediabtns.nativeElement.classList.add('ion-hide');
    // this.logmsj.nativeElement.classList.remove('ion-hide');
  }

  onEnter() {
    this.loginWithEmail();
  }

}
