"use client";

import { authenticate } from "@/app/lib/actions";
import styles from "./loginForm.module.css";
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

// Submit button component with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button type="submit" className={styles.loginButton} disabled={pending}>
      {pending ? (
        <>
          <AiOutlineLoading3Quarters className={styles.spinner} />
          Signing in...
        </>
      ) : (
        'Sign In'
      )}
    </button>
  );
}

const LoginForm = () => {
  const [state, formAction] = useFormState(authenticate, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard");
    }
  }, [state, router]);

  return (
    <div className={styles.loginContainer}>
      <div className={styles.formWrapper}>
        <div className={styles.logoContainer}>
          <img
            src="https://res.cloudinary.com/dql3efszd/image/upload/v1736874273/RGV911-Logo_pqibpo.png"
            alt="RGV911 Logo"
            className={styles.logo}
          />
          <h1 className={styles.title}>RGV911 IT Helpdesk</h1>
        </div>

        <form action={formAction} className={styles.form}>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <FaUser className={styles.inputIcon} />
              <input
                type="text"
                name="username"
                placeholder="Username"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputWrapper}>
              <FaLock className={styles.inputIcon} />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className={styles.input}
              />
            </div>
          </div>

          {state && typeof state === 'string' && (
            <div className={styles.error}>
              <strong>Error:</strong> {state}
            </div>
          )}

          <SubmitButton />

          <div className={styles.footer}>
            <p>RGV911 IT Department</p>
            <p className={styles.copyright}>&copy; {new Date().getFullYear()} All rights reserved</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;