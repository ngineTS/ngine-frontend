import { Directive, ElementRef, EventEmitter, OnDestroy, Output } from "@angular/core";

@Directive({
  selector: '[appResizeObserver]'
})
export class ResizeObserverDirective implements OnDestroy {
  private observer: ResizeObserver;

  @Output() resize = new EventEmitter<DOMRectReadOnly>();

  constructor(private el: ElementRef) {
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        this.resize.emit(entry.contentRect);
      }
    });
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    this.observer.unobserve(this.el.nativeElement);
    this.observer.disconnect();
  }
}