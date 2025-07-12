"use client";
import { useActionState, useEffect } from "react";
import { signup } from "../lib";
import { useFormStatus } from "react-dom";
import { cssTransition, toast, ToastContainer } from "react-toastify";
import { LoaderCircle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { redirect } from "next/navigation";

export default function SignupPage() {
  const [state, loginAction] = useActionState(signup, undefined);

  useEffect(() => {
    const Bounce = cssTransition({
      enter: "animate__animated animate__bounceIn",
      exit: "animate__animated animate__bounceOut",
    });

    if (state?.errors) {
      Object.entries(state.errors).forEach(([_, messages]) => {
        if (Array.isArray(messages)) {
          toast.error(messages[0], {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            pauseOnHover: true,
            draggable: true,
            theme: "light",
            transition: Bounce,
          });
        }
      });
    } else if (state?.success) redirect("/dashboard");
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form
        action={loginAction}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-neutral-300"
      >
        <h1 className="text-2xl font-semibold text-neutral-800 mb-6 text-center">
          Signup to Your Account
        </h1>
        <ToastContainer />

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-1 text-sm font-medium text-neutral-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="text-neutral-800 w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block mb-1 text-sm font-medium text-neutral-700"
          >
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            className="text-neutral-800 w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="name"
            className="block mb-1 text-sm font-medium text-neutral-700"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            required
            className="text-neutral-800 w-full border border-neutral-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          />
        </div>

        <SubmitButton />

        <p className="text-xs text-neutral-500 mt-4 text-center">
          By signing up, you agree to our terms and privacy policy.
        </p>

        <p className="text-sm text-center text-neutral-600 mt-4">
          Already have an account?{" "}
          <a
            href="login"
            className="text-neutral-800 font-medium hover:underline hover:text-neutral-600"
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-neutral-800 text-white rounded-lg py-2 font-medium hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending ? <LoaderCircle className="animate-spin w-4 h-4" /> : null}
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}
