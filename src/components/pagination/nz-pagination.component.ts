import {
  Component,
  ViewEncapsulation,
  Input,
  ElementRef,
  EventEmitter,
  Output
} from '@angular/core';

@Component({
  selector     : 'nz-pagination',
  encapsulation: ViewEncapsulation.None,
  template     : `
    <ul class="ant-pagination ant-pagination-simple" *ngIf="nzSimple">
      <li
        title="上一页"
        class="ant-pagination-prev"
        (click)="_jumpPage(_current-1)"
        [class.ant-pagination-disabled]="_isFirstIndex">
        <a></a>
      </li>
      <li [attr.title]="_current+'/'+_lastIndex" class="ant-pagination-simple-pager">
        <input [(ngModel)]="nzPageIndex" size="3"><span class="ant-pagination-slash">／</span>{{_lastIndex}}
      </li>
      <li
        title="下一页"
        class="ant-pagination-next"
        (click)="_jumpPage(_current+1)"
        [class.ant-pagination-disabled]="_isLastIndex">
        <a></a>
      </li>
    </ul>
    <ul *ngIf="!nzSimple" class="ant-pagination" [class.mini]="nzSize=='small'">
      <span class="ant-pagination-total-text" *ngIf="nzShowTotal">共 {{_total}} 条</span>
      <li
        title="上一页"
        class="ant-pagination-prev"
        (click)="_jumpPage(_current-1)"
        [class.ant-pagination-disabled]="_isFirstIndex"
        [class.ant-pagination-item-active]="_isFirstIndex">
        <a></a>
      </li>
      <li
        title="第一页"
        class="ant-pagination-item"
        (click)="_jumpPage(_firstIndex)"
        [class.ant-pagination-item-active]="_isFirstIndex">
        <a>{{_firstIndex}}</a>
      </li>
      <li
        [attr.title]="'向前 '+_roundPageSize+' 页'"
        (click)="_jumpBefore(_pageSize)"
        class="ant-pagination-jump-prev"
        *ngIf="(_lastIndex >9)&&(_current-3>_firstIndex)">
        <a></a>
      </li>
      <li
        *ngFor="let page of _pages"
        [attr.title]="page.index"
        class="ant-pagination-item"
        (click)="_jumpPage(page.index)"
        [class.ant-pagination-item-active]="_current==page.index">
        <a>{{page.index}}</a>
      </li>
      <li
        [attr.title]="'向后 '+_roundPageSize+' 页'"
        (click)="_jumpAfter(_pageSize)"
        class="ant-pagination-jump-next"
        *ngIf="(_lastIndex >9)&&(_current+3<_lastIndex)">
        <a></a>
      </li>
      <li
        [attr.title]="'最后一页: '+_lastIndex"
        class="ant-pagination-item"
        (click)="_jumpPage(_lastIndex)"
        *ngIf="(_lastIndex>0)&&(_lastIndex!==_firstIndex)"
        [class.ant-pagination-item-active]="_isLastIndex">
        <a>{{_lastIndex}}</a>
      </li>
      <li
        title="下一页"
        class="ant-pagination-next"
        (click)="_jumpPage(_current+1)"
        [class.ant-pagination-disabled]="_isLastIndex"
        [class.ant-pagination-item-active]="_isLastIndex">
        <a></a>
      </li>
      <div class="ant-pagination-options">
        <nz-select
          *ngIf="nzShowSizeChanger"
          [nzSize]="nzSize=='small'?'small':''"
          class="ant-pagination-options-size-changer"
          [ngModel]="_pageSize"
          (ngModelChange)="_pageSizeChange($event)">
          <nz-option
            *ngFor="let option of _options"
            [nzLabel]="option+ '条/页'"
            [nzValue]="option">
          </nz-option>
          <nz-option
            *ngIf="_options.indexOf(nzPageSize)==-1"
            [nzLabel]="nzPageSize+ '条/页'"
            [nzValue]="nzPageSize">
          </nz-option>
        </nz-select>
        <div class="ant-pagination-options-quick-jumper"
          *ngIf="nzShowQuickJumper">
          跳至<input [(ngModel)]="nzPageIndex">页
        </div>
      </div>
    </ul>`,
  styleUrls    : [
    './style/index.less'
  ]
})
export class NzPaginationComponent {
  _el: HTMLElement;
  _current = 1;
  _total: number;
  _pageSize = 10;
  _firstIndex = 1;
  _lastIndex = Infinity;
  _pages = [];
  _options = [ 10, 20, 30, 40, 50 ];
  _showSizeChanger = false;
  _showQuickJumper = false;
  _showTotal = false;
  _simple = false;

  @Input()
  set nzShowSizeChanger(value: boolean|string) {
    if (value === '') {
      this._showSizeChanger = true;
    } else {
      this._showSizeChanger = value as boolean;
    }
  }

  get nzShowSizeChanger() {
    return this._showSizeChanger;
  }


  @Input()
  set nzShowQuickJumper(value: boolean|string) {
    if (value === '') {
      this._showQuickJumper = true;
    } else {
      this._showQuickJumper = value as boolean;
    }
  }

  get nzShowQuickJumper() {
    return this._showQuickJumper;
  }


  @Input()
  set nzShowTotal(value: boolean|string) {
    if (value === '') {
      this._showTotal = true;
    } else {
      this._showTotal = value as boolean;
    }
  }

  get nzShowTotal() {
    return this._showTotal;
  }

  @Input()
  set nzSimple(value: boolean|string) {
    if (value === '') {
      this._simple = true;
    } else {
      this._simple = value as boolean;
    }
  }

  get nzSimple() {
    return this._simple;
  }

  @Input() nzSize: string;

  @Output() nzPageSizeChange: EventEmitter<number> = new EventEmitter();
  @Output() nzPageIndexChange: EventEmitter<number> = new EventEmitter();
  @Output() nzPageIndexClickChange: EventEmitter<number> = new EventEmitter();

  _jumpBefore(pageSize) {
    this._jumpPage(this._current - Math.round(pageSize / 2));
  }

  _jumpAfter(pageSize) {
    this._jumpPage(this._current + Math.round(pageSize / 2));
  }


  @Input()
  get nzPageIndex(): number {
    return this._current;
  };

  set nzPageIndex(value: number) {
    if (this._current === value) {
      return;
    }
    if (value > this._lastIndex || value < this._firstIndex) {
      return;
    }
    this._current = Number(value);
    this._buildIndexes();
  };

  @Input()
  get nzPageSize(): number {
    return this._pageSize;
  };

  set nzPageSize(value: number) {
    if (value === this._pageSize) {
      return;
    }
    this._pageSize = value;
    this.nzPageIndexChange.emit(this.nzPageIndex);
    this._buildIndexes();
  };

  @Input()
  get nzTotal(): number {
    return this._total;
  };

  set nzTotal(value: number) {
    if (value === this._total) {
      return;
    }
    this._total = value;
    this._buildIndexes();

  }


  _pageSizeChange($event) {
    this.nzPageSize = $event;
    this.nzPageSizeChange.emit($event);
  }

  /** generate indexes list */
  _buildIndexes() {
    this._lastIndex = Math.ceil(this._total / this._pageSize);
    if (this._current > this._lastIndex) {
      this._jumpPage(this._lastIndex);
    }
    const tmpPages = [];
    if (this._lastIndex <= 9) {
      for (let i = 2; i <= this._lastIndex - 1; i++) {
        tmpPages.push({ index: i });
      }
    } else {
      const current = +this._current;
      let left = Math.max(2, current - 2);
      let right = Math.min(current + 2, this._lastIndex - 1);

      if (current - 1 <= 2) {
        right = 5;
      }

      if (this._lastIndex - current <= 2) {
        left = this._lastIndex - 4;
      }

      for (let i = left; i <= right; i++) {
        tmpPages.push({ index: i });
      }
    }
    this._pages = tmpPages;
  }

  _jumpPage(index) {
    if (index < this._firstIndex) {
      this.nzPageIndex = this._firstIndex;
    } else if (index > this._lastIndex) {
      this.nzPageIndex = this._lastIndex;
    } else {
      this.nzPageIndex = index;
    }
    this.nzPageIndexClickChange.emit(this.nzPageIndex);
  }

  get _isLastIndex() {
    return this._current === this._lastIndex;
  }

  get _isFirstIndex() {
    return this._current === this._firstIndex;
  }

  get _roundPageSize() {
    return Math.round(this._pageSize / 2);
  }

  constructor(private _elementRef: ElementRef) {
    this._el = this._elementRef.nativeElement;
  }
}
