import { Component, OnInit, Input } from '@angular/core';
import { CrudService } from '../../services/crud.service';
import { ModalController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.page.html',
  styleUrls: ['./comments.page.scss'],
})
export class CommentsPage implements OnInit {

  @Input() vid: number;
  comment: string;
  constructor( private crudService: CrudService, private modalCtrl: ModalController, private loadingCtrl: LoadingController ) { }

  ngOnInit() {
    console.log('vid: ', this.vid);
    this.crudService.crud({ sel: '', tbl: 35, where: this.vid + ',""' }).subscribe(suc => {
      console.log('succComment', suc);
      this.comment = suc[0][0][0];
      this.loadingCtrl.dismiss();
    }, err => {
      console.log(err);
    });
  }

  saveComment() {
    console.log(this.vid, this.comment);
    this.crudService.crud({ sel: '', tbl: 35, where: this.vid + ',"' + this.comment + '"' }).subscribe(suc => {
      console.log(suc);
      this.modalCtrl.dismiss({ dismissed: true });
    }, err => {
      console.log(err);
      this.modalCtrl.dismiss({ dismissed: false });
    });
  }

}
