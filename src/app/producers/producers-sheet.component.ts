import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { IProducer, Producer } from "../producers";
import { ProducerService, AppStore } from '../services';


@Component({
  selector: 'producers-sheet',
  templateUrl: './producers-sheet.component.html',
  styleUrls: ['./producers-sheet.component.css']
})
export class ProducersSheetComponent implements OnInit {

  constructor(private service: ProducerService, private changeDetector: ChangeDetectorRef, private store: AppStore) { }

  private hotRegisterer = new HotTableRegisterer();

  ngOnInit(): void {
    setTimeout(() => {  // give breathing time for the component
      let unSavedData = this.store.load<IProducer[]>(this.dataKey);
      if (unSavedData && unSavedData.length > 0 && confirm('You have UNSAVED producers data, RESTORE it?')) {
        this.producers = unSavedData;
        this.store.spinner = true;
        setTimeout(() => {
          this.hotData(this.producers);
          this.store.spinner = false;
        }, 1000);
      }
      else {
        this.clearLocalData();
        this.updateData();
      }
    }, 500);
  }

  title: string = 'Producers Sheet';
  hotId = 'producers-sheet';
  allowSave: boolean = false;
  producers: IProducer[] = [];
  showAll: boolean = false;

  hot = () => this.hotRegisterer.getInstance(this.hotId)
  hotData = (data?: IProducer[]): IProducer[] => {
    if (data) {
      this.hot().loadData(data);
    }
    return this.hot().getSourceData() as IProducer[];
  }
  dataChanged = (changes: Handsontable.CellChange[], source: Handsontable.ChangeSource) => {
    if (source != 'loadData') {
      this.setLocalData();
    }
    this.hot().validateCells(valid => {
      this.allowSave = valid;
      this.changeDetector.detectChanges();
    });
  }

  get producerIds() {
    return this.producers.map(x => x.code);
  }

  hotSettings: Handsontable.GridSettings = {
    licenseKey: 'non-commercial-and-evaluation',
    columns: [
      { title: 'Producer Code', data: 'code', validator: (value, cb) => cb(value > 0 && this.producerIds.filter(x => x == value).length <= 1) },
      { title: 'Name', data: 'name', validator: /^[a-zA-Z0-9.\s,-]{3,}/ },
      { title: 'Contact No.', data: 'contactNumber', validator: /^$|^\d{10}$/ },
      { title: 'Bank Account No.', data: 'bankAccountNumber', validator: /^$|^[0-9]{5,20}$/ },
      { title: 'Bank IFSC Code', data: 'bankIfscCode', validator: /^$|^[A-Za-z]{4}\d{7}$/ },
    ],
    colWidths: ['25px', '100px', '50px', '50px', '50px'],
    dataSchema: {
      code: '',
      name: '',
      active: true,
      contactNumber: '',
      bankAccountNumber: '',
      bankIfscCode: ''
    },
    stretchH: 'all',
    readOnlyCellClassName: 'read-only-class',
    allowInsertRow: true,
    colHeaders: true,
    afterChange: this.dataChanged,
    contextMenu: {
      items: {
        "validateData": {
          name: "Validate Data",
          callback: (key, options) => {
            this.hot().validateCells(valid => {
              this.allowSave = valid;
              this.changeDetector.detectChanges();
            });
          }
        },
        "deleteProducer": {
          name: "Deactivate Producer",
          callback: (key, options) => {
            if (options.length > 0 && options[0].start.row <= options[0].end.row) {
              for (let i = options[0].start.row; i <= options[0].end.row; i++) {
                this.service.deactivateProducer(this.producers[i]).subscribe();
              }
            }
          }
        }
      }
    }
  }

  updateData() {
    this.service.getProducers().subscribe(resp => {
      this.producers = resp.filter(x => this.showAll || x.active);
      this.hotData(this.producers);
    })
  }

  addProducer(): void {
    this.producers.push(new Producer(Math.max(...this.producers.map(x => +x.code), 0) + 1 + ''))
    this.hotData(this.producers);
  }

  save(): void {
    if (this.allowSave) {
      let data = this.hot().getSourceData() as IProducer[];
      this.service.bulkUpdate(data).subscribe(resp => {
        this.clearLocalData();
        this.allowSave = false;
        this.updateData();
      })
    }
  }

  clearLocalData(): void {
    this.store.store([], this.dataKey);
  }

  setLocalData(): void {
    this.store.store(this.hotData(), this.dataKey);
  }

  get dataKey(): string {
    return this.hotId;
  }
}
