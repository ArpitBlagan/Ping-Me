import * as z from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { useState } from "react";
import { useContext } from "react";
import { contextt } from "./Contextt";
const SignUpSchema = z.object({
  email: z.string().email("Enter valid email"),
  password: z
    .string()
    .min(6, "Password should be atleast 6 characters long")
    .max(20, "Password should be atmost 20 characters long"),
});
type signup = z.infer<typeof SignUpSchema>;
const SignIn = () => {
  const value = useContext(contextt);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signup>({ resolver: zodResolver(SignUpSchema) });
  const onSubmit: SubmitHandler<signup> = async (data) => {
    console.log(data);
    setLoading(true);
    try {
      const body = {
        email: data.email,
        password: data.password,
      };
      const res = await axios.post(
        "https://chat-assignment-qrb7.onrender.com/api/login",
        body,
        {
          withCredentials: true,
        },
      );
      console.log(res.data);
      value?.setInfo({
        isloggedIn: true,
        name: res.data.name,
        email: res.data.email,
        id: res.data.id,
      });
      setLoading(false);
      toast.success("signined In successfully :) !");
      navigate("/chat");
    } catch (err) {
      toast.error("something went wrong while signing in :( !");
      console.log(err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80dvh] flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form flex flex-col gap-3 md:w-1/2   w-full py-4 px-6"
      >
        <p className="text-center">
          Don't have an account?{"   "}
          <Link to="/signIn" className="underline">
            SignUp
          </Link>
        </p>
        <div className="flex flex-col gap-2 items-start">
          <label>Email</label>
          <Input
            type="email"
            placeholder="arpit@gmail.com"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-red-500">{errors.email.message}</span>
          )}
        </div>
        <div className="flex flex-col gap-2 items-start">
          <label>Password</label>
          <Input
            type="password"
            placeholder="@123arpit"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-red-500">{errors.password.message}</span>
          )}
        </div>
        <Button disabled={loading}>{loading ? "signing in" : "SignIn"}</Button>
      </form>
    </div>
  );
};
export default SignIn;
