declare module "page-flip" {
  export class PageFlip {
    constructor(el: HTMLElement, settings: Record<string, unknown>);
    loadFromImages(urls: string[]): void;
    destroy(): void;
    on(event: "init" | "flip", cb: (e: { data: unknown; object: PageFlip }) => void): PageFlip;
    flipNext(corner?: string): void;
    flipPrev(corner?: string): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
  }
}
