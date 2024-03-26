import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesService {
  private currentUnsavedChangesSubject: BehaviorSubject<any>;
  public currentUnsavedChanges: Observable<any>;
  constructor() { 
    this.currentUnsavedChangesSubject = new BehaviorSubject<boolean>(false);
    this.currentUnsavedChanges = this.currentUnsavedChangesSubject.asObservable();
  }

  updateUnsavedStatus(status: boolean) {
    this.currentUnsavedChangesSubject.next(status);
  }

  public get currentValue(): any {
    return this.currentUnsavedChangesSubject.value;
  }
}