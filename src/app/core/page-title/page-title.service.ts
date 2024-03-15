import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PageTitleItem } from '../models/page-title-model';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {

  public title: BehaviorSubject<PageTitleItem> = new BehaviorSubject<PageTitleItem>({ title: "", imgUrl: "assets/svgs/menu-home.svg"});

  setTitle(value: PageTitleItem) {
		this.title.next(value);
	}
}
