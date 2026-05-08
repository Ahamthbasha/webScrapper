import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import InputField from "../../components/common/InputField"; 
import { verifyOTP, resendOTP } from '../../api/auth/userAuth';
import { Mail, ArrowLeft, Shield, CheckCircle, Clock, Send } from "lucide-react";

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});

type OTPForm = z.infer<typeof otpSchema>;

interface LocationState {
  email: string;
  expiresIn?: number;
}

interface ErrorResponse {
  success: boolean;
  message?: string;
  data?: {
    expiresIn?: number;
  };
}

interface ResendOTPResponse {
  success: boolean;
  message?: string;
  data?: {
    expiresIn?: number;
  };
}

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [timer, setTimer] = useState(() => state?.expiresIn || 60);
  const [canResend, setCanResend] = useState(() => !state?.expiresIn || state.expiresIn <= 0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    resetField,
  } = useForm<OTPForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  useEffect(() => {
    if (!state?.email) {
      toast.error("No registration session found. Please register again.");
      navigate("/register");
    }
  }, [state, navigate]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            setCanResend(true);
          }
          return newValue;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  const onSubmit = async (data: OTPForm) => {
    if (!state?.email) return;
    
    setIsVerifying(true);
    try {
      const res = await verifyOTP({ 
        email: state.email, 
        otp: data.otp 
      });

      if (res.success) {
        toast.success(res.message || "Email verified successfully! Your account has been created.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      toast.error(err.response?.data?.message || "OTP verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (!state?.email) return;
    
    setIsResending(true);
    try {
      const res = await resendOTP({ email: state.email }) as ResendOTPResponse;
      
      if (res.success) {
        toast.success(res.message || "New verification code sent successfully!");
        
        resetField("otp", { 
          defaultValue: "",
          keepError: false,
          keepTouched: false,
          keepDirty: false
        });
        
        setValue("otp", "", { 
          shouldValidate: false,
          shouldDirty: false,
          shouldTouch: false 
        });
        
        const expiresIn = res.data?.expiresIn || 60;
        setTimer(expiresIn);
        setCanResend(false);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      toast.error(err.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoBack = () => {
    navigate("/register");
  };

  const maskEmail = (email: string) => {
    if (!email) return "";
    const [localPart, domain] = email.split("@");
    if (localPart.length <= 3) {
      return `${localPart}***@${domain}`;
    }
    return `${localPart.substring(0, 3)}***${localPart.substring(localPart.length - 1)}@${domain}`;
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("otp", value, { shouldValidate: true });
    
    if (value.length === 6 && /^\d+$/.test(value)) {
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-lg relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl animate-pulse opacity-75"></div>
              <div className="relative">
                <Mail className="h-10 w-10 text-white" />
                <Shield className="h-5 w-5 text-white absolute -bottom-1 -right-1" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-400 mb-3">
              We've sent a verification code to
            </p>
            <div className="inline-flex items-center space-x-2 bg-gray-800/80 px-4 py-2 rounded-lg border border-gray-700">
              <Mail className="h-4 w-4 text-emerald-400" />
              <p className="text-base font-semibold text-emerald-400">
                {state?.email ? maskEmail(state.email) : ""}
              </p>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center space-x-2 mb-6 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <p className="text-xs text-gray-300">
              This code expires in 60 seconds for security
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="dark">
              <InputField
                label="Enter Verification Code"
                id="otp"
                type="text"
                placeholder="Enter 6-digit code"
                {...register("otp")}
                onChange={handleOtpChange}
                error={errors.otp?.message}
                maxLength={6}
                autoComplete="off"
                autoFocus={true}
              />
            </div>

            <div className="text-center">
              {!canResend ? (
                <div className="flex items-center justify-center space-x-2 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Clock className="h-5 w-5 text-emerald-400 animate-pulse" />
                  <p className="text-gray-300">
                    Code expires in{" "}
                    <span className="inline-flex items-center justify-center px-3 py-1 bg-gray-700 rounded-full font-mono font-bold text-emerald-400">
                      {timer}s
                    </span>
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <span className="text-red-400">⚠️</span>
                  <p className="text-red-400 font-medium">
                    Code expired. Please request a new one.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="
                w-full flex justify-center items-center py-3 px-4 
                bg-gradient-to-r from-emerald-600 to-teal-600 
                hover:from-emerald-700 hover:to-teal-700
                text-white font-semibold rounded-lg
                focus:outline-none focus:ring-4 focus:ring-emerald-500/50
                transition-all duration-200 transform hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                shadow-lg shadow-emerald-500/20
              "
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Create Account
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </button>

            <div className="text-center space-y-3">
              <p className="text-gray-400">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || isResending}
                  className={`
                    inline-flex items-center space-x-1 font-semibold transition-all duration-200
                    ${canResend && !isResending
                      ? "text-emerald-400 hover:text-emerald-300 cursor-pointer hover:underline" 
                      : "text-gray-600 cursor-not-allowed"
                    }
                  `}
                >
                  {isResending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Resend OTP</span>
                    </>
                  )}
                </button>
              </p>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <button
                type="button"
                onClick={handleGoBack}
                className="
                  w-full flex items-center justify-center space-x-2
                  text-gray-400 hover:text-emerald-400
                  transition-all duration-200
                  group
                "
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Registration</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
          }
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}