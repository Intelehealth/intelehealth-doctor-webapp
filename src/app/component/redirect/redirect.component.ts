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
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private route: ActivatedRoute,
    private linkService: LinkService
  ) {}

  ngOnInit(): void {
    this.hash = this.route.snapshot.paramMap.get("hash");
    this.getLink();
  }

  getLink() {
    this.linkService
      .getLink(this.hash)
      .subscribe((response: { success; data; message }) => {
        if (response.success) {
          const link = response.data.link;
          this.redirect(link);
        } else {
          const message = response.message || "Sorry, something went wrong.";
          this.message = message;
          alert(message);
        }
      });
  }

  redirect(link) {
    this.document.location.href = link;
  }
}
