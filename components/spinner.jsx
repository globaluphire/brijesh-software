import { Grid } from "react-loader-spinner";

const Spinner = ({ isLoading, loadingText }) => {
    return (
        <>
            {isLoading ? (
                <div id="myLoadingModal" className="loading-modal">
                    <div className="loading-modal-content">
                        <Grid
                            visible={isLoading}
                            height="50"
                            width="50"
                            color="#003778"
                            ariaLabel="grid-loading"
                            radius="12.5"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                        <span className="loading-modal-text px-3">
                            {loadingText ? loadingText : "Please wait!!!"}
                        </span>
                    </div>
                </div>
            ) : (
                ""
            )}
        </>
    );
};

export default Spinner;
