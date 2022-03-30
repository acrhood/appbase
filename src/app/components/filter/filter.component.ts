import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {

  constructor( private popoverCtrl: PopoverController) { }

  ngOnInit() {}

  onClick( valor: number ) {
    console.log('Opc:', valor);
    this.popoverCtrl.dismiss({
      item: valor
    });
  }

}
