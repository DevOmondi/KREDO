// import React from 'react'
import axios from "axios";
import config from "../config";
import { useState, useEffect } from "react";

const Balances = () => {
  //float state management
  const [float, setFloat] = useState("");
  // loading state management
  // const [isLoading, setIsLoading] = useState(false);

  //fetch float from db
  const getFloat = async () => {
    const authTkn = sessionStorage.getItem("tkn");
    // setIsLoading(true);
    try {
      await axios({
        method: "get",
        url: `${config.API_URL}/api/transaction/float`,
        headers: { Authorization: `${authTkn}` },
      }).then((response) => {
        const _response = response.data;
        // console.log("Response is:",_response);
        setFloat(_response);
        // setIsLoading(false);
      });
    } catch (error) {
      setTimeout(function () {
        if (error) {
          return alert("Sorry!! couldn't fetch float :(");
          // console.log(error)
        }
      }, 5000);
    }
  };
  // Fetch float on page load
  useEffect(() => {
    getFloat();
  }, []);
  return (
    <div className="flex flex-col md:flex-row lg:w-[85%] mt-[1rem] lg:mx-auto py-[2rem] md:justify-between gap-[2rem]">
      <div className="balance-card">
        <p className="balance-title">FLOAT BALANCE</p>
        <span className="balance-amnt">
          Ksh. {Number(float.balance || 0)?.toFixed(2)}
        </span>
      </div>
      <div className="balance-card">
        <p className="balance-title">SALES TODAY</p>
        <span className="balance-amnt">--</span>
      </div>
      <div className="balance-card">
        <p className="balance-title">REVENUE TODAY</p>
        <span className="balance-amnt">--</span>
      </div>
    </div>
  );
};

export default Balances;
