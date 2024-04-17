import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../../../features/adminApiSlice";
import { setCredentials } from "../../../features/authSlice";
import { toast } from "react-toastify";
import Cookies from "universal-cookie";

const SignIn = () => {
  const [signInData, setSignInData] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const cookies = new Cookies();

  const { adminInfo } = useSelector((state) => state.auth);

  //   If AdminInfo(logged In) is available navigate to Admin Dashboard
  useEffect(() => {
    if (adminInfo) {
      navigate("/admin/dashboard");
    }
  }, [navigate, adminInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      console.log("res", res);

      // dispatch(setCredentials(res));
      dispatch(setCredentials(res));
      toast.success("Logged in successfull");
      navigate("/admin/dashboard");
    } catch (err) {
      console.log("catch error");
      console.log(err?.data?.message || err.error);
      toast.error(err?.data?.message || err.error);
    }
  };
  return (
    <div>
      <div className="mx-auto w-[30%] my-[10%] border rounded shadow-lg p-5">
        <form
          action=""
          method="post"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <h1 className="text-lg font-semibold">Create a New Admin</h1>
          <hr />
          <div className="flex flex-col gap-2 mx-10">
            <label htmlFor="adminname">Admin</label>
            <input
              type="text"
              name="adminname"
              id="adminname"
              placeholder="Name"
              className="border rounded px-2 py-1"
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Password"
              className="border rounded px-2 py-1"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="submit"
              value="Login"
              className="border rounded px-2 py-1 mt-3 w-[50%] bg-green-600 text-white hover:border-black hover:bg-green-700 cursor-pointer"
            />
          </div>
        </form>

        {/* Undo for new admin registration */}
        {/* <div className="text-end -mt-11">
          <Link to={"/admin/signup"}>
            <button className="text-sm bg-blue-500 px-2 py-1 mt-3 border rounded text-white">
              Register
            </button>
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default SignIn;
