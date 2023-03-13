import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LinkService {
  private baseURL = environment.mindmapURL;

  constructor(
    private http: HttpClient
  ) { }

  getShortenedLink(hash) {
    return this.http.get(`${this.baseURL}/links/getLink/${hash}`);
  }

  shortUrl(link: string) {
    return this.http.post(`${this.baseURL}/links/shortLink`, ({ link } as any));
  }

  requestPresctionOtp(hash, phoneNumber) {
    return this.http.post(`${this.baseURL}/links/requestOtp`, ({ hash, phoneNumber } as any));
  }

  verifyPresctionOtp(hash, otp) {
    return this.http.post(`${this.baseURL}/links/verifyOtp`, ({ hash, otp } as any));
  }
}
