import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileImageService } from './../../../../services/profile-image.service';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.css']
})
export class ProfileImageComponent implements OnInit {
image: string;
  constructor(private route: ActivatedRoute,
    private service: ProfileImageService) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('id');
    this.service.fetchProfileImage(uuid)
    .subscribe(response => {
    this.image = response.results[0].Image.url;
    });

  }

}
