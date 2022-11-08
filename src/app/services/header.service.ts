import { Injectable, Input } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class HeaderService {
  public showSearchBar: boolean = false;

  constructor() {}
}
