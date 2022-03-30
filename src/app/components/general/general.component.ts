import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { AlertPage } from '../../modals/alert/alert.page';
import { ErrorPage } from '../../modals/error/error.page';
import { ModalPage } from '../../modals/modal/modal.page';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit {
  // tslint:disable: triple-equals

  constructor( private modalCtrl: ModalController, private navCtrl: NavController ) { }

  ngOnInit() {}

  async mostrar_error(error: string, goterror: number) {
    console.log(goterror);
    if (goterror == undefined) {
      goterror = 0;
    }
    const modal = await this.modalCtrl.create({
      component: ErrorPage,
      componentProps: {
        error,
        goterror
      },
      cssClass: 'error-modal'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log(data);
    if (data != undefined) {
      switch (data.type) {
        case 1:
          this.navCtrl.navigateBack('/infouser');
          break;
      }
    }
  }

  // async verify_user(getuser: string) {
  //   const modal = await this.modalCtrl.create({
  //     component: VerifypassPage,
  //     componentProps: {
  //       getuser
  //     },
  //     cssClass: 'primary-modal'
  //   });
  //   return await modal.present();
  // }

  async mostrar_alert(error: string) {
    const modal = await this.modalCtrl.create({
      component: AlertPage,
      componentProps: {
        error
      },
      cssClass: 'alert-modal'
    });
    return await modal.present();
  }

  async show_Directions() {
    const modal = await this.modalCtrl.create({
      component: ModalPage,
      cssClass: 'modal-modal'
    });
    return await modal.present();
  }

}
