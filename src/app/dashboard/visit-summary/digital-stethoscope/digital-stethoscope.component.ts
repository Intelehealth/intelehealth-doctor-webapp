
import { Component, OnInit } from '@angular/core';

interface ScreeningResult {
  confidence_score: number;
  condition: string;
  description: string;
  condition_detected: string;
  type?: string;
}

interface LungData {
  lung_bpm: string;
  location: string;
  position: string;
  point?: number;
  report_url: string;
  screening_results: ScreeningResult[];
}

interface HeartData {
  heart_bpm: number | string;
  location: string;
  position: string;
  point?: number;
  report_url: string;
  screening_results: ScreeningResult[];
}

type AnyData = LungData | HeartData;

interface DetectedCondition {
  condition: string;
  confidence: number;
}

interface MeasurementPoint {
  id: number;
  top: string;
  left: string;
}

@Component({
  selector: 'app-digital-stethoscope',
  templateUrl: './digital-stethoscope.component.html',
  styleUrls: ['./digital-stethoscope.component.scss']
})
export class DigitalStethoscopeComponent implements OnInit {
  selectedPosition: number | null = null;
  // index of the selected measurement point in the current view (0..n-1)
  selectedViewIndex: number | null = null;
  // which view the selection belongs to: 'anterior' | 'lateral' | 'posterior'
  selectedView: string | null = null;
  isPlaying: boolean = false;
  speed: number = 1.0;
  selectedDataSource: 'lung' | 'heart' | null = null;

  lungData: LungData[] = [
    {
      lung_bpm: "16",
      location: "lung",
      position: "right lung",
      point: 1,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        {
          confidence_score: 96,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 68,
          condition: "Wheeze",
          description: "Wheezing detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "14",
      location: "lung",
      position: "left lung",
      point: 2,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        {
          confidence_score: 88,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 72,
          condition: "Crackles",
          description: "Crackling sounds detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "20",
      location: "lung",
      position: "right lung",
      point: 3,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        {
          confidence_score: 90,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 65,
          condition: "Wheeze",
          description: "Wheezing detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "17",
      location: "lung",
      position: "left lung",
      point: 4,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        {
          confidence_score: 93,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 71,
          condition: "Rhonchi",
          description: "Rhonchi detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "22",
      location: "lung",
      position: "right lung",
      point: 5,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        {
          confidence_score: 89,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 60,
          condition: "Crackles",
          description: "Crackling sounds detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "18",
      location: "lung",
      position: "left lung",
      point: 6,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        {
          confidence_score: 91,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 63,
          condition: "Wheeze",
          description: "Wheezing detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "19",
      location: "lung",
      position: "right lung",
      point: 7,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        {
          confidence_score: 94,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 78,
          condition: "Rhonchi",
          description: "Rhonchi detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "21",
      location: "lung",
      position: "left lung",
      point: 8,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        {
          confidence_score: 89,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 74,
          condition: "Crackles",
          description: "Crackling sounds detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "23",
      location: "lung",
      position: "right lung",
      point: 9,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        {
          confidence_score: 91,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 77,
          condition: "Wheeze",
          description: "Wheezing detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "15",
      location: "lung",
      position: "left lung",
      point: 10,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_5/nivethaintelehealth.org_1_2025101420145521.448_Ant_5.html",
      screening_results: [
        {
          confidence_score: 86,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 71,
          condition: "Rhonchi",
          description: "Rhonchi detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "24",
      location: "lung",
      position: "right lung",
      point: 11,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        {
          confidence_score: 92,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 79,
          condition: "Crackles",
          description: "Crackling sounds detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "13",
      location: "lung",
      position: "left lung",
      point: 12,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        {
          confidence_score: 95,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 64,
          condition: "Wheeze",
          description: "Wheezing detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "25",
      location: "lung",
      position: "right lung",
      point: 13,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        {
          confidence_score: 90,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 68,
          condition: "Rhonchi",
          description: "Rhonchi detected",
          condition_detected: "true"
        }
      ]
    },
    {
      lung_bpm: "11",
      location: "lung",
      position: "left lung",
      point: 14,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/nivethaintelehealth.org_1_2025101420145521.448_Ant_6/nivethaintelehealth.org_1_2025101420145521.448_Ant_6.html",
      screening_results: [
        {
          confidence_score: 92,
          condition: "Normal Lung Sound",
          description: "Normal lung sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 70,
          condition: "Wheeze",
          description: "Wheezing detected",
          condition_detected: "true"
        }
      ]
    },
  ];

  heartData: HeartData[] = [
    {
      heart_bpm: 79,
      location: "heart",
      position: "aortic",
      point: 1,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/Ali.ayudevices40gmail.com_1_2020092620115128.084_A/Ali.ayudevices40gmail.com_1_2020092620115128.084_A.html",
      screening_results: [
        {
          confidence_score: 97,
          condition: "Normal Heart Sound",
          description: "Abnormal heart sound",
          condition_detected: "false"
        },
        {
          confidence_score: 72,
          condition: "Murmur",
          type: "Soft Murmur",
          description: "Soft murmur detected",
          condition_detected: "true"
        },
        {
          confidence_score: 67,
          condition: "Pulmonary Arterial Hypertension",
          description: "Possibly PAH detected",
          condition_detected: "true"
        }
      ]
    },
    {
      heart_bpm: 75,
      location: "heart",
      position: "left ventricle",
      point: 2,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/Ali.ayudevices40gmail.com_1_2020092620115128.084_A/Ali.ayudevices40gmail.com_1_2020092620115128.084_A.html",
      screening_results: [
        {
          confidence_score: 88,
          condition: "Normal Heart Sound",
          description: "Normal heart sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 55,
          condition: "Murmur",
          type: "Soft Murmur",
          description: "Murmur detected",
          condition_detected: "true"
        },
        {
          confidence_score: 60,
          condition: "Pulmonary Arterial Hypertension",
          description: "Possible PAH detected",
          condition_detected: "true"
        }
      ]
    },
    {
      heart_bpm: 82,
      location: "heart",
      position: "right atrium",
      point: 3,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/Ali.ayudevices40gmail.com_1_2020092620115128.084_A/Ali.ayudevices40gmail.com_1_2020092620115128.084_A.html",
      screening_results: [
        {
          confidence_score: 94,
          condition: "Normal Heart Sound",
          description: "Normal heart sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 50,
          condition: "Murmur",
          type: "Medium Murmur",
          description: "Medium murmur detected",
          condition_detected: "true"
        },
        {
          confidence_score: 66,
          condition: "Pulmonary Arterial Hypertension",
          description: "Possible PAH detected",
          condition_detected: "true"
        }
      ]
    },
    {
      heart_bpm: 74,
      location: "heart",
      position: "mitral valve",
      point: 4,
      report_url: "https://analytics-html-js-plot.s3.amazonaws.com/Ali.ayudevices40gmail.com_1_2020092620115128.084_A/Ali.ayudevices40gmail.com_1_2020092620115128.084_A.html",
      screening_results: [
        {
          confidence_score: 90,
          condition: "Normal Heart Sound",
          description: "Normal heart sound detected",
          condition_detected: "false"
        },
        {
          confidence_score: 62,
          condition: "Murmur",
          type: "Soft Murmur",
          description: "Soft murmur detected",
          condition_detected: "true"
        },
        {
          confidence_score: 59,
          condition: "Pulmonary Arterial Hypertension",
          description: "Possible PAH detected",
          condition_detected: "true"
        }
      ]
    }
  ];


  // Position coordinates for measurement points on each view
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
    { id: 3, top: '63%', left: '58%' },
    { id: 4, top: '74%', left: '62%' }
  ];

  ngOnInit(): void {
    // Component initialization
  }

  handlePointClick(point: MeasurementPoint, viewIndex: number, viewName: string, dataName: string): void {
    const index = dataName === 'lungData' ? this.lungData.findIndex(d => d.point === point.id) : this.heartData.findIndex(d => d.point === point.id);
    this.selectedPosition = index !== -1 ? index : null;
    this.selectedViewIndex = viewIndex;
    this.selectedView = viewName;
    this.selectedDataSource = dataName === 'lungData' ? 'lung' : 'heart';
    this.isPlaying = false;
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

  // Accept a point id (global id from the view) and return whether that
  // measurement has any detected conditions.
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
}