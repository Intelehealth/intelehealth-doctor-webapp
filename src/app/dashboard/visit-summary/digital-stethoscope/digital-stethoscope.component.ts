
import { Component, OnInit } from '@angular/core';
import { ScreeningResult, LungData, HeartData, DetectedCondition, MeasurementPoint } from 'src/app/model/model';

type AnyData = LungData | HeartData;

@Component({
  selector: 'app-digital-stethoscope',
  templateUrl: './digital-stethoscope.component.html',
  styleUrls: ['./digital-stethoscope.component.scss']
})
export class DigitalStethoscopeComponent implements OnInit {
  activeTab: 'heart' | 'lungs' = 'heart';

  selectedPosition: number | null = null;
  selectedViewIndex: number | null = null;
  selectedView: string | null = null;
  selectedDataSource: 'lung' | 'heart' | null = null;
  selectedPointId: number | null = null;

  isPlaying: boolean = false;
  speed: number = 1.0;

  deviceName = 'Ayusynk Digital Stethoscope';
  deviceId = 'AY-2304';

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

  lungData: LungData[] = [
    {
      lung_bpm: "16",
      location: "lung",
      position: "Right Upper Lobe",
      point: 1,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" },
        { confidence_score: 38, condition: "S3 Gallop", description: "S3 gallop detected", condition_detected: "true" }
      ]
    },
    {
      lung_bpm: "14",
      location: "lung",
      position: "Left Upper Lobe",
      point: 2,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" },
        { confidence_score: 38, condition: "S3 Gallop", description: "S3 gallop detected", condition_detected: "true" }
      ]
    },
    {
      lung_bpm: "20",
      location: "lung",
      position: "Right Mid Lobe",
      point: 3,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" },
        { confidence_score: 38, condition: "S3 Gallop", description: "S3 gallop detected", condition_detected: "true" }
      ]
    },
    {
      lung_bpm: "17",
      location: "lung",
      position: "Right Lower Lobe",
      point: 5,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      lung_bpm: "22",
      location: "lung",
      position: "Left Lower Lobe",
      point: 6,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      lung_bpm: "19",
      location: "lung",
      position: "Right Lateral Upper",
      point: 7,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      lung_bpm: "21",
      location: "lung",
      position: "Right Lateral Lower",
      point: 8,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      lung_bpm: "23",
      location: "lung",
      position: "Left Lateral Upper",
      point: 9,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      lung_bpm: "15",
      location: "lung",
      position: "Left Lateral Lower",
      point: 10,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      lung_bpm: "24",
      location: "lung",
      position: "Right Upper Back",
      point: 11,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      lung_bpm: "13",
      location: "lung",
      position: "Left Upper Back",
      point: 12,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      lung_bpm: "25",
      location: "lung",
      position: "Right Mid Back",
      point: 13,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" },
        { confidence_score: 38, condition: "S3 Gallop", description: "S3 gallop detected", condition_detected: "true" }
      ]
    },
    {
      lung_bpm: "11",
      location: "lung",
      position: "Left Mid Back",
      point: 14,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    }
  ];

  heartData: HeartData[] = [
    {
      heart_bpm: 78,
      breathing_rate: 16,
      location: "heart",
      position: "Aortic",
      point: 1,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/Ali.ayudevices40gmail.com_1_2020092620115128.084_A/Ali.ayudevices40gmail.com_1_2020092620115128.084_A.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      heart_bpm: 78,
      breathing_rate: 16,
      location: "heart",
      position: "Pulmonic",
      point: 2,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/Ali.ayudevices40gmail.com_1_2020092620115128.084_A/Ali.ayudevices40gmail.com_1_2020092620115128.084_A.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      heart_bpm: 78,
      breathing_rate: 16,
      location: "heart",
      position: "Tricuspid",
      point: 3,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/Ali.ayudevices40gmail.com_1_2020092620115128.084_A/Ali.ayudevices40gmail.com_1_2020092620115128.084_A.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    },
    {
      heart_bpm: 78,
      breathing_rate: 16,
      location: "heart",
      position: "Mitral",
      point: 4,
      recorded_time: "09:42 AM",
      device: "Ayusynk Digital Stethoscope",
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/Ali.ayudevices40gmail.com_1_2020092620115128.084_A/Ali.ayudevices40gmail.com_1_2020092620115128.084_A.html",
      screening_results: [
        { confidence_score: 94, condition: "Normal Heart Sound", description: "Normal heart sound detected", condition_detected: "false" },
        { confidence_score: 12, condition: "Systolic Murmur", description: "Systolic murmur detected", condition_detected: "false" }
      ]
    }
  ];

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
    // Auto-select first point on heart tab
  }

  switchTab(tab: 'heart' | 'lungs'): void {
    this.activeTab = tab;
    this.selectedPosition = null;
    this.selectedViewIndex = null;
    this.selectedView = null;
    this.selectedDataSource = null;
    this.selectedPointId = null;
  }

  handlePointClick(point: MeasurementPoint, viewIndex: number, viewName: string, dataName: string): void {
    const source = dataName === 'lungData' ? 'lung' : 'heart';
    const dataArray = source === 'lung' ? this.lungData : this.heartData;
    const index = dataArray.findIndex(d => d.point === point.id);

    this.selectedPointId = point.id;
    this.selectedPosition = index !== -1 ? index : null;
    this.selectedViewIndex = viewIndex;
    this.selectedView = viewName;
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
    return 78; // Default heart rate
  }

  getBreathingRate(data: AnyData): string | number {
    if ('heart_bpm' in data) {
      return (data as HeartData).breathing_rate || 16;
    }
    return (data as LungData).lung_bpm;
  }

  getRecordedTime(data: AnyData): string {
    return data.recorded_time || '09:42 AM';
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

    let currentIndex = this.selectedPosition !== null ? this.selectedPosition : -1;
    let nextIndex = (currentIndex + 1) % dataArray.length;
    let nextData = dataArray[nextIndex];
    let nextPointId = nextData.point!;

    // Find which view and view index this point belongs to
    let viewName = source === 'heart' ? 'heart' : '';
    let viewIndex = 0;

    if (source === 'lung') {
      const anterior = this.anteriorPoints.findIndex(p => p.id === nextPointId);
      const lateral = this.lateralPoints.findIndex(p => p.id === nextPointId);
      const posterior = this.posteriorPoints.findIndex(p => p.id === nextPointId);

      if (anterior !== -1) { viewName = 'anterior'; viewIndex = anterior; }
      else if (lateral !== -1) { viewName = 'lateral'; viewIndex = lateral; }
      else if (posterior !== -1) { viewName = 'posterior'; viewIndex = posterior; }
    } else {
      const heartIdx = this.heartPoints.findIndex(p => p.id === nextPointId);
      if (heartIdx !== -1) { viewName = 'heart'; viewIndex = heartIdx; }
    }

    this.selectedPointId = nextPointId;
    this.selectedPosition = nextIndex;
    this.selectedViewIndex = viewIndex;
    this.selectedView = viewName;
    this.selectedDataSource = source;
  }
}
