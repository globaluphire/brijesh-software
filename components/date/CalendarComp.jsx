/* eslint-disable no-unused-vars */
/* eslint no-unneeded-ternary: "error" */
import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-date-range";
import format from "date-fns/format";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { showFormattedDate } from "../../utils/showFormattedDate";

const CalendarComp = ({ setDate, date1 }) => {

  // date state
  // const [calendar, setCalendar] = useState(new Date());

  // open close
  const [open, setOpen] = useState(false);

  // get the target element to toggle 
  const refOne = useRef(null);

  useEffect(() => {
    // set current date on component load
    // setCalendar(format(new Date(), "yyyy-MM-dd"));

    // event listeners
    document.addEventListener("keydown", hideOnEscape, true);
    document.addEventListener("click", hideOnClickOutside, true);
  }, []);

  // useEffect(() => {
  //   localStorage.setItem("calendar", calendar);
  // }, [calendar]);

  // hide dropdown on ESC press
  const hideOnEscape = (e) => {
    // console.log(e.key)
    if( e.key === "Escape" ) {
      setOpen(false);
      // localStorage.setItem("calendar", calendar);
    }
  };

  // Hide on outside click
  const hideOnClickOutside = (e) => {
    // console.log(refOne.current)
    // console.log(e.target)
    if( refOne.current && !refOne.current.contains(e.target) ) {
      setOpen(false);
      // localStorage.setItem("calendar", calendar);
    }
  };

  // on date change, store date in state
  const handleSelect = (date) => {
    // console.log(date)
    // let dateFormat = format(date, "yyyy-MM-dd");
    setDate(date);
    setOpen(false);
  };

  return (
    <div className="calendarWrap">

      <input
        required
        value={ date1 ? showFormattedDate(date1) : new Date() }
        readOnly
        className="inputBox"
        onClick={ () => setOpen(open => !open) }
      />

      <div ref={refOne}>
        {open && 
          <Calendar
            date={ date1 ? date1 : new Date() }
            onChange = { (date) => handleSelect(date) }
            className="calendarElement"
          />
        }
      </div>

    </div>
  );
};

export default CalendarComp;