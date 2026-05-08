import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import { useState } from "react";
import InputField from "../../components/common/InputField"; 
import PasswordField from "../../components/common/PasswordField"; 
import { registerUser } from "../../api/auth/userAuth";
import { Search, Globe, ArrowRight} from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

interface ErrorResponse {
  success: boolean;
  message?: string;
  errors?: Array<{ msg: string; path: string }>;
}

export default function Register() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      const { name, email, password } = data;
      const res = await registerUser({ name, email, password });

      if (res.success) {
        toast.success(res.message || "Verification code sent successfully!");
        navigate("/verify-otp", { 
          state: { 
            email: res.data?.email || email,
            expiresIn: res.data?.expiresIn || 60 
          } 
        });
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;
      
      if (err.response?.data) {
        const responseData = err.response.data;
        
        if (responseData.errors && Array.isArray(responseData.errors)) {
          responseData.errors.forEach((validationErr) => {
            toast.error(validationErr.msg);
          });
        } else if (responseData.message) {
          toast.error(responseData.message);
        } else {
          toast.error("Registration failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsSubmitting(false);
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
              <div className="relative flex space-x-1">
                <Globe className="h-8 w-8 text-white" />
                <Search className="h-6 w-6 text-white absolute -bottom-1 -right-1" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-400">
              Start your web scraping journey today
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="dark">
              <InputField
                label="Full Name"
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                error={errors.name?.message}
              />
            </div>

            <div className="dark">
              <InputField
                label="Email Address"
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                error={errors.email?.message}
              />
            </div>

            <div className="dark">
              <PasswordField
                label="Password"
                id="password"
                placeholder="••••••••"
                {...register("password")}
                error={errors.password?.message}
              />
            </div>

            <div className="dark">
              <PasswordField
                label="Confirm Password"
                id="confirmPassword"
                placeholder="••••••••"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full flex justify-center items-center py-3 px-4 
                bg-gradient-to-r from-emerald-600 to-teal-600 
                hover:from-emerald-700 hover:to-teal-700
                text-white font-semibold rounded-lg
                focus:outline-none focus:ring-4 focus:ring-emerald-500/50
                transition-all duration-200 transform hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                shadow-lg shadow-emerald-500/20
                mt-6
              "
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Verification Code...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{" "}
              <Link 
                to="/login" 
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Terms & Privacy */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs text-center text-gray-500">
              By signing up, you agree to our{" "}
              <a href="/terms" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
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