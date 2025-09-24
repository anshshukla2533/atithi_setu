import React, { useState } from "react";
import axios from "axios";

export default function UserLoginForm() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"login" | "otp">("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Step 1: Send login request to get OTP
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/user/login", { mobile, password });
      if (res.data.otpRequired) {
        setStep("otp");
        setMessage("OTP sent to your mobile.");
      } else {
        setMessage("Unexpected response.");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Login failed");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post("/api/user/verify-otp", { mobile, otp });
      if (res.data.ok) {
        setMessage("Login successful!");
        // Save user info, redirect, etc.
      } else {
        setMessage("OTP verification failed.");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || "OTP verification failed");
    }
    setLoading(false);
  };

  return (
    <div>
      {step === "login" ? (
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Mobile"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>Send OTP</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>Verify OTP</button>
        </form>
      )}
      {message && <div>{message}</div>}
    </div>
  );
}
