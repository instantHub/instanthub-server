import React from 'react';

const SignIn = () => {
    const handleSubmit = (e) => {
        e.preventDefault();
      };
      return (
        <div>
          <div>
            <form action="" method="post" onSubmit={handleSubmit}>
              <h1>Admin Login</h1>
              <div>
                <label htmlFor="adminname">Admin Name</label>
                <input type="text" name="adminname" id="" />
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="" />
                <input type="submit" value="Submit" />
              </div>
            </form>
          </div>
        </div>
      );
};

export default SignIn;