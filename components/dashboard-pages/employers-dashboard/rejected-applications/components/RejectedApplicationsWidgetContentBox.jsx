import candidatesData from "../../../../../data/candidates";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "../../../../../config/supabaseClient";
import { toast } from "react-toastify";
import { Typeahead } from "react-bootstrap-typeahead";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Table } from "react-bootstrap";
import { useSelector } from "react-redux";

const addSearchFilters = {
    name: "",
    jobTitle: ""
  }


const RejectedApplicationsWidgetContentBox = () => {
    const [fetchedAllApplicants, setFetchedAllApplicantsData] = useState({});
    const [applicationStatus, setApplicationStatus] = useState('');
    const [applicationStatusReferenceOptions, setApplicationStatusReferenceOptions] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [applicationId, setApplicationId] = useState('');

    // for search filters
    const [searchFilters, setSearchFilters] = useState(JSON.parse(JSON.stringify(addSearchFilters)));
    const { name, jobTitle } = useMemo(() => searchFilters, [searchFilters])

    // global states
    const facility = useSelector(state => state.employer.facility.payload)
    

    async function updateApplicationStatus (applicationStatus, applicationId) {
        // save updated applicant status
        const { data1, error1 } = await supabase
            .from('applications')
            .update({ status: applicationStatus })
            .eq('application_id', applicationId)

        // this will prevent the page to keep filtered if have any search filters set
        let { data, error } = await supabase
            .from('applicants_view')
            .select("*")
            .eq('status', 'Rejection')
            .ilike('name', '%'+name+'%')
            .ilike('job_title', '%'+jobTitle+'%')
            .order('created_at',  { ascending: false });

        if (facility) {
            data = data.filter(i => i.facility_name == facility)
        }

        if(data) {
            data.forEach( applicant => applicant.created_at = dateFormat(applicant.created_at))
            setFetchedAllApplicantsData(data)
        }
    }

    const dateFormat = (val) => {
      const date = new Date(val)
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric'}) + ', ' + date.getFullYear()
    }
  
    // clear all filters
    const clearAll = () => {
        setSearchFilters(JSON.parse(JSON.stringify(addSearchFilters)));
        fetchedAllApplicantsView({name: "", jobTitle: ""})
    };

    async function findApplicant () {
        // call reference to get applicantStatus options
        let { data: refData, error: e } = await supabase
            .from('reference')
            .select("*")
            .eq('ref_nm',  'applicantStatus');

        if (refData) {
            setApplicationStatusReferenceOptions(refData)
        }
    
        let { data, error } = await supabase
            .from('applicants_view')
            .select("*")
            .eq('status', 'Rejection')
            .ilike('name', '%'+name+'%')
            .ilike('job_title', '%'+jobTitle+'%')
            .order('created_at',  { ascending: false });

        if (facility) {
            data = data.filter(i => i.facility_name == facility)
        }
    
        if(data) {
            data.forEach( applicant => applicant.created_at = dateFormat(applicant.created_at))
            setFetchedAllApplicantsData(data)
        }
    };

    async function fetchedAllApplicantsView ({ name, jobTitle }) {
      try{
        // call reference to get applicantStatus options
        let { data, error: e } = await supabase
            .from('reference')
            .select("*")
            .eq('ref_nm',  'applicantStatus');

        if (data) {
            setApplicationStatusReferenceOptions(data)
        }

        let { data: allApplicantsView, error } = await supabase
            .from('applicants_view')
            .select("*")
            .eq('status', 'Rejection')
            .order('created_at',  { ascending: false });

        if (facility) {
            allApplicantsView = allApplicantsView.filter(i => i.facility_name == facility)
        }
    
        if (allApplicantsView) {
            allApplicantsView.forEach( i => i.created_at = dateFormat(i.created_at))
            setFetchedAllApplicantsData(allApplicantsView)
        }
      } catch(e) {
        toast.error('System is unavailable.  Please try again later or contact tech support!', {
          position: "bottom-right",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        console.warn(e)
      }
    };
  
    useEffect(() => {
      fetchedAllApplicantsView(searchFilters)
      if (facility) {
        localStorage.setItem("facility", facility);
      } else {
        localStorage.setItem("facility", '');
      }
    }, [facility]);


    const setNoteData = async (applicationId) => {
        // reset NoteText
        setNoteText('');
        setApplicationId('');

        const { data, error } = await supabase
              .from('applicants_view')
              .select('*')
              .eq('application_id', applicationId);

        if (data) {
            setNoteText (data[0].notes);
            setApplicationId(data[0].application_id)
        }
    }

    const ViewCV = async (applicationId) => {
        const { data, error } = await supabase
              .from('applicants_view')
              .select('*')
              .eq('application_id', applicationId);

        if (data) {
            window.open(data[0].doc_dwnld_url.slice(14, -2), '_blank', 'noreferrer');
        }
        if (error) {
            toast.error('Error while retrieving CV.  Please try again later or contact tech support!', {
                position: "bottom-right",
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    }

    const DownloadHandler = async (applicant) => {
        const { data, error } = await supabase
            .from('applicants_view')
            .select('*')
            .eq('application_id', applicant.application_id);

        if (data) {
            let fileName = data[0].doc_dwnld_url.slice(14, -2);
            fetch(fileName, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/pdf',
                },
              })
                .then(response => response.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(new Blob([blob]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = fileName;
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode.removeChild(link);
                });
            //window.open(data[0].doc_dwnld_url.slice(14, -2), '_blank', 'noreferrer');
        }
        if (error) {
            toast.error('Error while retrieving CV.  Please try again later or contact tech support!', {
                position: "bottom-right",
                autoClose: true,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
            });
        }
    }

    const addNotes = async () => {
        const { data, error } = await supabase
            .from('applications')
            .update({ 'notes': noteText})
            .eq('application_id', applicationId)

        // open toast
        toast.success('Applicant notes has been saved!', {
            position: "bottom-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored",
        });

        // fetching for refresh the data
        // fetchedAllApplicantsView();

        // close popup
        document.getElementById('notesCloseButton').click();

        // reset NoteText
        setNoteText('');
        setApplicationId('');
        
    }

    return (
        <div className="tabs-box">
            <div className="widget-title" style={{ fontSize: '1.5rem', fontWeight: '500' }}>
                <b>Rejected Applicants!</b>
            </div>
            { applicationStatusReferenceOptions != null ?
                <Form>
                    <Form.Label className="optional" style={{ marginLeft: '32px', letterSpacing: '2px', fontSize: '12px' }}>SEARCH BY</Form.Label>
                    <Row className="mx-1" md={4}>
                        <Col>
                            <Form.Group className="mb-3 mx-3">
                                <Form.Label className="chosen-single form-input chosen-container">Applicant Name</Form.Label>
                                <Form.Control
                                    className="chosen-single form-input chosen-container"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {
                                        setSearchFilters((previousState) => ({ 
                                            ...previousState,
                                            name: e.target.value
                                        }))
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            findApplicant(searchFilters)
                                        }
                                    }}
                                    style={{ maxWidth: '300px' }}/>
                            </Form.Group>
                        </Col>
                        <Col>
                            <Form.Group className="mb-3 mx-3">
                                <Form.Label className="chosen-single form-input chosen-container">Job Title</Form.Label>
                                <Form.Control
                                    className="chosen-single form-input chosen-container"
                                    type="text"
                                    value={jobTitle}
                                    onChange={(e) => {
                                        setSearchFilters((previousState) => ({ 
                                            ...previousState,
                                            jobTitle: e.target.value
                                        }))
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            findApplicant(searchFilters)
                                        }
                                    }}
                                    style={{ maxWidth: '300px' }}/>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mx-3">
                        <Col>
                            <Form.Group className="chosen-single form-input chosen-container mt-3">
                                <Button variant="primary"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        findApplicant(searchFilters);
                                    }}
                                    className="btn btn-submit btn-sm text-nowrap m-1"
                                    >
                                    Filter
                                </Button>
                                <Button variant="primary" onClick={clearAll}
                                    className="btn btn-secondary btn-sm text-nowrap mx-2"
                                    style= {{ minHeight: '40px', padding: '0 20px' }}>
                                    Clear
                                </Button>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form> : ''
            }
            {/* End filter top bar */}

            <div className="optional" style={{ textAlign: 'right', marginRight: '50px', marginBottom: '10px' }}>Showing ({fetchedAllApplicants.length}) Applicants got Rejection!</div>

            {/* Start table widget content */}
            <div className="widget-content">
                <div className="table-outer">
                    <Table className="default-table manage-job-table">
                        <thead>
                            <tr>
                            <th>Name</th>
                            <th>Applied On</th>
                            <th>Job Title</th>
                            <th>Facility</th>
                            <th>Status</th>
                            <th>Notes</th>
                            <th>Actions</th>
                            </tr>
                        </thead>
                        
                        {fetchedAllApplicants.length == 0 ? <tbody style={{ fontSize: '1.5rem', fontWeight: '500' }}><tr><td><b>No results found!</b></td></tr></tbody>: 
                            <tbody>
                                {Array.from(fetchedAllApplicants).map((applicant) => (
                                    <tr key={applicant.application_id}>
                                        <td>
                                        {/* <!-- Job Block --> */}
                                        <div className="job-block">
                                            <div>
                                                {/* <span className="company-logo">
                                                <img src={item.logo} alt="logo" />
                                                </span> */}
                                                <h4>
                                                {/* <Link href={`/employers-dashboard/edit-job/${applicant.user_id}`}>
                                                    {applicant.name}
                                                </Link> */}
                                                {applicant.name}
                                                </h4>
                                            </div>
                                        </div>
                                        </td>
                                        <td>
                                        {/* <Link href="/employers-dashboard/all-applicants/${item.job_id}">3+ Applied</Link> */}
                                            <span>{applicant.created_at}</span>
                                        </td>
                                        <td>
                                            {applicant.job_title}
                                        </td>
                                        <td>
                                            {applicant.facility_name}
                                        </td>
                                        <td>
                                            <select className="chosen-single form-select" 
                                                value={applicant.status}
                                                onChange={(e) => {
                                                    updateApplicationStatus(e.target.value, applicant.application_id)
                                                }}>
                                                {applicationStatusReferenceOptions.map((option) => (
                                                    <option value={option.ref_dspl}>{option.ref_dspl}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <ul className="option-list">
                                                <li>
                                                    <button data-text="Add, View, Edit, Delete Notes">
                                                    <a
                                                        href="#"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#addNoteModal"
                                                        onClick = { () => {setNoteData(applicant.application_id) }}
                                                    >
                                                        <span className="la la-eye"></span>
                                                    </a>
                                                    </button>
                                                </li>
                                            </ul>
                                        </td>
                                        <td>
                                            <div className="option-box">
                                                <ul className="option-list">
                                                <li onClick = { () => { ViewCV(applicant.application_id) }}>
                                                    <button data-text="View CV">
                                                        <span className="la la-file-download"></span>
                                                    </button>
                                                </li>
                                                <li onClick={() => DownloadHandler(applicant)}>
                                                    <button data-text="Download CV">
                                                        <span className="la la-download"></span>
                                                    </button>
                                                </li>
                                                {/* <li onClick={()=>{ Qualified(applicant.application_id, applicant.status) }} >
                                                    <button data-text="Qualified">
                                                    <span className="la la-check"></span>
                                                    </button>
                                                </li>
                                                <li onClick={()=>{ NotQualified(applicant.application_id, applicant.status) }} >
                                                    <button data-text="Not Qualified">
                                                    <span className="la la-times-circle"></span>
                                                    </button>
                                                </li>
                                                <li onClick={()=>{ ResetStatus(applicant.application_id, applicant.status) }} >
                                                    <button data-text="Reset Status">
                                                    <span className="la la-undo-alt"></span>
                                                    </button>
                                                </li> */}
                                                </ul>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        }
                    </Table>

                    {/* Add Notes Modal Popup */}
                    <div
                        className="modal fade"
                        id="addNoteModal"
                        tabIndex="-1"
                        aria-hidden="true"
                    >
                        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                        <div className="apply-modal-content modal-content">
                            <div className="text-center">
                            <h3 className="title">Add Notes</h3>
                            <button
                                type="button"
                                id="notesCloseButton"
                                className="closed-modal"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                            </div>
                            {/* End modal-header */}
                            <form>
                                <textarea 
                                    value={noteText}
                                    id="notes"
                                    cols="45"
                                    rows="10"
                                    onChange={(e) => {
                                        setNoteText(e.target.value)
                                    }}
                                    style={{resize: 'vertical', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px'}}></textarea>
                                <br/>
                                <div className="form-group text-center">
                                    <button
                                        className="theme-btn btn-style-one"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            addNotes();
                                        }}
                                    >
                                        Save
                                    </button>
                                </div>
                            </form>
                            {/* End PrivateMessageBox */}
                        </div>
                        {/* End .send-private-message-wrapper */}
                        </div>
                    </div>
                </div>
            </div>
            {/* End table widget content */}
        </div>
    );
};

export default RejectedApplicationsWidgetContentBox;