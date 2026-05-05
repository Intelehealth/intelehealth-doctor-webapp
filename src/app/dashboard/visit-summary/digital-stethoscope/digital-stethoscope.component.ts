
import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ScreeningResult, LungData, HeartData, DetectedCondition, MeasurementPoint, ObsModel, EncounterModel } from 'src/app/model/model';

type AnyData = LungData | HeartData;

/** Concept display name used to identify stethoscope OBS entries */
const STETHOSCOPE_CONCEPT = 'sound of breathing';

@Component({
  selector: 'app-digital-stethoscope',
  templateUrl: './digital-stethoscope.component.html',
  styleUrls: ['./digital-stethoscope.component.scss']
})
export class DigitalStethoscopeComponent implements OnInit, OnChanges {
  //** The component scans ALL encounters for OBS with concept "Sound of breathing".
  @Input() encounters: EncounterModel[] = [];

  activeTab: 'heart' | 'lungs' = 'heart';

  selectedPosition: number | null = null;
  selectedDataSource: 'lung' | 'heart' | null = null;
  selectedPointId: number | null = null;

  isPlaying: boolean = false;
  speed: number = 1.0;

  deviceName = '';
  deviceId = '';

  lungPositionNames: Record<number, string> = {
    1: 'Right Upper Lobe', 2: 'Left Upper Lobe',
    3: 'Right Mid Lobe', 4: 'Left Mid Lobe',
    5: 'Right Lower Lobe', 6: 'Left Lower Lobe',
    7: 'Right Lateral Upper', 8: 'Right Lateral Lower',
    9: 'Left Lateral Upper', 10: 'Left Lateral Lower',
    11: 'Right Upper Back', 12: 'Left Upper Back',
    13: 'Right Mid Back', 14: 'Left Mid Back',
    15: 'Right Lower Back', 16: 'Left Lower Back'
  };

  heartPositionNames: Record<number, string> = {
    1: 'Aortic', 2: 'Pulmonic', 3: 'Tricuspid', 4: 'Mitral'
  };

  private heartPositionToPoint: Record<string, number> = {
    'aortic': 1, 'pulmonic': 2, 'tricuspid': 3, 'mitral': 4
  };

  private lungPositionToPoint: Record<string, number> = {
    'right upper lobe': 1, 'left upper lobe': 2,
    'right mid lobe': 3, 'left mid lobe': 4,
    'right lower lobe': 5, 'left lower lobe': 6,
    'right lateral upper': 7, 'right lateral lower': 8,
    'left lateral upper': 9, 'left lateral lower': 10,
    'right upper back': 11, 'left upper back': 12,
    'right mid back': 13, 'left mid back': 14,
    'right lower back': 15, 'left lower back': 16
  };

  /** Maps Ayusynk underscore-format positions (e.g. "anterior_upper_right") to chart point IDs */
  private ayusynkLungPositionToPoint: Record<string, number> = {
    'anterior_upper_right': 1, 'anterior_upper_left': 2,
    'anterior_middle_right': 3, 'anterior_middle_left': 4,
    'anterior_lower_right': 5, 'anterior_lower_left': 6,
    'lateral_upper_right': 7, 'lateral_lower_right': 8,
    'lateral_upper_left': 9, 'lateral_lower_left': 10,
    'posterior_upper_right': 11, 'posterior_upper_left': 12,
    'posterior_middle_right': 13, 'posterior_middle_left': 14,
    'posterior_lower_right': 15, 'posterior_lower_left': 16
  };

  // Data arrays — populated from OBS encounter data (no static placeholders)
  lungData: LungData[] = [];
  heartData: HeartData[] = [];

  anteriorPoints: MeasurementPoint[] = [
    { id: 1, top: '48%', left: '42%' },
    { id: 2, top: '48%', left: '58%' },
    { id: 3, top: '62%', left: '38%' },
    { id: 4, top: '62%', left: '62%' },
    { id: 5, top: '74%', left: '32%' },
    { id: 6, top: '74%', left: '68%' }
  ];

  lateralPoints: MeasurementPoint[] = [
    { id: 7, top: '52%', left: '32%' },
    { id: 8, top: '68%', left: '25%' },
    { id: 9, top: '52%', left: '64%' },
    { id: 10, top: '68%', left: '72%' }
  ];

  posteriorPoints: MeasurementPoint[] = [
    { id: 11, top: '48%', left: '42%' },
    { id: 12, top: '48%', left: '58%' },
    { id: 13, top: '62%', left: '38%' },
    { id: 14, top: '62%', left: '62%' },
    { id: 15, top: '74%', left: '32%' },
    { id: 16, top: '74%', left: '68%' }
  ];

  heartPoints: MeasurementPoint[] = [
    { id: 1, top: '52%', left: '42%' },
    { id: 2, top: '52%', left: '58%' },
    { id: 3, top: '63%', left: '48%' },
    { id: 4, top: '74%', left: '55%' }
  ];

  get heartRecordingCount(): number {
    return this.heartData.length;
  }

  get lungRecordingCount(): number {
    return this.lungData.length;
  }

  get allLungPointIds(): number[] {
    const ids = new Set<number>();
    this.anteriorPoints.forEach(p => ids.add(p.id));
    this.lateralPoints.forEach(p => ids.add(p.id));
    this.posteriorPoints.forEach(p => ids.add(p.id));
    return Array.from(ids).sort((a, b) => a - b);
  }

  ngOnInit(): void {
    this.parseStethoscopeData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['encounters']) {
      this.parseStethoscopeData();
    }
  }

  private parseStethoscopeData(): void {
    this.lungData = [];
    this.heartData = [];
    this.deviceName = '';
    this.deviceId = '';

    if (!this.encounters?.length) return;

    // Collect ALL "Sound of breathing" OBS from every encounter
    const stethObs: ObsModel[] = [];
    for (const enc of this.encounters) {
      if (!enc.obs?.length) continue;
      for (const obs of enc.obs) {
        if (obs.concept?.display?.toLowerCase().includes(STETHOSCOPE_CONCEPT)) {
          stethObs.push(obs);
        }
      }
    }

    if (!stethObs.length) return;

    // Parse each OBS entry into lung/heart recordings
    for (const obs of stethObs) {
      const parsed = this.parseObsValue(obs.value);
      if (!parsed || typeof parsed !== 'object') continue;

      const sound: string = parsed.sound ?? '';           // "heart" or "lung"
      const obsPosition: string = parsed.position ?? '';  // e.g. "aortic"
      const recordings: any[] = parsed.outputfromayusynk; // Ayusynk device output

      if (!Array.isArray(recordings) || !recordings.length) continue;

      for (const rec of recordings) {
        this.mapRecordingToData(rec, sound, obsPosition);
      }
    }

    // Default device name from Ayusynk if not populated from recordings
    if (!this.deviceName) {
      this.deviceName = 'Ayusynk Digital Stethoscope';
    }
  }

  /**
   * Parse an OBS value — handles JSON strings, coded objects, and plain values.
   */
  private parseObsValue(value: any): any {
    if (!value) return null;

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { return JSON.parse(trimmed); } catch { return null; }
      }
      return null;
    }

    // Already an object (OpenMRS sometimes pre-parses)
    if (typeof value === 'object') {
      return value;
    }

    return null;
  }

  /**
   * Map a single Ayusynk recording to the appropriate data array.
   * Resolves the position name to a point number using reverse lookup maps.
   */
  private mapRecordingToData(rec: any, sound: string, obsPosition: string): void {
    const recLocation = (rec.location ?? '').toLowerCase().trim();
    const isHeart = sound === 'heart' || recLocation === 'heart';
    const isLung = sound === 'lung' || recLocation === 'lung' || recLocation === 'lungs';

    if (isHeart) {
      // Heart: outer obsPosition is reliable ("Tricuspid", "Aortic", ...).
      const heartKey = (obsPosition || rec.position || '').toLowerCase().trim();
      const point = this.heartPositionToPoint[heartKey] ?? 0;
      this.heartData.push({
        heart_bpm: this.normalizeNA(rec.heart_bpm),
        breathing_rate: this.normalizeNA(rec.breathing_rate),
        location: 'heart',
        position: this.heartPositionNames[point] || obsPosition || rec.position || '',
        point,
        report_url: rec.report_url ?? '',
        recorded_time: rec.recorded_time ?? '',
        device: rec.device ?? 'Ayusynk Digital Stethoscope',
        screening_results: this.toScreeningResults(rec.screening_results)
      });
    } else if (isLung) {
      const innerKey = (rec.position ?? '').toLowerCase().trim();
      const outerKey = (obsPosition ?? '').toLowerCase().trim();
      const point =
        this.ayusynkLungPositionToPoint[innerKey] ??
        this.lungPositionToPoint[outerKey] ??
        this.lungPositionToPoint[innerKey] ??
        0;
      this.lungData.push({
        lung_bpm: this.normalizeNA(rec.lung_bpm),
        location: 'lung',
        position: this.lungPositionNames[point] || obsPosition || rec.position || '',
        point,
        report_url: rec.report_url ?? '',
        recorded_time: rec.recorded_time ?? '',
        device: rec.device ?? 'Ayusynk Digital Stethoscope',
        screening_results: this.toScreeningResults(rec.screening_results)
      });
    }

    // Extract device info from the first recording that has it
    if (rec.device && !this.deviceName) this.deviceName = rec.device;
    if (rec.deviceId && !this.deviceId) this.deviceId = rec.deviceId;
  }

  /** Normalize values like null, undefined, "NA", "na", "" to a consistent "N/A". */
  private normalizeNA(value: any): string {
    if (value == null) return 'N/A';
    const str = String(value).trim();
    if (str === '' || str.toLowerCase() === 'na') return 'N/A';
    return str;
  }

  //** Safely normalize screening_results with fallback to empty array.
  private toScreeningResults(results: any): ScreeningResult[] {
    if (!Array.isArray(results)) return [];
    return results.map((r: any) => ({
      confidence_score: r.confidence_score ?? 0,
      condition: r.condition ?? '',
      description: r.description ?? '',
      condition_detected: String(r.condition_detected ?? false)
    }));
  }

  switchTab(tab: 'heart' | 'lungs'): void {
    this.activeTab = tab;
    this.selectedPosition = null;
    this.selectedDataSource = null;
    this.selectedPointId = null;
  }

  handlePointClick(point: MeasurementPoint, dataName: string): void {
    const source = dataName === 'lungData' ? 'lung' : 'heart';
    const dataArray = source === 'lung' ? this.lungData : this.heartData;
    const index = dataArray.findIndex(d => d.point === point.id);

    this.selectedPointId = point.id;
    this.selectedPosition = index !== -1 ? index : null;
    this.selectedDataSource = source;
    this.isPlaying = false;
  }

  getPointState(pointId: number, source: 'lung' | 'heart'): string {
    if (this.selectedPointId === pointId && this.selectedDataSource === source) {
      return 'selected';
    }
    const data = source === 'lung'
      ? this.lungData.find(d => d.point === pointId)
      : this.heartData.find(d => d.point === pointId);
    if (!data) return 'no-recording';
    if (this.getDetectedConditions(data).length > 0) return 'abnormal';
    return 'recorded';
  }

  hasRecording(pointId: number, source: 'lung' | 'heart'): boolean {
    return source === 'lung'
      ? this.lungData.some(d => d.point === pointId)
      : this.heartData.some(d => d.point === pointId);
  }

  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
  }

  onSpeedChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.speed = parseFloat(target.value);
  }

  openReport(): void {
    const data = this.getSelectedData();
    if (data && data.report_url) {
      window.open(data.report_url, '_blank');
    }
  }

  getDetectedConditions(data: AnyData): DetectedCondition[] {
    return data.screening_results
      .filter(result => result.condition_detected === "true")
      .map(result => ({
        condition: result.condition,
        confidence: result.confidence_score
      }));
  }

  hasCondition(pointId: number, source: 'lung' | 'heart'): boolean {
    const data = source === 'lung'
      ? this.lungData.find(d => d.point === pointId)
      : this.heartData.find(d => d.point === pointId);
    return data ? this.getDetectedConditions(data).length > 0 : false;
  }

  getSelectedData(): AnyData | null {
    if (this.selectedPosition === null || this.selectedDataSource === null) {
      return null;
    }
    return this.selectedDataSource === 'lung'
      ? this.lungData[this.selectedPosition]
      : this.heartData[this.selectedPosition];
  }

  getSelectedBpm(data: AnyData): string | number {
    return 'heart_bpm' in data ? data.heart_bpm : data.lung_bpm;
  }

  getSelectedPositionName(): string {
    if (this.selectedPointId === null) return '';
    if (this.selectedDataSource === 'heart') {
      return this.heartPositionNames[this.selectedPointId] || `Point ${this.selectedPointId}`;
    }
    return this.lungPositionNames[this.selectedPointId] || `Point ${this.selectedPointId}`;
  }

  getHeartRate(data: AnyData): string | number {
    if ('heart_bpm' in data) return data.heart_bpm;
    return 'N/A';
  }

  getBreathingRate(data: AnyData): string | number {
    if ('heart_bpm' in data) {
      return (data as HeartData).breathing_rate || 'N/A';
    }
    return (data as LungData).lung_bpm;
  }

  getRecordedTime(data: AnyData): string {
    return data.recorded_time || 'N/A';
  }

  hasConditionForSelected(): boolean {
    const data = this.getSelectedData();
    if (!data) return false;
    return this.getDetectedConditions(data).length > 0;
  }

  getNonDetectedResults(data: AnyData): ScreeningResult[] {
    return data.screening_results.filter(r => r.condition_detected !== "true");
  }

  navigateToNextRecording(): void {
    const source = this.selectedDataSource || (this.activeTab === 'heart' ? 'heart' : 'lung');
    const dataArray = source === 'lung' ? this.lungData : this.heartData;

    if (dataArray.length === 0) return;

    const currentIndex = this.selectedPosition !== null ? this.selectedPosition : -1;
    const nextIndex = (currentIndex + 1) % dataArray.length;
    const nextData = dataArray[nextIndex];

    this.selectedPointId = nextData.point!;
    this.selectedPosition = nextIndex;
    this.selectedDataSource = source;
  }
}
