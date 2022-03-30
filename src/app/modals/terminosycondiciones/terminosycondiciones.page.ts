import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-terminosycondiciones',
  templateUrl: './terminosycondiciones.page.html',
  styleUrls: ['./terminosycondiciones.page.scss'],
})
export class TerminosycondicionesPage implements OnInit {
  // tslint:disable: triple-equals
  constructor() { }

  ngOnInit() { }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
    const value = ev.target.value;
    console.log('Value', value);
    if (value == 'tyc') {
      document.getElementById('tyc').classList.remove('ion-hide');
      document.getElementById('pp').classList.add('ion-hide');
    } else if (value == 'pp') {
      document.getElementById('tyc').classList.add('ion-hide');
      document.getElementById('pp').classList.remove('ion-hide');
    }
  }

}
