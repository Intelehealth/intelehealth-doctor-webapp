import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImagesService } from 'src/app/services/images.service';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.css']
})
export class ProfileImageComponent implements OnInit {
image: string;
profileImagePresent = false;
  constructor(private route: ActivatedRoute,
    private service: ImagesService) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('id');
    this.service.fetchProfileImage(uuid)
    .subscribe(response => {
      if (response.results.length !== 0) {
        this.profileImagePresent = true;
        this.image = response.results[0].Image.url;
       }
    });

  }

}
