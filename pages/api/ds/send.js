import { supabase } from "../../../config/supabaseClient";
import { envConfig } from "../../../config/env";
const docusign = require("docusign-esign");

// config for vercel
export const config = {
    maxDuration: 60,
};

export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { token, user, applicant, template, recipient } = req.body;

            if (user.role !== "ADMIN") {
                return res
                    .status(405)
                    .json({ status: 405, message: "Method not allowed" });
            }

            const dsApiClient = new docusign.ApiClient();
            dsApiClient.setBasePath(envConfig.DOCUSIGN_API_URL);
            dsApiClient.addDefaultHeader("Authorization", "Bearer " + token);

            const envelopesApi = new docusign.EnvelopesApi(dsApiClient);

            // Make the envelope request body
            const response = await createEnvelopes(
                envelopesApi,
                user,
                applicant,
                template,
                recipient
            );

            return res.status(200).json({ message: "success", data: response });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Internal Server Error!" });
        }
    } else {
        return res
            .status(405)
            .json({ status: 405, message: "Method not allowed" });
    }
}

async function createEnvelopes(
    envelopesApi,
    user,
    applicant,
    template,
    recipient
) {
    const documentArray = [];
    // looping through all selected templates to send
    for (const doc of template) {
        try {
            const envelope = makeEnvelope(doc, recipient, user, applicant);
            // send the envelope
            const results = await envelopesApi.createEnvelope(
                envConfig.DOCUSIGN_ACCOUNT_ID,
                {
                    envelopeDefinition: envelope,
                }
            );
            const documentObj = {
                sender_name: user.name,
                sender_user_id: user.id,
                sender_email: user.email,
                receiver_name: applicant.name,
                receiver_email: recipient.email,
                application_id: applicant.application_id,
                applicant_name: applicant.name,
                envelope_id: results.envelopeId,
                template_id: doc.templateId,
                uri: results.uri,
                status: results.status,
            };
            // store response in supabase
            await supabase.from("document_signing").insert(documentObj);
            documentArray.push(documentObj);
        } catch (error) {
            console.error(`Error creating envelope: ${error}`);
            throw error;
        }
    }
    // returning array
    return documentArray;
}

function makeEnvelope(template, recipient, user, applicant) {
    // Create the envelope definition
    const envelopeDefinition = new docusign.EnvelopeDefinition();
    envelopeDefinition.templateId = template.templateId;
    envelopeDefinition.documentId = 1;

    const dateTime = new Date(applicant.hired_date);

    // Convert the date to a more readable format
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short",
    };
    const readableDate = dateTime.toLocaleDateString("en-IN", options);

    // email subject and body
    let emailNotificationHR = {};
    switch (true) {
        case true:
            emailNotificationHR =
                docusign.RecipientEmailNotification.constructFromObject({
                    emailSubject: `Please review the document being sent to ${applicant.name}`,
                    emailBody: `Applicant Details:
        Name: ${applicant.name}
        Email: ${applicant.email}
        Job Title: ${applicant.job_title}
        Facility Name: ${applicant.facility_name}
        Company Address: ${applicant.job_comp_add}
        Hired Date : ${readableDate}`,
                });
            break;
        case false:
            emailNotificationHR = {};
            break;
    }

    const prefillTabs = [];
    if (template?.tabs?.textTabs) {
        template.tabs.textTabs.forEach((tab) => {
            let check = false;
            if (tab.tabLabel.includes("employerName")) {
                tab.value = applicant.facility_name;
                check = true;
            }
            if (tab.tabLabel.includes("mailingAddress")) {
                tab.value = applicant.job_comp_add;
                check = true;
            }
            // if (tab.tabLabel.includes("EIN")) {
            //   tab.value = "Enter EIN";
            //   check = true
            // }
            if (tab.tabLabel.includes("jobTitle")) {
                tab.value = applicant.job_title;
                check = true;
            }
            if (check) {
                prefillTabs.push(tab);
            }
        });
    }

    const jobTitle = [];
    if (template?.tabs?.titleTabs) {
        template.tabs.titleTabs.forEach((tab) => {
            if (tab.tabLabel.includes("jobTitle")) {
                tab.value = applicant.job_title;
            }
            jobTitle.push(tab);
        });
    }
    // Create template role elements to connect the signer and cc recipients
    // to the template
    // We're setting the parameters via the object creation
    const hr = docusign.TemplateRole.constructFromObject({
        email: user.email,
        name: user.name,
        roleName: "HR",
        emailNotification: emailNotificationHR,
    });
    const signer = docusign.TemplateRole.constructFromObject({
        email: recipient.email,
        name: recipient.name,
        roleName: "Signer",
    });

    // Create a cc template role.
    // We're setting the parameters via setters
    //   let cc1 = new docusign.TemplateRole();
    //   cc1.email = "";
    //   cc1.name = "";
    //   cc1.roleName = "cc";

    const tabsToBeFilled = docusign.Tabs.constructFromObject({
        textTabs: prefillTabs,
    });

    hr.tabs = tabsToBeFilled;
    signer.tabs = tabsToBeFilled;

    // Add the TemplateRole objects to the envelope object
    envelopeDefinition.templateRoles = [hr, signer];
    // We want the envelope to be sent
    envelopeDefinition.status = "sent";

    return envelopeDefinition;
}
