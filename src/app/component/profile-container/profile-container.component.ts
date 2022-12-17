import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';
declare var getFromStorage: any;
@Component({
  selector: 'app-profile-container',
  templateUrl: './profile-container.component.html',
  styleUrls: ['./profile-container.component.scss']
})
export class ProfileContainerComponent implements OnInit {
  userName: string;
  providerInfo;
  personImageURL = "assets/images/profile/Frame 2609036.png";
  constructor(private profileService: ProfileService) { }

  ngOnInit(): void {
    this.userName = getFromStorage("doctorName");
    this.providerInfo = getFromStorage("provider");
    this.profileService.getProfileImage(this.providerInfo.person.uuid).subscribe((response) => {
      this.personImageURL = `${this.profileService.baseURL}/personimage/${this.providerInfo.person.uuid}`;
    }, (err) => {
      this.personImageURL = this.personImageURL;
    });
  }

  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      reader.onload = (event) => { // called once readAsDataURL is completed
        let url: any = event.target.result;
        let imageBolb = url.split(',');
        let json = {
          person: this.providerInfo.person.uuid,
          base64EncodedImage: imageBolb[1]
        }
        this.profileService.updateProfileImage(json).subscribe((response) => {
          window.location.reload();
        });
      }
    }
  }
}
