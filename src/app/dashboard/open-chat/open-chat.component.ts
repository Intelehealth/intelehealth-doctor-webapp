import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-open-chat',
  templateUrl: './open-chat.component.html',
  styleUrls: ['./open-chat.component.scss']
})
export class OpenChatComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute){
    
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.router.navigateByUrl("/dashboard/visit-summary/"+id,{ state: { openChat : "true" }});
  }
}
