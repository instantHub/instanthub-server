import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUpdateAdminMutation } from "../../features/adminApiSlice";
import { setCredentials } from "../../features/authSlice";

const UpdateAdmin = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state) => state.auth);

  const [updateAdmin] = useUpdateAdminMutation();

  //   console.log(adminInfo);

  useEffect(() => {
    if (adminInfo) {
      setName(adminInfo.name);
      setEmail(adminInfo.email);
      setAdminId(adminInfo._id);
    }
  }, [adminInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(name, email, password, confirmPassword, adminId);

    if (password === confirmPassword) {
      try {
        const res = await updateAdmin({
          _id: adminId,
          name,
          email,
          password,
        }).unwrap();
        dispatch(setCredentials(res.updatedAdmin));
        toast.success(res.message);
        navigate("/admin/dashboard");
      } catch (err) {
        console.log("catch error");
        console.log(err?.data?.message || err.error);
        toast.error(err?.data?.message || err.error);
      }
    } else {
      toast.error("Passwords did not match..!");
      setConfirmPassword("");
    }
  };

  return (
    <div>
      <div className="mx-auto w-[40%] max-2sm:w-[90%] my-[10%] border rounded shadow-lg p-5">
        <form
          action=""
          method="post"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <h1 className="text-lg font-semibold">Update Admin</h1>
          <hr />
          <div className="flex flex-col gap-2 mx-10">
            <label htmlFor="adminname">Enter Admin Name</label>
            <input
              type="text"
              value={name}
              name="adminname"
              id="adminname"
              placeholder="Name"
              className="border rounded px-2 py-1"
              onChange={(e) => setName(e.target.value)}
              required
            />
            <label htmlFor="adminemail">Enter Admin Email</label>
            <input
              type="email"
              value={email}
              name="adminemail"
              id="adminemail"
              placeholder="Email"
              className="border rounded px-2 py-1"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Enter Password</label>
            <input
              type="password"
              value={password}
              name="password"
              id="password"
              placeholder="Password"
              className="border rounded px-2 py-1"
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="confirmpassword">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              name="confirmpassword"
              id="confirmpassword"
              placeholder="Confirm Password"
              className="border rounded px-2 py-1"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="">
              <input
                type="submit"
                value="Update"
                className="border rounded px-2 py-1 mt-3 w-[50%] bg-green-600 text-white hover:border-black hover:bg-green-700 cursor-pointer"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateAdmin;
