import { Component, OnInit } from '@angular/core';
import { Platform, NavController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import * as shuffleArray from 'shuffle-array';
import { environment } from '../environments/environment';
import { CrudService } from './services/crud.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Plugins, LocalNotificationEnabledResult, LocalNotificationActionPerformed, LocalNotification, Device } from '@capacitor/core';
// import { FcmService } from './services/fcm.service';
const { SplashScreen /*,PushNotifications*/, LocalNotifications } = Plugins;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
// tslint:disable: max-line-length
// tslint:disable: triple-equals
export class AppComponent implements OnInit {
  user: boolean;
  email: string;
  name: string;
  uid: string;
  ntable: number;
  impresa = environment.impresa;
  // listMessages = [
  //   'Te extrañamos! Regresa pronto!',
  //   'Vuelve a utilizar esta asombrosa app!',
  //   'No busques más! Pedí acá lo que quieres!',
  //   'No cocines más! Aquí encontrarás lo que quieres!' ];

  constructor( private platform: Platform,
               private statusBar: StatusBar,
               public afAuth: AngularFireAuth,
               private crudService: CrudService,
               private navCtrl: NavController ) {
              //  private fcmService: FcmService) {
                 this.initializeApp();
               }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      SplashScreen.hide();
      // this.fcmService.initPush();
      // shuffleArray(this.listMessages).forEach((message: any, index: any) => {
      //   LocalNotifications.schedule({
      //     notifications: [
      //       {
      //         id: index,
      //         body: message,
      //         trigger: {
      //           in: 3, /*Envía notificaciones cada 3 días*/
      //           unit: ELocalNotificationTriggerUnit.DAY
      //         }
      //       }
      //     ]
      //   });
      // });
    });
  }

  // resetBadgeCount() {
  //   PushNotifications.removeAllDeliveredNotifications();
  // }

  updateOrders() {
    if (this.afAuth.auth.currentUser != null) {
      this.uid = this.afAuth.auth.currentUser.uid;
      const providerId = this.afAuth.auth.currentUser.providerData[0].providerId;
      const provider = document.getElementById('facebookProvider');
      console.log('providerId: ', providerId, ' provider: ', provider);
      if (provider != null) {
        switch (providerId) {
          case 'facebook.com':
            provider.classList.remove('ion-hide');
            break;
          default:
            provider.classList.add('ion-hide');
            break;
        }
      }
      const data = { sel: '', tbl: 41, where: '"' + this.uid + '",' + this.impresa };
      this.crudService.crud( data ).subscribe(res => {
        console.log('res count');
        console.log(JSON.stringify(res));
        console.log(res);
        const badge = document.getElementById('badgepedidos');
        badge.innerHTML = res[0][0][0];
      }, err => {
        console.log(err);
      });
    } else {
      document.getElementById('badgepedidos').innerHTML = '0';
    }
  }

  updateUser() {
    const auth = this.afAuth.auth.currentUser;
    console.log('auth: ', auth);
    if (auth != null) {
      if (auth.displayName != null) {
        this.name = auth.displayName.substr(0, auth.displayName.indexOf(' '));
      } else {
        this.name = '';
      }
      this.email = auth.email;
      console.log('uid', auth.uid);
      document.getElementById('cuenta').innerHTML = `<span style="font-size: 1.4em;">Hola, ${this.name}</span><br><label style="font-size: 0.9em;">${this.email}</label><br><ion-chip style="background: #3b5998;" class="ion-hide" id="providerId"><ion-label style="color: #fff;">Facebook</ion-label></ion-chip>`;
    } else {
      document.getElementById('cuenta').innerHTML = '<ion-label>Inicie sesión para acceder a las funciones de la aplicación</ion-label><br><br><a style="padding: 5% 25%;border-radius: 0.5em;color: white;text-decoration: none;" class="btnapp gradient-order ion-text-capitalize" color="app" expand="block" href="/signin">Iniciar sesión</a>';
    }
  }

  async ngOnInit() { 
    await LocalNotifications.requestPermissions();
  }
}
