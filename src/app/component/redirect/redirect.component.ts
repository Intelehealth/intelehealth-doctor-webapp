import { Component, Inject, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LinkService } from "src/app/services/link.service";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: "app-redirect",
  templateUrl: "./redirect.component.html",
  styleUrls: ["./redirect.component.css"],
})
export class RedirectComponent implements OnInit {
  hash = "";
  message = "please wait!";
  STATIC_HASH = {
    wc: {
      type: 'pdf',
      link: 'https://msf-arogyabharat.intelehealth.org/assets/Diet_Plan_Hindi.pdf'
    }
  }
  selectedLink = null;
  loading = true;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    private linkService: LinkService
  ) { }

  ngOnInit(): void {
    this.hash = this.route.snapshot.paramMap.get("hash");
    if (this.STATIC_HASH[this.hash]) {
      this.selectedLink = this.STATIC_HASH[this.hash];
      this.loading = false;
    } else {
      this.getLink();
    }
  }

  getLink() {
    this.linkService
      .getLink(this.hash)
      .subscribe({
        next: (response: { success; data; message }) => {
          if (response.success) {
            const link = response.data.link;
            this.redirect(link);
          } else {
            const message = response.message || "Sorry, something went wrong.";
            this.message = message;
            alert(message);
          }
        },
        error: (err: any) => {
          const message = "Invalid link!";
          alert(message);
          this.message = 'No data!'
        }
      });
  }

  redirect(link) {
    this.document.location.href = link;
  }
}
