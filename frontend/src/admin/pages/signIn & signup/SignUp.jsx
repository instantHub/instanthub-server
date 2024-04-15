import React, { useState } from "react";

const SignUp = () => {

const [signInData, setSignInData ] = useState(); 

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  return (
    <div>
      <div>
        <form action="" method="post" onSubmit={handleSubmit}>
          <h1>Create a New Admin</h1>
          <div>
            <label htmlFor="adminname">Enter Admin Name</label>
            <input type="text" name="adminname" id="" />
            <label htmlFor="password">Enter Password</label>
            <input type="password" name="password" id="" />
            <label htmlFor="confirmpassword">Confirm Password</label>
            <input type="password" name="confirmpassword" id="" />
            <input type="submit" value="Submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
