import { envConfig } from "../../config/env";

export default function handler(req, res) {
    if (req.method === "POST") {
        const mail = require("@sendgrid/mail");
        mail.setApiKey(envConfig.SENDGRID_API_KEY);
        const msg = {
            to: `${req.body.notifyMeEmail}`,
            from: "support@globaluphire.com", // Change to your verified sender,
            subject: `[Volare Health] New application for ${req.body.jobTitle}: ${req.body.name} ${req.body.time}`,
            attachments: req.body.attachments,
            html: `
            <html>
                <head>
                <style>
                a {
                    color: unset;
                    text-decoration: unset;
                }
                .body {
                    padding: 100px;
                    background-color: #e6effc;
                }
                .content {
                    font-family: Helvetica;
                    background-color: #fff;
                    padding: 15px;
                    box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.3) !important;
                    border-radius: 5px;
                    width: fit-content;
                    margin: 0 auto;
                }
                ul {
                    list-style: none;
                }

                button {
                    width: 100%;
                    background: linear-gradient(to bottom right, #1967d2, #222293);
                    border: 0;
                    border-radius: 12px;
                    color: #FFFFFF;
                    cursor: pointer;
                    display: inline-block;
                    font-family: -apple-system,system-ui,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
                    font-size: 16px;
                    font-weight: 500;
                    line-height: 2.5;
                    outline: transparent;
                    padding: 0 1rem;
                    text-align: center;
                    text-decoration: none;
                    transition: box-shadow .2s ease-in-out;
                    user-select: none;
                    -webkit-user-select: none;
                    touch-action: manipulation;
                    white-space: nowrap;
                }

                button:not([disabled]):focus {
                    box-shadow: 0 0 .25rem rgba(0, 0, 0, 0.5), -.1rem -.1rem .1rem rgba(25, 103, 210, 0.3), .1rem .1rem .1rem rgba(34, 34, 147, 0.3);
                }

                button:not([disabled]):hover {
                    box-shadow: 0 0 .25rem rgba(0, 0, 0, 0.5), -.1rem -.1rem .1rem rgba(25, 103, 210, 0.3), .1rem .1rem .1rem rgba(34, 34, 147, 0.3);
                }
            </style>
                </head>
                <body>
                <div class="body">
                <div class="content" style="box-shadow: 5px 5px 20px 0px rgba(0,0,0,0.3);">
                <h3>New application received:</h3>
                <ul>
                  <li>
                    <b>Job Title: </b>
                    <span>${req.body.jobTitle}</span>
                  </li>
                  <li>
                    <b>Applicant Name: </b>
                    <span>${req.body.name}</span>
                  </li>
                  <li>
                    <b>Applied In Center: </b>
                    <span>${req.body.jobCompAdd}</span>
                  </li>
                  <li>
                    <b>Facility Name: </b>
                    <span>${req.body.facilityName}</span>
                  </li>
                </ul>
                <p>Note: Please login with your employer credentials to access link</p>
                <a href="${req.body.redirectionUrl}"><button>Log in to view</button></a>
              </div>
              </div>
                </body>
            </html>`,
        };
        mail.send(msg)
            .then(() => {
                res.status(200).json({ status: "SUCCESS" });
            })
            .catch((error) => {
                res.status(200).json({ status: "FAILURE", error });
            });
    } else {
        res.status(405).json({ status: 405, message: "Method not allowed" });
    }
}
