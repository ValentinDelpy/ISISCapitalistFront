import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timer'
})
export class TimerPipe implements PipeTransform {

  private static chainage(val: number): string {
    let result: string;
    if (val >= 10) {
      result = val.toString();
    } else {
      result = '0' + val;
    }
    return result;
  }

  transform(value: number, ...args: any): string {
    let h = 0;
    let m = 0;
    let s = 0;
    if (value >= 3600) {
      h = Math.trunc(value / 3600);
      value = value - (h * 3600);
    }
    if (value >= 60) {
      m = Math.trunc(value / 60);
      value = value - (m * 60);
    }
    if (value < 60) {
      s = value;
    }
    return TimerPipe.chainage(h) + ':' + TimerPipe.chainage(m) + ':' + TimerPipe.chainage(s);
  }

}
