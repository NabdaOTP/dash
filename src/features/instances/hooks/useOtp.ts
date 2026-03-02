import { useCallback, useState } from "react";
import { toast } from "sonner";
import * as otpService from "../services/otp-service";

function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  return /^\+\d+$/.test(trimmed);
}

function isValidCode(code: string): boolean {
  const trimmed = code.trim();
  return /^\d{6}$/.test(trimmed);
}

export function useOtp() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const sendOtp = useCallback(async () => {
    if (!isValidPhone(phone)) {
      toast.error("Phone must start with + and contain digits only");
      return;
    }

    setIsSending(true);
    try {
      await otpService.sendOtp(phone.trim());
      setOtpSent(true);
      toast.success("OTP sent successfully");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? "Failed to send OTP";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }, [phone]);

  const verifyOtp = useCallback(async () => {
    if (!otpSent) {
      toast.error("Send an OTP first");
      return;
    }

    if (!isValidCode(code)) {
      toast.error("OTP must be 6 digits");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Phone must start with + and contain digits only");
      return;
    }

    setIsVerifying(true);
    try {
      await otpService.verifyOtp(phone.trim(), code.trim());
      toast.success("OTP verified successfully");
      setCode("");
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? "Failed to verify OTP";
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  }, [phone, code, otpSent]);

  const handlePhoneChange = useCallback((value: string) => {
    setPhone(value);
    // Changing phone invalidates previous OTP relationship
    setOtpSent(false);
    setCode("");
  }, []);

  return {
    phone,
    setPhone: handlePhoneChange,
    code,
    setCode,
    otpSent,
    isSending,
    isVerifying,
    sendOtp,
    verifyOtp,
  };
}

