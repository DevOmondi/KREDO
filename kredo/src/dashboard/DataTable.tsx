import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";

import { useMemo, useState } from "react";

import {
  ColDef,
  ICellRendererParams,
  ValueFormatterParams,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css"; // Core CSS
import "ag-grid-community/styles/ag-theme-quartz.css"; // Theme

/* Custom Cell Renderer (Display tick / cross in 'Purchase Successful' column) */
const MissionResultRenderer = (params: ICellRendererParams) => (
  <span
    style={{
      display: "flex",
      justifyContent: "center",
      height: "100%",
      alignItems: "center",
    }}
  >
    {
      <img
        alt={`${params.value}`}
        src={`https://www.ag-grid.com/example-assets/icons/${
          params.value ? "tick-in-circle" : "cross-in-circle"
        }.png`}
        style={{ width: "auto", height: "auto" }}
      />
    }
  </span>
);

/* Format Date Cells */
const dateFormatter = (params: ValueFormatterParams): string => {
  return new Date(params.value).toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
// interface GridReadyEvent<TData = any, TContext = any> {
//   // The grid api. 
//   api: GridApi<TData>;
//   // Application context as set on `gridOptions.context`. 
//   context: TContext;
//   // Event identifier 
//   type: string;
// }
const DataTable = (props) => {
  // Column Definitions.
  const [colDefs] = useState<ColDef[]>([
    {
      field: "updatedAt",
      headerName: "Date",
      width: 250,
      valueFormatter: dateFormatter,
      checkboxSelection: true,
    },
    {
      field: "ref",
      headerName: "REF",
      width: 200,
    },
    {
      field: "accountNumber",
      headerName: "Phone No",
      width: 225,
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 130,
    },
    {
      field: "statusComplete",
      headerName: "Purchase Successful?",
      width: 200,
      cellRenderer: MissionResultRenderer,
    },
  ]);

  // Apply settings across all columns
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      filter: true,
      editable: true,
    };
  }, []);

  return (
    <div className="font-nunito">
      <div
        className={"ag-theme-quartz font-nunito"}
        style={{ width: "100%", height: "20rem" }}
      >
        <AgGridReact
          rowData={props?.rowData}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          rowSelection="multiple"
          onSelectionChanged={(event) => console.log(event)}
          onCellValueChanged={(event) =>
            console.log(`New Cell Value: ${event.value}`)
          }
        />
      </div>
    </div>
  );
};

export default DataTable;
