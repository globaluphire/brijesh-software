// eslint-disable-next-line no-unused-vars
import Head from "next/head";

const Seo = ({ pageTitle }) => (
    <>
        <Head>
            <title>{pageTitle && `${pageTitle} | Raftaar`}</title>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1, shrink-to-fit=no"
            />
        </Head>
    </>
);

export default Seo;
