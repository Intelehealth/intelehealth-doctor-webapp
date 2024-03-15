import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadMindmapJsonComponent } from './upload-mindmap-json.component';

describe('UploadMindmapJsonComponent', () => {
  let component: UploadMindmapJsonComponent;
  let fixture: ComponentFixture<UploadMindmapJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadMindmapJsonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadMindmapJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
