import { envConfig } from "../../../config/env";

export default function handler(req, res) {
    if (req.method === "POST") {
        const mail = require("@sendgrid/mail");
        mail.setApiKey(envConfig.SENDGRID_API_KEY);
        const msg = {
            to: "brijeshbhagat67@gmail.com",
            from: "support@globaluphire.com", // Change to your verified sender,
            subject: `[Raftaar] New Order placed for ${req.body.clientName} on ${req.body.pickupDate}`,
            html: `
            <html>
                <head>
                <style>
                a {
                    color: unset;
                    text-decoration: unset;
                }
                .body {
                    // padding: 10px;
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
                <h3>Order Details:</h3>
                <ul>
                  <li>
                    <b>Order City: </b>
                    <span>${req.body.orderCity}</span>
                  </li>
                  <li>
                    <b>Pickup Date: </b>
                    <span>${req.body.pickupDate}</span>
                  </li>
                  <li>
                    <b>Material: </b>
                    <span>${req.body.material}</span>
                  </li>
                  <li>
                    <b>Size: </b>
                    <span>${req.body.size}</span>
                  </li>
                  <li>
                    <b>Priority: </b>
                    <span>${req.body.priority}</span>
                  </li>
                  <li>
                    <b>Quantity: </b>
                    <span>${req.body.quantity}</span>
                  </li>
                  <li>
                    <b>weight: </b>
                    <span>${req.body.weight}</span>
                  </li>
                  <li>
                    <b>Pickup Location: </b>
                    <span>${req.body.pickupLocation}</span>
                  </li>
                  <li>
                    <b>Drop Location: </b>
                    <span>${req.body.dropLocation}</span>
                  </li>
                </ul>
                <p>Note: Please login with your employer credentials to access below link.</p>
                <a href="${req.body.redirectionUrl}"><button>View Order</button></a>
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
