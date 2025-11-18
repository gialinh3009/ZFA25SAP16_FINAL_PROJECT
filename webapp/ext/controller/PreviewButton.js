sap.ui.define([
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/Label",
  "sap/m/Button",
  "sap/m/DatePicker",
  "sap/m/Input",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/ui/core/HTML",
  "sap/m/IconTabBar",
  "sap/m/IconTabFilter",
  "sap/ui/core/util/File"
], function (
  MessageToast, Dialog, Label, Button, DatePicker, Input, Select, Item, HTML, IconTabBar, IconTabFilter, FileUtil
) {
  "use strict";

  return {
    onPreviewPress: async function (oContext, aSelectedContexts) {
      if (!aSelectedContexts || !aSelectedContexts.length) {
        MessageToast.show("Please select at least one document.");
        return;
      }

      const aItemTypes = aSelectedContexts.map(ctx => ctx.getObject().ItemType).filter(Boolean);
      const bAllSame = aItemTypes.length > 0 && aItemTypes.every(t => t === aItemTypes[0]);
      const sDefaultItemType = bAllSame ? aItemTypes[0] : "";

      if (!bAllSame) {
        MessageToast.show("Warning: Selected documents have different item types.");
      }

      const oDialog = new Dialog({
        title: "Preview Multiple Documents",
        contentWidth: "400px",
        contentHeight: "320px",
        resizable: true,
        draggable: true,
        content: [
          new Label({ text: "Item Type:", design: "Bold" }),
          new Input({
            value: sDefaultItemType,
            placeholder: bAllSame ? "" : "Enter Item Type (varies by doc)"
          }),
          new Label({ text: "Print Date:", design: "Bold" }),
          new DatePicker({
            value: new Date().toISOString().split("T")[0],
            valueFormat: "yyyy-MM-dd",
            displayFormat: "long"
          }),
          new Label({ text: "Language:", design: "Bold" }),
          new Select({
            width: "100%",
            selectedKey: "E",
            items: [
              new Item({ key: "E", text: "English (E)" }),
              new Item({ key: "V", text: "Vietnamese (V)" })
            ]
          })
        ],
        beginButton: new Button({
          text: "Preview All",
          type: "Emphasized",
          press: async () => {
            const sItemTypeInput = oDialog.getContent()[1].getValue();
            const sPrintDate = oDialog.getContent()[3].getValue();
            const sLang = oDialog.getContent()[5].getSelectedKey();
            const sBaseUrl = "/sap/opu/odata4/sap/zsd_alldoc_srv_b/srvd/sap/zsd_alldoc_srv_d/0001";

            try {
              const tokenResponse = await fetch(`${sBaseUrl}/$metadata`, {
                method: "GET",
                headers: { "X-CSRF-Token": "Fetch" }
              });
              const sToken = tokenResponse.headers.get("x-csrf-token");

              const aTabs = [];
              const aBlobs = [];

              for (const ctx of aSelectedContexts) {
                const oDoc = ctx.getObject();
                const sAppType = encodeURIComponent(oDoc.ApplicationType);
                const sDocNo = encodeURIComponent(oDoc.DocumentNumber);

                const sItemTypeForDoc = sItemTypeInput || oDoc.ItemType;

                const sUrl =
                  `${sBaseUrl}/ZC_SD_AllDoc_H(ApplicationType='${sAppType}',DocumentNumber='${sDocNo}')/com.sap.gateway.srvd.zsd_alldoc_srv_d.v0001.preview_pdf`;

                const oResponse = await fetch(sUrl, {
                  method: "POST",
                  headers: {
                    "X-CSRF-Token": sToken,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                  },
                  body: JSON.stringify({
                    DOCUMENTNO: oDoc.DocumentNumber,
                    ITEMTYPE: sItemTypeForDoc,
                    PRINTDATE: sPrintDate,
                    LANGUAGE: sLang
                  })
                });

                if (!oResponse.ok) continue;

                const oData = await oResponse.json();
                const oResult = oData.d?.results?.[0] || oData.d || oData;
                const sPdfB64 = oResult.pdf_base64 || oResult.PDF_BASE64;

                if (sPdfB64) {
                  const byteChars = atob(sPdfB64);
                  const byteNums = new Array(byteChars.length);
                  for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
                  const byteArray = new Uint8Array(byteNums);
                  const blob = new Blob([byteArray], { type: "application/pdf" });
                  const blobUrl = URL.createObjectURL(blob);

                  aBlobs.push({ blob, name: `SO_${oDoc.DocumentNumber}.pdf` });

                  aTabs.push(
                    new IconTabFilter({
                      text: `${oDoc.DocumentNumber}`,
                      content: [
                        new HTML({
                          content: `
                            <div style="height:100%;width:100%;display:flex;flex-direction:column;">
                              <iframe 
                                src="${blobUrl}#view=FitH"
                                style="flex:1;border:none;width:100%;height:100%;" 
                                allowfullscreen
                              ></iframe>
                            </div>`
                        })
                      ]
                    })
                  );
                }
              }

              const oPdfDialog = new Dialog({
                title: "Multiple PDF Preview",
                contentWidth: "90%",
                contentHeight: "90%",
                resizable: true,
                draggable: true,
                content: [
                  new IconTabBar({
                    expanded: true,
                    stretchContentHeight: true,
                    items: aTabs
                  })
                ],
                beginButton: new Button({
                  text: "Download All",
                  type: "Emphasized",
                  press: function () {
                    aBlobs.forEach(f =>
                      FileUtil.save(
                        f.blob,
                        f.name.replace(".pdf", ""),
                        "pdf",
                        "application/pdf",
                        "UTF-8",
                        false
                      )
                    );
                  }
                }),
                endButton: new Button({
                  text: "Close",
                  press: () => oPdfDialog.close()
                }),
                afterClose: () => oPdfDialog.destroy()
              });

              oPdfDialog.open();
            } catch (e) {
              console.error(e);
              MessageToast.show("Error generating PDFs: " + e.message);
            }

            oDialog.close();
          }
        }),
        endButton: new Button({
          text: "Cancel",
          press: () => oDialog.close()
        })
      });

      oDialog.open();
    }
  };
});
