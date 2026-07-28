import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { jsPDF } from "jspdf";

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
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
    button[mat-icon-button], .mat-icon-button, .mat-mdc-icon-button, .mat-mdc-button-touch-target, .mat-mdc-button-ripple, .mat-mdc-focus-indicator { display: none !important; }
    @media print {
      @page { size: landscape; margin: 5mm; }
      html, body { margin: 0; padding: 0; }
    }
  `;


  /**
   * Prints the partogram table (identified by `tableId`) via the browser's native
   * print dialog (`window.print()`). Used by the epartogram print button.
   *
   * The table is written into an off-screen iframe with the shared print CSS and
   * printed from there so the surrounding app chrome is excluded. The browser's
   * print engine renders CSS 'writing-mode' correctly, so vertical text is
   * preserved.
   */
  async printPartogramNative(tableId: string, title: string = "Partogram") {
    const tableEl = document.getElementById(tableId);
    if (!tableEl) {
      return;
    }
    // The target IS a <table>, so re-wrap its rows in a fresh table element.
    await this.printHtmlNative(
      `<table class="table table-bordered bg-white">${tableEl.innerHTML}</table>`,
      title
    );
  }

  /**
   * Prints an arbitrary section (identified by `elementId`) via the browser's
   * native print dialog. Unlike `printPartogramNative`, the element's markup is
   * printed as-is, so it works for sections containing several tables (e.g. the
   * epartogram Stage 3 view).
   */
  async printSectionNative(elementId: string, title: string = "Partogram") {
    const el = document.getElementById(elementId);
    if (!el) {
      return;
    }
    await this.printHtmlNative(el.innerHTML, title);
  }

  /**
   * Writes `bodyHtml` into an off-screen iframe with the shared print CSS and
   * invokes the browser's native print dialog (`window.print()`) from there, so
   * the surrounding app chrome is excluded. Shared by the native-print helpers.
   *
   * A real print engine renders CSS 'writing-mode' correctly, so vertical text
   * is preserved.
   */
  private async printHtmlNative(bodyHtml: string, title: string = "Partogram") {
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
    <div id="print-wrapper">${bodyHtml}</div>
  </body>
</html>`);
    frameDoc.close();

    const cleanup = () => {
      if (iframe.parentNode) { iframe.parentNode.removeChild(iframe); }
    };

    // Wait for fonts (including the async Material Icons webfont) to load before
    // printing — otherwise the print preview is captured before glyphs render.
    // Falls back to a timeout if the Font Loading API is unavailable.
    const waitForFonts = () => new Promise<void>((resolve) => {
      const fonts = (frameDoc as any).fonts;
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(); } };
      if (fonts && fonts.ready && typeof fonts.ready.then === "function") {
        fonts.ready.then(() => setTimeout(finish, 150));
        setTimeout(finish, 2000);
      } else {
        setTimeout(finish, 600);
      }
    });

    const prevTitle = document.title;

    try {
      await waitForFonts();
      const wrapper = frameDoc.getElementById("print-wrapper");
      if (wrapper) {
        const PRINTABLE_WIDTH_PX = ((297 - 10) * 96) / 25.4;
        const contentWidth = wrapper.scrollWidth;
        if (contentWidth > PRINTABLE_WIDTH_PX) {
          const scale = PRINTABLE_WIDTH_PX / contentWidth;
          wrapper.style.transform = `scale(${scale})`;
          // A transform doesn't shrink the layout box, so reserve the scaled
          // height to avoid a trailing blank page.
          wrapper.style.height = `${wrapper.scrollHeight * scale}px`;
        }
      }
      // Remove the iframe and restore the page title once the print dialog is
      // dismissed. Guard against 'afterprint' never firing (some browsers) with a
      // fallback timeout.
      let cleaned = false;
      const cleanupOnce = () => {
        if (cleaned) { return; }
        cleaned = true;
        document.title = prevTitle;
        cleanup();
      };
      frameWin.addEventListener("afterprint", cleanupOnce);
      setTimeout(cleanupOnce, 60000);

      document.title = title;
      frameWin.focus();
      frameWin.print();
    } catch (err) {
      console.error("Failed to print partogram", err);
      document.title = prevTitle;
      cleanup();
    }
  }

  /**
   * Hands a generated PDF to the OS. On mobile (and any browser that supports
   * sharing files) this opens the native share sheet, which includes a "Print"
   * action (AirPrint on iOS, Print on Android) as well as Save/share targets —
   * this is how the user reaches a real print option inside the webview, where
   * `window.print()` does nothing. Falls back to a plain file download when file
   * sharing isn't available or the share is dismissed with an error.
   */
  async deliverPdf(pdf: jsPDF, filename: string, title: string = "Report") {
    const nav = navigator as any;
    try {
      const blob = pdf.output("blob");
      const file = new File([blob], filename, { type: "application/pdf" });
      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await nav.share({ files: [file], title });
          return;
        } catch (err) {
          // User dismissed the share sheet — don't also trigger a download.
          if (err && (err.name === "AbortError" || err.name === "NotAllowedError")) {
            return;
          }
          // Any other share failure falls through to a download below.
        }
      }
    } catch (err) {
      console.error("PDF share failed, falling back to download", err);
    }
    pdf.save(filename);
  }
}
