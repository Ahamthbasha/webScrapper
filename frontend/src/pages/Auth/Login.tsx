import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { type AxiosError } from "axios";
import { useDispatch } from "react-redux";
import InputField from "../../components/common/InputField"; 
import PasswordField from "../../components/common/PasswordField"; 
import { login } from "../../api/auth/userAuth"; 
import { setUser } from "../../redux/slices/userSlice";
import { Search, Globe, ArrowRight } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface ValidationError {
  msg: string;
  path: string;
}

interface ErrorResponse {
  success: boolean;
  message?: string;
  errors?: ValidationError[];
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await login(data);

      if (res.success) {
        const { user } = res.data;
        
        dispatch(
          setUser({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          })
        );
        
        toast.success("Welcome back! Ready to scrape some data?");
        navigate("/");
      }
    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;

      if (err.response?.data) {
        const responseData = err.response.data;

        if (responseData.errors && Array.isArray(responseData.errors)) {
          responseData.errors.forEach((validationErr, index) => {
            toast.error(validationErr.msg, {
              toastId: `error-${validationErr.path}-${index}`,
            });
          });
        } else if (responseData.message) {
          toast.error(responseData.message);
        } else {
          toast.error("Login failed. Please try again.");
        }
      } else {
        toast.error("Network error. Please check your connection and try again.");
      }
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
              Welcome Back
            </h2>
            <p className="text-gray-400">
              Login to start extracting web data
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Wrap InputField with div that has dark mode class */}
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
              "
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                <>
                  Log In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{" "}
              <Link 
                to="/register" 
                className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Create account
              </Link>
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
        
        /* Override styles for dark mode inputs */
        .dark input,
        .dark .password-input {
          background-color: rgb(31, 41, 55) !important;
          color: white !important;
          border-color: rgb(55, 65, 81) !important;
        }
        
        .dark input:focus,
        .dark .password-input:focus {
          border-color: rgb(16, 185, 129) !important;
          ring-color: rgb(16, 185, 129) !important;
        }
        
        .dark input::placeholder {
          color: rgb(107, 114, 128) !important;
        }
        
        .dark label {
          color: rgb(209, 213, 219) !important;
        }
      `}</style>
    </div>
  );
}