import { Controller, Get, Logger, Param, Post, Query, Req, Res, StreamableFile } from "@nestjs/common";
import { OrderService } from "./order.service";
import { Request, Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Order } from "./models/order.entity";
import { User } from "../user/models/user.entity";
import { UserService } from "../user/user.service";
import { createReadStream } from "fs";
import * as path from "path";
import { join } from "path";
import { CartService } from "../cart/cart.service";
import * as fs from "node:fs";
import PDFDocumentWithTables from "pdfkit-table";
import { MailService } from "../mail/mail.service";

enum GetMode {
    DEFAULT,
    ID,
    DETAILS
}

enum Type {
    GET_ALL,
    GET_USER,
    GET_ORDER,
    POST
}

type QueryMode = {
    mode: string | string[];
};

@Controller(["order", "order_history"])
export class OrderController {
    private readonly logger = new Logger(OrderController.name);

    constructor(
        private orderHistoryService: OrderService,
        private jwtService: JwtService,
        private userService: UserService,
        private cartService: CartService,
        private mailService: MailService
    ) {
    }

    @Get()
    async get(
        @Req() req: Request,
        @Query() query: QueryMode,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res, Type.GET_ALL);
        if (!(user instanceof User)) return user;

        const mode = this.selectGetMode(query);

        switch (mode) {
            case GetMode.DEFAULT:
                const totalOrdersNumber = await this.orderHistoryService.allIds();
                res.status(200);
                return {
                    status: "OK",
                    code: 200,
                    description: "Total number of orders",
                    data: totalOrdersNumber.length
                };
            case GetMode.ID:
                const totalOrders = await this.orderHistoryService.allIds();
                res.status(200);
                return {
                    status: "OK",
                    code: 200,
                    description: "All orders ids",
                    data: totalOrders
                };
            case GetMode.DETAILS:
                const totalOrdersDetails = await this.orderHistoryService.all();
                res.status(200);
                return {
                    status: "OK",
                    code: 200,
                    description: "All orders details",
                    data: totalOrdersDetails
                };
        }
    }

    @Get("/user/:user_id")
    async getUserOrders(
        @Req() req: Request,
        @Query() query: QueryMode,
        @Param("user_id") user_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res, Type.GET_USER, null, user_id);
        if (!(user instanceof User)) return user;

        const mode = this.selectGetMode(query);

        const totalOrders = await this.orderHistoryService.find({ user_id: user_id });

        switch (mode) {
            case GetMode.DEFAULT:
                res.status(200);
                return {
                    status: "OK",
                    code: 200,
                    description: "Total number of orders",
                    data: totalOrders.length
                };
            case GetMode.ID:
                res.status(200);
                return {
                    status: "OK",
                    code: 200,
                    description: "All orders ids",
                    data: totalOrders.map((item) => item.id)
                };
            case GetMode.DETAILS:
                res.status(200);
                return {
                    status: "OK",
                    code: 200,
                    description: "All orders details",
                    data: totalOrders
                };
        }
    }

    @Get("/order/:order_id")
    async getOrder(
        @Req() req: Request,
        @Param("order_id") order_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const order = await this.orderHistoryService.findOne({ id: order_id });

        const user = await this.checkAuthorization(req, res, Type.GET_ORDER, order);
        if (!(user instanceof User)) return user;

        res.status(200);
        return {
            status: "OK",
            code: 200,
            description: "Order item",
            data: order
        };
    }

    @Post()
    async post(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const user = await this.checkAuthorization(req, res, Type.POST);
        if (!(user instanceof User)) return user;

        const cart = await this.cartService.getCartForUser(user.id);
        if (!cart) {
            res.status(404);
            return {
                status: "KO",
                code: 404,
                description: "Cart is empty, so no order can be made",
                data: null
            };
        }

        try {
            const order = await this.orderHistoryService.create(user, cart);
            const stream = await this.generateInvoice(order);
            await new Promise((resolve, reject) => {
                stream.on("finish", resolve);
                stream.on("error", reject); // N'oubliez pas de gérer les erreurs de stream.
            });
            return this.postInvoiceGeneration(res, order, cart.id);
        } catch (e) {
            res.status(501);
            return {
                status: "KO",
                code: 501,
                description:
                    "Order history item was not created because of an error",
                error: e,
                data: null
            };
        }
    }

    @Get("/invoice/:order_id")
    async getInvoice(
        @Req() req: Request,
        @Param("order_id") order_id: number,
        @Res({ passthrough: true }) res: Response
    ) {
        const order = await this.orderHistoryService.findOne({ id: order_id });

        const user = await this.checkAuthorization(req, res, Type.GET_ORDER, order);
        if (!(user instanceof User)) return user;

        const file = createReadStream(join(process.cwd(), `ardeco_invoices/invoice_${order_id}.pdf`));
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="ardeco_invoice_${order_id}.pdf"`
        });

        res.status(200);
        return new StreamableFile(file);
    }

    async checkAuthorization(
        req: Request,
        res: Response,
        type: Type,
        order: Order = null,
        user_id: number = null
    ) {
        const cookie = req.cookies["jwt"];
        const data = cookie ? this.jwtService.verify(cookie) : null;

        // Cookie or JWT not valid
        if (!cookie || !data) {
            res.status(401);
            return {
                status: "KO",
                code: 401,
                description:
                    "You have to login in order to create or get an order",
                data: null
            };
        }

        const user = await this.userService.findOne({ id: data["id"] });

        if (!user) {
            res.status(403);
            return {
                status: "KO",
                code: 403,
                description: "You are not allowed to create or get an order",
                data: null
            };
        }

        switch (type) {
            case Type.GET_ALL:
                if (user.role !== "admin") {
                    res.status(403);
                    return {
                        status: "KO",
                        code: 403,
                        description:
                            "You are not allowed to get all orders, you must be an admin",
                        data: null
                    };
                }
                break;
            case Type.GET_ORDER:
                if (!order) {
                    res.status(404);
                    return {
                        status: "KO",
                        code: 404,
                        description: "Order was not found",
                        data: null
                    };
                }

                if (order.user_id !== user.id) {
                    if (user.role !== "admin") {
                        res.status(403);
                        return {
                            status: "KO",
                            code: 403,
                            description:
                                "You are not allowed to get this order",
                            data: null
                        };
                    }
                }
                break;
            case Type.GET_USER:
                if (!user_id) {
                    res.status(400);
                    return {
                        status: "KO",
                        code: 400,
                        description:
                            "User id must be specified in order to get orders for a user",
                        data: null
                    };
                }

                const user_to_get = await this.userService.findOne({
                    id: user_id
                });
                if (!user_to_get) {
                    res.status(404);
                    return {
                        status: "KO",
                        code: 404,
                        description:
                            "User was not found, so you can't access to his orders",
                        data: null
                    };
                }

                if (user_to_get.id !== user.id) {
                    if (user.role !== "admin") {
                        res.status(403);
                        return {
                            status: "KO",
                            code: 403,
                            description:
                                "You are not allowed to get orders for this user",
                            data: null
                        };
                    }
                }
                break;
            case Type.POST:
                break;
        }
        return user;
    }

    private async postInvoiceGeneration(res: Response, order: Order, id: number) {
        try {
            this.mailService.sendInvoice(order.user.email, order.id);
        } catch (e) {
            this.logger.error(e);
            this.logger.warn("Invoice has successfully been generated, but no email has been sent");
        }
        delete order.user;
        await this.cartService.delete(id);
        res.status(201);
        return {
            status: "OK",
            code: 201,
            description: "Order history item was created",
            data: order
        };
    }

    private selectGetMode = (mode: QueryMode): GetMode => {
        if (!mode.mode) return GetMode.DEFAULT;
        if (typeof mode.mode === "string") {
            if (mode.mode === "id") return GetMode.ID;
            if (mode.mode === "details") return GetMode.DETAILS;
        } else if (Array.isArray(mode.mode)) {
            const extracted_mode = mode.mode.pop();
            if (extracted_mode === "id") return GetMode.ID;
            if (extracted_mode === "details") return GetMode.DETAILS;
        }
        return GetMode.DEFAULT;
    };

    private async generateInvoice(order: Order) {
        const invoices_dir = path.join(__dirname, "../..", "ardeco_invoices");
        if (!fs.existsSync(invoices_dir)) {
            fs.mkdirSync(invoices_dir);
        }
        const invoice_filename = `invoice_${order.id}.pdf`;
        const invoice_path = path.join(invoices_dir, invoice_filename);

        const pdfDoc = new PDFDocumentWithTables({
            margin: 35
        });
        const stream = fs.createWriteStream(invoice_path);
        pdfDoc.pipe(stream);

        // --- En-tête de la facture ---
        pdfDoc.fontSize(24).text("ARDeco", { align: "center" });
        pdfDoc.image("ardeco_logo.png", 25, 25, { width: 50 });

        // --- Informations client ---
        pdfDoc.fontSize(12).text(`Facture n°${order.id}`, { align: "right" });
        pdfDoc.moveDown();
        pdfDoc.font("Helvetica-Bold").text(`Date : `, { continued: true }).font("Helvetica");
        pdfDoc.text(order.datetime.toLocaleString());
        pdfDoc.moveDown();
        pdfDoc.font("Helvetica-Bold").text(`Client : `, { continued: true }).font("Helvetica");
        pdfDoc.text(order.name);
        pdfDoc.moveDown();
        pdfDoc.font("Helvetica-Bold").text(`Adresse : `).font("Helvetica");
        pdfDoc.text(order.address);
        pdfDoc.text(`${order.city}, ${order.zip_code}`);
        pdfDoc.text(order.country);
        pdfDoc.moveDown();

        // --- Tableau des articles ---
        const table = {
            headers: ["Article", "Couleur", "Distributeur", "Quantité", "Prix unitaire", "Total"],
            rows: []
        };

        order.furniture.forEach(item => {
            table.rows.push([
                `${item.name} (${item.id})`,
                item.color,
                item.company,
                item.quantity,
                `${item.price} €`,
                `${item.quantity * item.price} €`
            ]);
        });

        await pdfDoc.table(table, {
            prepareHeader: () => pdfDoc.font("Helvetica-Bold", 12),
            prepareRow: (row, i) => {
                let tmp = pdfDoc.font("Helvetica").fontSize(10);
                if (i === 5) return tmp.font("Helvetica-Bold");
                return tmp;
            },
            columnsSize: [150, 85, 115, 75, 75, 75]
        });

        // --- Total de la commande ---
        pdfDoc.moveDown();
        pdfDoc.font("Helvetica-Bold").fontSize(12).text(`Total : ${order.total_amount} €`, { align: "right" });

        pdfDoc.end();

        return stream;
    }
}
