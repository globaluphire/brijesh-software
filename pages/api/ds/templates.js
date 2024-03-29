import { supabase } from "../../../config/supabaseClient";
import { envConfig } from "../../../config/env";
const docusign = require("docusign-esign");

async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            // eslint-disable-next-line no-unused-vars
            const { token, user, applicant } = req.body;
            const dsApiClient = new docusign.ApiClient();
            dsApiClient.setBasePath(envConfig.DOCUSIGN_API_URL);
            dsApiClient.addDefaultHeader("Authorization", "Bearer " + token);
            const templatesApi = new docusign.TemplatesApi(dsApiClient);
            const templates = await templatesApi.listTemplates(
                envConfig.DOCUSIGN_ACCOUNT_ID
            );
            if (!templates) {
                return res
                    .status(404)
                    .json({ status: 404, message: "No templates found!" });
            }
            // get document details from supabase
            const userTemplates = await supabase
                .from("document_signing")
                .select("*")
                .match({
                    application_id: applicant.application_id,
                });

            const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

            // Promise for async
            const updatedTemplates = await Promise.all(
                templates.envelopeTemplates.map(async (template) => {
                    delay(100);
                    // template.description needs to be set as json in docuSign
                    const descriptionData = JSON.parse(template.description);
                    // adding all and location specific documents into array
                    if (
                        descriptionData.location === "ALL" ||
                        applicant.job_comp_add?.includes(
                            descriptionData.location
                        )
                    ) {
                        const tabs = await templatesApi.getDocumentTabs(
                            envConfig.DOCUSIGN_ACCOUNT_ID,
                            template.templateId,
                            1
                        );
                        if (tabs) {
                            template.tabs = tabs;
                        }

                        // match templateId from all the templates available to get envelope_id
                        const matchingUserTemplate = userTemplates.data.find(
                            (userTemplate) =>
                                userTemplate.template_id === template.templateId
                        );
                        // matched templates are the ones which are sent/completed
                        if (matchingUserTemplate) {
                            // get envelope data using envelope_id
                            const response = await envelopesApi.getEnvelope(
                                envConfig.DOCUSIGN_ACCOUNT_ID,
                                matchingUserTemplate.envelope_id
                            );
                            // update documen_signing table
                            await supabase
                                .from("document_signing")
                                .update({ status: response.status })
                                .eq("id", matchingUserTemplate.id);
                            // appened envelope data
                            template.envelope = response;
                            delay(100);
                        }
                        return template;
                    } else {
                        return null;
                    }
                })
            );
            const removedNullTemplates = updatedTemplates.filter(
                (template) => template !== null
            );
            return res
                .status(200)
                .json({ message: "Success", data: removedNullTemplates });
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .json({ status: 400, message: "Some Error Occured!" });
        }
    } else {
        return res
            .status(405)
            .json({ status: 405, message: "Method not allowed" });
    }
}
