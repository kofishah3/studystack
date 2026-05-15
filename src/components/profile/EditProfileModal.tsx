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
import { SelectInputwLabel } from "@/components/inputs/SelectInput";
import { SearchableSelectwLabel } from "@/components/inputs/SearchableSelect";
import FullButton from "@/components/inputs/FullButton";
import { useToast } from "@/contexts/ToastContext";
import { CEBU_SCHOOLS, DEGREE_PROGRAMS } from "@/lib/constants";

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
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    user_name: user?.user_name || "",
    institution: user?.institution || "",
    education_level: user?.education_level || "bachelor",
    degree_program: user?.degree_program || "",
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
        degree_program: user.degree_program || "",
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

  const handleChange = (e: { target: { name: string; value: string } }) => {
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
        showToast({
          type: "success",
          title: "Profile updated",
          message: "Your profile information has been saved.",
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to update profile";
      setError(errorMsg);
      showToast({
        type: "error",
        title: "Update failed",
        message: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCollegeLevel = ["bachelor", "master", "doctorate"].includes(
    formData.education_level,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-surface w-full max-w-xl rounded-3xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          id="edit-profile-header"
          className="flex items-center justify-between px-8 py-6 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-10"
        >
          <h2
            id="edit-profile-title"
            className="text-xl font-bold font-sora text-text"
          >
            Edit Profile
          </h2>
          <button
            id="close-edit-profile"
            onClick={onClose}
            className="p-2 hover:bg-muted/10 rounded-full transition-colors cursor-pointer"
          >
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div
          id="edit-profile-body"
          className="overflow-y-auto p-8 custom-scrollbar"
        >
          <form
            id="edit-profile-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {error && (
              <div
                id="edit-profile-error"
                className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium animate-shake"
              >
                {error}
              </div>
            )}

            <div
              id="profile-image-section"
              className="flex flex-col items-center gap-4"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-linear-to-r from-primary-500 to-primary-500 rounded-full opacity-20 blur-sm group-hover:opacity-40 transition duration-500"></div>
                <div
                  id="profile-image-container"
                  className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-background shadow-xl"
                >
                  <img
                    id="profile-preview-image"
                    src={previewUrl}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                  <label
                    id="profile-image-label"
                    htmlFor="profile-upload"
                    className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="text-white mb-1" size={24} />
                    <span className="text-xs text-white font-bold uppercase tracking-wider">
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
              <p
                id="profile-image-hint"
                className="text-xs text-muted font-medium"
              >
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
                <SearchableSelectwLabel
                  id="edit-institution"
                  label="Institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  options={CEBU_SCHOOLS}
                  placeholder="University Name"
                  icon={<Building size={18} className="text-muted" />}
                />
              </div>

              {isCollegeLevel && (
                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <SearchableSelectwLabel
                    id="edit-degree-program"
                    label="Degree Program"
                    name="degree_program"
                    value={formData.degree_program}
                    onChange={handleChange}
                    options={DEGREE_PROGRAMS}
                    placeholder="BS Computer Science"
                    icon={<GraduationCap size={18} className="text-muted" />}
                  />
                </div>
              )}

              <SelectInputwLabel
                id="edit-education-level"
                label="Education Level"
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                icon={<GraduationCap size={16} className="text-muted" />}
                options={[
                  { value: "high_school", label: "High School" },
                  { value: "bachelor", label: "Bachelor" },
                  { value: "master", label: "Master" },
                  { value: "doctorate", label: "Doctorate" },
                  { value: "other", label: "Other" },
                ]}
              />

              <SelectInputwLabel
                id="edit-gender"
                label="Gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                icon={<Users size={16} className="text-muted" />}
                placeholder="Select..."
                options={[
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />

              <div id="age-input-container" className="md:col-span-2">
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

            <div id="modal-footer-buttons" className="pt-4 flex gap-4">
              <FullButton
                id="cancel-profile-edit"
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
