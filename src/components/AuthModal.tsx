import { useState } from "react";
import { Eye, EyeOff, Mail, Phone, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

const AuthModal = ({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthModalProps) => {
  const { login, loginWithOTP, register, verifyRegistration, requestLoginOTP } =
    useAuth();

  // Login states
  const [loginData, setLoginData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Register states
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // OTP states
  const [otpData, setOtpData] = useState({
    email: "",
    otp: "",
    tempToken: "",
    isOTPMode: false,
    isVerifying: false,
    isRegistrationOTP: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.emailOrPhone || !loginData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);
      await login(loginData.emailOrPhone, loginData.password);
      onClose();
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !registerData.name ||
      !registerData.email ||
      !registerData.phone ||
      !registerData.password
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (registerData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      const response = await register({
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
      });

      setOtpData({
        email: registerData.email,
        otp: "",
        tempToken: response.tempToken,
        isOTPMode: true,
        isVerifying: false,
        isRegistrationOTP: true,
      });
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpData.email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setIsLoading(true);
      await requestLoginOTP(otpData.email);
      setOtpData((prev) => ({
        ...prev,
        isOTPMode: true,
        isRegistrationOTP: false,
      }));
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpData.otp.length !== 6) {
      toast.error("Please enter the complete OTP");
      return;
    }

    try {
      setIsLoading(true);
      if (otpData.isRegistrationOTP) {
        await verifyRegistration(otpData.email, otpData.otp, otpData.tempToken);
      } else {
        await loginWithOTP(otpData.email, otpData.otp);
      }
      onClose();
    } catch (error) {
      // Error is handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const resetStates = () => {
    setLoginData({ emailOrPhone: "", password: "" });
    setRegisterData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setOtpData({
      email: "",
      otp: "",
      tempToken: "",
      isOTPMode: false,
      isVerifying: false,
      isRegistrationOTP: false,
    });
    setShowPassword(false);
    setShowRegisterPassword(false);
  };

  const handleClose = () => {
    resetStates();
    onClose();
  };

  if (otpData.isOTPMode) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {otpData.isRegistrationOTP
                ? "Verify Registration"
                : "Verify Login"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-cricket-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-cricket-green" />
              </div>
              <p className="text-gray-600">We've sent a verification code to</p>
              <p className="font-medium">{otpData.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpData.otp}
                  onChange={(value) =>
                    setOtpData((prev) => ({ ...prev, otp: value }))
                  }
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={isLoading || otpData.otp.length !== 6}
                className="w-full bg-cricket-green hover:bg-cricket-green/90"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setOtpData((prev) => ({ ...prev, isOTPMode: false }))
                  }
                  className="text-sm text-gray-600"
                >
                  ← Back to {otpData.isRegistrationOTP ? "register" : "login"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to BoxCric</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginEmail">Email or Phone</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="loginEmail"
                    type="text"
                    placeholder="Enter email or phone"
                    value={loginData.emailOrPhone}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        emailOrPhone: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loginPassword">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="loginPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cricket-green hover:bg-cricket-green/90"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* OTP Login */}
            <form onSubmit={handleLoginOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpEmail">Login with OTP</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="otpEmail"
                    type="email"
                    placeholder="Enter email for OTP"
                    value={otpData.email}
                    onChange={(e) =>
                      setOtpData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="outline"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </Button>
            </form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="registerName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerName"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerEmail">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerPhone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerPhone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={registerData.phone}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registerPassword">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="registerPassword"
                    type={showRegisterPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowRegisterPassword(!showRegisterPassword)
                    }
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showRegisterPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cricket-green hover:bg-cricket-green/90"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
