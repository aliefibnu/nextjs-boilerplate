"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { logout, updateName } from "@/app/auth/lib";
import { useFormStatus } from "react-dom";
import { toast, ToastContainer, cssTransition } from "react-toastify";
import { Save, LoaderCircle } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { Confirm } from "notiflix/build/notiflix-confirm-aio";

type UserInfo = {
  email: string;
  name: string;
  role: string;
};

export default function AccountSettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const router = useRouter();

  const Bounce = cssTransition({
    enter: "animate__animated animate__bounceIn",
    exit: "animate__animated animate__bounceOut",
  });

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/user/me");
      if (!res.ok) return router.push("/auth/login");
      const data = await res.json();
      setUser(data);
    }

    fetchUser();
  }, [router]);

  async function handleUpdateName(formData: FormData) {
    const res = await updateName(formData);
    if (res?.error) {
      toast.error(res.error, { transition: Bounce });
    } else {
      toast.success("Name updated", { transition: Bounce });
      setUser((prev) => (prev ? { ...prev, name: res.name as string } : prev));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-neutral-300">
        <h1 className="text-2xl font-semibold text-neutral-800 mb-2 text-center">
          Account Settings
        </h1>

        <ToastContainer />

        {!user ? (
          <div className="flex justify-center my-6">
            <LoaderCircle className="w-6 h-6 animate-spin text-neutral-600" />
          </div>
        ) : (
          <>
            <div className="mb-4 mt-4">
              <label className="block text-sm font-medium text-neutral-600">
                Email
              </label>
              <div className="text-neutral-800">{user.email}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-600">
                Role
              </label>
              <div className="text-neutral-800">{user.role}</div>
            </div>

            <form action={handleUpdateName} className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-700 mb-1"
              >
                Name
              </label>

              <div className="flex rounded-lg overflow-hidden border border-neutral-300">
                <input
                  name="name"
                  type="text"
                  defaultValue={user.name}
                  required
                  className="flex-1 px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                />
                <SubmitButton />
              </div>
            </form>

            <LogoutButton />
          </>
        )}
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      title="Save"
      className="px-4 bg-neutral-800 text-white hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {pending ? (
        <LoaderCircle className="animate-spin w-4 h-4" />
      ) : (
        <Save className="w-4 h-4" />
      )}
    </button>
  );
}

function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [logoutState, logoutAction] = useActionState(logout, undefined);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (logoutState?.success) {
      router.push("/auth/login");
    }
  }, [logoutState, router]);

  return (
    <form action={logoutAction} ref={formRef} method="post">
      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full bg-red-500 text-white rounded-lg py-2 font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        onClick={(e) => {
          e.preventDefault();
          Confirm.show(
            "Logout?",
            "Are you sure you want to logout?",
            "Logout",
            "Cancel",
            () => {
              setPending(true);
              formRef.current?.requestSubmit();
            },
            () => {},
            {
              titleColor: "#fb2c36",
              okButtonBackground: "#fb2c36",
            }
          );
        }}
      >
        {pending && <LoaderCircle className="w-4 h-4 animate-spin" />}
        {pending ? "Logging out..." : "Logout"}
      </button>
    </form>
  );
}
