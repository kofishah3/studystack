"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Camera,
  Loader2,
  User,
  Building,
  GraduationCap,
  Calendar,
  Users,
} from "lucide-react";
import axios from "axios";
import { TextInputwLabel } from "@/components/inputs/TextInput";
import FullButton from "@/components/inputs/FullButton";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: (updatedUser: any) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onUpdate,
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    user_name: user?.user_name || "",
    institution: user?.institution || "",
    education_level: user?.education_level || "bachelor",
    age: user?.age || "",
    gender: user?.gender || "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(
    user?.profile_url ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.user_name}`,
  );

  useEffect(() => {
    if (user) {
      setFormData({
        user_name: user.user_name || "",
        institution: user.institution || "",
        education_level: user.education_level || "bachelor",
        age: user.age || "",
        gender: user.gender || "",
      });
      setPreviewUrl(
        user.profile_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_name}`,
      );
    }
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const submitData = new FormData();

      submitData.append("data", JSON.stringify(formData));
      if (selectedImage) {
        submitData.append("profile_image", selectedImage);
      }

      const res = await axios.post("/api/user/update", submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        onUpdate(updatedUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-surface w-full max-w-xl rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-xl font-bold font-sora text-text">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary-500 to-primary-600 rounded-full opacity-20 blur-sm group-hover:opacity-40 transition duration-500"></div>
                <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-background shadow-xl">
                  <img
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="text-white mb-1" size={24} />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                      Change
                    </span>
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
              </div>
              <p className="text-xs text-muted font-medium">
                Click to change profile picture
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <TextInputwLabel
                  id="edit-username"
                  label="Username"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  placeholder="Your username"
                  icon={<User size={18} className="text-muted" />}
                />
              </div>

              <div className="md:col-span-2">
                <TextInputwLabel
                  id="edit-institution"
                  label="Institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="University Name"
                  icon={<Building size={18} className="text-muted" />}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text flex items-center gap-2">
                  <GraduationCap size={16} className="text-muted" />
                  Education Level
                </label>
                <div className="relative">
                  <select
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleChange}
                    className="w-full h-12 bg-surface border border-border rounded-2xl px-4 text-sm text-text outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="high_school">High School</option>
                    <option value="bachelor">Bachelor</option>
                    <option value="master">Master</option>
                    <option value="doctorate">Doctorate</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text flex items-center gap-2">
                  <Users size={16} className="text-muted" />
                  Gender
                </label>
                <div className="relative">
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-12 bg-surface border border-border rounded-2xl px-4 text-sm text-text outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <TextInputwLabel
                  id="edit-age"
                  label="Age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="20"
                  icon={<Calendar size={18} className="text-muted" />}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <FullButton
                label="Cancel"
                variant="secondary"
                onClick={onClose}
              />
              <FullButton
                id="save-profile"
                label="Save Changes"
                type="submit"
                isLoading={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
