// import React from 'react'

const Balances = () => {
  return (
    <div className="flex flex-col md:flex-row lg:w-[85%] mt-[1rem] lg:mx-auto py-[2rem] md:justify-between gap-[2rem]">
      <div className="balance-card">
        <p className="balance-title">FLOAT BALANCE</p>
        <span className="balance-amnt">Ksh. 10,000</span>
      </div>
      <div className="balance-card">
        <p className="balance-title">SALES TODAY</p>
        <span className="balance-amnt">Ksh. 50,000</span>
      </div>
      <div className="balance-card">
        <p className="balance-title">REVENUE TODAY</p>
        <span className="balance-amnt">Ksh. 3,000</span>
      </div>
    </div>
  );
};

export default Balances;
