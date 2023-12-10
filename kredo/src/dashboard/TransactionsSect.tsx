// import React from 'react'
import config from "../config";
import axios from "axios";

import { useState, useEffect } from "react";

import { Button } from "@chakra-ui/react";

// CSS Modules, react-datepicker-cssmodules.css
import "react-datepicker/dist/react-datepicker-cssmodules.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import DataTable from "./DataTable";

const TransactionsSect = () => {
  // Row Data Interface
  interface IRow {
    updatedAt: number;
    ref: string;
    accountNumber: number;
    amount: number;
    statusComplete: boolean;
  }
  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState<IRow[]>([]);

  const [startDate, setStartDate] = useState(new Date().getTime());
  const [endDate, setEndDate] = useState(new Date().getTime());
  // Fetch data to be displayed
  const getTransactions = async () => {
    const authTkn = sessionStorage.getItem("tkn");
    // console.log("session: ", authTkn);
    try {
      const response = await axios.get(
        `${config.API_URL}/api/transaction/history`,
        { headers: { Authorization: `${authTkn}` } }
      );
      const _data = response.data;
      // console.log(_data);
      setRowData(_data);
    } catch (error) {
      // console.log(error);
    }
  };
  // TODO: Func to filter data based on Transaction dates
  const filterTransactions = () => {
    console.log("Start date is:", startDate);
    console.log("End date is:", endDate);
    const filteredTransactions = rowData?.filter(
      (transaction) =>
        new Date(transaction.updatedAt.toString()).getTime() >= startDate &&
        new Date(transaction.updatedAt.toString()).getTime() <= endDate
    );
    console.log("Filtered transactions are:", filteredTransactions);
    setRowData(filteredTransactions);
  };
  // Fetch data & update rowData state
  useEffect(() => {
    getTransactions();
  }, []);
  return (
    <div className="lg:w-[85%] mx-auto lg:mx-auto mt-[1rem] shadow-md bg-white rounded-md p-[2rem]">
      <div className="mb-[2rem]">
        <h1 className="text-[#7752FE] w-[90%] font-[700] mb-[1rem] mx-auto md:mx-0 text-2xl">
          Purchases
        </h1>
        <div className="flex flex-col md:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col md:flex-row items-center gap-[1rem]">
            <p>Start date:</p>
            <DatePicker
              className="input"
              selected={startDate}
              onChange={(date: string) => {
                const startDateTime = new Date(date).getTime();
                setStartDate(startDateTime);
                // console.log("Start date is:", startDate);
              }}
            />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-[1rem]">
            <p>End date:</p>
            <DatePicker
              className="input"
              selected={endDate}
              onChange={(date: string) => {
                const endDateTime = new Date(date).getTime();
                setEndDate(endDateTime);
                // console.log("End date is:", endDate);
              }}
            />
          </div>
          <Button
            size="sm"
            bg={"primary.default"}
            color={"white"}
            _hover={{ bg: "primary.hover" }}
            className="mt-[1rem] mx-[5%]"
            onClick={filterTransactions}
          >
            Reload
          </Button>
        </div>
      </div>
      <DataTable rowData={rowData} />
    </div>
  );
};

export default TransactionsSect;
