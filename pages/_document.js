/* eslint-disable no-unused-vars */
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
                />
                <meta httpEquiv="x-ua-compatible" content="ie=edge" />
                <meta
                    name="keywords"
                    content=""
                />
                <meta
                    name="description"
                    content="Raftaar Logistics - Truck Transportation Service"
                />
                <meta name="raftaarLogistics" content="ATFN" />

                <link rel="icon" href="/favicon.ico" />

                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
