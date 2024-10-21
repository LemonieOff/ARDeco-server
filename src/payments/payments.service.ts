import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import * as PDFDocument from "pdfkit";
import { Catalog } from "src/catalog/models/catalog.entity";
import { Order } from "../order/models/order.entity";

/* TODO : Take inspiration from this code to put the invoice creation in order.service.ts (and call it from controller)
 */

@Injectable()
export class PaymentsService {
    async createInvoice(order: Order) {
        console.log(`Creating invoice pdf for order ${order.id}`);

        const invoiceFileName = `invoice_${order.id}.pdf`;

        let invoicesDir = process.env.ARDECO_INVOICES_DIR || path.join(__dirname, "../..", "ardeco_invoices");
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir);
        }
        const invoicePath = path.join(__dirname, "../..", "ardeco_invoices", invoiceFileName);

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));

        this.generateHeader(pdfDoc, order);

        const values = order.furniture.split(",");
        let itemsInCart = [];
        let y = 1;

        pdfDoc.text("Nom", 50, 280)
            .text("Fournisseur", 150, 280)
            .text("Prix", 280, 280, { width: 90, align: "right" })
            .text("Taxe %", 0, 280, { align: "right" });

        for (let i = 0; i != values.length; i++) { // A pour fonction de convertir les id des meubles en json de meuble
            const parsedId = parseInt(values[i]);
            if (isNaN(parsedId)) {
                console.error(`Invalid id: ${values[i]}`);
            } else {
                if (item) {
                    await this.addItem(pdfDoc, order, item, y * 30 + 280);
                    y += 1;
                } else {
                    console.log("Non existing furniture");
                }
            }
        }
        this.addCommandPrice(pdfDoc, order.total_taxes, y * 30 + 280, "Prix HT");
        this.addCommandPrice(pdfDoc, order.total_amount, y * 30 + 310, "Prix TTC");
        this.generateFooter(pdfDoc, order);

        pdfDoc.end();
    }

    private async generateHeader(pdfDoc: PDFKit.PDFDocument, order: Order) {
        pdfDoc.image("ardeco_logo.png", 50, 45, { width: 50 })
            .fillColor("#444444")
            .fontSize(20)
            .text("ARDeco", 110, 57)
            .fontSize(10)
            .text("La place rouge", 200, 65, { align: "right" })
            .text("Moscou", 200, 80, { align: "right" })
            .moveDown()
            .text(`N° Facture: ${order.id}`, 50, 200)
            .text(`Date de paiement: ${order.datetime.toUTCString()}`, 50, 215)
            .text(`Total: ${order.total_amount}`, 50, 130)

            .text(order.name, 300, 200)
            .text(order.delivery_adress_line_1, 300, 215)
            .text(
                `${order.delivery_city}, ${order.delivery_country}, ${order.delivery_postal_code} ${order.delivery_region}`,
                300,
                150
            );
    }

    private async addItem(pdfDoc: PDFKit.PDFDocument, order: Order, item: Catalog, y: number) {
        pdfDoc.fontSize(10)
            .text(item.name, 50, y)
            .text(item.company_name, 150, y)
            .text(String(item.price), 280, y, { width: 90, align: "right" })
            .text(order.total_taxes, 0, y, { align: "right" })
            .strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, y - 13)
            .lineTo(550, y - 13)
            .stroke()
            .moveDown();
    }

    private async addCommandPrice(pdfDoc: PDFKit.PDFDocument, price: number, y: number, label: string) {
        pdfDoc.fontSize(10)
            .text(label, 450, y, { align: "left" })
            .text(String(price), 0, y, { align: "right" })
            .strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, y - 13)
            .lineTo(550, y - 13)
            .stroke()
            .moveDown();
    }

    private async generateFooter(pdfDoc: PDFKit.PDFDocument, order: Order) {

    }
}
