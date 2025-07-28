import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Shield,
  Smartphone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

const Settings = () => {
  const { user, updateUser } = useAuth();
  // Controlled state for account fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  });
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openDownloadData, setOpenDownloadData] = useState(false);
  const [openDeleteAccount, setOpenDeleteAccount] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user data from AuthContext on mount
  useEffect(() => {
    if (user) {
      const [first, ...rest] = user.name ? user.name.split(" ") : [""];
      setFirstName(first || "");
      setLastName(rest.join(" ") || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      if (user.preferences) {
        setNotifications(user.preferences.notifications || notifications);
      }
    }
  }, [user]);

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };



  // Save handler updates user in AuthContext (and can call API)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedUser = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        preferences: {
          notifications,
        },
      };
      updateUser(updatedUser);
      
      // Show success message
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Error saving settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel handler resets to current user values
  const handleCancel = () => {
    if (user) {
      const [first, ...rest] = user.name ? user.name.split(" ") : [""];
      setFirstName(first || "");
      setLastName(rest.join(" ") || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      if (user.preferences) {
        setNotifications(user.preferences.notifications || notifications);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-light via-white to-sky-blue/10">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account preferences and app settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-cricket-green" />
                <span>Account Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <Separator />

              <div className="flex space-x-2">
                <Button 
                  className="bg-cricket-green hover:bg-cricket-green/90" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-cricket-green" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Booking confirmations and updates
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(value) =>
                      handleNotificationChange("email", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Real-time alerts on your device
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(value) =>
                      handleNotificationChange("push", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label className="font-medium">SMS Notifications</Label>
                      <p className="text-sm text-gray-600">
                        Important updates via text message
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(value) =>
                      handleNotificationChange("sms", value)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <Label className="font-medium">
                        Marketing Communications
                      </Label>
                      <p className="text-sm text-gray-600">
                        Promotional offers and cricket tips
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(value) =>
                      handleNotificationChange("marketing", value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-cricket-green" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="font-medium">Location Sharing</Label>
                    <p className="text-sm text-gray-600">
                      Allow app to access your location for nearby grounds
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {/* Change Password Modal */}
                <Dialog open={openChangePassword} onOpenChange={setOpenChangePassword}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-cricket-green border-cricket-green hover:bg-cricket-green/10"
                    >
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input type="password" placeholder="Current Password" />
                      <Input type="password" placeholder="New Password" />
                      <Input type="password" placeholder="Confirm New Password" />
                    </div>
                    <DialogFooter>
                      <Button className="bg-cricket-green hover:bg-cricket-green/90">Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* Download My Data Modal */}
                <Dialog open={openDownloadData} onOpenChange={setOpenDownloadData}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Download My Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Download My Data</DialogTitle>
                    </DialogHeader>
                    <p className="mb-4">You can download a copy of your account data. This may take a few moments.</p>
                    <DialogFooter>
                      <Button className="bg-cricket-green hover:bg-cricket-green/90">Download</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {/* Delete Account AlertDialog */}
                <AlertDialog open={openDeleteAccount} onOpenChange={setOpenDeleteAccount}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. All your data will be permanently deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>




        </div>
      </div>
    </div>
  );
};

export default Settings;
