import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { FilterMatchMode, FilterOperator } from "primereact/api";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { ProgressBar } from "primereact/progressbar";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Slider } from "primereact/slider";
import { TriStateCheckbox } from "primereact/tristatecheckbox";
import { ToggleButton } from "primereact/togglebutton";
import { Rating } from "primereact/rating";
import { CustomerService } from "../../demo/service/CustomerService";
import { ProductService } from "../../demo/service/ProductService";
import { SelectButton } from "primereact/selectbutton";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";

import { supabase } from "../../config/supabaseClient";

const Users = () => {
  const [fetchedUsersData, setFetchedUsersData] = useState([]);

  const [customers1, setCustomers1] = useState(null);
  const [customers2, setCustomers2] = useState([]);
  const [customers3, setCustomers3] = useState([]);
  const [filters1, setFilters1] = useState(null);
  const [loading1, setLoading1] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const [idFrozen, setIdFrozen] = useState(false);
  const [products, setProducts] = useState([]);
  const [globalFilterValue1, setGlobalFilterValue1] = useState("");
  const [expandedRows, setExpandedRows] = useState(null);
  const [allExpanded, setAllExpanded] = useState(false);

  const [sizeOptions] = useState([
    { label: "Small", value: "small" },
    { label: "Normal", value: "normal" },
    { label: "Large", value: "large" },
  ]);
  const [size, setSize] = useState(sizeOptions[0].value);

  const representatives = [
    { name: "Amy Elsner", image: "amyelsner.png" },
    { name: "Anna Fali", image: "annafali.png" },
    { name: "Asiya Javayant", image: "asiyajavayant.png" },
    { name: "Bernardo Dominic", image: "bernardodominic.png" },
    { name: "Elwin Sharvill", image: "elwinsharvill.png" },
    { name: "Ioni Bowcher", image: "ionibowcher.png" },
    { name: "Ivan Magalhaes", image: "ivanmagalhaes.png" },
    { name: "Onyama Limba", image: "onyamalimba.png" },
    { name: "Stephen Shaw", image: "stephenshaw.png" },
    { name: "XuXue Feng", image: "xuxuefeng.png" },
  ];

  const roles = ["SUPER_ADMIN", "ADMIN", "CANDIDATE", "NO ACCESS"];

  const clearFilter1 = () => {
    initFilters1();
  };

  const onGlobalFilterChange1 = (e) => {
    const value = e.target.value;
    let _filters1 = { ...filters1 };
    _filters1["global"].value = value;

    setFilters1(_filters1);
    setGlobalFilterValue1(value);
  };

  const renderHeader1 = () => {
    return (
      <div className="flex justify-content-between">
        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Clear"
          outlined
          onClick={clearFilter1}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue1}
            onChange={onGlobalFilterChange1}
            placeholder="Keyword Search"
          />
        </span>
        <SelectButton
          value={size}
          onChange={(e) => setSize(e.value)}
          options={sizeOptions}
        />
      </div>
    );
  };

  const dateTimeFormat = (val) => {
    if (val) {
      return new Date(val);
    }
  };

  async function fetchUsers() {
    setLoading1(true);

    // fetch users data
    try {
      let query = supabase.from("users").select("*");

      let { data: usersData, error } = await query.order("created_at", {
        ascending: false,
        nullsFirst: false,
      });

      if (usersData) {
        usersData.forEach((i) => (i.created_at = dateTimeFormat(i.created_at)));
        setFetchedUsersData(usersData);
        setLoading1(false);
      }
    } catch (e) {
      // todo: add new error toast...
      //   toast.error(
      //     "System is unavailable.  Unable to fetch Client Data.  Please try again later or contact tech support!",
      //     {
      //       position: "bottom-right",
      //       autoClose: false,
      //       hideProgressBar: false,
      //       closeOnClick: true,
      //       pauseOnHover: true,
      //       draggable: true,
      //       progress: undefined,
      //       theme: "colored",
      //     }
      //   );
    }
  }

  useEffect(() => {
    fetchUsers();
    initFilters1();
  }, []);

  const initFilters1 = () => {
    setFilters1({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      email: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }],
      },
      created_at: {
        operator: FilterOperator.AND,
        constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }],
      },
      role: {
        operator: FilterOperator.OR,
        constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }],
      },
    });
    setGlobalFilterValue1("");
  };

  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="dd/mm/yy"
        placeholder="dd/mm/yyyy"
        mask="99/99/9999"
      />
    );
  };

  const roleBodyTemplate = (rowData) => {
    return (
      <span className={`customer-badge role-${rowData.role}`}>
        {rowData.role}
      </span>
    );
  };

  const roleFilterTemplate = (options) => {
    return (
      <Dropdown
        value={options.value}
        options={roles}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        itemTemplate={roleItemTemplate}
        placeholder="Select a Role"
        className="p-column-filter"
        showClear
      />
    );
  };

  const roleItemTemplate = (option) => {
    return <span className={`customer-badge role-${option}`}>{option}</span>;
  };

  const statusOrderBodyTemplate = (rowData) => {
    return (
      <span className={`order-badge order-${rowData.status.toLowerCase()}`}>
        {rowData.status}
      </span>
    );
  };

  const header1 = renderHeader1();

  //   All Render Blocks
  const actionButtonRender = (rowData) => {
    return (
      <div className="flex flex-wrap justify-content-center">
        <Button
          style={{ height: "2rem", width: "2rem" }}
          icon="pi pi-pen-to-square"
          text
          size="small"
          aria-label="Filter"
          onClick={() => router.push(`/user-details/${user.user_key_id}`)}
        />
      </div>
    );
  };

  const createdDateRender = (rowData) => {
    return rowData.created_at.toLocaleString("en-IN");
  };

  return (
    <div className="grid">
      <div className="col-12">
        <div className="card">
          <div className="flex align-items-baseline">
            <h5>All Users</h5>
            <small>&nbsp;(Total: {fetchedUsersData.length})</small>
          </div>
          <DataTable
            value={fetchedUsersData}
            size={size}
            paginator
            rowsPerPageOptions={[5, 10, 25, 50]}
            className="p-datatable-gridlines"
            rows={10}
            dataKey="id"
            loading={loading1}
            responsiveLayout="scroll"
            showGridlines
            stripedRows
            rowHover
            removableSort
            scrollable
            scrollHeight="65vh"
            sortMode="multiple"
            tableStyle={{ minWidth: "50rem" }}
            filters={filters1}
            header={header1}
            filterDisplay="menu"
            resizableColumns
            columnResizeMode="expand"
            emptyMessage="No users found."
          >
            <Column
              field="user_key_id"
              header="Action"
              body={actionButtonRender}
              align="center"
              style={{ maxWidth: "5rem" }}
            />
            <Column
              filter
              filterPlaceholder="Search by name"
              field="name"
              sortable
              header="Name"
            ></Column>
            <Column
              field="role"
              sortable
              header="Role"
              filterMenuStyle={{ width: "14rem" }}
              style={{ minWidth: "12rem" }}
              body={roleBodyTemplate}
              filter
              filterElement={roleFilterTemplate}
            ></Column>
            <Column
              filter
              filterPlaceholder="Search by email"
              field="email"
              sortable
              header="Email"
            ></Column>
            <Column
              field="created_at"
              sortable
              filter
              filterPlaceholder="Search by date"
              header="Created at"
              body={createdDateRender}
              filterElement={dateFilterTemplate}
            ></Column>
          </DataTable>
        </div>
      </div>
    </div>
  );
};

export default Users;
