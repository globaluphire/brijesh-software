import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Button, Form, ListGroup, ListGroupItem } from "react-bootstrap";
import { Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

const UserDocuments = ({ applicantData }) => {
  const user = useSelector((state) => state.candidate.user);
  const [allTemplates, setAllTemplates] = useState([]);
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imgData, setImgData] = useState(null);
  const applicantForm = useRef(null);
  const [sendDocumentsForSigningLoading, setSendDocumentsForSigningLoading] = useState(false);

  // Function to fetch templates and update the state
  const sendDocumentsForSigning = async () => {
    setSendDocumentsForSigningLoading(true);
    try {
      if (!applicantForm.current) {
        return;
      }
      const applicantEmail = applicantForm.current.querySelector("#applicantEmail").value;
      const applicantName = applicantForm.current.querySelector("#applicantName").value;
      const applicantroleName = applicantForm.current.querySelector("#applicantroleName").value;
    if(!applicantEmail || !applicantName || !applicantroleName){
      toast.error('Please Fill the form!', {
        position: "bottom-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setSendDocumentsForSigningLoading(false)
      return;
    }

    if(!selectedTemplates.length){
      toast.error('Please Select at least one doucment!', {
        position: "bottom-right",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      setSendDocumentsForSigningLoading(false)
      return;
    }
      const applicant = {
        email: applicantEmail,
        name: applicantName,
        roleName: applicantroleName,
      };
      const token = await getAccessToken(user.email);
      const response = await fetch(`/api/ds/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token?.data?.access_token,
          user,
          applicant: applicantData,
          // send selectedTemplates here
          template: selectedTemplates,
          recipient: applicant,
        }),
      });
      if (response.ok) {
        toast.success('Documents sent for Signing!', {
          position: "bottom-right",
          autoClose: 8000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        const data = await response.json();
      } else {
        setIsLoading(false);
        console.error("Failed to fetch templates");
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
    setSendDocumentsForSigningLoading(false);
  };

  // Function to fetch templates and update the state
  const fetchTemplates = async (applicantData) => {
    try {
      const token = await getAccessToken(user.email);
      const response = await fetch(
        `/api/ds/templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token?.data?.access_token,
            user,
            applicant: applicantData,
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIsLoading(false);
        setAllTemplates(data?.data); // Update the state with fetched data
      } else {
        setIsLoading(false);
        console.error("Failed to fetch templates");
      }
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  };

  // Function to get Docusign access token
  const getAccessToken = async (email) => {
    try {
      const response = await fetch(`/api/ds/accessToken?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Failed to get access token");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to fetch one preview
  const fetchOnePreview = async (templateId) => {
    setImgData(false);
    try {
      const token = await getAccessToken(user.email);
      const response = await fetch(`/api/ds/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template: {
            templateId: templateId,
            documentId: 1,
          },
          token: token.data.access_token,
        }),
      }).then((res) => res.json());
      setImgData({
        templateId,
        data: `data:image/${response.pages[0].mimeType};base64,${response.pages[0].imageBytes}`,
      });
    } catch (error) {
      console.error(error);
      setImgData(null);
    }
  };

  useEffect(() => {
    if (applicantData) {
      fetchTemplates(applicantData);
      setIsLoading(true);
    }
  }, [applicantData]);

  const handleCheckChange = (template, checked) => {
    if (checked) {
      if (!selectedTemplates.some(t => t.templateId === template.templateId)) {
        setSelectedTemplates([...selectedTemplates, template]);
      }
    } else {
      setSelectedTemplates(
        selectedTemplates.filter((t) => t.templateId !== template.templateId)
      );
    }
  }

  return (
    <form className="default-form">
      <div className="row">
        <div 
          className="col-4"
        >
          <h5 className="mb-3">Documents</h5>
          {isLoading ? (
          <div style={{              
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </div>
          ) : allTemplates ? (
            <ListGroup 
              as="ol" 
              variant="numbered"
              style={{
                height: "40rem",
                overflow: "auto",
              }}
            >
              {allTemplates?.map((template) => (
                <ListGroup.Item
                  key={template.id}
                  onClick={() =>!(imgData === false ||
                    imgData?.templateId === template.templateId) && fetchOnePreview(template.templateId)}
                  style={{ 
                    cursor: "pointer",
                    backgroundColor: imgData?.templateId === template.templateId ? "#007bff" : "white",
                    color: imgData?.templateId === template.templateId ? "white" : "black",
                    display: "grid",
                    gridTemplateColumns: "auto 1fr auto",
                  }}
                >
                    <span 
                      // style={{width: "100%"}} 
                      disabled={
                      imgData === false ||
                      imgData?.templateId === template.templateId
                    }>
                      {template.name}
                      <span style={{marginLeft:"10rem"}}>
                        Status: {template?.envelope?.status ? template?.envelope?.status : "not sent"}
                      </span>
                    </span>
                    <input 
                      type="checkbox" 
                      defaultChecked={template.shared !== "false"}
                      disabled={template.shared !== "false"}
                      aria-label="Checkbox for following text input"
                      className="form-check-input float-right"
                      onChange={(e) => handleCheckChange(template, e.target.checked)}
                    />
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <>No templates found!</>
          )}
        </div>
        <div 
          className="col-4"
          
        >
          <h5>Preview</h5>
          <ListGroup
            className="border"
            style={{
              height: "40rem",
              overflow: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imgData === null && <>No Preview To Show</>}
            {imgData === false ? <Spinner /> : <img src={imgData?.data} style={{
              width: "100%",
            }}/>}
          </ListGroup>
          {/* <Button
            onClick={() => {
              sendDocumentsForSigning();
            }}
          >
            {" "}
            send
          </Button> */}
        </div>
        <div className="col-4"
            style={{
              height: "40rem",
              overflow: "auto",
            }}
        >
          <Form
            ref={applicantForm}
          >
            <Form.Group className="form-group">
              <Form.Label htmlFor="applicantEmail">Email</Form.Label>
              <Form.Control
                className="form-control form-control-sm"
                type="email"
                defaultValue={applicantData?.email ? applicantData?.email : ""}
                id="applicantEmail"
              />
            </Form.Group>
            <Form.Group className="form-group">
                <Form.Label htmlFor="applicantName"> Name</Form.Label>
                <Form.Control
                  className="form-control form-control-sm"
                  type="text"
                  defaultValue={applicantData?.name}
                  id="applicantName"
                />
            </Form.Group>
            <Form.Group className="form-group">
              <Form.Label htmlFor="applicantroleName">Role</Form.Label>
              <Form.Control
                className="form-control form-control-sm"
                type="text"
                defaultValue="Signer"
                id="applicantroleName"
              />
            </Form.Group>
          </Form>
          <Button
            onClick={() => {
              sendDocumentsForSigning();
            }}
            className="w-100"
            disabled={sendDocumentsForSigningLoading}
          >{sendDocumentsForSigningLoading ? <Spinner /> : "Send"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default UserDocuments;