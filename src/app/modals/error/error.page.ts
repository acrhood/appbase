import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-error',
  templateUrl: './error.page.html',
  styleUrls: ['./error.page.scss'],
})
export class ErrorPage implements OnInit {
  @Input() error: string;
  @Input() goterror: number;
  constructor( public modalCtrl: ModalController ) { }

  ngOnInit() {
    document.getElementById('error').innerHTML = this.error;
    console.log(this.error);
  }

  dismiss() {
    this.modalCtrl.dismiss({
      dismissed: true,
      type: this.goterror
    });
  }

}
