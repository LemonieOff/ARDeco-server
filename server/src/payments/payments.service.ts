import { Injectable } from "@nestjs/common";
import Stripe from "stripe";
import { InjectRepository } from "@nestjs/typeorm";
import { CommandFailedEvent, Repository, UpdateResult } from "typeorm";
import { command } from "./models/command.entity";
import { QueryPartialEntity } from "typeorm/query-builder/QueryPartialEntity";
import { commandDto } from "./models/command.dto";
import * as fs from 'fs';
import * as path from 'path';
import * as PDFDocument from 'pdfkit';
import { CatalogService } from "src/catalog/catalog.service";
import { Catalog } from "src/catalog/models/catalog.entity";




// TEST : sk_test_51NputjKvy7BFowS9fdbY0S1Zjp0HDC2WRZwp8vRzyHSAsUOSOxfzWNCF0nboryWA8Jp5ZJZVHWgPQI8orwTzYCZD00dGeVzihA
// TRUE : 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

@Injectable()
export class PaymentsService {
    private stripe;

    constructor(
        @InjectRepository(command)
        private readonly commandRepository: Repository<command>,
        private catalogService: CatalogService,
    ) {
        this.stripe = new Stripe(
            "sk_test_51NputjKvy7BFowS9fdbY0S1Zjp0HDC2WRZwp8vRzyHSAsUOSOxfzWNCF0nboryWA8Jp5ZJZVHWgPQI8orwTzYCZD00dGeVzihA",
            {
                apiVersion: "2023-08-16"
            }
        );

    }

    createPayment(paymentRequestBody: commandDto): Promise<any> {
        let sumAmount = 0;
        //    paymentRequestBody.products.forEach((product) => {
        //      sumAmount = sumAmount + product.price * product.quantity;
        //    });
    
        return this.stripe.paymentIntents.create({
            amount: paymentRequestBody.total_amount,
            currency: "eur",
            payment_method_types: ["card"]
        });
    }

    private async generateHeader(pdfDoc: PDFDocument, command: command) {
        pdfDoc.image('ardeco_logo.png', 50, 45, { width: 50 })
            .fillColor('#444444')
            .fontSize(20)
            .text('ARDeco', 110, 57)
            .fontSize(10)
            .text('La place rouge', 200, 65, { align: 'right' })
            .text('Moscou', 200, 80, { align: 'right' })
            .moveDown()
            .text(`N° Facture: ${command.id}`, 50, 200)
            .text(`Date de paiement: ${command.datetime.toUTCString()}`, 50, 215)
            .text(`Total: ${command.total_amount}`, 50, 130)

            .text(command.name, 300, 200)
            .text(command.delivery_adress_line_1, 300, 215)
            .text(
                `${command.delivery_city}, ${command.delivery_country}, ${command.delivery_postal_code} ${command.delivery_region}`,
                300,
                150,
            )
    }

    private async addItem(pdfDoc: PDFDocument, command: command, item: Catalog, y: number) {
        pdfDoc.fontSize(10)
            .text(item.name, 50, y)
            .text(item.company_name, 150, y)
            .text(item.price, 280, y, { width: 90, align: 'right' })
            .text(command.total_taxes, 0, y, { align: 'right' })
            .strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, y - 13)
            .lineTo(550, y - 13)
            .stroke()
            .moveDown();
    }

    private async addCommandPrice(pdfDoc: PDFDocument, price: number, y: number, label: string) {
        pdfDoc.fontSize(10)
            .text(label, 450, y, { align: 'left' })
            .text(price, 0, y, { align: 'right' })
            .strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, y - 13)
            .lineTo(550, y - 13)
            .stroke()
            .moveDown();
    }

    private async generateFooter(pdfDoc: PDFDocument, command: command) {

    }

    async createInvoice(id: number) {
        console.log(id)
        const command = await this.findOne({ id: id });
        console.log(command)
        if (command == null)
            return "Error"

        const invoiceFileName = `invoice_${command.id}.pdf`;

        let invoicesDir = process.env.ARDECO_INVOICES_DIR || path.join(__dirname, '../..', 'ardeco_invoices');
        if (!fs.existsSync(invoicesDir)) {
            fs.mkdirSync(invoicesDir);
        }
        const invoicePath = path.join(__dirname, '../..', 'ardeco_invoices', invoiceFileName);

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));

        this.generateHeader(pdfDoc, command)

        const values = command.furniture.split(",");
        let itemsInCart = []
        let y = 1

        pdfDoc.
            text("Nom", 50, 280)
            .text("Fournisseur", 150, 280)
            .text("Prix", 280, 280, { width: 90, align: 'right' })
            .text("Taxe %", 0, 280, { align: 'right' })

        for (let i = 0; i != values.length; i++) { // A pour fonction de convertir les id des meubles en json de meuble
            const parsedId = parseInt(values[i]);
            if (isNaN(parsedId)) {
                console.error(`Invalid id: ${values[i]}`);
            } else {
                let item: Catalog = await this.catalogService.findOne({ id: parsedId })
                if (item) {
                    await this.addItem(pdfDoc, command, item, y * 30 + 280);
                    y += 1
                } else {
                    console.log("Non existing furniture")
                }
            }
        }
        this.addCommandPrice(pdfDoc, command.total_taxes, y * 30 + 280, "Prix HT")
        this.addCommandPrice(pdfDoc, command.total_amount, y * 30 + 310, "Prix TTC")
        this.generateFooter(pdfDoc, command)

        pdfDoc.end();
    }

    async confirmPayment(paymentIntentId, order : command, mail: string): Promise<any> {
        
        const axios = require('axios');
        
        let dataInvoice = JSON.stringify({
            "id": order.id
          });
          
          let configInvoice = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.ardeco.app/payments/invoice',
            headers: { 
              'Content-Type': 'application/json'
            },
            data : dataInvoice
          };
          axios.request(configInvoice)
          .then((response) => {
            console.log(JSON.stringify(response.data));
          })
          .catch((error) => {
            console.log(error);
          });
        
        
        let dataMail = JSON.stringify({
            "email": mail,
            "id_invoice": order.id,
            "name": order.name,
            "total": order.total_amount
        });
        let configMail = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.ardeco.app/mail/invoice',
            headers: {
                'Content-Type': 'application/json'
            },
            data: dataMail
        };

        axios.request(configMail)
            .then((response) => {
                console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
                console.log(error);
            });
        
        
        return await this.stripe.paymentIntents.confirm(paymentIntentId, {
            payment_method: "pm_card_visa"
        });
    }

    async all(): Promise<command[]> {
        return this.commandRepository.find();
    }

    async create(data): Promise<command> {
        const u = this.commandRepository.save(data);
        console.log("Create command :", await u);
        return u;
    }

    async findOne(condit): Promise<command> {
        return this.commandRepository.findOne({ where: condit });
    }

    async update(
        id: number,
        data: QueryPartialEntity<command>
    ): Promise<UpdateResult> {
        console.log("ID : ", id, ", DATA : ", data)
        return this.commandRepository.update(id, data);
    }

    async delete(id: number): Promise<any> {
        //return this.commandRepository.delete(id);
        console.log("Deleting command ", id);
        this.commandRepository
            .createQueryBuilder("command")
            .delete()
            .from(command)
            .where("id = id", { id: id })
            .execute();
    }
}
