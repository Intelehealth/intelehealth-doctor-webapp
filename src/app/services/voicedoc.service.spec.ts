import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { VoicedocService } from './voicedoc.service';

describe('VoicedocService', () => {
  let service: VoicedocService;
  let http: HttpTestingController;
  const base = `${environment.mindmapURL}/voicedoc`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: { authToken: 'token' } }]
    });
    service = TestBed.inject(VoicedocService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends source=webapp when creating a session', () => {
    service.createSession({ visitUuid: 'v', patientUuid: 'p', doctorUuid: 'd', chwUuid: 'c', roomId: 'r' }).subscribe();
    const req = http.expectOne(`${base}/sessions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ visitUuid: 'v', patientUuid: 'p', doctorUuid: 'd', chwUuid: 'c', roomId: 'r', source: 'webapp' });
    req.flush({ success: true, data: { sessionId: 's1' } });
  });

  it('lists transcripts with page, limit and source', () => {
    let total = 0;
    service.listTranscripts(2, 10, 'mobile').subscribe(res => (total = res.data.total));
    const req = http.expectOne(r => r.url === `${base}/transcripts`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('source')).toBe('mobile');
    req.flush({ success: true, data: { items: [], total: 42, page: 2, limit: 10 } });
    expect(total).toBe(42);
  });

  it('omits source when listing all transcripts', () => {
    service.listTranscripts(1, 10).subscribe();
    const req = http.expectOne(r => r.url === `${base}/transcripts`);
    expect(req.request.params.has('source')).toBeFalse();
    req.flush({ success: true, data: { items: [], total: 0, page: 1, limit: 10 } });
  });

  it('fetches a single transcript by id', () => {
    let transcript: string = null;
    service.getTranscript('abc/1').subscribe(res => (transcript = res.data.transcript));
    const req = http.expectOne(`${base}/transcripts/abc%2F1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'abc/1', transcript: 'hello', summary: null } });
    expect(transcript).toBe('hello');
  });

  it('appends optional level fields to the chunk upload form', () => {
    service.uploadChunk('s1', new Blob(['a']), 3, { localRms: '0.1000', localSources: '1' }).subscribe();
    const req = http.expectOne(`${base}/sessions/s1/chunks`);
    const form = req.request.body as FormData;
    expect(form.get('chunkNumber')).toBe('3');
    expect(form.get('localRms')).toBe('0.1000');
    expect(form.get('localSources')).toBe('1');
    expect(form.get('remoteRms')).toBeNull();
    req.flush({});
  });
});
