"use client";

import { useActionState, useEffect } from "react";
import { login } from "../lib"; // login action server
import { useFormStatus } from "react-dom";
import { toast, ToastContainer, cssTransition } from "react-toastify";
import { LoaderCircle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { redirect } from "next/navigation";

export default function LoginPage() {
  const [state, loginAction] = useActionState(login, undefined);

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
    } else if (state?.success) {
      redirect("/dashboard");
    }
  }, [state]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form
        action={loginAction}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-neutral-300"
      >
        <h1 className="text-2xl font-semibold text-neutral-800 mb-6 text-center">
          Login to Your Account
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

        <div className="mb-6">
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

        <SubmitButton />

        <p className="text-sm text-center text-neutral-600 mt-4">
          Don’t have an account?{" "}
          <a
            href="/auth/signup"
            className="text-neutral-800 font-medium hover:underline hover:text-neutral-600"
          >
            Signup
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
      {pending ? "Logging in..." : "Login"}
    </button>
  );
}
