/* eslint-disable no-unused-vars */
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { supabase } from "../../../../config/supabaseClient";
import InfoBox from "./InfoBox";
import ViewLR from "./ViewLR";

const index = () => {

    const user = useSelector((state) => state.candidate.user);
    const showLoginButton = useMemo(() => !user?.id, [user]);
    const [fetchedJobData, setFetchedJobData] = useState({});
    const router = useRouter();
    const id = router.query.id;
    const isEmployer = ["SUPER_ADMIN", "ADMIN", "MEMBER"].includes(user.role);
    const [fetchedLRdata, setFetchedLRdata] = useState({});

    async function savePDF() {
        var element = document.getElementById("print-lr");
        var opt = {
            margin:       0,
            filename:     fetchedLRdata.lr_number + ".pdf",
            image:        { type: "jpeg", quality: 1 },
            html2canvas:  { scale: 2  },
            jsPDF:        { unit: "in", format: "letter", orientation: "portrait" }
          };

          window.html2pdf().from(element).set(opt).save();
    };

    const dateFormat = (val) => {
        if (val) {
            const date = new Date(val);
            return (
                date.toLocaleDateString("en-IN", {
                    month: "long",
                    day: "numeric",
                }) +
                ", " +
                date.getFullYear()
            );
        }
    };

    const fetchLR = async () => {
        try {
            if (id) {
                const { data: lrData, error } = await supabase
                    .from("lr")
                    .select("*")

                    // Filters
                    .eq("id", id);

                if (lrData) {
                    lrData.forEach(
                        (lr) =>
                            (lr.lr_created_date = dateFormat(lr.lr_created_date))
                    );
                    setFetchedLRdata(lrData[0]);
                }
            }
        } catch (e) {
            toast.error(
                "System is unavailable.  Please try again later or contact tech support!",
                {
                    position: "bottom-right",
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "colored",
                }
            );
            console.warn(e);
        }
    };

    useEffect(() => {
        fetchLR();
    }, [id]);

    return (
        <>
            {/* <!-- Invoice Section --> */}
            <section>
                <div className="auto-container">
                    <div className="upper-box btn-box mb-3" style={{ textAlign: "right" }}>
                        <Link href="/employers-dashboard/lr" className="btn btn-danger btn-sm text-nowrap m-1 p-3">
                            Back to LR
                        </Link>
                        <button className="btn btn-success btn-sm text-nowrap m-1 p-3" onClick={() => savePDF()}>
                            Export to PDF
                        </button>
                    </div>
                </div>
                <div id="print-lr">
                    <div className="auto-container">
                        <div className="invoice-wrap">
                            <div className="invoice-content">
                                <div className="table-outer">
                                    <ViewLR fetchedLRdata={ fetchedLRdata }/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* <!-- End Invoice Section -->  */}
        </>
    );
};

export default index;
