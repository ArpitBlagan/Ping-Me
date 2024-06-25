import * as z from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useState } from "react";
const SignInSchema = z.object({
  name: z.string(),
  email: z.string().email("Enter valid email"),
  password: z
    .string()
    .min(6, "Password should be atleast 6 characters long")
    .max(20, "Password should be atmost 20 characters long"),
});
type signin = z.infer<typeof SignInSchema>;
const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<signin>({ resolver: zodResolver(SignInSchema) });
  const onSubmit: SubmitHandler<signin> = async (data) => {
    console.log(data);
    toast("Signing Up a user");
    setLoading(true);
    try {
      const body = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      const res = await axios.post(
        "https://chat-assignment-qrb7.onrender.com/api/register",
        body,
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      toast.success("Signined up successfully");
      setLoading(false);
      navigate("/signup");
    } catch (err) {
      console.log(err);
      toast.error("something went wrong while signing in!");
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[80dvh] flex items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="form flex flex-col gap-3 md:w-1/2  w-full py-4 px-6 "
      >
        <p className="text-center">
          Already registered?{"   "}
          <Link to="/signUp" className="underline">
            SignIn
          </Link>
        </p>
        <div className="flex flex-col gap-2 items-start">
          <label>Name</label>
          <Input type="text" placeholder="Arpit" {...register("name")} />
          {errors.name && (
            <span className="text-red-500">{errors.name.message}</span>
          )}
        </div>
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
            type="text"
            placeholder="@123arpit"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-red-500">{errors.password.message}</span>
          )}
        </div>
        <Button disabled={loading}>{loading ? "Signing up" : "SignUp"}</Button>
      </form>
    </div>
  );
};

export default SignUp;
