import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy
} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Directive({
  selector: '[ellipsis-angular]',
})
export class EllipsisAngularDirective implements OnDestroy {
  private ellipsisSymbol = '&hellip;'
  private ellipsisSeparator = ' ';
  private ellipsisSeparatorReg = new RegExp('[' + this.ellipsisSeparator + ']+', 'gm');
  private unclosedHTMLTagMatcher = /<[^>]*$/;
  private lastWindowResizeTime = 0;
  private lastWindowResizeWidth = 0;
  private lastWindowResizeHeight = 0;
  private lastWindowTimeoutEvent = null;
  private isTruncated = false;

  private observer = new MutationObserver(() => this.ellipsis());

  constructor(private el: ElementRef,
              private sanitizer: DomSanitizer) {
  }

  private trustAsHtml(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(text);
  }

  private ellipsis() {
    let trustedHtml = this.trustAsHtml(this.el.nativeElement.innerHTML);
    const domElement = this.el.nativeElement;

    if (trustedHtml) {
      domElement.innerHTML = trustedHtml.toString();
      // When the text has overflow
      if (this.isOverflowed()) {
        const initialMaxHeight = domElement.clientHeight;
        const initialMaxWidth = domElement.clientWidth;
        const separatorLocations = [];

        let match;
        // tslint:disable-next-line:no-conditional-assignment
        while ((match = this.ellipsisSeparatorReg.exec(trustedHtml.toString())) !== null) {
          separatorLocations.push(match.index);
        }

        // We know the text overflows and there are no natural breakpoints so we build a new index
        // With this index it will search for the best truncate location instead of for the best ellipsisSeparator location
        if (separatorLocations.length === 0) {
          let textLength = 5;
          while (textLength <= trustedHtml.toString().length) {
            separatorLocations.push(textLength);
            textLength += 5;
          }
          separatorLocations.push(trustedHtml.toString().length);
        }
        let lowerBound = 0;
        let upperBound = separatorLocations.length - 1;
        let textCutOffIndex, range;
        // Loop while upper bound and lower bound are not confined to the smallest range yet
        while (true) {
          // This is an implementation of a binary search as we try to find the overflow position as quickly as possible
          range = upperBound - lowerBound;
          // tslint:disable-next-line:no-bitwise
          textCutOffIndex = lowerBound + (range >> 1);
          if (range <= 1) {
            break;
          } else {
            if (this.fastIsOverflowing(
              this.getTextUpToIndex(trustedHtml.toString(), separatorLocations, textCutOffIndex) + this.ellipsisSymbol,
              initialMaxHeight, initialMaxWidth)
            ) {
              // The match was in the lower half, excluding the previous upper part
              upperBound = textCutOffIndex;
            } else {
              // The match was in the upper half, excluding the previous lower part
              lowerBound = textCutOffIndex;
            }
          }
        }
        // We finished the search now we set the new text through the correct trustedHtml api
        this.isTruncated = true;
        domElement.innerHTML = this.getTextUpToIndex(trustedHtml.toString(), separatorLocations, textCutOffIndex) + this.ellipsisSymbol;

        //Set data-overflow class on element for css stying
        domElement.classList.add('html-overflowed');
      } else {
        domElement.classList.remove('html-overflowed');
      }
    } else if (trustedHtml === '') {
      domElement.innerHTML = '';
      domElement.classList.remove('html-overflowed');
    }
  }

  private isOverflowed(): boolean {
    const elDomNode = this.el.nativeElement;
    return (elDomNode.scrollHeight > elDomNode.clientHeight) || (elDomNode.scrollWidth > elDomNode.clientWidth);
  }

  private fastIsOverflowing(text: string, initialMaxHeight: number, initialMaxWidth: number): boolean {
    const elDomNode = this.el.nativeElement;
    elDomNode.innerHTML = text;
    return (elDomNode.scrollHeight > initialMaxHeight) || (elDomNode.scrollWidth > initialMaxWidth);
  }

  private getTextUpToIndex(htmlText: string, separatorLocations: number[], index: number): string {
    return htmlText.substring(0, separatorLocations[index]).replace(this.unclosedHTMLTagMatcher, '');
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.ellipsis();
  }

  ngOnDestroy() {
    // Destroy observer
    this.observer.disconnect();
  }

  ngAfterViewInit() {
    // Watch for DOM changes
    this.observer.observe(this.el.nativeElement, { attributes: false, childList: true, subtree: true });
  }

  // TODO: look at source
}
