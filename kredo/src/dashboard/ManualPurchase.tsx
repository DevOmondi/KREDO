// import React from 'react'
import { useState } from "react";
// import axios from "axios";
// import config from "../config";
import { Button } from "@chakra-ui/react";

const ManualPurchase = () => {
  // services object
  type servicesObj = {
    "Safaricom Airtime": {
      serviceID: number;
      serviceCode: string;
    };
    "Airtel Airtime": {
      serviceID: number;
      serviceCode: string;
    };
    "Telkom Airtime": {
      serviceID: number;
      serviceCode: string;
    };
    "KPLC Postpaid": {
      serviceID: number;
      serviceCode: string;
    };
    "KPLC Prepaid": {
      serviceID: number;
      serviceCode: string;
    };
  };
  const services: servicesObj = {
    "Safaricom Airtime": { serviceID: 101, serviceCode: "SAFCOM" },
    "Airtel Airtime": { serviceID: 102, serviceCode: "AIRTEL" },
    "Telkom Airtime": { serviceID: 103, serviceCode: "TELKOM" },
    "KPLC Postpaid": { serviceID: 104, serviceCode: "KPLCPOSTPAID" },
    "KPLC Prepaid": { serviceID: 105, serviceCode: " KPLCPREPAID" },
  };
  // Payload object
  type payloadObj = {
    serviceCode: string;
    serviceID: string;
  };
  const initialPayloadObj: payloadObj = {
    serviceCode: "",
    serviceID: "",
  };
  //   Input states
  const [accountNumber, setAccountNumber] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [payload, setPayload] = useState<payloadObj>(initialPayloadObj);
  //   const [isLoading, setIsLoading] = useState(false);
  //   TODO: Func to handle service change
  const changeServiceFunc = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const _service = event.target.value;
    setPayload({
      serviceCode: services[_service as keyof servicesObj].serviceCode,
      serviceID: services[_service as keyof servicesObj].serviceID.toString(),
    });
  };
  //   TODO: Func to handle purchase
  const purchaseHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    // const authTkn = sessionStorage.getItem("tkn");
    event.preventDefault();
    if (
      !accountNumber ||
      !amountPaid ||
      !payload?.serviceCode ||
      !payload?.serviceID
    ) {
      return alert("Sorry! Some deails are missing.");
    }
    console.log("Payload is:", payload);
    // setIsLoading(true);
    // axios
    //   .post(
    //     `${config.API_URL}/api/transaction/purchase`,
    //     {
    //       accountNumber: accountNumber,
    //       amountPaid: amountPaid,
    //       serviceCode: payload.serviceCode,
    //       serviceID: payload.serviceID,
    //     },
    //     { headers: { Authorization: `${authTkn}` } }
    //   )
    //   .then((response) => {
    //     if (response.status === 200) {
    //       setTimeout(function () {
    //         return alert(
    //           "Transaction completed successfully!! :)"
    //           //   handleAlertClick()
    //         );
    //       }, 3000);
    //     }
    //   })
    //   .catch((error) => {
    //     setTimeout(function () {
    //       console.log(error);
    //       return alert(
    //         "Ow Snap!!! looks like something went wrong :("
    //         // handleAlertClick()
    //       );
    //     }, 3000);
    //   });
    //function to stop loading after "ok" click on alert
    // const handleAlertClick = () => {
    //   setIsLoading(false);
    // };
  };
  return (
    <div className="lg:w-[85%] mt-[1rem] shadow-md lg:mx-auto bg-white rounded-md p-[2rem]">
      <p className="text-[#7752FE] w-[90%] font-[1000] mb-[1rem] mx-auto md:mx-0 text-3xl">
        Manual Purchase
      </p>
      <div className="flex flex-col md:flex-row lg:items-end lg:justify-between">
        <div className="flex md:gap-[7rem] gap-[1rem] flex-col md:flex-row w-[90%] mx-auto md:mx-0">
          {/* Phone number */}
          <div>
            <label>Enter Phone number</label>
            <input
              type="text"
              placeholder="e.g 254xxxxxxxxx"
              className="input"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setAccountNumber(event.target.value)
              }
            />
          </div>
          {/* Service */}
          <div>
            <label htmlFor="services">Type of Service</label>
            <select
              id="services"
              className="input"
              onChange={changeServiceFunc}
              defaultValue=""
            >
              <option value="" hidden disabled>
                --select service--
              </option>
              {Object.keys(services).map((_service) => (
                <option key={_service} value={_service}>
                  {_service}
                </option>
              ))}
            </select>
          </div>
          {/* Amount */}
          <div>
            <label>Enter Amount</label>
            <input
              type="number"
              className="input"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                setAmountPaid(event.target.value)
              }
            />
          </div>
        </div>
        <Button
          size="sm"
          bg={"primary.default"}
          color={"white"}
          _hover={{ bg: "primary.hover" }}
          className="mt-[1rem] mx-[5%]"
          onClick={purchaseHandler}
        >
          Purchase
        </Button>
      </div>
    </div>
  );
};

export default ManualPurchase;
