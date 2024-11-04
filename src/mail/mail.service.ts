import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { loopWhile } from "deasync";
import { Attachment } from "nodemailer/lib/mailer";
import * as fs from "node:fs";

type EmailSender = {
    name: string,
    address: string
}

const ARDeco_sender: EmailSender = {
    name: "ARDeco Team",
    address: "contact@ardeco.app"
};

@Injectable()
export class MailService {
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

    public sendInvoice(email: string, invoice_id: number) {
        const subject = "Merci de votre commande sur ARDeco !";
        const body = `<body><h1>Merci de votre commande sur ARDeco !</h1>
<p>Bonjour,<br /><br />
Nous vous remercions pour votre commande sur ARDeco !<br /><br />
Vous trouverez ci-joint votre facture.<br /><br />
N'hésitez pas à nous contacter si vous avez la moindre question.<br /><br />
Nous vous souhaitons une excellente journée, et à bientôt sur ARDeco !</p></body>`;
        const invoice_path = `ardeco_invoices/invoice_${invoice_id}.pdf`;
        const invoice_content = fs.readFileSync(invoice_path);
        return this.sendEmail(email, subject, body, [{
            filename: `ardeco_invoice_${invoice_id}.pdf`,
            content: invoice_content,
            contentType: "application/pdf"
        }]);
    }

    private sendEmail(address: string, subject: string, body: string, attachments: Attachment[] = [], from: EmailSender = ARDeco_sender) {
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
            html: body,
            attachments: attachments
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
}
