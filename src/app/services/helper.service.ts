import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class HelperService {
  constructor() {}
  public refreshTable = new Subject();

  toParamString(paramObj) {
    if (paramObj) {
      let str = new URLSearchParams(paramObj);
      return `?${str.toString()}`;
    } else {
      return "";
    }
  }

  getUpdatedValue(data, item, key = "uuid") {
    let arr = data.slice();
    let isExist = false;
    arr = arr.map((value) => {
      if (value[key] === item[key]) {
        value = item;
        isExist = true;
      }
      return value;
    });
    if (!isExist) arr.push(item);
    return [...arr];
  }

  checkIfRoleExists(role: string, roles: any) {
    let exists = false;
    roles.forEach((r: any) => {
      if (r.name == role) {
        exists = true;
      }
    });
    return exists;
  }

  private readonly partogramPrintCss = `
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: 'DM Sans', Arial, sans-serif; }
    #print-wrapper { display: inline-block; transform-origin: top left; }
    table { width: max-content; border-collapse: collapse; font-family: 'DM Sans', Arial, sans-serif; table-layout: auto; }
    .table-bordered { border: 1px solid #000 !important; }
    .table-bordered th,
    .table-bordered td { border: 1px solid #000; text-align: center; vertical-align: middle; padding: 0.4rem; font-size: 11px; font-weight: bold; white-space: nowrap; }
    .table-bordered td.nb { border: none; }
    .table-bordered td.brd { border-right-style: dotted; }
    .table-bordered td.bld { border-left-style: dotted; }
    .table-bordered td.brn { border-right-style: none; }
    .table-bordered td.bln { border-left-style: none; }
    .table-bordered td.divider { border: none; padding: 0.15rem; }
    .table-bordered td.divider2 { border: none; padding: 0; position: relative; }
    .value-item { color: #007bff; border-radius: 50%; width: fit-content; padding: 2px; min-width: 20px; margin: 0 auto; }
    .value-item.red { border: 2px solid #ED1A56; }
    .value-item.yellow { border: 2px solid #FD8C3E; }
    .value-item.green { border: 2px solid #019283; }
    .value-item.vertical { writing-mode: vertical-rl; transform: rotate(180deg); max-height: 100px; white-space: normal; }
    .value-item.note { writing-mode: vertical-rl; transform: rotate(180deg); max-height: 350px; border-radius: 0; word-break: break-word; white-space: normal; }
    .value-item.note span { color: #212529; }
    .page-title-row td { text-align: left; font-size: 14px; border: none; color: #007bff; white-space: normal; }
    .page-title-row td span { color: #000; }
    .page-title-row-2 td { background-color: #FFE9EF; text-align: left; font-size: 14px; color: red; white-space: normal; }
    .page-title-row-2 td span { color: #000; }
    .alert-row td { text-shadow: 0 0 1px #000; }
    .alert-row td span { white-space: nowrap; margin: 0 5px; }
    .alert-row td .d-flex { display: flex; align-items: center; }
    .alert-row td .arrow { width: 100%; height: 2px; background: #000; position: relative; }
    .alert-row td .arrow.left::before { position: absolute; content: ''; width: 0; height: 0; left: -6px; top: 50%; transform: translateY(-50%); border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-right: 6px solid #000; }
    .alert-row td .arrow.right::after { position: absolute; content: ''; width: 0; height: 0; right: -6px; top: 50%; transform: translateY(-50%); border-top: 6px solid transparent; border-bottom: 6px solid transparent; border-left: 6px solid #000; }
    .vrt-header span { writing-mode: vertical-rl; transform: rotate(180deg); max-height: 300px; text-shadow: 0 0 1px #000; white-space: normal; }
    .bg-secondary { background-color: #6c757d !important; }
    .bg-white { background-color: #fff !important; }
    .sos { background-color: #FFE9EF !important; border: 2px solid red !important; }
    .sos .value-item h5 { text-align: center; color: red; font-weight: bold; margin-bottom: 0; }
    .birth-outcome-con { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(180deg); writing-mode: vertical-rl; max-height: 300px; font-size: 18px; color: #007bff; display: flex; align-items: center; justify-content: center; white-space: nowrap; padding: 10px 5px; }
    .footer-row td { text-align: left; white-space: normal; }
    .footer-row td span { font-weight: normal; }
    .d-flex { display: flex; }
    .align-items-center { align-items: center; }
    .justify-content-center { justify-content: center; }
    .flex-column { flex-direction: column; }
    h1 { font-size: 22px; font-weight: bold; text-align: center; margin: 0; }
    h5 { font-size: 14px; font-weight: bold; margin: 0; }
    mat-icon { font-family: 'Material Icons'; font-size: 18px; display: inline-block; vertical-align: middle; }
    @media print {
      @page { size: landscape; margin: 5mm; }
      html, body { margin: 0; padding: 0; }
    }
  `;

  /**
   * Opens the partogram table (identified by `tableId`) in a new window, scales it
   * to fit A4 landscape and triggers the browser print dialog. Shared by the
   * partogram and epartogram views.
   */
  printPartogram(tableId: string, title: string = "Partogram") {
    const tableEl = document.getElementById(tableId);
    if (!tableEl) {
      globalThis.print();
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    // Off-screen but with a real size so the table lays out and measures
    // correctly (a 0x0 iframe reports wrong widths).
    iframe.style.cssText = "position:fixed;left:-10000px;top:0;width:1400px;height:1600px;border:0;";
    document.body.appendChild(iframe);

    const frameWin = iframe.contentWindow;
    const frameDoc = frameWin?.document;
    if (!frameWin || !frameDoc) {
      iframe.remove();
      globalThis.print();
      return;
    }

    frameDoc.open();
    frameDoc.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>${this.partogramPrintCss}</style>
  </head>
  <body>
    <div id="print-wrapper">
      <table class="table table-bordered bg-white">${tableEl.innerHTML}</table>
    </div>
  </body>
</html>`);
    frameDoc.close();

    // The browser derives the Save-as-PDF filename from the top-level page's
    // document.title (not the iframe's), so temporarily switch it to the report
    // name for the print and restore it afterwards.
    const prevDocTitle = document.title;
    const cleanup = () => {
      document.title = prevDocTitle;
      if (iframe.parentNode) { iframe.parentNode.removeChild(iframe); }
    };
    frameWin.onafterprint = cleanup;

    const scaleAndPrint = () => {
      const wrapper = frameDoc.getElementById("print-wrapper");
      const table = wrapper ? (wrapper.querySelector("table") as HTMLElement | null) : null;
      if (wrapper && table) {
        // A4 landscape printable area at 96dpi with 5mm margins (~1085 x 756);
        // stay a little under to avoid spilling onto a second/blank page.
        const printableWidth = 1080;
        const printableHeight = 740;

        // Measure the natural (unscaled) size of the whole guide. scrollWidth/
        // scrollHeight give the real content size regardless of the iframe size.
        wrapper.style.display = "inline-block";
        wrapper.style.transform = "none";
        wrapper.style.margin = "0";
        const naturalWidth = table.scrollWidth;
        const naturalHeight = table.scrollHeight;

        // Fit the whole guide onto one page in BOTH dimensions (never enlarge).
        let scale = Math.min(printableWidth / naturalWidth, printableHeight / naturalHeight);
        if (scale > 1) { scale = 1; }

        // Use `transform: scale()` (not `zoom`) so the table borders scale down
        // with the content and stay thin rather than looking bold. A transform
        // doesn't shrink the layout box, so collapse the reserved space with
        // negative margins — that keeps it to one page with nothing clipped.
        wrapper.style.transformOrigin = "top left";
        wrapper.style.transform = "scale(" + scale + ")";
        wrapper.style.marginRight = ((scale - 1) * naturalWidth) + "px";
        wrapper.style.marginBottom = ((scale - 1) * naturalHeight) + "px";
      }
      // Set the filename (via document.title) just before opening the dialog.
      document.title = title || prevDocTitle;
      frameWin.focus();
      frameWin.print();
      // Fallback cleanup in case onafterprint never fires (some mobile browsers).
      setTimeout(cleanup, 60000);
    };

    // Wait for fonts (including the async Material Icons webfont) to load before
    // measuring — otherwise the table is measured shorter than it prints and the
    // bottom gets clipped. Falls back to a timeout if the Font Loading API is
    // unavailable or never resolves.
    const fonts = (frameDoc as any).fonts;
    let started = false;
    const run = () => { if (!started) { started = true; scaleAndPrint(); } };
    if (fonts && fonts.ready && typeof fonts.ready.then === "function") {
      fonts.ready.then(() => setTimeout(run, 150));
      setTimeout(run, 2000);
    } else {
      setTimeout(run, 600);
    }
  }
}
