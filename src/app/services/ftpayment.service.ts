import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CrudService } from './crud.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FtpaymentService {

  ftpass: string = environment.passft;

  constructor( private http: HttpClient, private crud: CrudService ) { }

  /* User Profile Management Options */
  createUser(appname: string, user: any, firstname: any, lastname: any, pass: any, email: any, phone: any) {
    return this.http.post('https://emcom.oneklap.com:2321/api/createUser',
      { applicationName: appname,
        userName: user,
        userFirstName: firstname,
        userLastName: lastname,
        userPassword: this.ftpass,
        userEmail: email,
        userCallerId: phone });
  }

  logOnUser(appname: string, user: any, pass: any) {
    console.log('appname');
    return this.http.post(`https://emcom.oneklap.com:2321/api/logOnUser`,
      { applicationName: appname, userName: user, userPassword: this.ftpass });
  }

  userDeleteProfile(appname: string, user: any, pass: any, email: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/UserDeleteProfile`,
      { applicationName: appname, userName: user, userPassword: this.ftpass, userEmail: email });
  }

  userChangePassword(appname: string, user: any, pass: any, newpass: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/userChangePassword`,
      // { applicationName: appname, userName: user, userPassword: this.ftpass, userPasswordNew: this.ftpass });
      { applicationName: appname, userName: user, userPassword: pass, userPasswordNew: newpass });
  }

  /* Cards Management */
  userIncludeCard(appname: string, user: any, pass: any, name: any, cardNumber: any, expMonth: any, expYear: any, cvv: any) {
    return this.http.post('https://emcom.oneklap.com:2321/api/UserIncludeCard',
      { applicationName: appname,
        userName: user,
        userPassword: this.ftpass,
        cardDescription: name,
        primaryAccountNumber: cardNumber,
        expirationMonth: expMonth,
        expirationYear: expYear,
        verificationValue: cvv });
  }

  userUpdateCard(appname: string, user: any, pass: any, tokenId: any, cardNumber: any, expMonth: any, expYear: any, cvv: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/UserUpdateCard`,
      { applicationName: appname,
        userName: user,
        userPassword: this.ftpass,
        cardTokenId: tokenId,
        cardDescription: name,
        primaryAccountNumber: cardNumber,
        expirationMonth: expMonth,
        expirationYear: expYear,
        verificationValue: cvv });
  }

  userDeleteCard(appname: string, user: any, pass: any, tokenId: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/UserDeleteCard`,
      { applicationName: appname,
        userName: user,
        userPassword: this.ftpass,
        cardTokenId: tokenId });
  }

  userRequestDefaultCard(appname: string, user: any, pass: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/UserRequestDefaultCard`,
      { applicationName: appname, userName: user, userPassword: this.ftpass });
  }

  userRequestCards(appname: string, user: any, pass: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/UserRequestCards`,
      { applicationName: appname, userName: user, userPassword: this.ftpass });
  }

  userSetDefaultCard(appname: string, user: any, tokenId: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/UserSetDefaultCard`,
      { applicationName: appname, userName: user, cardTokenId: tokenId });
  }

  /* Payment Management By Users */
  userRequestCharges(appname: string, user: any, pass: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/UserRequestCharges`,
      { applicationName: appname, userName: user, userPassword: this.ftpass });
  }

  userViewCharge(appname: string, user: any, pass: any, tokenId: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/UserViewCharge`,
      { applicationName: appname, userName: user, userPassword: this.ftpass, chargeTokenId: tokenId });
  }

  userApplyCharge(appname: string, user: any, pass: any, chargeId: any, tokenId: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/UserApplyCharge`,
      { applicationName: appname, userName: user, userPassword: this.ftpass, chargeTokenId: chargeId, cardTokenId: tokenId });
  }

  /* Payment Management By Commerce */
  logOnApp(appname: string, apppass: string) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/LogOnApp`,
      { applicationName: appname, applicationPassword: apppass });
  }

  appIncludeCharge(appname: string, apppass: string, user: any, descr: any, curr: any, amount: any) {
    let headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'DELETE, POST, GET, OPTIONS');
    headers.append('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    return this.http.post('https://emcom.oneklap.com:2321/api/AppIncludeCharge',
      { applicationName: appname,
        applicationPassword: apppass,
        chargeDescription: descr,
        userName: user,
        transactionCurrency: curr,
        transactionAmount: amount }, { headers: headers });
  }

  appApplyCharge(appname: string, apppass: string, user: any, chargeId: any, tokenId: any) {
    let headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'DELETE, POST, GET, OPTIONS');
    headers.append('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    return this.http.post('https://emcom.oneklap.com:2321/api/AppApplyCharge',
      { applicationName: appname,
        applicationPassword: apppass,
        userName: user,
        chargeTokenId: chargeId,
        cardTokenId: tokenId }, { headers: headers });
  }

  appVerifyUserData(appname: string, apppass: string, user: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/AppVerifyUserData`,
      { applicationName: appname, applicationPassword: apppass, userName: user });
  }

  appVerifyUserDefaultCard(appname: string, apppass: string, user: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/AppVerifyUserDefaultCard`,
      { applicationName: appname, applicationPassword: apppass, userName: user });
  }

  appVerifyUserCharge(appname: string, apppass: string, user: any, chargeId: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/AppVerifyUserCharge`,
      { applicationName: appname, applicationPassword: apppass, userName: user, chargeTokeId: chargeId });
  }

  appReturnCharge(appname: string, apppass: string, user: any, chargeId: any) {
    return this.http.post('https://emcom.oneklap.com:2321/api/AppReturnCharge',
      { applicationName: appname,
        applicationPassword: apppass,
        userName: user,
        chargeTokenId: chargeId });
  }

  appDeleteCharge(appname: string, apppass: string, user: any, chargeId: any) {
    let headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'DELETE, POST, GET, OPTIONS');
    headers.append('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    return this.http.post(`https://emcom.oneklap.com:2321/api/AppDeleteCharge`,
      { applicationName: appname, applicationPassword: apppass, userName: user, chargeTokenId: chargeId }, { headers: headers });
  }

  appGetChargesByUser(appname: string, apppass: string, user: any) {
    return this.http.post('https://emcom.oneklap.com:2321/api/AppGetChargesByUser',
      { applicationName: appname,
        applicationPassword: apppass,
        userName: user });
  }

  appTrack2Authorization(appname: string, t2d: any, cvv: any, chip: any, amount: any, traceNumber: any, curr: any, plan: any) {
    return this.http.post(``,
      { applicationName: appname,
        track2Data: t2d,
        last4Digits: cvv,
        chipCardData: chip,
        transactionAmount: amount,
        systemTraceNumber: traceNumber,
        transactionCurrency: curr,
        quotePlan: plan });
  }

  appApplyDirectCharge(appname: string, apppass: string, descr: any, curr: any, amount: any, cardNumber: any,
                       expMonth: any, expYear: any, cvv: any) {
    return this.http.post(`https://emcom.oneklap.com:2321/api/AppApplyDirectCharge`,
      { applicationName: appname,
        applicationPassword: apppass,
        chargeDescription: descr,
        transactionCurrency: curr,
        transactionAmount: amount,
        primaryAccountNumber: cardNumber,
        expirationMonth: expMonth,
        expirationYear: expYear,
        verificationValue: cvv });
  }

}
