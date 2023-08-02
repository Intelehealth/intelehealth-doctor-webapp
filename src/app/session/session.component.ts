import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

  slides: any = [
    {
      img_url: "assets/svgs/slide-1.svg",
      title: "Deliver quality health care where there is no doctor",
      description: "",
      heartbeat1: "assets/images/login/right_red_heartbeat.png",
      heartbeat2: "assets/images/login/right_green_heartbeat.png"
    },
    {
      img_url: "assets/svgs/slide-2.svg",
      title: "2,75,000 population covered from 215 villages in 2 countries",
      description: "",
      heartbeat1: "assets/images/login/right_green_heartbeat.png",
      heartbeat2: "assets/images/login/right_red_heartbeat.png"
    },
    {
      img_url: "assets/svgs/slide-3.svg",
      title: "Take online consultations and send prescriptions to the patients virtually",
      description: "",
      heartbeat1: "assets/images/login/right_red_heartbeat.png",
      heartbeat2: "assets/images/login/right_green_heartbeat.png"
    }
  ];

  selectedLanguage: any = 1;
  languages: any = [
    {
      id: 1,
      name: 'English'
    },
    {
      id: 2,
      name: 'Hindi'
    }
  ];
  constructor(
    private socketSvc: SocketService
  ) { }

  ngOnInit(): void {
    this.socketSvc.close();
  }

}
