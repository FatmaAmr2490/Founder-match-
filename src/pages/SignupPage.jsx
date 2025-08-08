import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SignupForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    university: "",
    university_custom: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md space-y-5"
    >
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-semibold">
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleInputChange}
          className="h-12 border-2 focus:border-red-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-semibold">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          className="h-12 border-2 focus:border-red-500"
        />
      </div>

      {/* University Dropdown */}
      <div className="space-y-2">
        <Label htmlFor="university" className="text-sm font-semibold">
          University/Education
        </Label>
        <select
          id="university"
          name="university"
          value={formData.university}
          onChange={handleInputChange}
          className="h-12 border-2 focus:border-red-500 rounded-md px-3 w-full"
        >
          <option value="">Select your university</option>
          <option value="Cairo University">Cairo University</option>
          <option value="Alexandria University">Alexandria University</option>
          <option value="Ain Shams University">Ain Shams University</option>
          <option value="Mansoura University">Mansoura University</option>
          <option value="Assiut University">Assiut University</option>
          <option value="Al-Azhar University">Al-Azhar University</option>
          <option value="Helwan University">Helwan University</option>
          <option value="Zagazig University">Zagazig University</option>
          <option value="Other">Other</option>
        </select>

        {formData.university === "Other" && (
          <Input
            id="custom_university"
            name="university_custom"
            placeholder="Enter your university"
            value={formData.university_custom}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                university_custom: e.target.value,
                university: e.target.value,
              }))
            }
            className="h-12 border-2 focus:border-red-500 mt-2"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-semibold">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleInputChange}
          className="h-12 border-2 focus:border-red-500"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md"
      >
        Sign Up
      </Button>
    </form>
  );
}
