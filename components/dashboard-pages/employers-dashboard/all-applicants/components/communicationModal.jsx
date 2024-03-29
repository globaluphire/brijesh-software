/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import EmailModal from "./emailModal";
import SmsModal from "./smsModal";
import { ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { supabase } from "../../../../../config/supabaseClient";
import { MessageBox } from "react-chat-elements";
import ViewModal from "./ViewModal";

function CommunicationModal({ applicantData, setIsCommunicationModalOpen }) {
    const [activeTab, setActiveTab] = useState(1); // State to track the active tab (1 for SMS, 2 for Email)
    const [allMessages, setAllMessages] = useState([]);
    const [receiversPhoneNumber, setReceiversPhoneNumber] = useState("+1");
    const [receiversEmail, setReceiversEmail] = useState("");
    const [receiversPhoneNumberDisabled, setReceiversPhoneNumberDisabled] =
        useState(false);

    const handleSetMessages = async (data) => {
        if (!data) {
            console.log("error retriving messages");
            return;
        }

        const createdAt = data[data.length - 1]?.created_at;
        await supabase
            .from("applications")
            .update({ last_contacted_at: createdAt })
            .eq("application_id", applicantData?.application_id);

        setAllMessages(() => [
            data.map((el) => {
                if (el.direction === "inbound") {
                    return (
                        <div
                            className="small text-start fw-bold text-muted mt-3"
                            style={{
                                fontSize: "0.7rem",
                            }}
                        >
                            {el.type === "email" ? (
                                <span className="la la-envelope"></span>
                            ) : (
                                <span className="la la-comments"></span>
                            )}{" "}
                            {el.sender_name}{" "}
                            {new Date(el.created_at).toLocaleString()}
                            <MessageBox
                                className="fw-normal"
                                position={"left"}
                                type={"text"}
                                text={
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: el.message,
                                        }}
                                    />
                                }
                            />
                        </div>
                    );
                } else {
                    return (
                        <div
                            className="small text-end fw-bold text-muted mt-3"
                            style={{
                                fontSize: "0.7rem",
                            }}
                        >
                            {/* <span className="la la-envelope"></span> {" "} */}
                            {el.type === "email" ? (
                                <span className="la la-envelope"></span>
                            ) : (
                                <span className="la la-comments"></span>
                            )}{" "}
                            {el.sender_name}{" "}
                            {new Date(el.created_at).toLocaleString()}
                            <MessageBox
                                className="fw-normal"
                                position={"right"}
                                type={"text"}
                                text={
                                    el.type === "email" ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: `
                <strong>To: ${applicantData?.email} </strong><br/>
                Your Message: <div class="email-message">${el.message}</div>
                `,
                                            }}
                                        />
                                    ) : (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: el.message,
                                            }}
                                        />
                                    )
                                }
                            />
                        </div>
                    );
                }
            }),
        ]);
    };

    const handleSetModalData = async (applicantData) => {
        if (applicantData) {
            if (applicantData?.email) {
                setReceiversEmail(applicantData.email);
            }
            const { data, error } = await supabase
                .from("sms_messages")
                .select("*")
                .match({ application_id: applicantData?.application_id });
            // .or(
            //   `receiver_name.eq.${applicantData?.name}, sender_name.eq.${applicantData?.name}`
            // );
            await supabase
                .from("applications")
                .update({ new_message_received: false })
                .eq("application_id", applicantData?.application_id);
            setReceiversPhoneNumber(applicantData?.phn_nbr);
            setReceiversEmail(applicantData?.email);
            // if (data[0]?.receiver_phone) {
            //   setReceiversPhoneNumber(data[0].receiver_phone);
            //   // setReceiversEmail(data[0].receiver_email);
            //   setReceiversPhoneNumberDisabled(true);
            // } else {
            //   setReceiversPhoneNumber("");
            //   // setReceiversEmail("");
            //   setReceiversPhoneNumberDisabled(false);
            // }
            handleSetMessages(data);
        }
    };

    function onModalClose() {
        setIsCommunicationModalOpen(false);
        setActiveTab(1);
        setReceiversPhoneNumber("");
        setReceiversEmail("");
    }

    useEffect(() => {
        handleSetModalData(applicantData);
    }, [applicantData]);

    return (
        <div className="modal fade" id="communication-modal">
            <div className="modal-dialog modal-dialog-centered modal-xl">
                <div className="apply-modal-content modal-content">
                    <button
                        type="button"
                        id="close-button-2"
                        className="closed-modal"
                        data-bs-dismiss="modal"
                        onClick={() => onModalClose()}
                    ></button>
                    <h3 className="modal-title">Send SMS/Email</h3>
                    <div className="modal-body">
                        <div
                            className="row align-items-start"
                            style={{
                                maxHeight: "500px",
                            }}
                        >
                            <ToggleButtonGroup
                                type="radio"
                                name="options"
                                defaultValue={1}
                                style={{ paddingBottom: "20px" }}
                            >
                                <ToggleButton
                                    id="tbg-radio-1"
                                    value={1}
                                    onClick={() => setActiveTab(1)}
                                    style={{
                                        backgroundColor:
                                            activeTab === 2
                                                ? "var(--msg-primary)"
                                                : "var(--primary-hover-bg-color)",
                                        opacity: activeTab === 1 ? "1" : "0.5",
                                        border: "none",
                                        color:
                                            activeTab === 2 ? "#000" : "#fff",
                                    }}
                                >
                                    SMS
                                </ToggleButton>
                                <ToggleButton
                                    id="tbg-radio-2"
                                    value={2}
                                    onClick={() => setActiveTab(2)}
                                    style={{
                                        backgroundColor:
                                            activeTab === 1
                                                ? "var(--msg-primary)"
                                                : "var(--primary-hover-bg-color)",
                                        opacity: activeTab === 2 ? "1" : "0.5",
                                        border: "none",
                                        color:
                                            activeTab === 1 ? "#000" : "#fff",
                                    }}
                                >
                                    Email
                                </ToggleButton>
                            </ToggleButtonGroup>

                            {activeTab === 1 ? (
                                // ? receiversPhoneNumber
                                <SmsModal
                                    applicantData={applicantData}
                                    setAllMessages={setAllMessages}
                                    receiversPhoneNumber={receiversPhoneNumber}
                                    setReceiversPhoneNumber={
                                        setReceiversPhoneNumber
                                    }
                                    receiversPhoneNumberDisabled={
                                        receiversPhoneNumberDisabled
                                    }
                                    setReceiversPhoneNumberDisabled={
                                        setReceiversPhoneNumberDisabled
                                    }
                                />
                            ) : (
                                // : (
                                //   <div
                                //     style={{
                                //       margin: "auto",
                                //       textAlign: "center",
                                //     }}
                                //   >
                                //     No phone Number Provided!
                                //   </div>
                                // )
                                <></>
                            )}

                            {activeTab === 2 ? (
                                // ? receiversEmail
                                <EmailModal
                                    applicantData={applicantData}
                                    setAllMessages={setAllMessages}
                                    receiversEmail={receiversEmail}
                                    setReceiversEmail={setReceiversEmail}
                                />
                            ) : (
                                // : (
                                //   <div style={{ margin: "auto", textAlign: "center" }}>
                                //     No email Provided!
                                //   </div>
                                // )
                                <></>
                            )}
                            {/* {(
                receiversPhoneNumber && activeTab === 1) ||
              (receiversEmail && activeTab === 2) ? ( */}
                            <ViewModal data={allMessages} />
                            {/* ) : (
                 ""
               )} */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CommunicationModal;
