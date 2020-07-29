import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import Handsontable from 'handsontable';
import { IProducer, Producer } from "../producers";
import { ProducerService } from '../services';


@Component({
  selector: 'producers-sheet',
  templateUrl: './producers-sheet.component.html',
  styleUrls: ['./producers-sheet.component.css']
})
export class ProducersSheetComponent implements OnInit {

  constructor(private service: ProducerService, private changeDetector: ChangeDetectorRef) { }

  private hotRegisterer = new HotTableRegisterer();

  ngOnInit(): void {
    this.service.getProducers().subscribe(resp => {
      this.producers = resp.filter(x => this.showAll || x.active);
      this.hot().loadData(this.producers);
    })
  }

  title: string = 'Producers Sheet';
  hotId = 'producers-sheet';
  allowSave: boolean = false;
  producers: IProducer[] = [];
  showAll: boolean = false;

  hot = () => this.hotRegisterer.getInstance(this.hotId)
  dataChanged = () => {
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
      { title: 'Name', data: 'name', validator: /^[a-zA-Z0-9\s,-]{3,}/ },
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

  addProducer(): void {
    this.producers.push(new Producer(Math.max(...this.producers.map(x => +x.code), 0) + 1 + ''))
    this.hot().loadData(this.producers);
  }

  save(): void {
    if (this.allowSave) {
      let data = this.hot().getSourceData() as IProducer[];
      data.forEach(p => {
        if (p._id) {
          this.service.updateProducer(p).subscribe();
        }
        else {
          this.service.addProducer(p).subscribe();
        }
      })
    }
  }
}
