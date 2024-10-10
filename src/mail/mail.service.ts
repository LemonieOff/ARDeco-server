import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentsService } from "src/payments/payments.service";
import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { loopWhile } from "deasync";

type EmailSender = {
    name: string,
    address: string
}

const ARDeco_sender: EmailSender = {
    name: "ARDeco Team",
    address: "ardeco.officiel@gmail.com"
};

@Injectable()
export class MailService {
    constructor(
        private readonly configService: ConfigService,
        @Inject(forwardRef(() => PaymentsService))
        private paymentService: PaymentsService
    ) {
    }

    public sendWelcomeAndVerification(email: string, token: string) {
        const subject = "Bienvenue sur ARDeco !";
        const checkLink = "https://ardeco.app/checkEmail?token=" + token;
        const body = `<body><h1>Bienvenue sur ARDeco !</h1>
<p>Nous vous souhaitons la bienvenue sur ARDeco !<br /><br />
Pour vous connecter depuis le site ou l'application mobile, il vous suffit de renseigner cette adresse email accompagnée du mot de passe que vous avez défini.<br />
Nous vous invitons également à vérifier votre adresse email en cliquant sur le lien suivant : <a href="${checkLink}">${checkLink}</a><br />
Si le lien ne fonctionne pas, veuillez le copier-coller dans votre navigateur.</p></body>`;
        return this.sendEmail(email, subject, body);
    }

    public sendPasswordChanged(email: string, first_name: string) {
        const subject = "ARDeco - Alerte de sécurité !";
        const body = `<body><h1>ARDeco - Alerte de sécurité !</h1>
<p>Bonjour ${first_name},<br /><br />
Nous vous informons que votre mot de passe vient d'être changé.<br/><br/>
Si vous n'êtes pas à l'origine de ce changement, veuillez répondre à cet email et notre équipe se chargera de vous aider à sécuriser votre compte !<br/><br/>
Sinon, vous pouvez simplement ignorer ce message.<br/><br/>
Nous vous souhaitons une bonne journée, et à bientôt sur ARDeco !</p></body>`;
        return this.sendEmail(email, subject, body);
    }

    private sendEmail(address: string, subject: string, body: string, from: EmailSender = ARDeco_sender) {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "ardeco.officiel@gmail.com",
                pass: "jfma eyqj wxim mnoz"
            }
        });

        const mailOptions = {
            from: from,
            to: address,
            subject: subject,
            html: body
        };

        let finished = false;
        let result: Error | SMTPTransport.SentMessageInfo;
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                result = error;
                console.error(error);
            } else {
                result = info;
                console.log("Email sent: " + info.response);
            }
            console.log("Finished sending email");
            finished = true;
        });
        console.log("Waiting for email to be sent");
        loopWhile(function() {
            return !finished;
        });
        console.log("Email sent");
        return result;
    }

    /*  public async sendMailPassword(content : sendMailPasswordDTO) {
            await this.setTransport(await this.getToken());
            this.mailerService
                .sendMail({
                    transporterName: 'gmail',
                    to: content.email, // list of receivers
                    from: 'noreply@nestjs.com', // sender address
                    subject: 'Change your ARDeco password', // Subject line
                    template: './password',
                    context: {
                        token : content.token,
                        user : content.user,
                    },
                })
                .then((success) => {
                    console.log(success);
                })
                .catch((err) => {
                    console.log(err);
                });
        }

        public async sendMailInvoice(content : sendMailInvoiceDTO) {
            await this.setTransport(await this.getToken());

            let filePath = `ardeco_invoices/invoice_${content.id_invoice}.pdf`

            const attachmentContent = fs.readFileSync(filePath);

            console.log()
            const command = await
            this.mailerService
                .sendMail({
                    transporterName: 'gmail',
                    to: content.email, // list of receivers
                    from: 'noreply@nestjs.com', // sender address
                    subject: 'Récapitulatif de comande ARdeco', // Subject line
                    template: './invoice',
                    context: {
                        name : content.name,
                        total : content.total,
                        order_id: content.id_invoice

                    },
                    attachments: [
                        {
                            filename: "invoice.pdf",
                            content: attachmentContent,
                            //encoding: 'utf-8'
                        },
                    ]
                })
                .then((success) => {
                    console.log(success);
                })
                .catch((err) => {
                    console.log(err);
                });
        }*/
}
