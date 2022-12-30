import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { OtpService } from "src/app/services/otp.service";
import { MindmapService } from "src/app/services/mindmap.service";
import { SessionService } from "src/app/services/session.service";
import { AuthService } from "src/app/services/auth.service";
declare var saveToStorage: any;

@Component({
  selector: "app-otp-verification",
  templateUrl: "./otp-verification.component.html",
  styleUrls: ["./otp-verification.component.scss"],
})
export class OtpVerificationComponent implements OnInit {
  @Output() onSucess = new EventEmitter<boolean>();
  @Output() onSucessIntele = new EventEmitter<boolean>();
  time = new Date().getTime()+180000;
  mins: number;
  secs:number;
  otp: string;
  verify: any;
  password:any; 
  username:any;
 
  constructor(
    private otpservice: OtpService, 
    private router: Router,
    private mindmap:MindmapService,
    private sessionService: SessionService,
    private authService: AuthService,
  ) {}
  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: "",
    inputStyles: {
      width: "45px",
      height: "45px",
    },
  };
  ngOnInit(): void {
    // this.verify = JSON.parse(localStorage.getItem("verificationId"));
    // this.mindmap.getMindmapOTP().subscribe((res)=>{
    //   console.log(res,"response");
    // });
  }

  onOtpChange(otpCode: any) {
    this.otp = otpCode;
  }

  handleClick(){
    let data = localStorage.getItem('session');
    
    if(!Number(data)){
      this.mindmap.postMindmapOTP({"userName":data}).subscribe((res)=>{
        localStorage.setItem('userData',JSON.stringify(res.data));   
        this.router.navigateByUrl("/login/set-new-password");               
      });
    }else{
      this.mindmap.postMindmapOTP({"phoneNumber":data}).subscribe((res)=>{
        console.log(res,"Forgot username");
        if(res.data.username === "doctor"){
          this.username = "doctor";
          this.password = "Doctor@123"
        }else if(res.data.username === "doctor1"){
          this.username = "doctor1"
          this.password = "Doctor123"
        }else{
          this.username = "admin"
          this.password = "Admin123"
        }
        const string = `${this.username}:${this.password}`;
        const base64 = btoa(string);
        saveToStorage("session", base64);
        this.sessionService.loginSession(base64).subscribe((response) => {
          if (response.authenticated === true) {
            this.onSucessIntele.emit(true);
            this.sessionService.provider(response.user.uuid).subscribe(
              (provider) => {
                saveToStorage("provider", provider.results[0]);
                this.authService.sendToken(response.user.sessionId);
                saveToStorage("user", response.user);
                this.router.navigate(["/dashboard/profile"]);
              });
            }
        });
      });
    }
  }

  // handleClick() {
  //   var credential = firebase.auth.PhoneAuthProvider.credential(
  //     this.verify,
  //     this.otp
  //   );

  //   firebase
  //     .auth()
  //     .signInWithCredential(credential)
  //     .then((response) => {
  //       console.log(response);
  //       localStorage.setItem("user_data", JSON.stringify(response));
  //       // this.router.navigate(["/dashboard"]);
  //       this.router.navigateByUrl("/login/set-new-password");
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       alert(error.message);
  //     });
  // }

  resendOTP() {
    var data = localStorage.getItem("mobilenumber");
    this.otpservice.getOTP("sign-in-button", data).subscribe(() => {
      alert("OTP resend sucessfully");
    });
  }

  x = setInterval(()=>{
    var today = new Date().getTime();
    var differ = this.time - today;
    this.mins = Math.floor((differ % (1000 * 60 * 60)) / (1000 * 60));
    this.secs = Math.floor((differ % (1000 * 60)) / (1000));  
    if(differ < 0){
      clearInterval(this.x)
    }
  },1000)

}
