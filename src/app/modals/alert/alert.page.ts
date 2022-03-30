import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.page.html',
  styleUrls: ['./alert.page.scss'],
})
export class AlertPage implements OnInit {
  @Input() error: string;
  constructor( public modalCtrl: ModalController ) { }

  ngOnInit() {
    document.getElementById('error').innerHTML = this.error;
    console.log(this.error);
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true
    });
  }

}
